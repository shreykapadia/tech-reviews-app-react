// src/components/SearchResultItemCard.jsx
import React from 'react';

function SearchResultItemCard({ item, onCardClick, calculateCriticsScore }) {
  // Assuming 'item' is a product object for now.
  // This card can be adapted if search results include other types (e.g., articles).
  const { productName, brand, imageURL, criticReviews, audienceRating, description } = item;

  const criticsScore = calculateCriticsScore(criticReviews);
  let scoreDisplay = 'N/A';
  let scoreBadgeClass = 'score-avg';

  if (criticsScore !== null && !isNaN(criticsScore)) {
    const roundedScore = Math.round(criticsScore);
    scoreDisplay = `${roundedScore}/100`;
    if (roundedScore >= 85) scoreBadgeClass = 'score-excellent';
    else if (roundedScore >= 70) scoreBadgeClass = 'score-good';
  }

  // Truncate description for display
  const shortDescription = description ? (description.length > 120 ? `${description.substring(0, 117)}...` : description) : "No description available.";

  return (
    <div
      className="bg-white rounded-xl shadow-lg transform hover:scale-[1.01] transition-all duration-300 border border-gray-100 hover:border-blue-200 flex flex-col md:flex-row items-stretch cursor-pointer group overflow-hidden"
      onClick={() => onCardClick(item)}
    >
      {/* Image Section */}
      <div className="w-full md:w-48 lg:w-56 flex-shrink-0 overflow-hidden p-4 md:p-0 md:pr-0">
        <img
          src={imageURL}
          alt={productName}
          className="w-full h-48 md:h-full object-cover rounded-lg md:rounded-none md:rounded-l-xl transform group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content Section */}
      <div className="flex-grow p-4 md:p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1 leading-tight">{productName}</h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-1">Brand: <span className="font-semibold text-gray-600">{brand}</span></p>
          <p className="text-sm text-gray-600 leading-relaxed my-2 hidden sm:block"> {/* Adjusted margin and visibility */}
            {shortDescription}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-y-2 sm:gap-x-4 mb-3">
            <div className="flex items-center space-x-2">
              <span className={`score-badge ${scoreBadgeClass}`}>{scoreDisplay}</span>
              <span className="text-xs sm:text-sm font-medium text-gray-600">Critics Score</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-base sm:text-lg text-yellow-500">&#9733;</span>
              <span className="text-xs sm:text-sm font-medium text-gray-600">{audienceRating} Audience Rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Button Section */}
      <div className="p-4 md:p-6 flex flex-col justify-center items-center md:items-end md:ml-auto flex-shrink-0">
        <button className="w-full md:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300 text-sm sm:text-base font-medium">
          View Details
        </button>
      </div>
    </div>
  );
}

export default SearchResultItemCard;