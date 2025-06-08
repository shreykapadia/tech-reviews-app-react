// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Added useLocation
import Cookies from 'js-cookie'; // Import js-cookie
import { HelmetProvider } from 'react-helmet-async'; // Import HelmetProvider
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

import CategoryPage from './components/CategoryPage'; // Import the CategoryPage component
import SearchResultsPage from './components/SearchResultsPage'; // Import the SearchResultsPage

import { supabase } from './supabaseClient.js'; // Import Supabase client
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
  allProductsArray, // Changed from filteredProducts to allProductsArray for ProductListings
  availableCategories, // Pass availableCategories for CategoryBrowse
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
          {/* Pass availableCategories to CategoryBrowse */}
          <CategoryBrowse categoriesData={availableCategories} />
          <ProductListings
            products={allProductsArray} // ProductListings should get all products for its own randomization
            // onProductClick={onProductClick} // onProductClick is not used by ProductListings directly
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
  const [criticWeightsData, setCriticWeightsData] = useState({}); // Keep for now, or move to Supabase
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
      console.log("Fetching data from Supabase...");
      try {
        // Fetch products with their category name and critic reviews
        // This assumes you have a 'categories' table and 'critic_reviews' table
        // and 'products' table has a 'category_id' FK to 'categories.id'
        // and 'critic_reviews' table has a 'product_id' FK to 'products.id'
        const { data: fetchedProducts, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            categories ( name ), 
            critic_reviews ( * )
          `);

        if (productsError) {
          console.error("Supabase products error:", productsError);
          throw productsError;
        }

        // Process fetched products to match the structure your app expects
        // (e.g., adding category name directly to product object)
        const processedProducts = fetchedProducts.map(p => ({
          ...p,
          productName: p.product_name, // Map snake_case from DB to camelCase if needed
          imageURL: p.image_url,
          keySpecs: p.key_specs,
          bestBuySku: p.best_buy_sku,
          audienceRating: p.audience_rating,
          audienceReviewCount: p.audience_review_count,
          aiProsCons: p.ai_pros_cons,
          category: p.categories?.name || 'Unknown', // Add category name
          criticReviews: p.critic_reviews || [],    // Ensure criticReviews is an array
          // Supabase returns critic_reviews as a nested array, App expects product.criticReviews
        }));
        
        setAllProductsArray(processedProducts);

        // Reconstruct productsData (object keyed by category name) if still needed
        // Or adapt components to use allProductsArray and filter by category name
        const productsByCategory = processedProducts.reduce((acc, product) => {
          const categoryName = product.category;
          if (!acc[categoryName]) {
            acc[categoryName] = [];
          }
          acc[categoryName].push(product);
          return acc;
        }, {});
        setProductsData(productsByCategory);

        // Fetch categories for the filter dropdown (if not already derived)
        const { data: fetchedCategories, error: categoriesError } = await supabase
          .from('categories')
          .select('*') // Fetch all columns for categories
          .order('name', { ascending: true });

        if (categoriesError) throw categoriesError;
        // Process categories to ensure consistent naming (e.g., camelCase)
        const processedCategories = fetchedCategories.map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          iconImageUrl: cat.icon_image_url, // Map from snake_case
          ariaLabel: cat.aria_label,       // Map from snake_case
          // Add any other fields CategoryBrowse or CategoryPage might need
        }));
        setAvailableCategories(processedCategories);

        // Keep fetching criticWeights and searchAliases from local JSON for now
        // These could also be moved to Supabase tables later
        const [weightsResponse, aliasesResponse] = await Promise.all([
          fetch('/data/criticWeights.json'),
          fetch('/data/searchAliases.json')
        ]);

        if (!weightsResponse.ok) throw new Error(`HTTP error! status: ${weightsResponse.status} for criticWeights.json`);
        if (!aliasesResponse.ok) throw new Error(`HTTP error! status: ${aliasesResponse.status} for searchAliases.json`);
        
        const fetchedWeights = await weightsResponse.json();
        const fetchedAliases = await aliasesResponse.json();
        setCriticWeightsData(fetchedWeights);
        setSearchAliasesData(fetchedAliases);

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
                calculateCriticsScore={calculateCriticsScore} // For ProductDetailView
                allProductsArray={allProductsArray} // For ProductListings
                availableCategories={availableCategories} // For CategoryBrowse
                onProductClick={handleProductCardClick}
              />} 
          />
          <Route
            path="/search"
            element={
              <SearchResultsPage
                searchTerm={headerSearchQuery}
                searchResults={headerSearchResults}
                // onProductClick={handleProductCardClick} // ProductCard handles its own navigation
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
          <Route
            path="/category/:categorySlug"
            element={
              <CategoryPage
                allProducts={allProductsArray}
                allAvailableCategories={availableCategories} // Pass all categories
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
    <HelmetProvider>
      <Router>
        <AppContent />
      </Router>
    </HelmetProvider>
  );
}

export default App;