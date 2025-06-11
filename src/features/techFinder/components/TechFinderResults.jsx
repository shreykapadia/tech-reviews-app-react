// src/features/techFinder/components/TechFinderResults.jsx
import React from 'react';
import PropTypes from 'prop-types';
import ProductCard from '../../../components/ProductCard'; // Adjust path as necessary
import { ChevronDownIcon } from '@heroicons/react/24/solid'; // For custom dropdown arrow

const TechFinderResults = ({
  categoryName,
  products,
  calculateCriticsScore,
  sortOption,
  onSortChange,
  isLoading,
  onGoBackToQuestions,
  onRestart,
  closeMatchProducts, // New prop
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[200px] py-10">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
        <p className="text-lg text-gray-600">Generating your recommendations...</p>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8">
        <h3 className="text-2xl sm:text-3xl font-bold text-brand-text text-center sm:text-left mb-4 sm:mb-0">
          Your Recommended {categoryName}
        </h3>
        {products.length > 0 && (
          <div className="flex items-center space-x-2">
            <label htmlFor="sort-options" className="text-sm font-medium text-gray-700">Sort by:</label>
            <div className="relative">
              <select
                id="sort-options"
                value={sortOption}
                onChange={(e) => onSortChange(e.target.value)}
                className="appearance-none block w-full bg-white border border-gray-300 hover:border-brand-primary px-3 py-2 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-sm transition-all duration-150 ease-in-out cursor-pointer"
              >
                <option value="default">Relevance & Score</option>
                <option value="price_asc">Starting Price Price: Low to High</option>
                <option value="price_desc">Starting Price: High to Low</option>
                <option value="brand_asc">Brand: A-Z</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
          </div>
        )}
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <ProductCard key={product.id || product.productName} product={product} calculateCriticsScore={calculateCriticsScore} />
          ))}
        </div>
      ) : (
        <div className="text-center text-lg text-gray-600 py-10 bg-gray-50 rounded-lg shadow p-6">
          <p className="text-xl font-semibold mb-3">No exact matches found.</p>
          <p>Try relaxing your filters on budget or specific features, or go back to adjust your answers.</p>
        </div>
      )}

      {closeMatchProducts && closeMatchProducts.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h4 className="text-xl sm:text-2xl font-semibold text-brand-text text-center sm:text-left mb-6">
            You Might Also Consider
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {closeMatchProducts.map(product => (
              <ProductCard key={`close-${product.id || product.productName}`} product={product} calculateCriticsScore={calculateCriticsScore} />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-10">
        <button onClick={onGoBackToQuestions} className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors">
          Go Back to Questions
        </button>
        <button onClick={onRestart} className="w-full sm:w-auto px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary-dark transition-colors">
          Start Over
        </button>
      </div>
    </div>
  );
};

TechFinderResults.propTypes = {
  categoryName: PropTypes.string.isRequired,
  products: PropTypes.array.isRequired,
  calculateCriticsScore: PropTypes.func.isRequired,
  sortOption: PropTypes.string.isRequired,
  onSortChange: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onGoBackToQuestions: PropTypes.func.isRequired,
  onRestart: PropTypes.func.isRequired,
  closeMatchProducts: PropTypes.array,
};

TechFinderResults.defaultProps = {
  closeMatchProducts: [],
};

export default TechFinderResults;