// src/features/home/HomePage.jsx
import React from 'react';
import PropTypes from 'prop-types';
import HeroSection from './components/HeroSection'; // Updated path
import ProductDetailView from './components/ProductDetailView'; // Updated path
import CategoryBrowse from './components/CategoryBrowse';
import ProductListings from './components/ProductListings';
import HowItWorksSection from './components/HowItWorksSection';

const HomePageComponent = ({
  selectedProduct,
  onBackClick,
  calculateCriticsScore,
  allProductsArray,
  availableCategories,
  // onProductClick, // This prop is passed from AppRoutes but not used directly here
}) => {
  return (
    <>
      <HeroSection />
      {selectedProduct ? (
        <ProductDetailView
          product={selectedProduct}
          onBackClick={onBackClick}
          calculateCriticsScore={calculateCriticsScore}
        />
      ) : (
        <>
          <CategoryBrowse categoriesData={availableCategories} isLoading={!availableCategories || availableCategories.length === 0} />
          <ProductListings
            products={allProductsArray}
            calculateCriticsScore={calculateCriticsScore}
          />
          <HowItWorksSection />
        </>
      )}
    </>
  );
};

HomePageComponent.propTypes = {
  selectedProduct: PropTypes.object, // Can be null if no product is selected
  onBackClick: PropTypes.func.isRequired,
  calculateCriticsScore: PropTypes.func.isRequired,
  allProductsArray: PropTypes.array.isRequired,
  availableCategories: PropTypes.array.isRequired,
};

const HomePage = React.memo(HomePageComponent);
HomePage.displayName = 'HomePage';
export default HomePage;