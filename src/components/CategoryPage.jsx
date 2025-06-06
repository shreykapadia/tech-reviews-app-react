// src/components/CategoryPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom'; // Removed useLocation as it's not used
import { Helmet } from 'react-helmet-async';
import Breadcrumbs from './ProductPage/Breadcrumbs'; // Assuming this can handle category-only views
import ProductCard from './ProductCard'; // Assuming this is the new, modern vertical ProductCard
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'; // FunnelIcon and XMarkIcon will be replaced by an inline SVG

// --- Helper Components (assumed to be similar to SearchResultsPage) ---

// FilterSection: A reusable component to wrap a filter group.
const FilterSection = ({ title, children, className }) => (
  <div className={`mb-6 ${className || ''}`}>
    <h3 className="text-lg font-semibold mb-3 text-gray-700 border-b border-gray-200 pb-2">
      {title}
    </h3>
    <div className="space-y-2">{children}</div>
  </div>
);

// CheckboxFilter: A reusable component for checkbox-based filters.
const CheckboxFilterItem = ({ item, isSelected, onChange, isDisabled, isCurrentCategory }) => (
  <label
    key={item.value}
    className={`flex items-center space-x-2 text-sm ${
      isDisabled ? 'cursor-not-allowed text-gray-400' : 'cursor-pointer hover:text-brand-primary'
    } ${isCurrentCategory ? 'font-semibold text-brand-primary' : 'text-gray-600'}`}
  >
    <input
      type="checkbox"
      className={`h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-brand-primary/50 transition-colors duration-150
        ${isDisabled ? 'text-gray-400 bg-gray-100' : 'text-brand-primary'}
        ${isCurrentCategory && isDisabled ? 'ring-2 ring-brand-primary ring-offset-1' : ''}
      `}
      value={item.value}
      checked={isSelected}
      onChange={(e) => !isDisabled && onChange(item.value, e.target.checked)}
      disabled={isDisabled}
    />
    <span>{item.label}</span>
  </label>
);


function CategoryPage({ allProducts, calculateCriticsScore }) {
  const { categorySlug } = useParams();

  const [categoryPageIsLoading, setCategoryPageIsLoading] = useState(true); // Renamed for clarity
  const [categoryPageError, setCategoryPageError] = useState(null); // Renamed for clarity
  const [categoryDetails, setCategoryDetails] = useState(null);
  const [productsForThisCategory, setProductsForThisCategory] = useState([]); // Renamed for clarity
  const [availableCategories, setAvailableCategories] = useState([]); // For sidebar filter

  const [activeFilters, setActiveFilters] = useState({
    brands: [],
    // Assuming your product data might eventually have price
    // If not, these can be removed or kept as illustrative
    minPrice: '',
    maxPrice: '',
  });
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Fetch categories data for names and validation
  useEffect(() => {
    setCategoryPageIsLoading(true);
    setCategoryPageError(null);
    setCategoryDetails(null); // Reset on slug change

    fetch('/data/categories.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load category definitions.');
        return res.json();
      })
      .then(data => {
        setAvailableCategories(data); // For the sidebar filter
        const currentCategory = data.find(cat => cat.slug === categorySlug);
        if (currentCategory) {
          setCategoryDetails(currentCategory);
        } else {
          setCategoryPageError(`The category "${categorySlug}" could not be found.`);
        }
      })
      .catch(err => {
        console.error("Error fetching categories.json:", err);
        setCategoryPageError(err.message || "Could not load category information.");
      })
      .finally(() => {
        setCategoryPageIsLoading(false);
      });
  }, [categorySlug]);

  // Filter products when categoryDetails is available or allProducts prop changes
  useEffect(() => {
    if (!categoryDetails || !allProducts) {
      setProductsForThisCategory([]); // Clear products if category unknown or allProducts not ready
      return;
    }

    // Ensure allProducts is an array before filtering
    if (Array.isArray(allProducts)) {
      const categorySpecificProducts = allProducts.filter(
        // CRITICAL: Ensure 'product.category' in products.json EXACTLY matches 'categoryDetails.name' in categories.json (case-sensitive)
        (product) => product.category === categoryDetails.name 
      );
      setProductsForThisCategory(categorySpecificProducts);
    } else {
      setProductsForThisCategory([]);
      // console.warn("allProducts prop is not an array in CategoryPage."); // Optional warning
    }
  }, [categoryDetails, allProducts]);


  const availableBrands = useMemo(() => {
    // Derive brands from the base set of products for this category
    if (!productsForThisCategory || productsForThisCategory.length === 0) return [];
    const brands = new Set(productsForThisCategory.map(p => p.brand).filter(Boolean)); // Filter out undefined/null brands
    return Array.from(brands).sort().map(brand => ({ value: brand, label: brand }));
  }, [productsForThisCategory]);

  const finalFilteredProducts = useMemo(() => { // Renamed to avoid confusion
    if (!productsForThisCategory) return [];
    return productsForThisCategory.filter(product => {
      const { brands, minPrice, maxPrice } = activeFilters;
      if (brands.length > 0 && !brands.includes(product.brand)) {
        return false;
      }
      // Note: Product data doesn't have price. This filter is a placeholder.
      // If price was available, e.g., product.price:
      // const productPrice = parseFloat(product.price); // Ensure price is a number
      // if (minPrice && productPrice < parseFloat(minPrice)) return false;
      // if (maxPrice && productPrice > parseFloat(maxPrice)) return false;
      return true;
    });
  }, [productsForThisCategory, activeFilters]);

  const handleBrandFilterChange = (brand, isChecked) => {
    setActiveFilters(prev => ({
      ...prev,
      brands: isChecked ? [...prev.brands, brand] : prev.brands.filter(b => b !== brand),
    }));
  };

  const handlePriceFilterChange = (type, value) => {
    setActiveFilters(prev => ({ ...prev, [type]: value }));
  };
  
  const handleCategoryLinkClick = () => {
    if (isMobileFiltersOpen) {
      setIsMobileFiltersOpen(false);
    }
  };

  // ----- RENDER LOGIC -----

  if (categoryPageIsLoading) { // Primary loading state for fetching category details
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
        <p className="ml-4 text-lg">Loading category...</p>
      </div>
    );
  }

  if (categoryPageError) { // If category fetch failed or slug invalid
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8 text-center min-h-[calc(100vh-10rem)] flex flex-col justify-center items-center"> {/* Adjust min-h */}
          <h1 className="text-2xl font-semibold text-red-600 mb-4">Error Loading Category</h1>
          <p className="text-gray-700 mb-6">{categoryPageError}</p>
          <Link to="/" className="text-brand-primary hover:underline">Go to Homepage</Link>
        </div>
        <Footer />
      </>
    );
  }

  if (!categoryDetails) { // Should be caught by error, but as a safeguard
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8 text-center min-h-[calc(100vh-10rem)] flex flex-col justify-center items-center">
          <h1 className="text-2xl font-semibold text-red-600 mb-4">Category Not Found</h1>
          <p className="text-gray-700 mb-6">The requested category details could not be loaded.</p>
          <Link to="/" className="text-brand-primary hover:underline">Go to Homepage</Link>
        </div>
        <Footer />
      </>
    );
  }

  // At this point, categoryDetails is loaded and valid.
  // Now, display content based on products.

  const pageTitle = `${categoryDetails.name} - TechScore Reviews & Guides`;
  const metaDescription = `Discover the best ${categoryDetails.name} reviewed by TechScore. Compare specs, read expert reviews, and find top deals on products like ${productsForThisCategory.slice(0, 2).map(p => p.productName).join(', ')} and more.`;
  const breadcrumbData = { category: categoryDetails.name, productName: '' };


  const FilterSidebarContent = () => (
    <>
      <FilterSection title="Category" className="text-sm">
        {/* Use availableCategories fetched in Effect 1 */}
        {availableCategories.map(cat => (
          <Link
            key={cat.slug}
            to={`/category/${cat.slug}`}
            onClick={handleCategoryLinkClick}
            className={`block py-1.5 px-3 rounded-md transition-colors duration-150
              ${categorySlug === cat.slug
                ? 'bg-brand-primary text-white font-semibold shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-brand-primary'
              }`}
          >
            {cat.name}
          </Link>
        ))}
      </FilterSection>

      {availableBrands.length > 0 && (
        <FilterSection title="Brand">
          {availableBrands.map(brand => (
            <CheckboxFilterItem
              key={brand.value}
              item={brand}
              isSelected={activeFilters.brands.includes(brand.value)}
              onChange={handleBrandFilterChange}
            />
          ))}
        </FilterSection>
      )}

      <FilterSection title="Price Range">
        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="Min"
            value={activeFilters.minPrice}
            onChange={(e) => handlePriceFilterChange('minPrice', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-brand-primary focus:border-brand-primary"
            aria-label="Minimum price"
          />
          <input
            type="number"
            placeholder="Max"
            value={activeFilters.maxPrice}
            onChange={(e) => handlePriceFilterChange('maxPrice', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-brand-primary focus:border-brand-primary"
            aria-label="Maximum price"
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">Note: Price filtering is illustrative as product data lacks price.</p>
      </FilterSection>
    </>
  );

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={`https://www.techscore.com/category/${categorySlug}`} />
      </Helmet>
      <main className="pt-16 md:pt-20"> {/* Adjust for fixed header height */}
        <Breadcrumbs product={breadcrumbData} />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-text mb-6 sm:mb-8 font-serif">
            {categoryDetails.name}
          </h1>

          <div className="lg:flex lg:space-x-8">
            {/* Mobile Filter Toggle Button */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                className={`w-full flex justify-between items-center p-4 bg-brand-primary text-white rounded-lg shadow-md focus:outline-none ${
                  isMobileFiltersOpen ? 'mb-4' : '' // Add margin-bottom only when sidebar is open for consistency
                }`}
                aria-expanded={isMobileFiltersOpen}
                aria-controls="category-filters-sidebar-content"
              >
                <span className="text-lg font-semibold">{isMobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}</span>
                <svg className={`w-6 h-6 transform transition-transform duration-200 ${isMobileFiltersOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Filter Sidebar */}
            <aside
              id="category-filters-sidebar-content" // Added ID for aria-controls
              className={`lg:w-1/4 xl:w-1/5 ${
                isMobileFiltersOpen ? 'block' : 'hidden'
              } lg:block mb-8 lg:mb-0`}
            >
              <div className="sticky top-24 space-y-6 p-4 bg-gray-50 rounded-lg shadow"> {/* Added padding and bg for clarity */}
                <FilterSidebarContent />
              </div>
            </aside>

            {/* Product Grid */}
            <div className="lg:w-3/4 xl:w-4/5">
              {/* Case 1: No products for this category initially (before applying any further filters) */}
              {productsForThisCategory.length === 0 && (
                 <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="mt-2 text-xl font-medium text-gray-800">No Products Found</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        There are currently no products listed in the "{categoryDetails.name}" category.
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                        (Hint: Check if <code>product.category</code> in your <code>products.json</code>
                        <br />
                        exactly matches <code>"{categoryDetails.name}"</code> from <code>categories.json</code>, including case.)
                    </p>
                    <div className="mt-6">
                        <Link
                            to="/"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
                        >
                            Go Back Home
                        </Link>
                    </div>
                </div>
              )}
              {/* Case 2: Products exist for category, but current filters yield no results */}
              {productsForThisCategory.length > 0 && finalFilteredProducts.length === 0 && (
                <div className="text-center py-12">
                     <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h2 className="mt-2 text-xl font-medium text-gray-800">No Matching Products</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        No products in "{categoryDetails.name}" match your current filters. Try adjusting your selection.
                    </p>
                 </div>
              )}
              {/* Case 3: Products exist for category and match filters */}
              {finalFilteredProducts.length > 0 && (
                <div className="grid grid-cols-1 gap-6 md:gap-8"> {/* Changed grid to single column */}
                  {finalFilteredProducts.map(product => (
                    <ProductCard
                      key={product.productName + (product.id || '')} // More robust key
                      product={product}
                      calculateCriticsScore={calculateCriticsScore}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      {/* Footer is now rendered globally by App.jsx */}
    </>
  );
}

export default CategoryPage;

// --- PropType Definitions ---
import PropTypes from 'prop-types';

CategoryPage.propTypes = {
  allProducts: PropTypes.arrayOf(
    PropTypes.shape({
      productName: PropTypes.string.isRequired,
      brand: PropTypes.string,
      category: PropTypes.string.isRequired,
      imageURL: PropTypes.string,
      description: PropTypes.string,
      keySpecs: PropTypes.object,
      criticReviews: PropTypes.array,
      // ... other product properties
    })
  ), // Can be null or undefined initially if App is still loading, or an empty array.
     // App.jsx initializes to [], so it should always be an array.
  calculateCriticsScore: PropTypes.func.isRequired,
};

CategoryPage.defaultProps = {
  allProducts: [], // Default to an empty array
};

FilterSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CheckboxFilterItem.propTypes = {
  item: PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
  isCurrentCategory: PropTypes.bool,
};