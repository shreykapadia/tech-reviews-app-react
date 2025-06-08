// src/components/ProductPage/ProductTitleBrand.jsx
import React from 'react';
import PropTypes from 'prop-types';
const ProductTitleBrandComponent = ({ productName, brand }) => {
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-primary mb-1 font-serif break-words">
        {productName}
      </h1>
      <p className="text-base sm:text-lg text-gray-600">{brand}</p>
    </div>
  );
};

ProductTitleBrandComponent.propTypes = {
  productName: PropTypes.string.isRequired,
  brand: PropTypes.string.isRequired,
};

const ProductTitleBrand = React.memo(ProductTitleBrandComponent);
ProductTitleBrand.displayName = 'ProductTitleBrand';
export default ProductTitleBrand;