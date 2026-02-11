// src/features/home/HomePage.jsx
import React from 'react';
import PropTypes from 'prop-types';
import HeroSection from './components/HeroSection';
import ProductDetailView from './components/ProductDetailView';
import CategoryBrowse from './components/CategoryBrowse';
import ProductListings from './components/ProductListings';
import HowItWorksSection from './components/HowItWorksSection';

const HomePageComponent = ({
  selectedProduct,
  onBackClick,
  calculateCriticsScore,
  availableCategories,
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
            calculateCriticsScore={calculateCriticsScore}
          />
          <HowItWorksSection />
        </>
      )}
    </>
  );
};

HomePageComponent.propTypes = {
  selectedProduct: PropTypes.object,
  onBackClick: PropTypes.func.isRequired,
  calculateCriticsScore: PropTypes.func.isRequired,
  availableCategories: PropTypes.array.isRequired,
};

const HomePage = React.memo(HomePageComponent);
HomePage.displayName = 'HomePage';
export default HomePage;
