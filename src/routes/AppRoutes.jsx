// src/AppRoutes.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import AdminRoute from './AdminRoute';

// Lazy load route components
const HomePage = lazy(() => import('../features/home/HomePage'));
const SearchResultsPage = lazy(() => import('../features/search/SearchResultsPage'));
const TermsOfServicePage = lazy(() => import('../features/staticContent/TermsOfServicePage'));
const PrivacyPolicyPage = lazy(() => import('../features/staticContent/PrivacyPolicyPage'));
const CookieSettingsPage = lazy(() => import('../features/staticContent/CookieSettingsPage'));
const ProductPage = lazy(() => import('../features/products/ProductPage'));
const CategoryPage = lazy(() => import('../features/categories/CategoryPage'));
const AllCategoriesPage = lazy(() => import('../features/categories/AllCategoriesPage')); // Import the new page
const ComparePage = lazy(() => import('../features/compare/ComparePage')); // Import the new page
const TechFinderPage = React.lazy(() => import('../features/techFinder/TechFinderPage'));

const LoginPage = lazy(() => import('../features/auth/LoginPage'));
const SignupPage = lazy(() => import('../features/auth/SignupPage'));
const RequestPasswordResetPage = lazy(() => import('../features/auth/RequestPasswordResetPage'));
const UpdatePasswordPage = lazy(() => import('../features/auth/UpdatePasswordPage'));
const DashboardPage = lazy(() => import('../features/user/DashboardPage'));
const AdminPage = lazy(() => import('../features/admin/AdminPage'));

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
  // Props for TechFinderPage (allProductsArray is already listed, calculateCriticsScore is new here)
  // Props for CategoryPage
  isAppDataLoading,
}) {
  // A simple fallback UI for Suspense
  const LoadingFallback = () => (
    <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
      <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
      <p className="ml-4 text-lg text-brand-text">Loading page...</p>
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
          path="/categories"
          element={
            <AllCategoriesPage
              availableCategories={availableCategories}
              areGlobalCategoriesLoading={isAppDataLoading}
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
        <Route
          path="/compare"
          element={
            <ComparePage
              allProducts={allProductsArray}
              calculateCriticsScore={calculateCriticsScore}
            />
          }
        />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route
          path="/product/:brandSlug/:productNameSlug"
          element={<ProductPage allProducts={allProductsArray} calculateCriticsScore={calculateCriticsScore} />}
        />
        <Route
          path="/product/:productNameSlug"
          element={<ProductPage allProducts={allProductsArray} calculateCriticsScore={calculateCriticsScore} />}
        />
        <Route
          path="/tech-finder"
          element={
            <TechFinderPage
              availableCategories={availableCategories}
              isAppDataLoading={isAppDataLoading}
              allProducts={allProductsArray} // Pass allProductsArray as allProducts
              calculateCriticsScore={calculateCriticsScore} // Pass calculateCriticsScore
            />}
        />
        {/* The main Footer component is typically rendered outside the Routes, in App.jsx or a Layout component */}
        <Route
          path="/category/:categorySlug" element={(
            <>
              {/* This console.log executes if React Router matches this route and starts rendering the element */}
              {/* {console.log('AppRoutes: Matched /category/:categorySlug. Attempting to render CategoryPage...')} */}
              <CategoryPage
                allProducts={allProductsArray}
                allAvailableCategories={availableCategories}
                calculateCriticsScore={calculateCriticsScore}
                areGlobalCategoriesLoading={isAppDataLoading}
              />
            </>
          )}
        />
        {/* Auth Routes */}
        <Route path="/cookie-settings" element={<CookieSettingsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<RequestPasswordResetPage />} />
        <Route path="/update-password" element={<UpdatePasswordPage />} />
        <Route
          path="/dashboard"
          element={
            <DashboardPage calculateCriticsScore={calculateCriticsScore} />
          }
        />
        <Route
          path="/admin"
          element={(
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          )}
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
