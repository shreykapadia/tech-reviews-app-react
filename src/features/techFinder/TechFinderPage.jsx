// src/features/techFinder/TechFinderPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import ProductCard from '../../components/ProductCard';
import { questionnaires } from './config/questionnaireData';
import { calculateCriticsScore as calculateCriticsScoreUtil } from '../../utils/ScoreCalculations'; // Assuming this is where it might live or be passed from
import {
  // Utility functions used by the moved logic will be imported in techFinderFilteringLogic.js
} from './utils/techFinderUtils';
import { checkProductAgainstCriterion, getProductPriceForSort } from './utils/techFinderFilteringLogic';
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

  // Use the passed calculateCriticsScore prop, or a default if not provided.
  const effectiveCalculateCriticsScore = calculateCriticsScore || calculateCriticsScoreUtil;


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
      // Optional: scroll to top of questions if they are visible
      // This function's primary role is to reset the question index for TechFinderResults' "Go Back" button
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
        const result = checkProductAgainstCriterion(product, questionId, answerValue, selectedCategory.name, categoryQuestions);
        return result.pass;
      });
    });

    setFilteredProducts(newFilteredProducts);

    const rejectedProducts = allProductsForCategory.filter(
      p => !newFilteredProducts.find(fp => (fp.id || fp.productName) === (p.id || p.productName))
    );
    let potentialCloseMatches = [];

    if (Object.keys(userAnswers).filter(key => userAnswers[key] !== 'any' && userAnswers[key] !== undefined && (!Array.isArray(userAnswers[key]) || userAnswers[key].length > 0)).length > 0) {
      rejectedProducts.forEach(product => {
        let failedCriteriaList = [];
        Object.entries(userAnswers).forEach(([questionId, answerValue]) => {
          // Skip 'any' answers or empty arrays for failure counting
          if (answerValue === 'any' || answerValue === undefined || (Array.isArray(answerValue) && (answerValue.length === 0 || answerValue.includes('any')))) {
            return;
          }

          const criterionCheckResult = checkProductAgainstCriterion(product, questionId, answerValue, selectedCategory.name, categoryQuestions);
          if (!criterionCheckResult.pass && criterionCheckResult.reason) {
            failedCriteriaList.push(criterionCheckResult.reason);
          }
        });

        const failedCount = failedCriteriaList.length;
        // Consider products that failed 1, 2, or 3 criteria
        if (failedCount >= 1 && failedCount <= 3) {
          potentialCloseMatches.push({ ...product, failedCount, failedCriteria: failedCriteriaList.map(fc => fc.label) });
        }
      });
    }

    // Sort close matches: first by failedCount (ascending), then by a secondary score (descending)
    potentialCloseMatches.sort((a, b) => {
      if (a.failedCount !== b.failedCount) {
        return a.failedCount - b.failedCount;
      }
      // Secondary sort by overall score (higher score is better)
      return (effectiveCalculateCriticsScore(b) || 0) + (b.audienceScore || 0) - ((effectiveCalculateCriticsScore(a) || 0) + (a.audienceScore || 0));
    });
    setCloseMatchProducts(potentialCloseMatches.slice(0, 6)); // Show up to 6 close matches

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
          const scoreA = (effectiveCalculateCriticsScore(a) || 0) + (a.audienceScore || 0);
          const scoreB = (effectiveCalculateCriticsScore(b) || 0) + (b.audienceScore || 0);
          return scoreB - scoreA;
        });
    }
    return sorted;
  }, [filteredProducts, sortOption, effectiveCalculateCriticsScore, userAnswers, selectedCategory]);

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
      <title>
        {currentStep === 1 ? 'Tech Finder - Select Category' : `Tech Finder - ${selectedCategory?.name || 'Guide'}`}
      </title>
      <meta name="description" content={currentStep === 1 ? "Select a product category to start finding your perfect tech device." : `Answer questions to find the best ${selectedCategory?.name || 'device'}.`} />
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
                    // allProductsForCategory={allProductsForCategory} // Not directly used by Questionnaire
                    calculateCriticsScore={effectiveCalculateCriticsScore} // Pass down the effective one
                    ProductCardComponent={ProductCard}
                    onRestart={handleRestart}
                  />
                );
              } else {
                return (
                  <TechFinderResults
                    categoryName={selectedCategory.name}
                    products={sortedAndFilteredProducts}
                    calculateCriticsScore={effectiveCalculateCriticsScore}
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
  calculateCriticsScore: calculateCriticsScoreUtil, // Default to the imported utility
};

export default TechFinderPage;