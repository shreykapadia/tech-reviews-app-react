// src/components/ProductCard.jsx
import React from 'react';

function ProductCard({ product, onCardClick, calculateCriticsScore, layout = "default" }) {
  const criticsScore = calculateCriticsScore(product.criticReviews);
  let scoreDisplay = 'N/A';
  let scoreBadgeClass = 'score-avg';

  if (criticsScore !== null && !isNaN(criticsScore)) {
    const roundedScore = Math.round(criticsScore);
    scoreDisplay = `${roundedScore}/100`;
    if (roundedScore >= 85) scoreBadgeClass = 'score-excellent';
    else if (roundedScore >= 70) scoreBadgeClass = 'score-good';
  }

  // Convert audience rating to a score out of 100 and determine badge class
  let audienceScoreDisplay = 'N/A';
  let audienceScoreBadgeClass = 'score-avg';
  if (product.audienceRating) {
    const parts = product.audienceRating.split('/');
    if (parts.length === 2) {
      const score = parseFloat(parts[0]);
      const scale = parseFloat(parts[1]);
      if (!isNaN(score) && !isNaN(scale) && scale !== 0) {
        const scoreOutOf100 = Math.round((score / scale) * 100);
        audienceScoreDisplay = `${scoreOutOf100}/100`;
        if (scoreOutOf100 >= 85) audienceScoreBadgeClass = 'score-excellent';
        else if (scoreOutOf100 >= 70) audienceScoreBadgeClass = 'score-good';
      }
    }
  }

  if (layout === "horizontal") {
    return (
      <div
        className="bg-white rounded-xl shadow-lg transform hover:scale-[1.01] transition-all duration-300 border border-gray-100 hover:border-blue-200 flex flex-col md:flex-row items-stretch cursor-pointer group overflow-hidden"
        onClick={() => onCardClick(product)}
      >
        {/* Image Section - takes up more defined space */}
        <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 overflow-hidden p-4 md:p-0 md:pr-0">
          <img
            src={product.imageURL}
            alt={product.productName}
            className="w-full h-48 md:h-full object-cover rounded-lg md:rounded-none md:rounded-l-xl transform group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        {/* Content Section - takes remaining space */}
        <div className="flex-grow p-4 md:p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1 leading-tight">{product.productName}</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-3">Brand: <span className="font-semibold text-gray-600">{product.brand}</span></p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-y-2 sm:gap-x-4 mb-3">
              <div className="flex items-center space-x-2">
                <span className={`score-badge ${scoreBadgeClass}`}>{scoreDisplay}</span>
                <span className="text-xs sm:text-sm font-medium text-gray-600">Critics Score</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`score-badge ${audienceScoreBadgeClass} text-xs sm:text-sm`}>{audienceScoreDisplay}</span>
                <span className="text-xs sm:text-sm font-medium text-gray-600">Audience Score</span>
              </div>
            </div>
            {/* Optional: Short Description for horizontal layout */}
            {/* <p className="text-sm text-gray-600 leading-relaxed mb-3 hidden lg:block">
              {product.description ? `${product.description.substring(0, 100)}...` : 'No description available.'}
            </p> */}
          </div>
          {/* Button is part of this flex column, aligned to bottom */}
        </div>
        {/* Button Section - far right, vertically centered within the card's height */}
        <div className="p-4 md:p-6 flex flex-col justify-center items-center md:items-end md:ml-auto flex-shrink-0">
          <button className="w-full md:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300 text-sm sm:text-base font-medium">
            View Details
          </button>
        </div>
      </div>
    );
  }

  // Default Card Layout (Vertical)
  return (
    <div
      // Mobile: p-3. sm and up: p-6
      className="block bg-white rounded-xl shadow-lg p-3 sm:p-6 transform hover:scale-103 transition-all duration-300 border border-gray-100 hover:border-blue-200 flex flex-col justify-between cursor-pointer overflow-hidden group"
      onClick={() => onCardClick(product)} // This click handler is on the whole card
    >
      <div> {/* Content wrapper */}
        <div className="flex justify-center mb-4 overflow-hidden rounded-lg">
          {/* Mobile: h-24 (6rem). sm and up: h-40. md and up: h-48 */}
          <img src={product.imageURL} alt={product.productName} className="max-w-full h-24 sm:h-40 md:h-48 object-cover rounded-lg transform group-hover:scale-110 transition-transform duration-300" />
        </div>
        {/* Mobile: text-base. sm and up: text-xl. md and up: text-2xl */}
        <h3 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 leading-tight">{product.productName}</h3>
        {/* Mobile: text-xs, mb-2. sm and up: text-sm, mb-4 */}
        <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">Brand: <span className="font-semibold text-gray-600">{product.brand}</span></p>
        {/* Mobile: flex-row, justify-between, items-center. sm and up: flex-col, items-start, then sm:flex-row for wider sm */}
        <div className="flex flex-row items-center justify-between gap-x-2 mb-2 sm:flex-col sm:items-start sm:gap-y-1 md:flex-row md:items-center md:justify-start md:gap-x-4 sm:mb-4">
          <div className="flex items-center space-x-2">
            {/* Apply responsive text size to the badge content */}
            <span className={`score-badge ${scoreBadgeClass} text-xs sm:text-sm`}>{scoreDisplay}</span>
            <span className="text-xs sm:text-sm font-medium text-gray-600">Critics Score</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`score-badge ${audienceScoreBadgeClass} text-xs sm:text-sm`}>{audienceScoreDisplay}</span>
            <span className="text-xs sm:text-sm font-medium text-gray-600">Audience Score</span>
          </div>
        </div>
      </div>
      {/* Mobile: mt-2, px-4 py-2, text-xs. sm and up: mt-4, px-6 py-3, text-base */}
      {/* Button is hidden on mobile (screens smaller than sm), visible on sm and up */}
      <button className="hidden sm:block mt-2 sm:mt-4 w-full px-4 py-2 sm:px-6 sm:py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300 text-xs sm:text-base font-medium opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
        View Details
      </button>
    </div>
  );
}

export default ProductCard;