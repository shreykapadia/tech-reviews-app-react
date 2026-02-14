// src/features/categories/CategoryPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Breadcrumbs from '../products/components/Breadcrumbs';
import ProductCard from '../../components/ProductCard';
import { fetchProductsByCategory, fetchBrandsByCategory } from '../../services/productService';
import useDebounce from '../../hooks/useDebounce';
import BackButton from '../../components/common/BackButton';
import ThemeCheckbox from '../../components/common/ThemeCheckbox';

const FilterSection = React.memo(({ title, children, className }) => (
  <div className={`mb-8 last:mb-0 ${className || ''}`}>
    <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] mb-5 text-gray-500 dark:text-slate-400 px-1 opacity-80">
      {title}
    </h3>
    <div className="space-y-3.5 px-1">{children}</div>
  </div>
));
FilterSection.displayName = 'FilterSection';


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
  const [priceInputs, setPriceInputs] = useState({
    minPrice: '',
    maxPrice: '',
  });
  const debouncedPriceInputs = useDebounce(priceInputs, 500);

  // Update active filters when debounced price inputs change
  useEffect(() => {
    setActiveFilters(prev => ({
      ...prev,
      minPrice: debouncedPriceInputs.minPrice,
      maxPrice: debouncedPriceInputs.maxPrice,
    }));
  }, [debouncedPriceInputs]);
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
    setPriceInputs(prev => ({ ...prev, [type]: value }));
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <BackButton to="/categories" label="" />
              <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-text dark:text-slate-100 font-serif">
                {categoryDetails.name}
              </h1>
            </div>

            {/* Modern Category Switcher */}
            <nav className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
              {allAvailableCategories && allAvailableCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/category/${cat.slug}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border ${cat.slug === categorySlug
                    ? 'bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/20'
                    : 'bg-white/80 dark:bg-slate-800/80 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-brand-primary/50 hover:text-brand-primary'
                    }`}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="lg:flex lg:space-x-8">
            <aside className={`lg:w-1/4 xl:w-1/5 mb-8 lg:mb-0`}>
              <div className="sticky top-24 space-y-6 p-4 bg-white/85 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/60 dark:border-white/10 transition-all duration-300">
                <FilterSection title="Brand">
                  {availableBrands.map(brand => (
                    <ThemeCheckbox
                      key={brand.value}
                      label={brand.label}
                      checked={activeFilters.brands.includes(brand.value)}
                      onChange={(checked) => handleBrandFilterChange(brand.value, checked)}
                    />
                  ))}
                </FilterSection>
                <FilterSection title="Price Range">
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Min Price"
                      className="w-full p-2.5 text-sm bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all dark:text-slate-200"
                      value={priceInputs.minPrice}
                      onChange={(e) => handlePriceFilterChange('minPrice', e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Max Price"
                      className="w-full p-2.5 text-sm bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all dark:text-slate-200"
                      value={priceInputs.maxPrice}
                      onChange={(e) => handlePriceFilterChange('maxPrice', e.target.value)}
                    />
                  </div>
                </FilterSection>
              </div>
            </aside>

            <div className="lg:w-3/4 xl:w-4/5">
              {products.length === 0 && !loadingProducts && (
                <div className="text-center py-12">
                  <h2 className="text-xl font-medium text-gray-800 dark:text-slate-300">No Products Found</h2>
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
