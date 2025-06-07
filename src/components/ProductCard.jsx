// src/components/ProductCard.jsx
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/solid'; // For star ratings

const ProductCard = ({ product, calculateCriticsScore }) => {
  const audienceScore = product.audienceRating ? product.audienceRating.split('/')[0] : 'N/A';
  const audienceScale = product.audienceRating ? product.audienceRating.split('/')[1] : 'N/A';

  const criticsScoreDisplay = useMemo(() => {
    return product.criticReviews ? Math.round(calculateCriticsScore(product.criticReviews)) : '--';
  }, [product.criticReviews, calculateCriticsScore]);

  const productNameSlug = product.productName.toLowerCase().replace(/\s+/g, '-');

  return (
    <Link
      to={`/product/${productNameSlug}`} // Direct navigation
      className="product-card-link group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out flex flex-col overflow-hidden border border-gray-100 animate-fade-in-up"
      aria-label={`View details for ${product.productName}`}
    >
      <div className="relative pt-[75%] overflow-hidden"> {/* Aspect ratio container for image */}
        <img
          src={product.imageURL || '/images/placeholder-image.webp'}
          alt={product.productName}
          className="absolute top-0 left-0 w-full h-full object-contain p-2 sm:p-4 transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-sm sm:text-base font-semibold text-brand-text group-hover:text-brand-primary transition-colors mb-1 truncate" title={product.productName}>
          {product.productName}
        </h3>
        <p className="text-xs text-gray-500 mb-2">{product.brand}</p>

        {/* Scores section */}
        <div className="flex justify-around items-center text-center border-t border-gray-100 pt-3 mt-auto">
          <div className="px-1">
            <p className="text-xl font-bold text-brand-primary group-hover:text-blue-700 transition-colors">
              {criticsScoreDisplay}
            </p>
            <p className="text-xs text-gray-500">Critics Score</p>
          </div>
          <div className="px-1">
            <div className="flex items-center justify-center">
              <p className="text-xl font-bold text-yellow-500 group-hover:text-yellow-600 transition-colors">
                {audienceScore}
              </p>
              <StarIcon className="h-4 w-4 text-yellow-500 ml-0.5" />
            </div>
            <p className="text-xs text-gray-500">Audience ({audienceScale})</p>
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
    criticReviews: PropTypes.array,
  }).isRequired,
  calculateCriticsScore: PropTypes.func.isRequired,
};

export default ProductCard;