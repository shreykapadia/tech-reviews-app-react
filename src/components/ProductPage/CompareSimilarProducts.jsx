// src/components/ProductPage/CompareSimilarProducts.jsx
import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { StarIcon } from '@heroicons/react/24/outline'; // For audience score display

const SuggestedProductCard = ({ product, onSelect, isSelected, calculateCriticsScore }) => {
  const criticsScore = useMemo(() => {
    return product.criticReviews ? Math.round(calculateCriticsScore(product.criticReviews)) : '--';
  }, [product.criticReviews, calculateCriticsScore]);

  // Simplified audience score display for this component
  const audienceScoreDisplay = product.audienceRating || '--';

  return (
    <div
      className={`relative p-3 sm:p-4 border rounded-lg cursor-pointer transition-all duration-200 ease-in-out
                  ${isSelected ? 'border-brand-primary ring-2 ring-brand-primary shadow-lg' : 'border-gray-200 bg-white hover:shadow-md'}`}
      onClick={() => onSelect(product.productName)}
      role="checkbox"
      aria-checked={isSelected}
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onSelect(product.productName)}
    >
      {isSelected && (
        <CheckCircleIcon className="absolute top-2 right-2 h-6 w-6 text-brand-primary bg-white rounded-full p-0.5" />
      )}
      <img
        src={product.imageURL || '/images/placeholder-image.webp'}
        alt={product.productName}
        className="w-full h-32 sm:h-36 object-contain mb-3 rounded"
        loading="lazy"
      />
      <h4 className="text-sm font-semibold text-brand-text truncate mb-0.5" title={product.productName}>
        {product.productName}
      </h4>
      <p className="text-xs text-gray-500 mb-2">{product.brand}</p>
      <div className="flex justify-between items-center text-xs">
        <div className="flex flex-col items-center">
          <span className="font-bold text-brand-primary">{criticsScore}</span>
          <span className="text-gray-500">Critics</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-bold text-brand-secondary">{audienceScoreDisplay.split('/')[0]}</span> {/* Show just the score part */}
          <span className="text-gray-500">Audience</span>
        </div>
      </div>
    </div>
  );
};

const CompareSimilarProducts = ({ currentProduct, allProducts, calculateCriticsScore }) => {
  const [selectedToCompare, setSelectedToCompare] = useState([]);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentProduct && allProducts.length > 0) {
      const similar = allProducts
        .filter(
          (p) =>
            p.category === currentProduct.category &&
            p.productName !== currentProduct.productName
        )
        .slice(0, 4); // Suggest up to 4 similar products
      setSuggestedProducts(similar);
    }
  }, [currentProduct, allProducts]);

  const handleSelectProduct = (productName) => {
    setSelectedToCompare((prevSelected) => {
      if (prevSelected.includes(productName)) {
        return prevSelected.filter((name) => name !== productName);
      }
      if (prevSelected.length < 3) { // Allow selecting up to 3 products for comparison
        return [...prevSelected, productName];
      }
      return prevSelected; // Max selection reached
    });
  };

  const handleCompareNow = () => {
    if (selectedToCompare.length >= 2) {
      const queryParams = selectedToCompare
        .map((name) => `product[]=${encodeURIComponent(name)}`)
        .join('&');
      navigate(`/compare?${queryParams}`); // Navigate to a comparison page
    }
  };

  const canCompare = selectedToCompare.length >= 2 && selectedToCompare.length <= 3;

  if (!currentProduct || suggestedProducts.length === 0) {
    return null; // Don't render if no current product or no suggestions
  }

  return (
    <div className="py-8 sm:py-10 bg-gray-50 rounded-lg shadow-md border border-gray-200 animate-fade-in-up mt-6 sm:mt-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-2xl sm:text-3xl font-semibold text-brand-primary font-serif mb-6 sm:mb-8 text-center">
          Compare With Similar Products
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {suggestedProducts.map((product) => (
            <SuggestedProductCard
              key={product.productName}
              product={product}
              onSelect={handleSelectProduct}
              isSelected={selectedToCompare.includes(product.productName)}
              calculateCriticsScore={calculateCriticsScore}
            />
          ))}
        </div>
        <div className="text-center">
          <button
            onClick={handleCompareNow}
            disabled={!canCompare}
            className={`px-8 py-3 sm:px-10 sm:py-4 text-base sm:text-lg font-medium rounded-full transition-all duration-300
                        ${canCompare
                          ? 'bg-brand-primary text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transform hover:scale-105 active:scale-95'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
          >
            Compare ({selectedToCompare.length} Selected)
          </button>
          {!canCompare && selectedToCompare.length < 2 && (
            <p className="text-xs text-gray-500 mt-2">Select at least 2 products to compare.</p>
          )}
           {!canCompare && selectedToCompare.length > 3 && ( // Should not happen with current logic but good to have
            <p className="text-xs text-red-500 mt-2">Please select a maximum of 3 products.</p>
          )}
        </div>
      </div>
    </div>
  );
};

CompareSimilarProducts.propTypes = {
  currentProduct: PropTypes.object.isRequired,
  allProducts: PropTypes.array.isRequired,
  calculateCriticsScore: PropTypes.func.isRequired,
};

export default CompareSimilarProducts;