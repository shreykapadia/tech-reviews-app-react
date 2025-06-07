// src/components/ProductPage/ProductTitleBrand.jsx
import React from 'react';
import PropTypes from 'prop-types';

const ProductTitleBrand = ({ productName, brand }) => {
  if (!productName || !brand) {
    // Or render some placeholder/error if data is missing
    return null;
  }

  return (
    <div className="mb-6 sm:mb-8 animate-fade-in-up">
      {/* Product Title - H1 equivalent */}
      <h1 className="text-4xl sm:text-5xl font-bold text-brand-primary font-serif mb-1 sm:mb-2 break-words">
        {productName}
      </h1>
      {/* Brand Display */}
      <p className="text-lg sm:text-xl text-gray-600 font-sans font-medium">
        By {brand}
      </p>
    </div>
  );
};

ProductTitleBrand.propTypes = {
  productName: PropTypes.string.isRequired,
  brand: PropTypes.string.isRequired,
};

export default ProductTitleBrand;