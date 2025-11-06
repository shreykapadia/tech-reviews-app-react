// src/components/ProductDetailView.jsx
import React from 'react';

function ProductDetailView({ product, onBackClick, calculateCriticsScore }) {
  if (!product) {
    return null;
  }

  const criticsScore = calculateCriticsScore(product.criticReviews);
  let scoreDisplay = 'N/A';
  let scoreBadgeClass = 'score-avg';

  if (criticsScore !== null) {
    const roundedScore = Math.round(criticsScore);
    scoreDisplay = `${roundedScore}/100`;
    if (roundedScore >= 85) scoreBadgeClass = 'score-excellent';
    else if (roundedScore >= 70) scoreBadgeClass = 'score-good';
  }

  const formatKey = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

  return (
    <div id="product-detail" className="mt-8 p-6 bg-white rounded-lg shadow-lg container mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 relative">
        <button
          id="back-to-products-btn"
          className="absolute top-4 right-4 px-4 py-2 bg-brand-light-gray text-brand-text rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors duration-200 text-sm font-medium"
          onClick={onBackClick}
        >
          &larr; Back to Products
        </button>

        <div className="flex flex-col md:flex-row gap-8 mt-12">
          <div className="md:w-1/2 flex justify-center items-start">
            <img
              id="product-detail-image"
              src={product.imageURL}
              alt={`${product.productName} Detail`}
              className="w-full max-w-lg rounded-xl shadow-md object-cover"
            />
          </div>

          <div className="md:w-1/2 flex flex-col">
            <h2 id="product-detail-name" className="text-4xl md:text-5xl font-extrabold text-brand-primary mb-2 leading-tight font-serif">
              {product.productName}
            </h2>
            <p className="text-lg text-brand-text mb-2">Brand: <span id="product-detail-brand" className="font-semibold text-brand-text">{product.brand}</span></p>
            <p className="text-lg text-brand-text mb-6">Category: <span id="product-detail-category" className="font-semibold text-brand-text">{product.category}</span></p>

            {/* Use a grid for consistent alignment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-8">
              {/* Critics Score */}
              <div className="flex items-center space-x-3 justify-center sm:justify-start">
                <span id="product-detail-critics-score" className={`score-badge ${scoreBadgeClass} score-badge-lg`}>
                  {criticsScore !== null ? `${Math.round(criticsScore)}/100` : 'N/A'}
                </span>
                <span className="text-lg font-semibold text-brand-text">Critics Score</span>
              </div>
              {/* Audience Rating */}
              <div className="flex items-center space-x-3 justify-center sm:justify-start">
                <span className="text-3xl text-yellow-500">&#9733;</span>
                <span id="product-detail-audience-rating" className="text-lg font-semibold text-brand-text">{product.audienceRating} Audience Rating</span>
              </div>
            </div>

            <div className="mb-8 p-6 bg-brand-light-gray rounded-lg shadow-sm border border-gray-100 text-left">
              <h3 className="text-2xl font-bold text-brand-text mb-4 font-serif">Key Specifications</h3>
              <ul id="product-detail-key-specs" className="list-disc list-inside space-y-2 text-brand-text">
                {Object.entries(product.keySpecs).map(([key, value]) => (
                  <li key={key}><strong>{formatKey(key)}:</strong> {value}</li>
                ))}
              </ul>
            </div>

            <details className="mb-4">
              <summary id="pros-cons-toggle-btn" className="text-lg text-brand-text font-serif cursor-pointer">
                AI-Generated Pros & Cons Summary
              </summary>
              <div id="pros-cons-content" className="content mt-4 text-left">
                <h4 className="text-xl font-semibold text-brand-text mb-3">Pros:</h4>
                <ul id="product-detail-pros" className="list-disc list-inside space-y-1 text-brand-text mb-4">
                  {product.aiProsCons?.pros?.map((pro, index) => (
                    <li key={`pro-${index}`}>{pro}</li>
                  ))}
                </ul>
                <h4 className="text-xl font-semibold text-brand-text mb-3">Cons:</h4>
                <ul id="product-detail-cons" className="list-disc list-inside space-y-1 text-brand-text">
                  {product.aiProsCons?.cons?.map((con, index) => (
                    <li key={`con-${index}`}>{con}</li>
                  ))}
                </ul>
              </div>
            </details>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailView;