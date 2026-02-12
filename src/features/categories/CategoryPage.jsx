// src/features/categories/CategoryPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Breadcrumbs from '../products/components/Breadcrumbs';
import ProductCard from '../../components/ProductCard';
import { fetchProductsByCategory, fetchBrandsByCategory } from '../../services/productService';

const FilterSection = React.memo(({ title, children, className }) => (
  <div className={`mb-6 ${className || ''}`}>
    <h3 className="text-lg font-semibold mb-3 text-gray-700 border-b border-gray-200 pb-2">
      {title}
    </h3>
    <div className="space-y-2">{children}</div>
  </div>
));
FilterSection.displayName = 'FilterSection';

const CheckboxFilterItem = React.memo(({ item, isSelected, onChange, isDisabled }) => (
  <label className={`flex items-center space-x-2 text-sm ${isDisabled ? 'cursor-not-allowed text-gray-400' : 'cursor-pointer hover:text-brand-primary'} text-gray-600`}>
    <input
      type="checkbox"
      className={`h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-brand-primary/50 transition-colors duration-150 ${isDisabled ? 'text-gray-400 bg-gray-100' : 'text-brand-primary'}`}
      value={item.value}
      checked={isSelected}
      onChange={(e) => !isDisabled && onChange(item.value, e.target.checked)}
      disabled={isDisabled}
    />
    <span>{item.label}</span>
  </label>
));
CheckboxFilterItem.displayName = 'CheckboxFilterItem';

function CategoryPage({
  allAvailableCategories,
  calculateCriticsScore,
  areGlobalCategoriesLoading,
}) {
  const { categorySlug } = useParams();
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [offset, setOffset] = useState(0);
  const LIMIT = 10;

  const [activeFilters, setActiveFilters] = useState({
    brands: [],
    minPrice: '',
    maxPrice: '',
  });
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const categoryDetails = useMemo(() => {
    if (areGlobalCategoriesLoading || !allAvailableCategories) return null;
    return allAvailableCategories.find(cat => cat.slug === categorySlug);
  }, [categorySlug, allAvailableCategories, areGlobalCategoriesLoading]);

  // Load brands for this category
  useEffect(() => {
    if (categoryDetails) {
      fetchBrandsByCategory(categoryDetails.name)
        .then(brands => setAvailableBrands(brands.map(b => ({ value: b, label: b }))))
        .catch(err => console.error("Error fetching brands:", err));
    }
  }, [categoryDetails]);

  // Load products when category or filters change
  const loadProducts = useCallback(async (currentOffset, append = false) => {
    if (!categoryDetails) return;
    setLoadingProducts(true);
    try {
      const { products: fetchedProducts, totalCount: count } = await fetchProductsByCategory(categoryDetails.name, {
        limit: LIMIT,
        offset: currentOffset,
        brands: activeFilters.brands,
        minPrice: activeFilters.minPrice ? parseFloat(activeFilters.minPrice) : undefined,
        maxPrice: activeFilters.maxPrice ? parseFloat(activeFilters.maxPrice) : undefined,
      });

      if (append) {
        setProducts(prev => [...prev, ...fetchedProducts]);
      } else {
        setProducts(fetchedProducts);
      }
      setTotalCount(count);
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setLoadingProducts(false);
    }
  }, [categoryDetails, activeFilters]);

  useEffect(() => {
    setOffset(0);
    loadProducts(0, false);
  }, [categoryDetails, activeFilters, loadProducts]);

  const handleLoadMore = () => {
    const newOffset = offset + LIMIT;
    setOffset(newOffset);
    loadProducts(newOffset, true);
  };

  const handleBrandFilterChange = useCallback((brand, isChecked) => {
    setActiveFilters(prev => ({
      ...prev,
      brands: isChecked ? [...prev.brands, brand] : prev.brands.filter(b => b !== brand),
    }));
  }, []);

  const handlePriceFilterChange = useCallback((type, value) => {
    setActiveFilters(prev => ({ ...prev, [type]: value }));
  }, []);

  if (areGlobalCategoriesLoading || (loadingProducts && products.length === 0)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
        <p className="ml-4 text-lg">Loading category...</p>
      </div>
    );
  }

  if (!categoryDetails) {
    return (
      <div className="container mx-auto px-4 py-8 text-center min-h-[calc(100vh-10rem)] flex flex-col justify-center items-center">
        <h1 className="text-2xl font-semibold text-red-600 mb-4">Category Not Found</h1>
        <Link to="/" className="text-brand-primary hover:underline">Return to Homepage</Link>
      </div>
    );
  }

  const categoryPageCrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Categories', path: '/categories' }
  ];

  return (
    <>
      <title>{`${categoryDetails.name} - TechScore`}</title>
      <div className="pt-16 md:pt-20">
        <Breadcrumbs crumbs={categoryPageCrumbs} />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-text mb-6 sm:mb-8 font-serif">
            {categoryDetails.name}
          </h1>

          <div className="lg:flex lg:space-x-8">
            <aside className={`lg:w-1/4 xl:w-1/5 mb-8 lg:mb-0`}>
              <div className="sticky top-24 space-y-6 p-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100">
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
                <FilterSection title="Price Range">
                  <div className="flex flex-col gap-2">
                    <input
                      type="number"
                      placeholder="Min Price"
                      className="p-2 border rounded"
                      value={activeFilters.minPrice}
                      onChange={(e) => handlePriceFilterChange('minPrice', e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Max Price"
                      className="p-2 border rounded"
                      value={activeFilters.maxPrice}
                      onChange={(e) => handlePriceFilterChange('maxPrice', e.target.value)}
                    />
                  </div>
                </FilterSection>
              </div>
            </aside>

            <div className="lg:w-3/4 xl:w-4/5">
              {products.length === 0 && !loadingProducts && (
                <div className="text-center py-12">
                  <h2 className="text-xl font-medium text-gray-800">No Products Found</h2>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 md:gap-8">
                {products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    calculateCriticsScore={calculateCriticsScore}
                  />
                ))}
              </div>

              {products.length < totalCount && (
                <div className="mt-10 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingProducts}
                    className="px-6 py-3 bg-brand-primary text-white rounded-full font-semibold hover:bg-brand-primary-dark transition-colors disabled:opacity-50"
                  >
                    {loadingProducts ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CategoryPage;
