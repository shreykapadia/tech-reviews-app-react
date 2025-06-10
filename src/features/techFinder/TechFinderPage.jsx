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
  parseStorage,
  parseScreenSize,
  hasDedicatedGraphics,
  parseBatteryLife,
  parseSmartphoneBatteryLife,
  getMaxMegapixels,
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
  const [sortOption, setSortOption] = useState('default'); // 'default', 'price_asc', 'price_desc', 'brand_asc'
  const [isCategoryDataReady, setIsCategoryDataReady] = useState(false); // New state

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    // `allProductsForCategory` and `filteredProducts` will be set by the new useEffect below
    setCurrentStep(2); // Advance to the next step (questionnaire)
    setIsCategoryDataReady(false); // Reset readiness when category changes
    window.scrollTo(0, 0);
  };

  // New useEffect to populate allProductsForCategory when selectedCategory or allProducts changes
  useEffect(() => {
    console.log('[TechFinderPage Category Sync useEffect] Attempting to sync. Selected Category:', selectedCategory?.name, 'AllProducts available:', Array.isArray(allProducts) && allProducts.length > 0);
    if (selectedCategory && Array.isArray(allProducts)) {
      // Log details about allProducts and the specific category name being used for filtering
      console.log(`[TechFinderPage Category Sync useEffect] Filtering allProducts (count: ${allProducts.length}) for category: "${selectedCategory.name}"`);
      // Log a sample of categories present in allProducts to check for mismatches
      if (allProducts.length > 0) {
        const sampleCategories = [...new Set(allProducts.slice(0, 20).map(p => p.category))]; // Get unique categories from first 20 products
        console.log('[TechFinderPage Category Sync useEffect] Sample categories found in allProducts:', sampleCategories);
      }

      const productsInCategory = allProducts.filter(p => p.category === selectedCategory.name);
      setAllProductsForCategory(productsInCategory);
      setFilteredProducts(productsInCategory);
      setIsCategoryDataReady(true); // Data is now ready for this category
      console.log(`[TechFinderPage Category Sync useEffect] Populated products for ${selectedCategory.name}. Count: ${productsInCategory.length}`);
    } else if (!selectedCategory) {
      // If category is deselected (e.g., restart), clear these.
      setAllProductsForCategory([]);
      setFilteredProducts([]);
      setIsCategoryDataReady(false); // Data is no longer ready
      console.log('[TechFinderPage Category Sync useEffect] Cleared category-specific products.');
    }
  }, [selectedCategory, allProducts]);



  const handleAnswerSelect = (questionId, value) => {
    setUserAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: value,
    }));
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setSelectedCategory(null);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setAllProductsForCategory([]);
    setFilteredProducts([]);
    setIsCategoryDataReady(false); // Reset on restart
    window.scrollTo(0, 0);
  };
  
  const handleSortChange = (newSortOption) => {
    setSortOption(newSortOption);
  };


  const handleGoBackToQuestions = () => {
    if (selectedCategory) {
      setCurrentQuestionIndex(0); // Go back to the first question of the current category
    }
  };

  // Filter products based on user answers
  useEffect(() => {
    console.log('[TechFinderPage Filtering useEffect] Triggered. States:', {
      selectedCategoryName: selectedCategory?.name,
      allProductsForCategoryCount: allProductsForCategory?.length,
      userAnswers: JSON.parse(JSON.stringify(userAnswers)), // Deep copy for accurate logging
    });

    // Guard 1: Ensure category data is ready (set by the Category Sync useEffect)
    if (!isCategoryDataReady) {
      console.log('[TechFinderPage Filtering useEffect] Early return: Category data is not ready.');
      // If filteredProducts isn't empty, clear it.
      if (filteredProducts.length > 0) setFilteredProducts([]);
      return;
    }

    // At this point, selectedCategory is set, and allProductsForCategory should be populated for it.
    if (!allProductsForCategory || (Array.isArray(allProductsForCategory) && allProductsForCategory.length === 0 && Object.keys(userAnswers).filter(key => userAnswers[key] !== 'any').length > 0)) {
      console.log(`[TechFinderPage Filtering useEffect] allProductsForCategory is empty or not yet populated for ${selectedCategory?.name}, but there are answers. Count: ${allProductsForCategory?.length}`);
      if (filteredProducts.length !== 0) {
        setFilteredProducts([]);
      }
      return;
    }

    // Guard 3: If there are no active user answers, filteredProducts should be allProductsForCategory.
    // However, if userAnswers becomes empty (e.g., by changing all answers to 'any'), reset.
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
      // LOG: Show every product entering the filter chain for the selected category
      console.log(`[TechFinderPage Product Filter Entry] Category: ${selectedCategory?.name}, Evaluating Product: ${product.productName} (Brand: ${product.brand})`);
      // Ensure product.keySpecs exists
      // If allProductsForCategory is empty here, this block won't run, which is fine.
      if (allProductsForCategory.length === 0) {
        console.log('[TechFinderPage Filtering useEffect] Inside filter callback, but allProductsForCategory is empty. This should not happen if checks above are correct.');
        return false; // Should not reach here if allProductsForCategory is empty due to checks above.
      }

      const keySpecs = product.keySpecs || {};
      // console.log(`Processing product: ${product.productName}`, keySpecs); // General log for all products being filtered

      return Object.entries(userAnswers).every(([questionId, answerValue]) => {
        if (answerValue === 'any') return true; // 'any' means this criterion is skipped
        
        const question = categoryQuestions.find(q => q.id === questionId);
        // If question not found (e.g. old answer for a removed question), or no productField for generic logic, skip.
        // Specific logic below will handle questions without productField.
        if (!question) return true; 

        // --- TV-Specific Filtering Logic ---
        if (selectedCategory.name === 'TVs') {
          console.log(`TV Filter - Product: ${product.productName}, KeySpecs:`, JSON.parse(JSON.stringify(keySpecs)));
          switch (questionId) {
            case 'tv-size': {
              // Parse the product's available screen sizes into an array of numbers
              const productSizes = String(keySpecs.screenSize || '')
                .split(',') // Split the comma-separated string
                .map(s => parseNumericValue(s.trim())) // Parse each part into a number
                .filter(s => s !== null); // Remove any sizes that couldn't be parsed

              console.log(`TV Filter (tv-size) - Product: ${product.productName}, Parsed Sizes: [${productSizes.join(', ')}], Answer: '${answerValue}'`);

              if (productSizes.length === 0) {
                console.log(`TV Filter (tv-size) - Product: ${product.productName}, No valid sizes found in keySpecs.screenSize.`);
                return false; // Cannot match if no sizes are listed
              }

              // Check if any of the product's sizes match the selected range
              if (answerValue === '55-inch') return productSizes.some(size => size >= 40 && size <= 55); // Medium (40-55 inch)
              if (answerValue === '65-inch') return productSizes.some(size => size >= 60 && size <= 70); // Large (60-70 inch)
              if (answerValue === '75-inch') return productSizes.some(size => size >= 75); // Extra Large (75+ inch)
              return true; // Handles 'any' which is checked before the switch, and any other unhandled values
            }
            case 'tv-resolution': {
              const productResolutionSpec = String(keySpecs.Resolution || '').toLowerCase();
              console.log(`TV Filter (tv-resolution) - Product: ${product.productName}, Resolution Spec: '${productResolutionSpec}', Answer: '${answerValue}'`);
              return productResolutionSpec.includes(String(answerValue).toLowerCase());
            }
            case 'tv-color-vibrancy': {
              const panelType = String(keySpecs.displayPanelType || '').toLowerCase();
              console.log(`TV Filter (tv-color-vibrancy) - Product: ${product.productName}, Panel Type: '${panelType}', Answer: '${answerValue}'`);
              if (answerValue === 'standard_colors') {
                // Standard colors should be basic LED/LCD, not OLED/QLED variants.
                return (panelType.includes('led') || panelType.includes('lcd')) && 
                       !panelType.includes('oled') && !panelType.includes('qled');
              }
              if (answerValue === 'rich_colors') {
                // Rich colors should include QLED and standard OLED, but exclude QD-OLED.
                return panelType.includes('qled') || (panelType.includes('oled') && !panelType.includes('qd-oled'));
              }

              // For "most_vibrant_colors", QD-OLED is a specific type of OLED.
              // So, if a product is "OLED (QD-OLED)", it should match.
              if (answerValue === 'most_vibrant_colors') return panelType.includes('qd-oled'); 
              return true; // Default if answerValue doesn't match known options
            }
            case 'tv-contrast-level': {
              const backlighting = String(keySpecs.displayBacklighting || '').toLowerCase();
              const panelType = String(keySpecs.displayPanelType || '').toLowerCase(); // OLEDs have inherent perfect contrast
              console.log(`TV Filter (tv-contrast-level) - Product: ${product.productName}, Backlighting: '${backlighting}', Panel Type: '${panelType}', Answer: '${answerValue}'`);
              if (answerValue === 'good_contrast') return backlighting.includes('direct lit') || backlighting.includes('edge lit');
              if (answerValue === 'excellent_contrast') return backlighting.includes('full array') || backlighting.includes('fald');
              if (answerValue === 'perfect_contrast') return panelType.includes('oled') || backlighting.includes('oled') || backlighting.includes('mini-led') || backlighting.includes('miniled');
              return true; // Default
            }
            case 'tv-viewing-environment': {
              const peakBrightness = parseNumericValue(keySpecs.peakBrightness_nits);
              const panelType = String(keySpecs.displayPanelType || '').toLowerCase();
              const backlighting = String(keySpecs.displayBacklighting || '').toLowerCase();
              console.log(`TV Filter (tv-viewing-environment) - Product: ${product.productName}, Peak Brightness: ${peakBrightness}, Panel Type: '${panelType}', Backlighting: '${backlighting}', Answer: '${answerValue}'`);

              if (answerValue === 'bright_room') {
                if (peakBrightness && peakBrightness > 1000) return true;
                // QD-OLEDs, QLEDs with FALD or Mini-LEDs are generally good for bright rooms
                return backlighting.includes('mini-led') || (panelType.includes('qd-oled')) || (panelType.includes('qled') && (backlighting.includes('fald') || backlighting.includes('fald')));
              }
              if (answerValue === 'dark_room') {
                // OLEDs excel in dark rooms
                return panelType.includes('oled') || backlighting.includes('oled');
              }
              return true; // Default for 'any' or other unhandled
            }
            case 'tv-motion-smoothness': {
              const refreshRate = parseNumericValue(keySpecs.refreshRate);
              console.log(`TV Filter (tv-motion-smoothness) - Product: ${product.productName}, Refresh Rate: ${refreshRate}, Answer: '${answerValue}'`);
              if (answerValue === 'very_important_motion') return refreshRate && refreshRate >= 120;
              if (answerValue === 'not_important_motion') return refreshRate && refreshRate <= 60; // or check if it's exactly 60
              return true; // Default
            }
            case 'tv-brand-preference': { // This uses generic logic because productField is 'brand'
              console.log(`TV Filter (tv-brand-preference) - Product: ${product.productName}, Brand: '${product.brand}', Answer: '${answerValue}'`);
              if (!question.productField) return true; // Should have productField
              const productValue = getNestedValue(product, question.productField);
              return String(productValue || '').toLowerCase() === String(answerValue).toLowerCase();
            }
            case 'tv-budget': {
              const prices = product.keySpecs?.retailPrice; // Access retailPrice from keySpecs
              const budgetAnswer = answerValue; 

              if (!prices || (Array.isArray(prices) && prices.length === 0) || (typeof prices !== 'number' && !Array.isArray(prices))) { // Consistent use of prices
                console.log(`TV Filter (tv-budget) - Product: ${product.productName}, No valid price data. Skipping filter.`);
                return true; // No price info or invalid format, can't filter by price
              }
              // Log the correct variable for raw retail price
              console.log(`TV Filter (tv-budget) - Product: ${product.productName}, Raw Retail Price:`, prices, `Answer: '${budgetAnswer}'`);
              
              const userSelectedScreenSize = userAnswers['tv-size'];

              // Helper function to check if a single price matches the budgetAnswer
              const checkPriceAgainstBudget = (price) => {
                if (price === null) return false; // Cannot match if price is null
                if (budgetAnswer === 'under500') return price < 500;
                if (budgetAnswer === '500-1000') return price >= 500 && price <= 1000;
                if (budgetAnswer === '1000-2000') return price >= 1000 && price <= 2000;
                if (budgetAnswer === 'over2000') return price > 2000;
                // 'any' budget is handled by the top-level `if (answerValue === 'any') return true;`
                return true; // If budgetAnswer is 'any' or unhandled, don't filter by price
              };

              // Scenario 1: User selected a specific screen size
              if (userSelectedScreenSize && userSelectedScreenSize !== 'any') {
                const targetSize = String(userSelectedScreenSize).split('-')[0].trim();
                let priceForSelectedSize = null;

                console.log(`TV Filter (tv-budget) - Product: ${product.productName}, Selected Size: '${targetSize}', Raw prices data:`, JSON.parse(JSON.stringify(prices))); // Log raw prices data
                if (Array.isArray(prices)) { // Consistent use of prices
                  const matchingPriceEntry = prices.find(p => {
                    if (typeof p === 'object' && p.screenSize && typeof p.price === 'number') { // Ensure price is also a number
                      const parsedProductScreenSize = parseNumericValue(String(p.screenSize));
                      if (parsedProductScreenSize === null) return false;

                      // Check if the product's screen size falls within the range of the selected size option
                      // Note: This find is just to see *if* any entry exists in the range.
                      // The actual price check will use the minimum price in the range below.
                      if (userSelectedScreenSize === '55-inch') return parsedProductScreenSize >= 40 && parsedProductScreenSize <= 55;
                      if (userSelectedScreenSize === '65-inch') return parsedProductScreenSize >= 60 && parsedProductScreenSize <= 70;
                      if (userSelectedScreenSize === '75-inch') return parsedProductScreenSize >= 75; // Check for 75+
                    }
                    return false;
                  });

                  // Find the minimum price among all entries that match the selected size range
                  let minPriceForRange = Infinity;
                  const sizeRangeCheck = (size) => {
                      if (userSelectedScreenSize === '55-inch') return size >= 40 && size <= 55;
                      if (userSelectedScreenSize === '65-inch') return size >= 60 && size <= 70;
                      if (userSelectedScreenSize === '75-inch') return size >= 75; // Check for 75+
                      return false;
                  };

                  // Iterate through prices to find the minimum price within the range
                  for (const p of prices) {
                      if (typeof p === 'object' && p.screenSize && typeof p.price === 'number') {
                          const parsedProductScreenSize = parseNumericValue(String(p.screenSize));
                          if (parsedProductScreenSize !== null && sizeRangeCheck(parsedProductScreenSize)) {
                              minPriceForRange = Math.min(minPriceForRange, p.price);
                          }
                      }
                  }

                  if (minPriceForRange !== Infinity) {
                      // Found at least one price within the range, now check budget against the minimum price found
                      console.log(`TV Filter (tv-budget) - Product: ${product.productName}, Found minimum price (${minPriceForRange}) within selected size range for '${userSelectedScreenSize}'.`);
                      return checkPriceAgainstBudget(minPriceForRange);
                  } else {
                      // Specific size selected, but no price found for *any* size within the selected range. Product does not match.
                      console.log(`TV Filter (tv-budget) - Product: ${product.productName}, No price found for selected size '${targetSize}'. Does not match budget criteria.`);
                      return false;
                  }

                } else if (typeof prices === 'number') {
                  // Product has a single price. We can't confirm it's for the *specific* targetSize if a size is selected.
                  console.log(`TV Filter (tv-budget) - Product: ${product.productName}, Specific size '${targetSize}' requested, but product has a single price. Cannot confirm price for this specific size.`);
                  return false;
                }
              }
              // Scenario 2: User selected "Flexible on size" (tv-size is 'any' or not set) OR product has a single price
              else {
                if (typeof prices === 'number') { // Consistent use of prices
                  const matches = checkPriceAgainstBudget(prices);
                  console.log(`TV Filter (tv-budget) - Product: ${product.productName}, Single Price: ${prices}. Matches budget '${budgetAnswer}': ${matches}`);
                  return matches;
                } else if (Array.isArray(prices)) { // Consistent use of prices
                  for (const priceEntry of prices) {
                    let currentPrice = (typeof priceEntry === 'object' && typeof priceEntry.price === 'number') ? priceEntry.price : (typeof priceEntry === 'number' ? priceEntry : null);
                    if (currentPrice !== null && checkPriceAgainstBudget(currentPrice)) {
                      console.log(`TV Filter (tv-budget) - Product: ${product.productName}, Found a matching price (${currentPrice} for size ${priceEntry.screenSize || 'N/A'}) for budget '${budgetAnswer}'.`);
                      return true; // Found at least one price that matches the budget
                    }
                  }
                  // No price in the array matched the budget
                  console.log(`TV Filter (tv-budget) - Product: ${product.productName}, No price in array matches budget '${budgetAnswer}'.`);
                  return false;
                }
              }
              // Fallback if pricesArray is neither a number nor an array (already handled by initial guard, but as safety)
              console.log(`TV Filter (tv-budget) - Product: ${product.productName}, Price data format unexpected or no matching price found after checks. Skipping filter.`);
              return true;
            }
            default: return true; // Unhandled TV question, don't filter out
          }
        } else if (selectedCategory.name === 'Laptops') {
          // --- Laptop-Specific Filtering Logic ---
          console.log(`Laptop Filter - Product: ${product.productName}, KeySpecs:`, JSON.parse(JSON.stringify(keySpecs)));
          const ram = parseRam(keySpecs.RAM || keySpecs.Memory);
          const storage = parseStorage(keySpecs.Storage);
          const screenSize = parseScreenSize(keySpecs['Display Size'] || keySpecs['Screen Size']);
          const processor = String(keySpecs.Processor || '').toLowerCase();
          const graphicsDedicated = hasDedicatedGraphics(keySpecs);
          const battery = parseBatteryLife(keySpecs['Battery Life']);
          const design = String(keySpecs.Design || '').toLowerCase();
          const productName = String(product.productName || '').toLowerCase();

          switch (questionId) {
            case 'laptop-primary-use':
              console.log(`Laptop Filter (laptop-primary-use) - Product: ${product.productName}, RAM: ${ram}, GraphicsDedicated: ${graphicsDedicated}, Processor: '${processor}', Answer: '${answerValue}'`);
              if (answerValue === 'general_use') {
                return (!ram || ram <= 8) && !graphicsDedicated && 
                       (processor.includes('i3') || processor.includes('ryzen 3') || processor.includes(' m1') || processor.includes(' m2') || processor.includes(' m3') || processor.includes(' m4') && !processor.includes('pro') && !processor.includes('max'));
              }
              if (answerValue === 'productivity_work') {
                return (ram >= 8) && !graphicsDedicated &&
                       (processor.includes('i5') || processor.includes('i7') || processor.includes('ryzen 5') || processor.includes('ryzen 7') || processor.includes('ultra 5') || processor.includes('ultra 7') || processor.includes('pro') || processor.includes('max'));
              }
              if (answerValue === 'gaming') {
                return (ram >= 16) && graphicsDedicated &&
                       (processor.includes('i7') || processor.includes('i9') || processor.includes('ryzen 7') || processor.includes('ryzen 9') || processor.includes('hx') || processor.includes('max') || processor.includes('ultra'));
              }
              if (answerValue === 'creative_work') {
                return (ram >= 16) && graphicsDedicated &&
                       (processor.includes('i7') || processor.includes('i9') || processor.includes('ryzen 7') || processor.includes('ryzen 9') || processor.includes('pro') || processor.includes('max') || processor.includes('ultra'));
              }
              if (answerValue === 'student_use') {
                return (ram >= 8) && (battery === null || battery >= 8); // Battery check is lenient if data missing
              }
              return true;

            case 'laptop-performance-level':
              console.log(`Laptop Filter (laptop-performance-level) - Product: ${product.productName}, RAM: ${ram}, GraphicsDedicated: ${graphicsDedicated}, Processor: '${processor}', Answer: '${answerValue}'`);
              if (answerValue === 'basic_performance') {
                return (!ram || ram <= 8) && !graphicsDedicated &&
                       (processor.includes('i3') || processor.includes('celeron') || processor.includes('pentium') || (processor.includes(' m') && !processor.includes('pro') && !processor.includes('max')));
              }
              if (answerValue === 'good_performance') {
                return (ram >= 8 && ram <= 16) && (!graphicsDedicated || processor.includes('pro')) && // Allow Apple Pro with integrated
                       (processor.includes('i5') || processor.includes('ultra 5') || processor.includes('ryzen 5') || (processor.includes(' m') && (processor.includes('pro') || (!processor.includes('max') && !processor.includes('ultra')))));
              }
              if (answerValue === 'high_performance') {
                return (ram >= 16) && graphicsDedicated &&
                       (processor.includes('i7') || processor.includes('ultra 7') || processor.includes('ryzen 7') || processor.includes('pro') || processor.includes('max'));
              }
              if (answerValue === 'max_performance') {
                return (ram >= 16) && graphicsDedicated && // Often 32GB+ but 16GB is a min
                       (processor.includes('i9') || processor.includes('ultra 9') || processor.includes('ryzen 9') || processor.includes('max') || processor.includes('ultra') || processor.includes('hx'));
              }
              return true;

            case 'laptop-storage-needs':
              console.log(`Laptop Filter (laptop-storage-needs) - Product: ${product.productName}, Storage (GB): ${storage}, Answer: '${answerValue}'`);
              if (storage === null) return true; // Don't filter if storage info is missing
              if (answerValue === 'storage_256gb_less') return storage <= 256;
              if (answerValue === 'storage_512gb') return storage >= 257 && storage <= 512; // Or just storage === 512 if data is clean
              if (answerValue === 'storage_1tb') return storage > 512 && storage <= 1024; // Or storage === 1024
              if (answerValue === 'storage_2tb_plus') return storage > 1024;
              return true;

            case 'laptop-portability-form-factor':
              console.log(`Laptop Filter (laptop-portability-form-factor) - Product: ${product.productName}, ScreenSize: ${screenSize}, Design: '${design}', ProductName: '${productName}', Answer: '${answerValue}'`);
              if (answerValue === 'ultra_portable') {
                return screenSize !== null && screenSize < 14;
              }
              if (answerValue === 'balanced_portability') {
                return screenSize !== null && screenSize >= 14 && screenSize <= 15.9; // e.g. 15.6 is common
              }
              if (answerValue === 'large_screen_portability') {
                return screenSize !== null && screenSize >= 16;
              }
              if (answerValue === '2_in_1_convertible') {
                const isTouch = String(keySpecs['Screen Size'] || keySpecs.Display || '').toLowerCase().includes('touch');
                return design.includes('convertible') || design.includes('2-in-1') ||
                       productName.includes('x360') || productName.includes('yoga') ||
                       productName.includes('flip') || productName.includes('spin') ||
                       (design.includes('tablet') && keySpecs.Keyboard); // Some tablets with keyboards
              }
              return true;

            case 'laptop-brand-preference':
              // This uses generic logic because productField is 'brand'
              console.log(`Laptop Filter (laptop-brand-preference) - Product: ${product.productName}, Brand: '${product.brand}', Answer: '${answerValue}'`);
              if (!question.productField) return true;
              const productValueBrand = getNestedValue(product, question.productField);
              return String(productValueBrand || '').toLowerCase() === String(answerValue).toLowerCase();

            case 'laptop-budget': {
              let productPrice = null;
              const retailPrice = product.keySpecs?.retailPrice; // Access retailPrice from keySpecs
              console.log(`Laptop Filter (laptop-budget) - Product: ${product.productName}, Raw Retail Price:`, retailPrice, `Answer: '${answerValue}'`);

              if (typeof retailPrice === 'number') {
                productPrice = retailPrice;
              } else if (Array.isArray(retailPrice) && retailPrice.length > 0) {
                let minPrice = Infinity;
                for (const item of retailPrice) {
                  if (typeof item === 'number') {
                    minPrice = Math.min(minPrice, item);
                  } else if (typeof item === 'object' && typeof item.price === 'number') {
                    minPrice = Math.min(minPrice, item.price);
                  }
                }
                if (minPrice !== Infinity) {
                  productPrice = minPrice;
                }
              }

              console.log(`Laptop Filter (laptop-budget) - Product: ${product.productName}, Calculated Product Price: ${productPrice}, Answer: '${answerValue}'`);
              if (productPrice === null) return true; // No price info, don't filter

              let matchesBudget = true; // Assume match unless filtered out
              if (answerValue === 'under500') {
                matchesBudget = productPrice < 500;
              } else if (answerValue === '500-800') {
                matchesBudget = productPrice >= 500 && productPrice <= 800;
              } else if (answerValue === '800-1200') {
                matchesBudget = productPrice > 800 && productPrice <= 1200;
              } else if (answerValue === '1200-1800') {
                matchesBudget = productPrice > 1200 && productPrice <= 1800;
              } else if (answerValue === 'over1800') {
                matchesBudget = productPrice > 1800;
              } else {
                 matchesBudget = true; // 'any' or unhandled answerValue
              }
              console.log(`Laptop Filter (laptop-budget) - Product: ${product.productName}, Price ${productPrice} vs Answer '${answerValue}': ${matchesBudget}`);
              return matchesBudget;
            }
            default: return true; // Unhandled Laptop question
          }
        } else if (selectedCategory.name === 'Smartphones') {
          // --- Smartphone-Specific Filtering Logic ---
          console.log(`Smartphone Filter - Product: ${product.productName}, KeySpecs:`, JSON.parse(JSON.stringify(keySpecs)));
          const os = String(keySpecs['Operating System'] || '').toLowerCase();
          const processor = String(keySpecs.Processor || '').toLowerCase();
          const cameraSpec = String(keySpecs['Main Camera'] || keySpecs.Camera || '');
          const batteryLife = parseSmartphoneBatteryLife(keySpecs.Battery || keySpecs.ratedBatteryLife);
          const storage = parseStorage(keySpecs.Storage);
          const screenSize = parseScreenSize(keySpecs['Screen Size'] || keySpecs.Display);
          const productNameLower = String(product.productName || '').toLowerCase();

          switch (questionId) {
            case 'smartphone-os':
              console.log(`Smartphone Filter (smartphone-os) - Product: ${product.productName}, OS: '${os}', Answer: '${answerValue}'`);
              if (answerValue === 'iOS') return os.startsWith('ios');
              if (answerValue === 'Android') return os.startsWith('android');
              return true;

            case 'smartphone-performance': {
              const p = processor;
              console.log(`Smartphone Filter (smartphone-performance) - Product: ${product.productName}, Processor: '${p}', Answer: '${answerValue}'`);
              // Keywords for performance tiers (examples, adjust as new chips release)
              const topTierKeywords = ['a18 pro', 'snapdragon 8 gen 4', 'tensor g5', 'dimensity 9300'];
              const highTierKeywords = ['a17 pro', 'a18', 'snapdragon 8 gen 3', 'snapdragon 8 gen 2', 'tensor g4', 'tensor g3', 'dimensity 9200', 'dimensity 9000'];
              const midTierKeywords = ['a16', 'a15', 'snapdragon 7 gen 3', 'snapdragon 7 gen 2', 'snapdragon 8 gen 1', 'snapdragon 888', 'tensor g2', 'dimensity 8000', 'dimensity 7000'];
              
              const matchesKeywordList = (text, keywords) => keywords.some(kw => text.includes(kw));

              if (answerValue === 'basic_performance_sm') {
                // Basic: Not explicitly mid, high, or top. Or matches "A18" (non-pro) as per prompt example.
                const isMidOrHigher = matchesKeywordList(p, midTierKeywords) || matchesKeywordList(p, highTierKeywords) || matchesKeywordList(p, topTierKeywords);
                return !isMidOrHigher || (p.includes('a18') && !p.includes('pro'));
              }
              if (answerValue === 'everyday_multitasking_sm') {
                // Everyday: Matches mid-tier or higher, or "Tensor G4" as per prompt example.
                return p.includes('tensor g4') || matchesKeywordList(p, midTierKeywords) || matchesKeywordList(p, highTierKeywords) || matchesKeywordList(p, topTierKeywords);
              }
              if (answerValue === 'demanding_apps_sm') {
                // Demanding: Matches high-tier or top-tier.
                return matchesKeywordList(p, highTierKeywords) || matchesKeywordList(p, topTierKeywords);
              }
              if (answerValue === 'top_tier_sm') {
                // Top-Tier: Matches only top-tier.
                return matchesKeywordList(p, topTierKeywords);
              }
              return true;
            }

            case 'smartphone-camera-priority': {
              const maxMP = getMaxMegapixels(cameraSpec);
              const zoomMatch = cameraSpec.match(/(\d+)x\s*(telephoto|optical zoom|periscope)/i);
              const hasHighZoom = zoomMatch && parseInt(zoomMatch[1], 10) >= 5;
              const isProOrUltraModel = productNameLower.includes('pro') || productNameLower.includes('ultra');
              console.log(`Smartphone Filter (smartphone-camera-priority) - Product: ${product.productName}, Camera Spec: '${cameraSpec}', MaxMP: ${maxMP}, HasHighZoom: ${hasHighZoom}, IsProOrUltra: ${isProOrUltraModel}, Answer: '${answerValue}'`);

              if (answerValue === 'camera_basics_sm') return true; // Less strict
              if (answerValue === 'camera_everyday_sm') {
                return (maxMP !== null && maxMP >= 48); // e.g., 48MP or 50MP
              }
              if (answerValue === 'camera_top_notch_sm') {
                return (maxMP !== null && maxMP >= 100) || hasHighZoom || isProOrUltraModel;
              }
              return true;
            }
            case 'smartphone-battery-life':
              console.log(`Smartphone Filter (smartphone-battery-life) - Product: ${product.productName}, Parsed Battery Life (hrs): ${batteryLife}, Answer: '${answerValue}'`);
              if (batteryLife === null) return true; // Don't filter if no comparable battery info
              if (answerValue === 'battery_light_sm') return batteryLife <= 14;
              if (answerValue === 'battery_moderate_sm') return batteryLife >= 15 && batteryLife <= 20;
              if (answerValue === 'battery_heavy_sm') return batteryLife > 20;
              return true;

            case 'smartphone-storage':
              console.log(`Smartphone Filter (smartphone-storage) - Product: ${product.productName}, Storage (GB): ${storage}, Answer: '${answerValue}'`);
              if (storage === null) return true;
              if (answerValue === 'storage_128gb_sm') return storage <= 128;
              if (answerValue === 'storage_256gb_sm') return storage > 128 && storage <= 256;
              if (answerValue === 'storage_512gb_sm') return storage > 256 && storage <= 512;
              if (answerValue === 'storage_1tb_plus_sm') return storage > 512;
              return true;

            case 'smartphone-screen-size':
              console.log(`Smartphone Filter (smartphone-screen-size) - Product: ${product.productName}, Screen Size (inches): ${screenSize}, Answer: '${answerValue}'`);
              if (screenSize === null) return true;
              if (answerValue === 'screen_compact_sm') return screenSize < 6.0;
              if (answerValue === 'screen_medium_sm') return screenSize >= 6.0 && screenSize <= 6.49;
              if (answerValue === 'screen_large_sm') return screenSize >= 6.5;
              return true;

            case 'smartphone-brand-preference':
              console.log(`Smartphone Filter (smartphone-brand-preference) - Product: ${product.productName}, Brand: '${product.brand}', Answer: '${answerValue}'`);
              if (!question.productField) return true;
              const productValueBrand = getNestedValue(product, question.productField);
              return String(productValueBrand || '').toLowerCase() === String(answerValue).toLowerCase();

            case 'smartphone-budget': {
              const smartphoneRetailPrice = product.keySpecs?.retailPrice;
              const productPrice = typeof smartphoneRetailPrice === 'number' ? smartphoneRetailPrice : null;
              console.log(`Smartphone Filter (smartphone-budget) - Product: ${product.productName}, Retail Price: ${product.retailPrice}, Parsed Price: ${productPrice}, Answer: '${answerValue}'`);
              if (productPrice === null) return true;
              if (answerValue === 'budget_under300_sm') return productPrice < 300;
              if (answerValue === 'budget_300_600_sm') return productPrice >= 300 && productPrice <= 600;
              if (answerValue === 'budget_600_900_sm') return productPrice > 600 && productPrice <= 900;
              if (answerValue === 'budget_over900_sm') return productPrice > 900;
              return true;
            }
            default: return true; // Unhandled Smartphone question
          }
        } else { // Generic filtering for other categories
          if (!question.productField) return true; // No field to compare against
          const productValue = getNestedValue(product, question.productField);
          // Ensure comparison is robust, e.g. for boolean or numeric fields if they exist
          // For generic fields, direct comparison is usually fine if data types match.
          // If productValue is numeric and answerValue is string representation of number, this might fail.
          // However, for most radio options, values are strings.
          if (typeof productValue === 'number' && !isNaN(Number(answerValue))) {
            return productValue === Number(answerValue);
          }
          if (typeof productValue === 'boolean') {
            return productValue === (answerValue === 'true');
          }
          return String(productValue || '').toLowerCase().includes(String(answerValue).toLowerCase());
        }
      });
    }); // End of allProductsForCategory.filter()
    setFilteredProducts(newFilteredProducts);
    // LOG 7: After filtering is complete
    console.log(`[TechFinderPage Filtering useEffect] Filter complete. Found ${newFilteredProducts.length} products matching criteria.`);
  }, [userAnswers, allProductsForCategory, selectedCategory, isCategoryDataReady]); // Added isCategoryDataReady

  // Effect for "Generating Recommendations" loading state
  useEffect(() => {
    if (selectedCategory) {
      const categoryQuestions = questionnaires[selectedCategory.name] || [];
      // Determine if the questionnaire is complete for the purpose of showing recommendations.
      // This means all questions for the current category have been passed.
      const isQuestionnaireActuallyComplete = currentQuestionIndex >= categoryQuestions.length && categoryQuestions.length > 0;

      if (isQuestionnaireActuallyComplete) {
        // If the questionnaire is complete, start the loading simulation.
        // This will set loading to true, and then false after the timeout.
        setIsLoadingRecommendations(true);
        const timer = setTimeout(() => {
          setIsLoadingRecommendations(false);
        }, 700); // Simulate loading for 700ms
        return () => clearTimeout(timer);
      }
      // If the questionnaire is not complete (e.g., user went back),
      // we don't need to explicitly set isLoadingRecommendations to false here,
      // as the rendering logic for questions will take over.
    }
  }, [currentQuestionIndex, selectedCategory]); // Removed isLoadingRecommendations from dependencies

  // Helper to get a single price for sorting
  const getProductPriceForSort = (product, currentAnswers, categoryName) => {
    const retailPriceData = product.keySpecs?.retailPrice;

    // Helper to parse size ranges from user answers for TVs
    const getTvSizeRangeFromAnswer = (answerValue) => {
      if (answerValue === '55-inch') return { min: 40, max: 55 };
      if (answerValue === '65-inch') return { min: 60, max: 70 };
      if (answerValue === '75-inch') return { min: 75, max: Infinity }; // Max is open-ended
      return null; // 'any' or unknown
    };

    if (categoryName === 'TVs') {
      const userSelectedSizeAnswer = currentAnswers?.['tv-size'];
      const targetSizeRange = getTvSizeRangeFromAnswer(userSelectedSizeAnswer);

      if (targetSizeRange && Array.isArray(retailPriceData)) {
        // User has a specific TV size preference, and product has an array of prices.
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
        // User has specific size preference, but product has a single price. Cannot confirm it's for that size.
        return null;
      }
      // If no specific size preference, or retailPriceData isn't an array for size logic, fall through.
    }

    // Generic price extraction (min price if array, or the price if single number)
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
    return null; // No price or unparseable
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
      case 'default': // Default: Combined score (Critic + Audience) descending
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
      return; // Don't advance if not last question and no answer for radio
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
      <main className="container mx-auto px-4 py-8 mt-16 md:mt-20"> {/* Adjust mt for header */}
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
                  />
                );
              }
            })()}
          </div>
        )}
      </main>
    </>
  );
}

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