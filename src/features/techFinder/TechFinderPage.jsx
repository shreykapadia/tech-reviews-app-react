// src/features/techFinder/TechFinderPage.jsx
import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

function TechFinderPage({ availableCategories, isAppDataLoading }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentStep(2); // Advance to the next step (questionnaire)
    // Scroll to top might be good UX here
    window.scrollTo(0, 0);
  };

  const effectiveIsLoading = isAppDataLoading || !availableCategories;
  const effectiveError = !effectiveIsLoading && (!availableCategories || availableCategories.length === 0)
    ? "No product categories are currently available. Please try again later."
    : null;

  return (
    <>
      <Helmet>
        <title>
          {currentStep === 1 ? 'Tech Finder - Select a Category' : `Tech Finder - ${selectedCategory?.name || 'Questions'}`}
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
              {effectiveIsLoading && (
                <div className="flex justify-center items-center min-h-[200px]">
                  <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
                  <p className="ml-3 text-gray-500">Loading categories...</p>
                </div>
              )}
              {effectiveError && !effectiveIsLoading && (
                <p className="col-span-full text-center text-red-500 bg-red-50 p-4 rounded-md">{effectiveError}</p>
              )}
              {!effectiveIsLoading && !effectiveError && availableCategories && availableCategories.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                  {availableCategories.map((category) => (
                    <button
                      key={category.id || category.slug}
                      onClick={() => handleCategorySelect(category)}
                      aria-label={`Select category: ${category.name}`}
                      className="group bg-white rounded-xl shadow-lg p-4 sm:p-6 transform hover:scale-105 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-brand-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary flex flex-col items-center justify-center text-center aspect-square"
                    >
                      {category.iconImageUrl ? (
                        <img
                          src={category.iconImageUrl}
                          alt="" // Decorative, as button has aria-label
                          aria-hidden="true"
                          className="h-20 w-20 sm:h-28 sm:w-28 md:h-32 md:w-32 object-contain mb-2 sm:mb-3 group-hover:opacity-80 transition-opacity"
                        />
                      ) : (
                        <div aria-hidden="true" className="h-20 w-20 sm:h-28 sm:w-28 md:h-32 md:w-32 bg-gray-200 rounded-md mb-2 sm:mb-3 flex items-center justify-center text-gray-400 text-4xl sm:text-5xl">?</div>
                      )}
                      <span className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 group-hover:text-brand-primary transition-colors">
                        {category.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {currentStep === 2 && selectedCategory && (
          <div className="text-center py-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-text mb-4">
              Great! Let's find the perfect {selectedCategory.name}.
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              The questionnaire for {selectedCategory.name} will appear here.
            </p>
            <button
              onClick={() => { setCurrentStep(1); setSelectedCategory(null); }}
              className="px-6 py-3 bg-brand-secondary text-brand-primary font-semibold rounded-lg hover:bg-brand-secondary/80 transition-colors"
            >
              Back to Category Selection
            </button>
          </div>
        )}
      </main>
    </>
  );
}

TechFinderPage.propTypes = {
  availableCategories: PropTypes.array,
  isAppDataLoading: PropTypes.bool,
};

TechFinderPage.defaultProps = {
  availableCategories: [],
  isAppDataLoading: true,
};

export default TechFinderPage;