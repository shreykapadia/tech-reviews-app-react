// src/AppRoutes.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

// Lazy load route components
const HomePage = lazy(() => import('../features/home/HomePage'));
const SearchResultsPage = lazy(() => import('../features/search/SearchResultsPage'));
const TermsOfServicePage = lazy(() => import('../features/staticContent/TermsOfServicePage'));
const PrivacyPolicyPage = lazy(() => import('../features/staticContent/PrivacyPolicyPage'));
const ProductPage = lazy(() => import('../features/products/ProductPage'));
const CategoryPage = lazy(() => import('../features/categories/CategoryPage'));


function AppRoutes({
  // Props for HomePage
  selectedProduct,
  onBackClick,
  allProductsArray,
  availableCategories,
  onProductClick,
  // Props for SearchResultsPage
  headerSearchQuery,
  headerSearchResults,
  // Props for ProductPage & CategoryPage
  calculateCriticsScore,
  // Props for CategoryPage
  isAppDataLoading,
}) {
  // A simple fallback UI for Suspense
  const LoadingFallback = () => (
    <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
      <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
      <p className="ml-4 text-lg">Loading page...</p>
    </div>
  );

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage // Updated component
              selectedProduct={selectedProduct}
              onBackClick={onBackClick}
              calculateCriticsScore={calculateCriticsScore}
              allProductsArray={allProductsArray}
              availableCategories={availableCategories}
              onProductClick={onProductClick}
            />
          }
        />
        <Route
          path="/search"
          element={
            <SearchResultsPage
              searchTerm={headerSearchQuery}
              searchResults={headerSearchResults}
              calculateCriticsScore={calculateCriticsScore}
            />
          }
        />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route
          path="/product/:productNameSlug"
          element={<ProductPage allProducts={allProductsArray} calculateCriticsScore={calculateCriticsScore} />}
        />
        <Route
          path="/category/:categorySlug"
          element={
            <CategoryPage
              allProducts={allProductsArray}
              allAvailableCategories={availableCategories}
              calculateCriticsScore={calculateCriticsScore}
              areGlobalCategoriesLoading={isAppDataLoading}
            />
          }
        />
      </Routes>
    </Suspense>
  );
}

AppRoutes.propTypes = {
  selectedProduct: PropTypes.object,
  onBackClick: PropTypes.func.isRequired,
  allProductsArray: PropTypes.array.isRequired,
  availableCategories: PropTypes.array.isRequired,
  onProductClick: PropTypes.func.isRequired,
  headerSearchQuery: PropTypes.string,
  headerSearchResults: PropTypes.array,
  calculateCriticsScore: PropTypes.func.isRequired,
  isAppDataLoading: PropTypes.bool,
};

AppRoutes.defaultProps = {
  headerSearchQuery: '',
  headerSearchResults: null,
  isAppDataLoading: true,
};

export default AppRoutes;