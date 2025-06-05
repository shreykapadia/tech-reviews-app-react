// src/components/ProductCard.jsx
import React from 'react';

function ProductCard({ product, onCardClick, calculateCriticsScore }) {
  const criticsScore = calculateCriticsScore(product.criticReviews);
  let scoreDisplay = 'N/A';
  let scoreBadgeClass = 'score-avg';

  if (criticsScore !== null && !isNaN(criticsScore)) {
    const roundedScore = Math.round(criticsScore);
    scoreDisplay = `${roundedScore}/100`;
    if (roundedScore >= 85) scoreBadgeClass = 'score-excellent';
    else if (roundedScore >= 70) scoreBadgeClass = 'score-good';
  }

  return (
    <div
      className="block bg-white rounded-xl shadow-lg p-6 transform hover:scale-103 transition-all duration-300 border border-gray-100 hover:border-blue-200 flex flex-col justify-between cursor-pointer overflow-hidden group"
      onClick={() => onCardClick(product)}
    >
      <div>
        <div className="flex justify-center mb-4 overflow-hidden rounded-lg">
          <img src={product.imageURL} alt={product.productName} className="max-w-full h-auto rounded-lg object-cover transform group-hover:scale-110 transition-transform duration-300" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1 leading-tight">{product.productName}</h3>
        <p className="text-sm text-gray-500 mb-4">Brand: <span className="font-semibold text-gray-600">{product.brand}</span></p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-y-2 sm:gap-x-4 mb-4">
          <div className="flex items-center space-x-2">
            <span className={`score-badge ${scoreBadgeClass}`}>{scoreDisplay}</span>
            <span className="text-sm font-medium text-gray-600">Critics Score</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg text-yellow-500">&#9733;</span>
            <span className="text-sm font-medium text-gray-600">{product.audienceRating} Audience Rating</span>
          </div>
        </div>
      </div>
      <button className="mt-4 w-full px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300 text-base font-medium opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
        View Details
      </button>
    </div>
  );
}

export default ProductCard;