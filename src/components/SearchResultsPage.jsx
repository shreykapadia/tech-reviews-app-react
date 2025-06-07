// src/components/SearchResultsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import ProductCard from './ProductCard'; // Import ProductCard

function SearchResultsPage({
  searchTerm,
  searchResults: initialSearchResults, // Renamed to initialSearchResults
  calculateCriticsScore,
}) {
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

  // Derive available filter options from the initial search results
  const availableCategories = useMemo(() => {
    if (!initialSearchResults) return [];
    const categories = initialSearchResults.map(p => p.category).filter(Boolean);
    return [...new Set(categories)].sort();
  }, [initialSearchResults]);

  const availableBrands = useMemo(() => {
    if (!initialSearchResults) return [];
    const brands = initialSearchResults.map(p => p.brand).filter(Boolean);
    return [...new Set(brands)].sort();
  }, [initialSearchResults]);

  // Effect to set initial sidebar state based on screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsFilterSidebarOpen(window.innerWidth >= 768); // md breakpoint
    };
    checkScreenSize(); // Check on mount
    window.addEventListener('resize', checkScreenSize); // Check on resize
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (!initialSearchResults) {
      setDisplayedProducts([]);
      return;
    }

    let filtered = [...initialSearchResults];

    // Filter by category
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => selectedCategories.includes(product.category));
    }

    // Filter by brand
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product => selectedBrands.includes(product.brand));
    }

    // Filter by price
    // Assuming products have a 'price' property. If not, this needs adjustment.
    // For this example, we'll assume 'price' might be in keySpecs or a direct property.
    // This part is highly dependent on your actual product data structure for price.
    // Let's assume a placeholder 'price' field for now or look in keySpecs.
    const minPrice = parseFloat(priceRange.min);
    const maxPrice = parseFloat(priceRange.max);

    filtered = filtered.filter(product => {
      // Attempt to get price. This is a placeholder.
      // You'll need to adapt this to how price is stored in your product objects.
      // Example: product.price or parseFloat(product.keySpecs?.price?.replace('$', ''))
      const productPrice = product.price || (product.keySpecs?.price ? parseFloat(String(product.keySpecs.price).replace(/[^0-9.]/g, '')) : null);

      if (productPrice === null) return true; // Or false if products without price shouldn't appear

      let passesMin = true;
      let passesMax = true;
      if (!isNaN(minPrice) && minPrice > 0) {
        passesMin = productPrice >= minPrice;
      }
      if (!isNaN(maxPrice) && maxPrice > 0) {
        passesMax = productPrice <= maxPrice;
      }
      return passesMin && passesMax;
    });

    setDisplayedProducts(filtered);

  }, [initialSearchResults, selectedCategories, selectedBrands, priceRange]);


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

  const handlePriceChange = (e) => {
    setPriceRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const FilterSection = ({ title, children, initiallyOpen = true }) => {
    const [isOpen, setIsOpen] = useState(initiallyOpen);

    // On mobile, default to closed unless specified
    useEffect(() => {
        const isMobile = window.innerWidth < 768; // md breakpoint
        if (isMobile) {
            setIsOpen(false); // Default to closed on mobile
        }
    }, []); // Run once on mount

    return (
      <div className="mb-4 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 focus:outline-none"
          aria-expanded={isOpen}
          aria-controls={`filter-content-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <h3 className="text-lg font-semibold text-brand-text">{title}</h3>
          <svg className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <div id={`filter-content-${title.toLowerCase().replace(/\s+/g, '-')}`} className={`p-4 transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
          {children}
        </div>
      </div>
    );
  };

  const CheckboxFilter = ({ items, selectedItems, onChange, itemType }) => (
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {items.map(item => (
        <label key={item} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            checked={selectedItems.includes(item)}
            onChange={() => onChange(item)}
          />
          <span className="text-sm text-gray-700">{item}</span>
        </label>
      ))}
      {items.length === 0 && <p className="text-sm text-gray-500">No {itemType} available for current results.</p>}
    </div>
  );

  // Grid classes for the results: always one column
  const resultsGridClasses = "grid grid-cols-1 gap-6 md:gap-8";

  if (!initialSearchResults) {
    // This could be a loading state or an initial state before any search is performed
    return (
      <div className="container mx-auto px-4 py-8 mt-20 md:mt-24 text-center"> {/* Added margin-top for fixed header */}
        <p className="text-xl text-gray-600">Enter a search term to find products.</p>
      </div>
    );
  }
  return (
    <>
      <main className="container mx-auto px-4 py-8 mt-20 md:mt-24"> {/* Ensure top margin for fixed header */}
        <div className="mb-12 flex flex-col sm:flex-row sm:items-baseline sm:gap-x-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-primary font-serif">
            Search Results
          </h1>
          {searchTerm && (
            <p className="text-lg sm:text-xl text-brand-text mt-1 sm:mt-0">
              for <span className="font-semibold">"{searchTerm}"</span>
            </p>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar Container */}
          <div className="w-full md:w-1/4 lg:w-1/5 md:self-start">
            {/* Toggle Button for Mobile */}
            <button
              onClick={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
              className={`md:hidden w-full flex justify-between items-center p-4 bg-brand-primary text-white rounded-lg shadow-md focus:outline-none ${
                isFilterSidebarOpen ? 'mb-4' : 'mb-0' // Add margin-bottom only when sidebar is open, or remove if results have enough top margin
              }`}
              aria-expanded={isFilterSidebarOpen}
              aria-controls="filters-sidebar-content"
            >
              <span className="text-lg font-semibold">{isFilterSidebarOpen ? 'Hide Filters' : 'Show Filters'}</span>
              <svg className={`w-6 h-6 transform transition-transform duration-200 ${isFilterSidebarOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Actual Filters Sidebar Content */}
            <aside
              id="filters-sidebar-content"
              className={`bg-white p-6 rounded-lg shadow-md transition-all duration-300 ease-in-out overflow-hidden ${
                isFilterSidebarOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none md:max-h-none md:opacity-100 md:pointer-events-auto'
              } md:block`}
            >
              <h2 className="text-2xl font-bold text-brand-primary mb-6 font-serif hidden md:block">Filters</h2>

              <FilterSection title="Category">
                <CheckboxFilter items={availableCategories} selectedItems={selectedCategories} onChange={handleCategoryChange} itemType="categories" />
              </FilterSection>

              <FilterSection title="Brand">
                <CheckboxFilter items={availableBrands} selectedItems={selectedBrands} onChange={handleBrandChange} itemType="brands" />
              </FilterSection>

              <FilterSection title="Price Range">
                <div className="space-y-3">
                  <div>
                    <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                    <input
                      type="number"
                      name="min"
                      id="minPrice"
                      value={priceRange.min}
                      onChange={handlePriceChange}
                      placeholder="e.g., 50"
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                    <input
                      type="number"
                      name="max"
                      id="maxPrice"
                      value={priceRange.max}
                      onChange={handlePriceChange}
                      placeholder="e.g., 500"
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
              </FilterSection>
              {/* Add more filter sections here (e.g., Size, other attributes) as needed */}
            </aside>
          </div>

          {/* Search Results Content */}
          {/* Add margin-top on mobile when filter sidebar is closed, to compensate for its absence */}
          <section className={`w-full md:w-3/4 lg:w-4/5 ${!isFilterSidebarOpen && window.innerWidth < 768 ? 'mt-2' : ''}`}>
            {displayedProducts.length === 0 ? (
              <div className="text-center py-10 bg-white p-6 rounded-lg shadow-md">
                {searchTerm ? (
                  <>
                    <p className="text-2xl text-gray-700 mb-4">No products found matching your filters for "{searchTerm}".</p>
                    <p className="text-gray-500">Try adjusting your search or filter criteria, or broaden your search term.</p>
                  </>
                ) : (
                  <p className="text-2xl text-gray-700 mb-4">Please enter a search term in the header to see results.</p>
                )}
              </div>
            ) : (
              <div className={resultsGridClasses}>
                {displayedProducts.map(item => ( // Changed 'product' to 'item' for clarity
                  <ProductCard
                    key={item.productName + item.brand + (item.id || '')} // Ensure unique key
                    product={item} // Pass 'item' as 'product' prop to ProductCard
                    calculateCriticsScore={calculateCriticsScore}
                  />
                ))}
              </div>
            )}
            {/* You could add pagination controls here if needed, operating on displayedProducts */}
          </section>
        </div>
      </main>
      {/* You might want to add a Footer component here as well, rendered globally or per page */}
    </>
  );
}

export default SearchResultsPage;