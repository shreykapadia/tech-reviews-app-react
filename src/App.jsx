// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Added useLocation
import Cookies from 'js-cookie'; // Import js-cookie
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import SearchAndFilter from './components/SearchAndFilter';
import ProductListings from './components/ProductListings';
import ProductDetailView from './components/ProductDetailView';
import CategoryBrowse from './components/CategoryBrowse'; // Import the CategoryBrowse component
import Footer from './components/Footer'; // Import the Footer component
import { normalizeScore, calculateCriticsScore as importedCalculateCriticsScore } from './utils/scoreCalculations';
import PrivacyPolicyPage from './components/PrivacyPolicyPage'; // Import the Privacy Policy page
import HowItWorksSection from './components/HowItWorksSection'; // Import the HowItWorksSection
import CookieConsentBanner from './components/CookieConsentBanner'; // Import the CookieConsentBanner
import TermsOfServicePage from './components/TermsOfServicePage'; // Import the Terms of Service page
import ProductPage from './components/ProductPage'; // Import the new ProductPage component

import SearchResultsPage from './components/SearchResultsPage'; // Import the SearchResultsPage

import './App.css';
import './index.css';

// Helper function to get all related search terms for a given query
// It now accepts aliases as an argument
const getEffectiveSearchTerms = (query, aliases = {}) => {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];

  let effectiveTermsSet = new Set([lowerQuery]); // Start with the query itself

  // Iterate through alias groups
  for (const key in aliases) {
    const aliasGroup = aliases[key];
    if (aliasGroup.includes(lowerQuery)) {
      // If the query is part of an alias group, add all terms from that group
      aliasGroup.forEach(term => effectiveTermsSet.add(term));
    }
  }
  return Array.from(effectiveTermsSet);
};

// Define HomePageLayout outside AppContent so it can be effectively memoized.
// It needs to receive all its dependencies as props.
const MemoizedHomePageLayout = React.memo(function HomePageLayout({
  selectedProduct,
  onBackClick,
  calculateCriticsScore,
  filteredProducts,
  onProductClick
}) {
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
          <CategoryBrowse />
          <ProductListings
            products={filteredProducts}
            onProductClick={onProductClick}
            calculateCriticsScore={calculateCriticsScore}
          />
          <HowItWorksSection />
        </>
      )}
    </>
  );
});

function AppContent() { // Renamed App to AppContent to use hooks from react-router-dom
  const [productsData, setProductsData] = useState({});
  const [criticWeightsData, setCriticWeightsData] = useState({});
  const [searchAliasesData, setSearchAliasesData] = useState({}); // State for search aliases
  const [allProductsArray, setAllProductsArray] = useState([]); // Flattened array for filtering
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [showCookieBanner, setShowCookieBanner] = useState(false);

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
        const [productsResponse, weightsResponse, aliasesResponse] = await Promise.all([
          fetch('/data/products.json'), // Path from public folder
          fetch('/data/criticWeights.json'), // Path from public folder
          fetch('/data/searchAliases.json') // Path to the aliases file
        ]);

        if (!productsResponse.ok) {
          throw new Error(`HTTP error! status: ${productsResponse.status} for products.json`);
        }
        if (!weightsResponse.ok) {
          throw new Error(`HTTP error! status: ${weightsResponse.status} for criticWeights.json`);
        }
        if (!aliasesResponse.ok) {
          throw new Error(`HTTP error! status: ${aliasesResponse.status} for searchAliases.json`);
        }

        const fetchedProducts = await productsResponse.json();
        const fetchedWeights = await weightsResponse.json();
        const fetchedAliases = await aliasesResponse.json();

        setProductsData(fetchedProducts);
        setCriticWeightsData(fetchedWeights);
        setSearchAliasesData(fetchedAliases);

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

  // Effect for cookie consent
  useEffect(() => {
    const consentCookie = Cookies.get('userConsent');
    if (!consentCookie) {
      setShowCookieBanner(true);
    } else if (consentCookie === 'accepted') {
      // User has already consented, you can initialize cookie-dependent services here
      console.log('Cookie consent previously accepted.');
      // e.g., initializeAnalytics();
    } else {
      console.log('Cookie consent previously declined.');
    }
  }, []);

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

  const handleCategoryChange = useCallback((event) => {
    setSelectedCategory(event.target.value);
  }, []);

  const handleProductCardClick = useCallback((product) => {
    setSelectedProduct(product);
  }, []); // setSelectedProduct is stable

  const handleBackToProducts = useCallback(() => {
    setSelectedProduct(null);
  }, []); // setSelectedProduct is stable

  const handleAcceptCookieConsent = () => {
    Cookies.set('userConsent', 'accepted', { expires: 365, path: '/' });
    setShowCookieBanner(false);
    // Initialize services that use cookies now
    // e.g., initializeAnalytics();
    console.log('User accepted cookie consent.');
  };

  const handleDeclineCookieConsent = () => {
    // You might still want to set a cookie to remember they declined,
    // to avoid showing the banner on every visit.
    Cookies.set('userConsent', 'declined', { expires: 365, path: '/' });
    setShowCookieBanner(false);
    console.log('User declined cookie consent.');
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
      const effectiveTerms = getEffectiveSearchTerms(headerSearchQuery, searchAliasesData);

      if (effectiveTerms.length === 0) { // Should ideally not happen if headerSearchQuery is trimmed and not empty
        setHeaderSearchResults([]);
        return;
      }

      const results = allProductsArray.filter(product =>
        effectiveTerms.some(term => {
          const productNameLower = product.productName.toLowerCase();
          const brandLower = product.brand.toLowerCase();
          const categoryLower = product.category ? product.category.toLowerCase() : '';
          // const descriptionLower = product.description ? product.description.toLowerCase() : ''; // Optional: search in description

          return productNameLower.includes(term) ||
                 brandLower.includes(term) ||
                 categoryLower.includes(term);
                 // || descriptionLower.includes(term);
        })
      );
      setHeaderSearchResults(results);
    } else if (headerSearchQuery.trim()) {
      // Products aren't loaded yet, but a search was made. Show empty results.
      setHeaderSearchResults([]);
    }
  }, [headerSearchQuery, allProductsArray, searchAliasesData, location.pathname]); // Rerun when query, products, aliases, or location changes


  const isCurrentPageHome = location.pathname === '/';

  return (
    <div className="bg-brand-light-gray font-sans antialiased text-brand-text">
      <Header onSearchSubmit={handleHeaderSearchSubmit} isHomePage={isCurrentPageHome} />

      <main>
        <Routes>
          <Route 
            path="/" 
            element={
              <MemoizedHomePageLayout
                selectedProduct={selectedProduct}
                onBackClick={handleBackToProducts}
                calculateCriticsScore={calculateCriticsScore}
                filteredProducts={filteredProducts}
                onProductClick={handleProductCardClick}
              />} 
          />
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
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route 
            path="/product/:productNameSlug" 
            element={
              <ProductPage 
                allProducts={allProductsArray} 
                calculateCriticsScore={calculateCriticsScore} 
              />
            } 
          />
        </Routes>
        {/* Footer is outside main but part of the overall page structure */}
      </main>
      <Footer />
      {showCookieBanner && (
        <CookieConsentBanner
          onAccept={handleAcceptCookieConsent}
          onDecline={handleDeclineCookieConsent}
        />
      )}
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