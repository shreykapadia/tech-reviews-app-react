// src/features/techFinder/TechFinderPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';
import ProductCard from '../../components/ProductCard';
import { questionnaires } from './config/questionnaireData';
import {
  parseNumericValue,
  getNestedValue,
  parseRam,
  parseScreenSize,
  hasDedicatedGraphics,
  parseBatteryLife,
  parseSmartphoneBatteryLife,
  getDxoScore,
  getNumericRamOptions,
  getNumericStorageOptions,
  getNumericScreenSizeOptions,
  getMobileScreenSize,
} from './utils/techFinderUtils';
import CategorySelector from './components/CategorySelector';
import TechFinderQuestionnaire from './components/TechFinderQuestionnaire';
import TechFinderResults from './components/TechFinderResults';

function TechFinderPage({ availableCategories, isAppDataLoading, allProducts, calculateCriticsScore }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [allProductsForCategory, setAllProductsForCategory] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [closeMatchProducts, setCloseMatchProducts] = useState([]);
  const [sortOption, setSortOption] = useState('default');
  const [isCategoryDataReady, setIsCategoryDataReady] = useState(false);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setCurrentStep(2);
    setIsCategoryDataReady(false);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    console.log('[TechFinderPage Category Sync useEffect] Attempting to sync. Selected Category:', selectedCategory?.name, 'AllProducts available:', Array.isArray(allProducts) && allProducts.length > 0);
    if (selectedCategory && Array.isArray(allProducts)) {
      console.log(`[TechFinderPage Category Sync useEffect] Filtering allProducts (count: ${allProducts.length}) for category: "${selectedCategory.name}"`);
      if (allProducts.length > 0) {
        const sampleCategories = [...new Set(allProducts.slice(0, 20).map(p => p.category))];
        console.log('[TechFinderPage Category Sync useEffect] Sample categories found in allProducts:', sampleCategories);
      }

      const productsInCategory = allProducts.filter(p => p.category === selectedCategory.name);
      setAllProductsForCategory(productsInCategory);
      setFilteredProducts(productsInCategory);
      setIsCategoryDataReady(true);
      console.log(`[TechFinderPage Category Sync useEffect] Populated products for ${selectedCategory.name}. Count: ${productsInCategory.length}`);
    } else if (!selectedCategory) {
      setAllProductsForCategory([]);
      setFilteredProducts([]);
      setIsCategoryDataReady(false);
      console.log('[TechFinderPage Category Sync useEffect] Cleared category-specific products.');
    }
  }, [selectedCategory, allProducts]);


  const handleAnswerSelect = (questionId, selectedValue, isChecked) => {
    setUserAnswers(prevAnswers => {
      const currentQuestion = (questionnaires[selectedCategory?.name] || []).find(q => q.id === questionId);
      const questionType = currentQuestion?.type;

      if (questionType === 'multiselect_checkbox') {
        const currentSelection = prevAnswers[questionId] ? [...prevAnswers[questionId]] : [];
        let newSelection;

        if (selectedValue === 'any') {
          newSelection = isChecked ? ['any'] : [];
        } else {
          if (isChecked) {
            newSelection = [...new Set([...currentSelection.filter(val => val !== 'any'), selectedValue])];
          } else {
            newSelection = currentSelection.filter(val => val !== selectedValue);
          }
        }
        return {
          ...prevAnswers,
          [questionId]: newSelection,
        };
      } else {
        return {
          ...prevAnswers,
          [questionId]: selectedValue,
        };
      }
    });
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setSelectedCategory(null);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setAllProductsForCategory([]);
    setFilteredProducts([]);
    setCloseMatchProducts([]);
    setIsCategoryDataReady(false);
    window.scrollTo(0, 0);
  };

  const handleSortChange = (newSortOption) => {
    setSortOption(newSortOption);
  };


  const handleGoBackToQuestions = () => {
    if (selectedCategory) {
      setCurrentQuestionIndex(0);
    }
  };

  const checkProductAgainstCriterion = (product, questionId, answerValue, categoryName, categoryQuestions) => {
    const question = categoryQuestions.find(q => q.id === questionId);
    if (!question) return true;
    if (answerValue === 'any') return true;

    const keySpecs = product.keySpecs || {};

    const handleBrandPreferenceFilter = (productValue, selectedBrandsArray) => {
      if (!Array.isArray(selectedBrandsArray) || selectedBrandsArray.length === 0) return true;
      if (selectedBrandsArray.includes('any')) return true;
      const productBrand = String(productValue || '').toLowerCase();
      return selectedBrandsArray.map(b => String(b).toLowerCase()).includes(productBrand);
    };

    if (categoryName === 'TVs') {
      switch (questionId) {
        case 'tv-size': {
          const productSizes = String(keySpecs.screenSize || '').split(',').map(s => parseNumericValue(s.trim())).filter(s => s !== null);
          if (productSizes.length === 0) return false;
          if (answerValue === '55-inch') return productSizes.some(size => size >= 40 && size <= 55);
          if (answerValue === '65-inch') return productSizes.some(size => size >= 60 && size <= 70);
          if (answerValue === '75-inch') return productSizes.some(size => size >= 75);
          return true;
        }
        case 'tv-resolution':
          return String(keySpecs.Resolution || '').toLowerCase().includes(String(answerValue).toLowerCase());
        case 'tv-color-vibrancy': {
          const panelType = String(keySpecs.displayPanelType || '').toLowerCase();
          if (answerValue === 'standard_colors') return (panelType.includes('led') || panelType.includes('lcd')) && !panelType.includes('oled') && !panelType.includes('qled');
          if (answerValue === 'rich_colors') return panelType.includes('qled') || (panelType.includes('oled') && !panelType.includes('qd-oled'));
          if (answerValue === 'most_vibrant_colors') return panelType.includes('qd-oled');
          return true;
        }
        case 'tv-contrast-level': {
          const backlighting = String(keySpecs.displayBacklighting || '').toLowerCase();
          const panelType = String(keySpecs.displayPanelType || '').toLowerCase();
          if (answerValue === 'good_contrast') return backlighting.includes('direct lit') || backlighting.includes('edge lit');
          if (answerValue === 'excellent_contrast') return backlighting.includes('full array') || backlighting.includes('fald');
          if (answerValue === 'perfect_contrast') return panelType.includes('oled') || backlighting.includes('oled') || backlighting.includes('mini-led') || backlighting.includes('miniled');
          return true;
        }
        case 'tv-viewing-environment': {
          const peakBrightness = parseNumericValue(keySpecs.peakBrightness_nits);
          const panelType = String(keySpecs.displayPanelType || '').toLowerCase();
          const backlighting = String(keySpecs.displayBacklighting || '').toLowerCase();
          if (answerValue === 'bright_room') return (peakBrightness && peakBrightness > 1000) || backlighting.includes('mini-led') || panelType.includes('qd-oled') || (panelType.includes('qled') && (backlighting.includes('fald') || backlighting.includes('fald')));
          if (answerValue === 'dark_room') return panelType.includes('oled') || backlighting.includes('oled');
          return true;
        }
        case 'tv-motion-smoothness': {
          const refreshRate = parseNumericValue(keySpecs.refreshRate);
          if (answerValue === 'very_important_motion') return refreshRate && refreshRate >= 120;
          if (answerValue === 'not_important_motion') return refreshRate && refreshRate <= 60;
          return true;
        }
        case 'tv-brand-preference':
          return handleBrandPreferenceFilter(getNestedValue(product, question.productField), answerValue);
        case 'tv-budget': {
          const prices = keySpecs?.retailPrice;
          if (!prices) return true;
          const checkPrice = (p) => {
            if (answerValue === 'under500') return p < 500;
            if (answerValue === '500-1000') return p >= 500 && p <= 1000;
            if (answerValue === '1000-2000') return p >= 1000 && p <= 2000;
            if (answerValue === 'over2000') return p > 2000;
            return true;
          };
          if (typeof prices === 'number') return checkPrice(prices);
          if (Array.isArray(prices)) return prices.some(item => checkPrice(typeof item === 'object' ? item.price : item));
          return true;
        }
        default: return true;
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
          if (answerValue === 'general_use') return (!maxNumericRam || maxNumericRam <= 8) && !graphicsDedicated && (processor.includes('i3') || processor.includes('ryzen 3') || ((processor.includes('m1') || processor.includes('m2') || processor.includes('m3') || processor.includes('m4')) && !processor.includes('pro') && !processor.includes('max')));
          if (answerValue === 'productivity_work') return (maxNumericRam >= 8) && !graphicsDedicated && (processor.includes('x plus') || processor.includes('i5') || processor.includes('i7') || processor.includes('ryzen 5') || processor.includes('ryzen 7') || processor.includes('ultra 5') || processor.includes('ultra 7') || (processor.includes('m1') || processor.includes('m2') || processor.includes('m3') || processor.includes('m4') || processor.includes('pro') || processor.includes('max')));
          if (answerValue === 'gaming') return (maxNumericRam >= 16) && graphicsDedicated && (processor.includes('i7') || processor.includes('i9') || processor.includes('ryzen 7') || processor.includes('ryzen 9') || processor.includes('hx') || processor.includes('intel') || processor.includes('ultra'));
          if (answerValue === 'creative_work') return (maxNumericRam >= 16) && graphicsDedicated && (processor.includes('i7') || processor.includes('i9') || processor.includes('ryzen 7') || processor.includes('ryzen 9') || processor.includes('pro') || processor.includes('max') || processor.includes('ultra'));
          if (answerValue === 'student_use') return (maxNumericRam >= 8) && (battery >= 12);
          return true;
        case 'laptop-performance-level':
          if (answerValue === 'basic_performance') return (ramOptions.length === 0 || ramOptions.some(r => r <= 8)) && !graphicsDedicated && (processor.includes('i3') || processor.includes('celeron') || processor.includes('pentium') || processor.includes('ryzen 3') || ((processor.includes('m1') || processor.includes('m2') || processor.includes('m3') || processor.includes('m4')) && !processor.includes('pro') && !processor.includes('max') && !processor.includes('ultra')));
          if (answerValue === 'good_performance') return (ramOptions.some(r => r >= 8 && r <= 16)) && !graphicsDedicated && (processor.includes('i5') || processor.includes('ultra 5') || processor.includes('ryzen 5') || processor.includes('i7') || processor.includes('ultra 7') || processor.includes('ryzen 7') || processor.includes('x plus') || processor.includes('x elite') || processor.includes('m1') || processor.includes('m2') || ((processor.includes('m3') || processor.includes('m4')) && !processor.includes('pro') && !processor.includes('max') && !processor.includes('ultra')));
          if (answerValue === 'high_performance') return (ramOptions.some(r => r >= 16)) && graphicsDedicated && (processor.includes('i7') || processor.includes('ultra 7') || processor.includes('ryzen 7') || processor.includes('pro') || processor.includes('max'));
          if (answerValue === 'max_performance') return (ramOptions.some(r => r >= 32)) && graphicsDedicated && (processor.includes('i9') || processor.includes('ultra 9') || processor.includes('ryzen 9') || processor.includes('max') || processor.includes('ultra') || processor.includes('hx'));
          return true;
        case 'laptop-storage-needs':
          if (storageOptions.length === 0) return true;
          if (answerValue === 'storage_256gb_less') return storageOptions.some(s => s <= 256);
          if (answerValue === 'storage_512gb') return storageOptions.some(s => s >= 257 && s <= 512);
          if (answerValue === 'storage_1tb') return storageOptions.some(s => s > 512 && s <= 1024);
          if (answerValue === 'storage_2tb_plus') return storageOptions.some(s => s > 1024);
          return true;
        case 'laptop-portability-form-factor':
          if (screenSizeOptions.length === 0 && answerValue !== '2_in_1_convertible') return true;
          if (answerValue === 'ultra_portable') return screenSizeOptions.some(size => size < 14);
          if (answerValue === 'balanced_portability') return screenSizeOptions.some(size => size >= 14 && size <= 15.9);
          if (answerValue === 'large_screen_portability') return screenSizeOptions.some(size => size >= 16);
          if (answerValue === '2_in_1_convertible') return design.includes('convertible') || design.includes('2-in-1') || productName.includes('x360') || productName.includes('yoga') || productName.includes('flip') || productName.includes('spin') || (design.includes('tablet') && keySpecs.Keyboard);
          return true;
        case 'laptop-brand-preference':
          return handleBrandPreferenceFilter(getNestedValue(product, question.productField), answerValue);
        case 'laptop-budget': {
            const retailPriceData = keySpecs?.retailPrice;
            if (!retailPriceData) return true;
            const checkPrice = (p) => {
                if (answerValue === 'under500') return p < 500;
                if (answerValue === '500-800') return p >= 500 && p <= 800;
                if (answerValue === '800-1200') return p > 800 && p <= 1200;
                if (answerValue === '1200-1800') return p > 1200 && p <= 1800;
                if (answerValue === 'over1800') return p > 1800;
                return true;
            };
            if (typeof retailPriceData === 'number') return checkPrice(retailPriceData);
            if (Array.isArray(retailPriceData)) return retailPriceData.some(item => checkPrice(typeof item === 'object' ? item.price : item));
            return true;
        }
        default: return true;
      }
    } else if (categoryName === 'Smartphones') {
      const processor = String(keySpecs.processor || '').toLowerCase();
      const mobileScreenSize = getMobileScreenSize(keySpecs);
      const currentDxoScore = getDxoScore(keySpecs);
      const batteryLife = parseSmartphoneBatteryLife(keySpecs.ratedBatteryLife);
      const storageOptionsSM = getNumericStorageOptions(keySpecs.storage);

      switch (questionId) {
        case 'smartphone-performance': {
            const topTierKeywords = ['a18 pro', 'a17 pro', 'snapdragon 8 gen 4', 'snapdragon 8 gen 3', 'dimensity 9300', 'snapdragon 8 elite'];
            const highTierKeywords = ['a18', 'a16', 'snapdragon 8 gen 2', 'tensor g3', 'tensor g4', 'dimensity 9200', 'dimensity 9000'];
            const midTierKeywords = ['a15', 'snapdragon 7 gen 3', 'snapdragon 7 gen 2', 'snapdragon 8 gen 1', 'snapdragon 888', 'tensor g2', 'dimensity 8000', 'dimensity 7000'];
            const matchesKwList = (txt, kws) => kws.some(k => txt.toLowerCase().includes(k.toLowerCase()));
            if (answerValue === 'everyday_multitasking_sm') return matchesKwList(processor, midTierKeywords);
            if (answerValue === 'demanding_apps_sm') {
                const lowerP = processor.toLowerCase();
                const isHigh = highTierKeywords.some(kw => lowerP.includes(kw.toLowerCase()));
                const isNonProTop = topTierKeywords.filter(kw => !kw.includes('pro') && !kw.includes('ultra') && !kw.includes('max') && !kw.includes('elite')).some(kw => lowerP.includes(kw.toLowerCase()));
                const isExcluded = lowerP.includes('pro');
                return (isHigh || isNonProTop) && !isExcluded;
            }
            if (answerValue === 'top_tier_sm') return matchesKwList(processor, topTierKeywords);
            return true;
        }
        case 'smartphone-camera-priority':
          if (currentDxoScore === null) return true;
          if (answerValue === 'camera_basics_sm') return currentDxoScore < 130;
          if (answerValue === 'camera_everyday_sm') return currentDxoScore >= 130 && currentDxoScore <= 140;
          if (answerValue === 'camera_top_notch_sm') return currentDxoScore > 140;
          return true;
        case 'smartphone-battery-life':
          if (batteryLife === null) return true;
          if (answerValue === 'battery_light_sm') return batteryLife < 25;
          if (answerValue === 'battery_moderate_sm') return batteryLife >= 25 && batteryLife <= 30;
          if (answerValue === 'battery_heavy_sm') return batteryLife > 30;
          return true;
        case 'smartphone-storage':
          if (storageOptionsSM.length === 0) return true;
          if (answerValue === 'storage_128gb_sm') return storageOptionsSM.some(s => s <= 128);
          if (answerValue === 'storage_256gb_sm') return storageOptionsSM.some(s => s > 128 && s <= 256);
          if (answerValue === 'storage_512gb_sm') return storageOptionsSM.some(s => s > 256 && s <= 512);
          if (answerValue === 'storage_1tb_plus_sm') return storageOptionsSM.some(s => s > 512);
          return true;
        case 'smartphone-screen-size':
          if (mobileScreenSize === null) return true;
          if (answerValue === 'screen_compact_sm') return mobileScreenSize < 6.0;
          if (answerValue === 'screen_medium_sm') return mobileScreenSize >= 6.0 && mobileScreenSize <= 6.49;
          if (answerValue === 'screen_large_sm') return mobileScreenSize >= 6.5;
          return true;
        case 'smartphone-brand-preference':
          return handleBrandPreferenceFilter(getNestedValue(product, question.productField), answerValue);
        case 'smartphone-budget': {
            const price = keySpecs?.retailPrice;
            if (typeof price !== 'number') return true;
            if (answerValue === 'budget_under300_sm') return price < 300;
            if (answerValue === 'budget_300_600_sm') return price >= 300 && price <= 600;
            if (answerValue === 'budget_600_900_sm') return price > 600 && price <= 900;
            if (answerValue === 'budget_over900_sm') return price > 900;
            return true;
        }
        default: return true;
      }
    } else {
      if (!question.productField) return true;
      const productValue = getNestedValue(product, question.productField);
      if (typeof productValue === 'number' && !isNaN(Number(answerValue))) return productValue === Number(answerValue);
      if (typeof productValue === 'boolean') return productValue === (answerValue === 'true');
      return String(productValue || '').toLowerCase().includes(String(answerValue).toLowerCase());
    }
  };

  useEffect(() => {
    console.log('[TechFinderPage Filtering useEffect] Triggered. States:', {
      selectedCategoryName: selectedCategory?.name,
      allProductsForCategoryCount: allProductsForCategory?.length,
      userAnswers: JSON.parse(JSON.stringify(userAnswers)),
    });

    if (!isCategoryDataReady) {
      console.log('[TechFinderPage Filtering useEffect] Early return: Category data is not ready.');
      if (filteredProducts.length > 0) setFilteredProducts([]);
      return;
    }

    if (!allProductsForCategory || (Array.isArray(allProductsForCategory) && allProductsForCategory.length === 0 && Object.keys(userAnswers).filter(key => userAnswers[key] !== 'any').length > 0)) {
      console.log(`[TechFinderPage Filtering useEffect] allProductsForCategory is empty or not yet populated for ${selectedCategory?.name}, but there are answers. Count: ${allProductsForCategory?.length}`);
      if (filteredProducts.length !== 0) {
        setFilteredProducts([]);
      }
      return;
    }

    if (Object.keys(userAnswers).filter(key => userAnswers[key] !== 'any').length === 0) {
      if (filteredProducts.length !== allProductsForCategory.length || !filteredProducts.every((val, index) => val === allProductsForCategory[index])) {
        setFilteredProducts(allProductsForCategory);
        console.log('[TechFinderPage Filtering useEffect] No active user answers. Setting filteredProducts to all products for category. Count:', allProductsForCategory.length);
      }
      return;
    }

    const categoryQuestions = questionnaires[selectedCategory.name] || [];
    console.log(`[TechFinderPage Filtering useEffect] Proceeding to filter ${allProductsForCategory.length} products for category: ${selectedCategory.name}`);

    const newFilteredProducts = allProductsForCategory.filter(product => {
      if (allProductsForCategory.length === 0) {
        console.log('[TechFinderPage Filtering useEffect] Inside filter callback, but allProductsForCategory is empty. This should not happen if checks above are correct.');
        return false;
      }
      return Object.entries(userAnswers).every(([questionId, answerValue]) => {
        return checkProductAgainstCriterion(product, questionId, answerValue, selectedCategory.name, categoryQuestions);
      }); // <-- Fixed: Missing closing parenthesis for .every()
    });

    setFilteredProducts(newFilteredProducts);

    const rejectedProducts = allProductsForCategory.filter(
      p => !newFilteredProducts.find(fp => (fp.id || fp.productName) === (p.id || p.productName))
    );
    let potentialCloseMatches = [];

    if (Object.keys(userAnswers).filter(key => userAnswers[key] !== 'any' && userAnswers[key] !== undefined && (!Array.isArray(userAnswers[key]) || userAnswers[key].length > 0)).length > 0) {
      rejectedProducts.forEach(product => {
        let failedCount = 0;
        Object.entries(userAnswers).forEach(([questionId, answerValue]) => {
          if (answerValue === 'any' || answerValue === undefined || (Array.isArray(answerValue) && answerValue.length === 0)) return;

          if (!checkProductAgainstCriterion(product, questionId, answerValue, selectedCategory.name, categoryQuestions)) {
            failedCount++;
          }
        });

        // Consider products that failed 1, 2, or 3 criteria
        if (failedCount >= 1 && failedCount <= 3) {
          potentialCloseMatches.push({ ...product, failedCount });
        }
      });
    }

    // Sort close matches: first by failedCount (ascending), then by a secondary score (descending)
    potentialCloseMatches.sort((a, b) => {
      if (a.failedCount !== b.failedCount) {
        return a.failedCount - b.failedCount;
      }
      // Secondary sort by overall score (higher score is better)
      return (calculateCriticsScore(b) || 0) + (b.audienceScore || 0) - ((calculateCriticsScore(a) || 0) + (a.audienceScore || 0));
    });
    setCloseMatchProducts(potentialCloseMatches.slice(0, 5)); // Show up to 5 close matches

    const productNames = newFilteredProducts.map(p => p.productName).join(', ');
    console.log(
      `[TechFinderPage Filtering useEffect] Filter complete. Found ${newFilteredProducts.length} products matching criteria: ${
        productNames || 'None'
      }`
    );
  }, [userAnswers, allProductsForCategory, selectedCategory, isCategoryDataReady]);

  useEffect(() => {
    if (selectedCategory) {
      const categoryQuestions = questionnaires[selectedCategory.name] || [];
      const isQuestionnaireActuallyComplete = currentQuestionIndex >= categoryQuestions.length && categoryQuestions.length > 0;

      if (isQuestionnaireActuallyComplete) {
        setIsLoadingRecommendations(true);
        const timer = setTimeout(() => {
          setIsLoadingRecommendations(false);
        }, 700);
        return () => clearTimeout(timer);
      }
    }
  }, [currentQuestionIndex, selectedCategory]);

  const getProductPriceForSort = (product, currentAnswers, categoryName) => {
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
        return null;
      }
    }

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

  const sortedAndFilteredProducts = useMemo(() => {
    if (!filteredProducts) return [];
    let sorted = [...filteredProducts];

    switch (sortOption) {
      case 'price_asc':
        sorted.sort((a, b) => {
          const priceA = getProductPriceForSort(a, userAnswers, selectedCategory?.name) ?? Infinity;
          const priceB = getProductPriceForSort(b, userAnswers, selectedCategory?.name) ?? Infinity;
          return priceA - priceB;
        });
        break;
      case 'price_desc':
        sorted.sort((a, b) => {
          const priceA = getProductPriceForSort(a, userAnswers, selectedCategory?.name) ?? -Infinity;
          const priceB = getProductPriceForSort(b, userAnswers, selectedCategory?.name) ?? -Infinity;
          return priceB - priceA;
        });
        break;
      case 'brand_asc':
        sorted.sort((a, b) => (a.brand || '').localeCompare(b.brand || ''));
        break;
      case 'default':
      default:
        sorted.sort((a, b) => {
          const scoreA = (calculateCriticsScore(a) || 0) + (a.audienceScore || 0);
          const scoreB = (calculateCriticsScore(b) || 0) + (b.audienceScore || 0);
          return scoreB - scoreA;
        });
    }
    return sorted;
  }, [filteredProducts, sortOption, calculateCriticsScore, userAnswers, selectedCategory]);

  const handleNavigatePreviousQuestion = () => {
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
  };

  const handleNavigateNextQuestion = () => {
    const categoryQuestions = questionnaires[selectedCategory?.name] || [];
    const currentQuestion = categoryQuestions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex >= categoryQuestions.length -1;
    if (currentQuestion?.type === 'radio' && !userAnswers[currentQuestion?.id] && !isLastQuestion) {
      return;
    }
    setCurrentQuestionIndex(prev => prev + 1);
  };
  const effectiveIsLoading = isAppDataLoading || !availableCategories;
  const effectiveError = !effectiveIsLoading && (!availableCategories || availableCategories.length === 0)
    ? "No product categories are currently available. Please try again later."
    : null;

  return (
    <>
      <Helmet>
        <title>
          {currentStep === 1 ? 'Tech Finder - Select Category' : `Tech Finder - ${selectedCategory?.name || 'Guide'}`}
        </title>
        <meta name="description" content={currentStep === 1 ? "Select a product category to start finding your perfect tech device." : `Answer questions to find the best ${selectedCategory?.name || 'device'}.`} />
      </Helmet>
      <main className="container mx-auto px-4 py-8 mt-16 md:mt-20">
        {currentStep === 1 && (
          <>
            <h1 className="text-3xl sm:text-4xl font-bold text-brand-text text-center mt-12 sm:mt-20 mb-6 font-serif">
              Find Your Perfect Tech
            </h1>
            <p className="text-lg text-gray-700 text-center mb-10 sm:mb-12">
              First, let's pick a product type. We'll then ask a few questions to help you discover the ideal device for your needs!
            </p>

            <section className="py-8">
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6 sm:mb-10 text-center">
                What are you looking for?
              </h2>
              <CategorySelector
                availableCategories={availableCategories}
                onCategorySelect={handleCategorySelect}
                isLoading={effectiveIsLoading}
                error={effectiveError}
              />
            </section>
          </>
        )}

        {currentStep === 2 && selectedCategory && (
          <div className="py-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-text">
                {selectedCategory.name} Finder
              </h2>
              <button onClick={handleRestart} className="px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary-dark transition-colors">Restart</button>
            </div>

            {(() => {
              const categoryQuestions = questionnaires[selectedCategory.name] || [];
              const questionnaireComplete = currentQuestionIndex >= categoryQuestions.length;

              if (!questionnaireComplete) {
                return (
                  <TechFinderQuestionnaire
                    questions={categoryQuestions}
                    currentQuestionIndex={currentQuestionIndex}
                    userAnswers={userAnswers}
                    onAnswerSelect={handleAnswerSelect}
                    onNavigatePrevious={handleNavigatePreviousQuestion}
                    onNavigateNext={handleNavigateNextQuestion}
                    categoryName={selectedCategory.name}
                    totalQuestions={categoryQuestions.length}
                    allProductsForCategory={allProductsForCategory}
                    calculateCriticsScore={calculateCriticsScore}
                    ProductCardComponent={ProductCard}
                    onRestart={handleRestart}
                  />
                );
              } else {
                return (
                  <TechFinderResults
                    categoryName={selectedCategory.name}
                    products={sortedAndFilteredProducts}
                    calculateCriticsScore={calculateCriticsScore}
                    sortOption={sortOption}
                    onSortChange={handleSortChange}
                    isLoading={isLoadingRecommendations}
                    onGoBackToQuestions={handleGoBackToQuestions}
                    onRestart={handleRestart}
                    closeMatchProducts={closeMatchProducts}
                  />
                );
              }
            })()}
          </div>
        )}
      </main>
    </>
  );
} // <--- THIS IS THE CRITICAL MISSING CLOSING BRACE FOR THE FUNCTION COMPONENT

TechFinderPage.propTypes = {
  availableCategories: PropTypes.array,
  isAppDataLoading: PropTypes.bool,
  allProducts: PropTypes.array,
  calculateCriticsScore: PropTypes.func,
};

TechFinderPage.defaultProps = {
  availableCategories: [],
  isAppDataLoading: true,
  allProducts: [],
  calculateCriticsScore: () => 0,
};

export default TechFinderPage;