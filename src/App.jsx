// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import SearchAndFilter from './components/SearchAndFilter';
import ProductListings from './components/ProductListings';
import ProductDetailView from './components/ProductDetailView';
import { normalizeScore, calculateCriticsScore as importedCalculateCriticsScore } from './utils/scoreCalculations';

import './App.css';
import './index.css';

function App() {
  const [productsData, setProductsData] = useState({});
  const [criticWeightsData, setCriticWeightsData] = useState({});
  const [allProductsArray, setAllProductsArray] = useState([]); // Flattened array for filtering
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [availableCategories, setAvailableCategories] = useState([]);

  // Create a memoized version of calculateCriticsScore that depends on criticWeightsData
  const calculateCriticsScore = useCallback((reviews) => {
    return importedCalculateCriticsScore(reviews, criticWeightsData);
  }, [criticWeightsData]);

  // Fetch data on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [productsResponse, weightsResponse] = await Promise.all([
          fetch('/data/products.json'), // Path from public folder
          fetch('/data/criticWeights.json') // Path from public folder
        ]);

        if (!productsResponse.ok) {
          throw new Error(`HTTP error! status: ${productsResponse.status} for products.json`);
        }
        if (!weightsResponse.ok) {
          throw new Error(`HTTP error! status: ${weightsResponse.status} for criticWeights.json`);
        }

        const fetchedProducts = await productsResponse.json();
        const fetchedWeights = await weightsResponse.json();

        setProductsData(fetchedProducts);
        setCriticWeightsData(fetchedWeights);

        // Flatten products for easier filtering
        const flattened = Object.values(fetchedProducts).flat();
        setAllProductsArray(flattened);

        // Get unique categories for filter dropdown
        const categories = Object.keys(fetchedProducts).sort();
        setAvailableCategories(categories);

      } catch (error) {
        console.error("Error fetching or parsing data:", error);
        // You might want to set an error state here to display to the user
      }
    }
    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  // Apply filters whenever productsData, searchTerm, or selectedCategory changes
  useEffect(() => {
    let productsToFilter = [];

    if (selectedCategory === 'all') {
      productsToFilter = allProductsArray;
    } else if (productsData[selectedCategory] && Array.isArray(productsData[selectedCategory])) {
      productsToFilter = productsData[selectedCategory];
    } else {
      productsToFilter = [];
    }

    const filtered = productsToFilter.filter(product => {
      const matchesSearchTerm =
        product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearchTerm;
    });
    setFilteredProducts(filtered);
  }, [productsData, allProductsArray, searchTerm, selectedCategory]); // Dependencies for filtering effect

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleProductCardClick = (product) => {
    setSelectedProduct(product);
  };

  const handleBackToProducts = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="bg-brand-light-gray font-sans antialiased text-brand-text">
      <Header />

      <main>
        <HeroSection />

        {/* Conditionally render SearchAndFilter and ProductListings or ProductDetailView */}
        {selectedProduct ? (
          <ProductDetailView
            product={selectedProduct}
            onBackClick={handleBackToProducts}
            calculateCriticsScore={calculateCriticsScore}
          />
        ) : (
          <>
            <SearchAndFilter
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              categories={availableCategories}
            />
            <ProductListings
              products={filteredProducts}
              onProductClick={handleProductCardClick}
              calculateCriticsScore={calculateCriticsScore}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;