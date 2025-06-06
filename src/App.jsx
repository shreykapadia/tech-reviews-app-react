// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Added useLocation
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import SearchAndFilter from './components/SearchAndFilter';
import ProductListings from './components/ProductListings';
import ProductDetailView from './components/ProductDetailView';
import { normalizeScore, calculateCriticsScore as importedCalculateCriticsScore } from './utils/scoreCalculations';

import SearchResultsPage from './components/SearchResultsPage'; // Import the SearchResultsPage

import './App.css';
import './index.css';

function AppContent() { // Renamed App to AppContent to use hooks from react-router-dom
  const [productsData, setProductsData] = useState({});
  const [criticWeightsData, setCriticWeightsData] = useState({});
  const [allProductsArray, setAllProductsArray] = useState([]); // Flattened array for filtering
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [availableCategories, setAvailableCategories] = useState([]);

  // State for header search functionality
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [headerSearchResults, setHeaderSearchResults] = useState(null);
  const navigate = useNavigate(); 
  const location = useLocation(); // Hook to get current location

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

  // This function is called when the search is submitted from the Header
  const handleHeaderSearchSubmit = (query) => {
    setHeaderSearchQuery(query); // Update the search query state
    navigate('/search');         // Navigate to the search results page
  };

  // useEffect to calculate search results when headerSearchQuery or allProductsArray changes
  useEffect(() => {
    // If there's no search query, set results to null (or empty array if on search page already)
    // This allows SearchResultsPage to show its initial "Enter a search term" prompt
    if (!headerSearchQuery.trim()) {
      if (location.pathname === '/search') {
        setHeaderSearchResults([]); // Show "no results" or prompt on search page
      } else {
        setHeaderSearchResults(null); // No active search
      }
      return;
    }

    // Only perform filtering if allProductsArray has been populated
    if (allProductsArray.length > 0) {
      const lowerCaseQuery = headerSearchQuery.toLowerCase();
      const results = allProductsArray.filter(product =>
        product.productName.toLowerCase().includes(lowerCaseQuery) ||
        product.brand.toLowerCase().includes(lowerCaseQuery) ||
        (product.category && product.category.toLowerCase().includes(lowerCaseQuery))
      );
      setHeaderSearchResults(results);
    } else if (headerSearchQuery.trim()) {
      // Products aren't loaded yet, but a search was made. Show empty results.
      setHeaderSearchResults([]);
    }
  }, [headerSearchQuery, allProductsArray, location.pathname]); // Rerun when query, products, or location changes

  // Component for the main page content (Home)
  const HomePageLayout = () => (
    <>
      <HeroSection />
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
    </>
  );

  const isCurrentPageHome = location.pathname === '/';

  return (
    <div className="bg-brand-light-gray font-sans antialiased text-brand-text">
      <Header onSearchSubmit={handleHeaderSearchSubmit} isHomePage={isCurrentPageHome} />

      <main>
        <Routes>
          <Route path="/" element={<HomePageLayout />} />
          <Route
            path="/search"
            element={
              <SearchResultsPage
                searchTerm={headerSearchQuery}
                searchResults={headerSearchResults}
                onProductClick={handleProductCardClick} // Assuming you want to open ProductDetailView from search results too
                calculateCriticsScore={calculateCriticsScore}
              />
            }
          />
          {/* You might want a dedicated route for ProductDetailView if accessed directly via URL */}
          {/* <Route path="/product/:productId" element={<ProductDetailView ... />} /> */}
        </Routes>
      </main>
    </div>
  );
}

// Wrap AppContent with Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;