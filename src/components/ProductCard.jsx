// src/components/ProductCard.jsx
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, calculateCriticsScore }) => {
  const criticsScoreDisplay = useMemo(() => {
    return product.criticReviews ? Math.round(calculateCriticsScore(product.criticReviews)) : '--';
  }, [product.criticReviews, calculateCriticsScore]);

  const audienceScoreOutOf100 = useMemo(() => {
    if (product.audienceRating) {
      const match = product.audienceRating.match(/(\d+(\.\d+)?)\s*\/\s*(\d+)/);
      if (match) {
        const score = parseFloat(match[1]);
        const scale = parseInt(match[3], 10);
        if (scale !== 0) {
          return Math.round((score / scale) * 100);
        }
      }
    }
    return null;
  }, [product.audienceRating]);
  const audienceScoreToDisplay = audienceScoreOutOf100 !== null ? audienceScoreOutOf100 : '--';

  // Generalized score color function
  const getScoreColor = (score, defaultColorClass = 'text-brand-secondary') => {
    if (score === null || score === '--') return 'text-brand-secondary'; // Default or no score
    const numericScore = Number(score);
    if (isNaN(numericScore)) return defaultColorClass; // Fallback if score is not a number

    if (numericScore >= 85) return 'text-green-600';
    if (numericScore >= 70) return 'text-yellow-600';
    if (numericScore < 70 && numericScore >=0) return 'text-red-600'; // Scores can be 0
    return defaultColorClass; // Fallback for any other case
  };

  const audienceScoreColorClass = getScoreColor(audienceScoreOutOf100);
  // Use 'text-brand-primary' as the default for critics score if no specific color applies
  const criticsScoreColorClass = getScoreColor(criticsScoreDisplay, 'text-brand-primary');

  const productNameSlug = product.productName.toLowerCase().replace(/\s+/g, '-');

  return (
    <Link
      to={`/product/${productNameSlug}`} // Direct navigation
      className="product-card-link group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out flex flex-row overflow-hidden border border-gray-200 animate-fade-in-up"
      aria-label={`View details for ${product.productName}`}
    >
      {/* Image Section - Left */}
      <div className="relative w-24 sm:w-32 h-auto sm:h-32 flex-shrink-0 bg-gray-100">
        <img
          src={product.imageURL || '/images/placeholder-image.webp'}
          alt={product.productName}
          className="w-full h-full object-cover" // Changed to object-cover for better fill
          loading="lazy"
        />
      </div>

      {/* Info Section - Right */}
      <div className="p-3 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-brand-text group-hover:text-brand-primary transition-colors mb-0.5 truncate" title={product.productName}>
            {product.productName}
          </h3>
          <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
          {product.description && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2 sm:line-clamp-1 md:line-clamp-2" title={product.description}>
              {product.description}
            </p>
          )}
        </div>

        {/* Compact Scores section */}
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs items-center">
          <div>
            <span className={`font-semibold ${criticsScoreColorClass}`}>{criticsScoreDisplay}</span>
            <span className="text-gray-500 ml-0.5">Critics</span>
          </div>
          <div>
            <span className={`font-semibold ${audienceScoreColorClass}`}>{audienceScoreToDisplay}</span>
            <span className="text-gray-500 ml-0.5">Audience</span>
              {product.audienceReviewCount > 0 && (
              <span className="text-gray-400 text-xs ml-0.5">({product.audienceReviewCount.toLocaleString()})</span>
              )}
          </div>
        </div>
      </div>
    </Link>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    productName: PropTypes.string.isRequired,
    brand: PropTypes.string.isRequired,
    imageURL: PropTypes.string,
    audienceRating: PropTypes.string,
    description: PropTypes.string, // Added description
    audienceReviewCount: PropTypes.number,
    criticReviews: PropTypes.array,
  }).isRequired,
  calculateCriticsScore: PropTypes.func.isRequired,
};

export default ProductCard;