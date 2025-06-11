// src/features/techFinder/utils/techFinderFilteringLogic.js
import {
  parseNumericValue,
  getNestedValue,
  parseRam,
  // parseScreenSize, // Not directly used by checkProductAgainstCriterion, but by getNumericScreenSizeOptions
  hasDedicatedGraphics,
  parseBatteryLife,
  parseSmartphoneBatteryLife,
  getDxoScore,
  getNumericRamOptions,
  getNumericStorageOptions,
  getNumericScreenSizeOptions,
  getMobileScreenSize,
} from './techFinderUtils';

export const checkProductAgainstCriterion = (product, questionId, answerValue, categoryName, categoryQuestions) => {
  const question = categoryQuestions.find(q => q.id === questionId);
  if (!question) return { pass: true };
  if (answerValue === 'any' || (Array.isArray(answerValue) && answerValue.includes('any'))) return { pass: true };
  if (Array.isArray(answerValue) && answerValue.length === 0) return { pass: true }; // No selection means no restriction for this criterion

  const keySpecs = product.keySpecs || {};

  const handleBrandPreferenceFilter = (productValue, selectedBrandsArray) => {
    if (!Array.isArray(selectedBrandsArray) || selectedBrandsArray.length === 0) return true;
    if (selectedBrandsArray.includes('any')) return true;
    const productBrand = String(productValue || product.brand || '').toLowerCase(); // Fallback to product.brand
    return selectedBrandsArray.map(b => String(b).toLowerCase()).includes(productBrand);
  };

  if (categoryName === 'TVs') {
    switch (questionId) {
      case 'tv-size': {
        const productSizes = String(keySpecs.screenSize || '').split(',').map(s => parseNumericValue(s.trim())).filter(s => s !== null);
        if (productSizes.length === 0) return { pass: false, reason: { id: questionId, label: question.filterLabel || question.text || "Screen Size Availability" } };
        let matchesSize = false;
        if (answerValue === '55-inch') matchesSize = productSizes.some(size => size >= 40 && size <= 55);
        else if (answerValue === '65-inch') matchesSize = productSizes.some(size => size >= 60 && size <= 70);
        else if (answerValue === '75-inch') matchesSize = productSizes.some(size => size >= 75);
        else matchesSize = true; // Should not happen if answerValue is one of the options
        return matchesSize ? { pass: true } : { pass: false, reason: { id: questionId, label: question.filterLabel || question.text || "Screen Size" } };
      }
      case 'tv-resolution': {
        const matches = String(keySpecs.Resolution || '').toLowerCase().includes(String(answerValue).toLowerCase());
        return matches ? { pass: true } : { pass: false, reason: { id: questionId, label: question.filterLabel || question.text || "Resolution" } };
      }
      case 'tv-color-vibrancy': {
        const panelType = String(keySpecs.displayPanelType || '').toLowerCase();
        let matches = false;
        if (answerValue === 'standard_colors') matches = (panelType.includes('led') || panelType.includes('lcd')) && !panelType.includes('oled') && !panelType.includes('qled');
        else if (answerValue === 'rich_colors') matches = panelType.includes('qled') || (panelType.includes('oled') && !panelType.includes('qd-oled'));
        else if (answerValue === 'most_vibrant_colors') matches = panelType.includes('qd-oled');
        else matches = true;
        return matches ? { pass: true } : { pass: false, reason: { id: questionId, label: question.filterLabel || question.text || "Color Vibrancy" } };
      }
      case 'tv-contrast-level': {
        const backlighting = String(keySpecs.displayBacklighting || '').toLowerCase();
        const panelType = String(keySpecs.displayPanelType || '').toLowerCase();
        let matches = false;
        if (answerValue === 'good_contrast') matches = backlighting.includes('direct lit') || backlighting.includes('edge lit');
        else if (answerValue === 'excellent_contrast') matches = backlighting.includes('full array') || backlighting.includes('fald');
        else if (answerValue === 'perfect_contrast') matches = panelType.includes('oled') || backlighting.includes('oled') || backlighting.includes('mini-led') || backlighting.includes('miniled');
        else matches = true;
        return matches ? { pass: true } : { pass: false, reason: { id: questionId, label: question.filterLabel || question.text || "Contrast Level" } };
      }
      case 'tv-viewing-environment': {
        const peakBrightness = parseNumericValue(keySpecs.peakBrightness_nits);
        const panelType = String(keySpecs.displayPanelType || '').toLowerCase();
        const backlighting = String(keySpecs.displayBacklighting || '').toLowerCase();
        let matches = false;
        if (answerValue === 'bright_room') matches = (peakBrightness && peakBrightness > 1000) || backlighting.includes('mini-led') || panelType.includes('qd-oled') || (panelType.includes('qled') && (backlighting.includes('fald') || backlighting.includes('fald')));
        else if (answerValue === 'dark_room') matches = panelType.includes('oled') || backlighting.includes('oled');
        else matches = true;
        return matches ? { pass: true } : { pass: false, reason: { id: questionId, label: question.filterLabel || question.text || "Viewing Environment" } };
      }
      case 'tv-motion-smoothness': {
        const refreshRate = parseNumericValue(keySpecs.refreshRate);
        let matches = false;
        if (answerValue === 'very_important_motion') matches = refreshRate && refreshRate >= 120;
        else if (answerValue === 'not_important_motion') matches = refreshRate && refreshRate <= 60;
        else matches = true; // If no specific motion preference, or refresh rate not specified, consider it a pass for this filter
        return matches ? { pass: true } : { pass: false, reason: { id: questionId, label: question.filterLabel || question.text || "Motion Smoothness" } };
      }
      case 'tv-brand-preference':
        return handleBrandPreferenceFilter(getNestedValue(product, question.productField), answerValue) ? { pass: true } : { pass: false, reason: { id: questionId, label: question.filterLabel || question.text || "Brand Preference" } };
      case 'tv-budget': {
        const prices = keySpecs?.retailPrice;
        if (!prices) return { pass: true }; // No price info, can't filter by budget
        const checkPrice = (p) => {
          if (answerValue === 'under500') return p < 500;
          if (answerValue === '500-1000') return p >= 500 && p <= 1000;
          if (answerValue === '1000-2000') return p >= 1000 && p <= 2000;
          if (answerValue === 'over2000') return p > 2000;
          return true;
        };
        let matchesBudget = false;
        if (typeof prices === 'number') matchesBudget = checkPrice(prices);
        else if (Array.isArray(prices)) matchesBudget = prices.some(item => checkPrice(typeof item === 'object' ? item.price : item));
        else matchesBudget = true; // Should not happen if prices is not number/array and not null
        return matchesBudget ? { pass: true } : { pass: false, reason: { id: questionId, label: question.filterLabel || question.text || "Budget" } };
      }
      default: return { pass: true };
    }
  } else if (categoryName === 'Laptops') {
    const processor = String(keySpecs.processorOptions || '').toLowerCase();
    const ramOptions = getNumericRamOptions(keySpecs.ram);
    const maxNumericRam = parseRam(keySpecs.ram);
    const storageOptions = getNumericStorageOptions(keySpecs.storage);
    const screenSizeOptions = getNumericScreenSizeOptions(keySpecs['Display Size'] || keySpecs['Screen Size'] || keySpecs.screenSize);
    const graphicsDedicated = hasDedicatedGraphics(keySpecs);
    const battery = parseBatteryLife(keySpecs.ratedBatteryLife);
    const design = String(keySpecs.Design || '').toLowerCase();
    const productName = String(product.productName || '').toLowerCase();

    switch (questionId) {
      case 'laptop-primary-use':
        let useMatches = false;
        if (answerValue === 'general_use') useMatches = (!maxNumericRam || maxNumericRam <= 8) && !graphicsDedicated && (processor.includes('i3') || processor.includes('ryzen 3') || ((processor.includes('m1') || processor.includes('m2') || processor.includes('m3') || processor.includes('m4')) && !processor.includes('pro') && !processor.includes('max')));
        else if (answerValue === 'productivity_work') useMatches = (maxNumericRam >= 8) && !graphicsDedicated && (processor.includes('x plus') || processor.includes('i5') || processor.includes('i7') || processor.includes('ryzen 5') || processor.includes('ryzen 7') || processor.includes('ultra 5') || processor.includes('ultra 7') || (processor.includes('m1') || processor.includes('m2') || processor.includes('m3') || processor.includes('m4') || processor.includes('pro') || processor.includes('max')));
        else if (answerValue === 'gaming') useMatches = (maxNumericRam >= 16) && graphicsDedicated && (processor.includes('i7') || processor.includes('i9') || processor.includes('ryzen 7') || processor.includes('ryzen 9') || processor.includes('hx') || processor.includes('intel') || processor.includes('ultra'));
        else if (answerValue === 'creative_work') useMatches = (maxNumericRam >= 16) && graphicsDedicated && (processor.includes('i7') || processor.includes('i9') || processor.includes('ryzen 7') || processor.includes('ryzen 9') || processor.includes('pro') || processor.includes('max') || processor.includes('ultra'));
        else if (answerValue === 'student_use') useMatches = (maxNumericRam >= 8) && (battery >= 12);
        else useMatches = true;
        return useMatches ? { pass: true } : { pass: false, reason: { id: questionId, label: question.filterLabel || question.text || "Primary Use" } };
      case 'laptop-performance-level':
        let perfMatches = false;
        if (answerValue === 'basic_performance') perfMatches = (ramOptions.length === 0 || ramOptions.some(r => r <= 8)) && !graphicsDedicated && (processor.includes('i3') || processor.includes('celeron') || processor.includes('pentium') || processor.includes('ryzen 3') || ((processor.includes('m1') || processor.includes('m2') || processor.includes('m3') || processor.includes('m4')) && !processor.includes('pro') && !processor.includes('max') && !processor.includes('ultra')));
        else if (answerValue === 'good_performance') perfMatches = (ramOptions.some(r => r >= 8 && r <= 16)) && !graphicsDedicated && (processor.includes('i5') || processor.includes('ultra 5') || processor.includes('ryzen 5') || processor.includes('i7') || processor.includes('ultra 7') || processor.includes('ryzen 7') || processor.includes('x plus') || processor.includes('x elite') || processor.includes('m1') || processor.includes('m2') || ((processor.includes('m3') || processor.includes('m4')) && !processor.includes('pro') && !processor.includes('max') && !processor.includes('ultra')));
        else if (answerValue === 'high_performance') perfMatches = (ramOptions.some(r => r >= 16)) && graphicsDedicated && (processor.includes('i7') || processor.includes('ultra 7') || processor.includes('ryzen 7') || processor.includes('pro') || processor.includes('max'));
        else if (answerValue === 'max_performance') perfMatches = (ramOptions.some(r => r >= 32)) && graphicsDedicated && (processor.includes('i9') || processor.includes('ultra 9') || processor.includes('ryzen 9') || processor.includes('max') || processor.includes('ultra') || processor.includes('hx'));
        else perfMatches = true;
        return perfMatches ? { pass: true } : { pass: false, reason: { id: questionId, label: question.filterLabel || question.text || "Performance Level" } };
      case 'laptop-storage-needs':
        if (storageOptions.length === 0) return { pass: true }; // No storage info, pass
        let storageMatches = false;
        if (answerValue === 'storage_256gb_less') storageMatches = storageOptions.some(s => s <= 256);
        else if (answerValue === 'storage_512gb') storageMatches = storageOptions.some(s => s >= 257 && s <= 512);
        else if (answerValue === 'storage_1tb') storageMatches = storageOptions.some(s => s > 512 && s <= 1024);
        else if (answerValue === 'storage_2tb_plus') storageMatches = storageOptions.some(s => s > 1024);
        else storageMatches = true;
        return storageMatches ? { pass: true } : { pass: false, reason: { id: questionId, label: question.filterLabel || question.text || "Storage Needs" } };
      case 'laptop-portability-form-factor':
        if (screenSizeOptions.length === 0 && answerValue !== '2_in_1_convertible') return { pass: true }; // No screen size info, pass unless specifically asking for 2-in-1
        let portabilityMatches = false;
        if (answerValue === 'ultra_portable') portabilityMatches = screenSizeOptions.some(size => size < 14);
        else if (answerValue === 'balanced_portability') portabilityMatches = screenSizeOptions.some(size => size >= 14 && size <= 15.9);
        else if (answerValue === 'large_screen_portability') portabilityMatches = screenSizeOptions.some(size => size >= 16);
        else if (answerValue === '2_in_1_convertible') portabilityMatches = design.includes('convertible') || design.includes('2-in-1') || productName.includes('x360') || productName.includes('yoga') || productName.includes('flip') || productName.includes('spin') || (design.includes('tablet') && keySpecs.Keyboard);
        else portabilityMatches = true;
        return portabilityMatches ? { pass: true } : { pass: false, reason: { id: questionId, label: question.filterLabel || question.text || "Portability/Form Factor" } };
      case 'laptop-brand-preference':
        return handleBrandPreferenceFilter(getNestedValue(product, question.productField), answerValue) ? { pass: true } : { pass: false, reason: { id: questionId, label: question.filterLabel || question.text || "Brand Preference" } };
      case 'laptop-budget': {
          const retailPriceData = keySpecs?.retailPrice;
          if (!retailPriceData) return { pass: true };
          let budgetMatches = false;
          const checkPrice = (p) => {
              if (answerValue === 'under500') return p < 500;
              if (answerValue === '500-800') return p >= 500 && p <= 800;
              if (answerValue === '800-1200') return p > 800 && p <= 1200;
              if (answerValue === '1200-1800') return p > 1200 && p <= 1800;
              if (answerValue === 'over1800') return p > 1800;
              return true;
          };
          if (typeof retailPriceData === 'number') budgetMatches = checkPrice(retailPriceData);
          else if (Array.isArray(retailPriceData)) budgetMatches = retailPriceData.some(item => checkPrice(typeof item === 'object' ? item.price : item));
          else budgetMatches = true;
          return budgetMatches ? { pass: true } : { pass: false, reason: { id: questionId, label: question.filterLabel || question.text || "Budget" } };
      }
      default: return { pass: true };
    }
  } else if (categoryName === 'Smartphones') {
    const processor = String(keySpecs.processor || '').toLowerCase();
    const mobileScreenSize = getMobileScreenSize(keySpecs);
    const currentDxoScore = getDxoScore(keySpecs);
    const batteryLife = parseSmartphoneBatteryLife(keySpecs.ratedBatteryLife);
    const storageOptionsSM = getNumericStorageOptions(keySpecs.storage);

    switch (questionId) {
      case 'smartphone-performance': {
          let perfMatchesSM = false;
          const topTierKeywords = ['a18 pro', 'a17 pro', 'snapdragon 8 gen 4', 'snapdragon 8 gen 3', 'dimensity 9300', 'snapdragon 8 elite'];
          const highTierKeywords = ['a18', 'a16', 'snapdragon 8 gen 2', 'tensor g3', 'tensor g4', 'dimensity 9200', 'dimensity 9000'];
          const midTierKeywords = ['a15', 'snapdragon 7 gen 3', 'snapdragon 7 gen 2', 'snapdragon 8 gen 1', 'snapdragon 888', 'tensor g2', 'dimensity 8000', 'dimensity 7000'];
          const matchesKwList = (txt, kws) => kws.some(k => txt.toLowerCase().includes(k.toLowerCase()));
          if (answerValue === 'everyday_multitasking_sm') perfMatchesSM = matchesKwList(processor, midTierKeywords);
          else if (answerValue === 'demanding_apps_sm') {
              const lowerP = processor.toLowerCase();
              const isHigh = highTierKeywords.some(kw => lowerP.includes(kw.toLowerCase()));
              const isNonProTop = topTierKeywords.filter(kw => !kw.includes('pro') && !kw.includes('ultra') && !kw.includes('max') && !kw.includes('elite')).some(kw => lowerP.includes(kw.toLowerCase()));
              const isExcluded = lowerP.includes('pro');
              perfMatchesSM = (isHigh || isNonProTop) && !isExcluded;
          }
          else if (answerValue === 'top_tier_sm') perfMatchesSM = matchesKwList(processor, topTierKeywords);
          else perfMatchesSM = true;
          return perfMatchesSM ? { pass: true } : { pass: false, reason: { id: questionId, label: question.filterLabel || question.text || "Performance" } };
      }
      case 'smartphone-camera-priority':
        if (currentDxoScore === null) return { pass: true }; // No DXO score, can't filter
        let cameraMatches = false;
        if (answerValue === 'camera_basics_sm') cameraMatches = currentDxoScore < 130;
        else if (answerValue === 'camera_everyday_sm') cameraMatches = currentDxoScore >= 130 && currentDxoScore <= 140;
        else if (answerValue === 'camera_top_notch_sm') cameraMatches = currentDxoScore > 140;
        else cameraMatches = true;
        return cameraMatches ? { pass: true } : { pass: false, reason: { id: questionId, label: question.filterLabel || question.text || "Camera Priority" } };
      case 'smartphone-battery-life':
        if (batteryLife === null) return { pass: true }; // No battery info
        let batteryMatches = false;
        if (answerValue === 'battery_light_sm') batteryMatches = batteryLife < 25;
        else if (answerValue === 'battery_moderate_sm') batteryMatches = batteryLife >= 25 && batteryLife <= 30;
        else if (answerValue === 'battery_heavy_sm') batteryMatches = batteryLife > 30;
        else batteryMatches = true;
        return batteryMatches ? { pass: true } : { pass: false, reason: { id: questionId, label: question.filterLabel || question.text || "Battery Life" } };
      case 'smartphone-storage':
        if (storageOptionsSM.length === 0) return { pass: true }; // No storage info
        let storageMatchesSM = false;
        if (answerValue === 'storage_128gb_sm') storageMatchesSM = storageOptionsSM.some(s => s <= 128);
        else if (answerValue === 'storage_256gb_sm') storageMatchesSM = storageOptionsSM.some(s => s > 128 && s <= 256);
        else if (answerValue === 'storage_512gb_sm') storageMatchesSM = storageOptionsSM.some(s => s > 256 && s <= 512);
        else if (answerValue === 'storage_1tb_plus_sm') storageMatchesSM = storageOptionsSM.some(s => s > 512);
        else storageMatchesSM = true;
        return storageMatchesSM ? { pass: true } : { pass: false, reason: { id: questionId, label: question.filterLabel || question.text || "Storage" } };
      case 'smartphone-screen-size':
        if (mobileScreenSize === null) return { pass: true }; // No screen size info
        let screenSizeMatches = false;
        if (answerValue === 'screen_compact_sm') screenSizeMatches = mobileScreenSize < 6.0;
        else if (answerValue === 'screen_medium_sm') screenSizeMatches = mobileScreenSize >= 6.0 && mobileScreenSize <= 6.49;
        else if (answerValue === 'screen_large_sm') screenSizeMatches = mobileScreenSize >= 6.5;
        else screenSizeMatches = true;
        return screenSizeMatches ? { pass: true } : { pass: false, reason: { id: questionId, label: question.filterLabel || question.text || "Screen Size" } };
      case 'smartphone-brand-preference':
        return handleBrandPreferenceFilter(getNestedValue(product, question.productField), answerValue) ? { pass: true } : { pass: false, reason: { id: questionId, label: question.filterLabel || question.text || "Brand Preference" } };
      case 'smartphone-budget': {
          const price = keySpecs?.retailPrice;
          if (typeof price !== 'number') return { pass: true }; // No price info
          let budgetMatchesSM = false;
          if (answerValue === 'budget_under300_sm') budgetMatchesSM = price < 300;
          else if (answerValue === 'budget_300_600_sm') budgetMatchesSM = price >= 300 && price <= 600;
          else if (answerValue === 'budget_600_900_sm') budgetMatchesSM = price > 600 && price <= 900;
          else if (answerValue === 'budget_over900_sm') budgetMatchesSM = price > 900;
          else budgetMatchesSM = true;
          return budgetMatchesSM ? { pass: true } : { pass: false, reason: { id: questionId, label: question.filterLabel || question.text || "Budget" } };
      }
      default: return { pass: true };
    }
  } else {
    // Generic handling for other categories or question types not explicitly covered
    if (!question.productField) return { pass: true }; // If question has no field to check against, assume pass

    const productValue = getNestedValue(product, question.productField);
    let matches = false;

    if (Array.isArray(answerValue)) { // Handles multiselect_checkbox for generic fields
      const productValStr = String(productValue || '').toLowerCase();
      matches = answerValue.some(av => String(av).toLowerCase() === productValStr);
    } else if (typeof productValue === 'number' && !isNaN(Number(answerValue))) {
      matches = productValue === Number(answerValue);
    } else if (typeof productValue === 'boolean') {
      matches = productValue === (answerValue === 'true');
    } else { // Default to string inclusion for single string answers
      matches = String(productValue || '').toLowerCase().includes(String(answerValue).toLowerCase());
    }

    return matches ? { pass: true } : { pass: false, reason: { id: questionId, label: question.filterLabel || question.text || questionId } };
  }
};

export const getProductPriceForSort = (product, currentAnswers, categoryName) => {
  const retailPriceData = product.keySpecs?.retailPrice;

  const getTvSizeRangeFromAnswer = (answerValue) => {
    if (answerValue === '55-inch') return { min: 40, max: 55 };
    if (answerValue === '65-inch') return { min: 60, max: 70 };
    if (answerValue === '75-inch') return { min: 75, max: Infinity };
    return null;
  };

  if (categoryName === 'TVs') {
    const userSelectedSizeAnswer = currentAnswers?.['tv-size'];
    const targetSizeRange = getTvSizeRangeFromAnswer(userSelectedSizeAnswer);

    if (targetSizeRange && Array.isArray(retailPriceData)) {
      let minPriceInSelectedRange = Infinity;
      for (const priceEntry of retailPriceData) {
        if (typeof priceEntry === 'object' && priceEntry.screenSize && typeof priceEntry.price === 'number') {
          const productSizeNum = parseNumericValue(String(priceEntry.screenSize));
          if (productSizeNum !== null && productSizeNum >= targetSizeRange.min && productSizeNum <= targetSizeRange.max) {
            minPriceInSelectedRange = Math.min(minPriceInSelectedRange, priceEntry.price);
          }
        }
      }
      return minPriceInSelectedRange !== Infinity ? minPriceInSelectedRange : null;
    } else if (targetSizeRange && typeof retailPriceData === 'number') {
      // If retailPriceData is a single number but we need a size-specific price, we can't determine it.
      // This case might imply the single price is for a default size, or pricing isn't broken down by size.
      // Returning null indicates we can't use this for size-specific price sorting.
      return null;
    }
  }

  // Fallback for non-TVs or TVs without size-specific pricing in answers
  if (typeof retailPriceData === 'number') {
    return retailPriceData;
  }
  if (Array.isArray(retailPriceData) && retailPriceData.length > 0) {
    let minPrice = Infinity;
    let foundPrice = false;
    for (const item of retailPriceData) {
      const currentItemPrice = (typeof item === 'object' && typeof item.price === 'number') ? item.price : (typeof item === 'number' ? item : null);
      if (currentItemPrice !== null) {
        minPrice = Math.min(minPrice, currentItemPrice);
        foundPrice = true;
      }
    }
    return foundPrice ? minPrice : null;
  }
  return null;
};