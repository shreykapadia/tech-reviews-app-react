// src/features/search/SearchResultsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import { searchProducts } from '../../services/productService';
import BackButton from '../../components/common/BackButton';
import ThemeCheckbox from '../../components/common/ThemeCheckbox';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

function SearchResultsPage({ calculateCriticsScore }) {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [displayedProducts, setDisplayedProducts] = useState([]);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      if (!searchTerm) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const products = await searchProducts(searchTerm);
        setResults(products);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };
    performSearch();
  }, [searchTerm]);

  const availableCategories = useMemo(() =>
    Array.from(new Set(results.map(p => p.category))).sort()
    , [results]);

  const availableBrands = useMemo(() =>
    Array.from(new Set(results.map(p => p.brand))).sort()
    , [results]);

  useEffect(() => {
    let filtered = results.filter(product => {
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) return false;
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) return false;

      const price = product.keySpecs?.retailPrice;
      if (typeof price === 'number') {
        if (priceRange.min && price < parseFloat(priceRange.min)) return false;
        if (priceRange.max && price > parseFloat(priceRange.max)) return false;
      }
      return true;
    });
    setDisplayedProducts(filtered);
  }, [results, selectedCategories, selectedBrands, priceRange]);

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const handleBrandChange = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const FilterSection = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
      <div className="mb-4 bg-white/85 dark:bg-slate-800/70 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-300">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-slate-400 opacity-90">{title}</h3>
          {isOpen ? (
            <ChevronUpIcon className="h-3.5 w-3.5 text-gray-400" />
          ) : (
            <ChevronDownIcon className="h-3.5 w-3.5 text-gray-400" />
          )}
        </button>
        {isOpen && (
          <div className="px-5 pb-5 pt-1 space-y-4">
            {children}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 mt-24 text-center">Searching...</div>;
  }

  return (
    <main className="container mx-auto px-4 py-10 mt-20 md:mt-24">
      <div className="mb-8">
        <BackButton className="mb-4" />
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-x-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-primary font-serif">Search Results</h1>
          {searchTerm && <p className="text-lg sm:text-xl text-brand-text mt-1 sm:mt-0">for <span className="font-semibold">"{searchTerm}"</span></p>}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4 lg:w-1/5">
          <FilterSection title="Category">
            {availableCategories.map(cat => (
              <ThemeCheckbox
                key={cat}
                label={cat}
                checked={selectedCategories.includes(cat)}
                onChange={() => handleCategoryChange(cat)}
              />
            ))}
          </FilterSection>
          <FilterSection title="Brand">
            {availableBrands.map(brand => (
              <ThemeCheckbox
                key={brand}
                label={brand}
                checked={selectedBrands.includes(brand)}
                onChange={() => handleBrandChange(brand)}
              />
            ))}
          </FilterSection>

          <FilterSection title="Price Range" defaultOpen={false}>
            <div className="space-y-3">
              <input
                type="number"
                placeholder="Min Price"
                className="w-full p-2.5 text-sm bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all dark:text-slate-200"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              />
              <input
                type="number"
                placeholder="Max Price"
                className="w-full p-2.5 text-sm bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all dark:text-slate-200"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              />
            </div>
          </FilterSection>
        </aside>

        <section className="w-full md:w-3/4 lg:w-4/5">
          {displayedProducts.length === 0 ? (
            <div className="text-center py-10 bg-white/85 dark:bg-slate-800/70 backdrop-blur-xl p-6 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/60 dark:border-white/10 transition-all duration-300">
              <p className="text-2xl text-gray-700 dark:text-slate-300 mb-4">No products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {displayedProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  calculateCriticsScore={calculateCriticsScore}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default SearchResultsPage;
