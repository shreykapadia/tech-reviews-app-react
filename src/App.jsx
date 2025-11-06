// src/App.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Added useLocation, useMemo
import Cookies from 'js-cookie'; // Import js-cookie
import { BrowserRouter as Router, useNavigate, useLocation } from 'react-router-dom';
import Header from './layouts/Header'; // Updated path
import Footer from './layouts/Footer'; // Updated path
import { normalizeScore, calculateCriticsScore as importedCalculateCriticsScore } from './utils/scoreCalculations';
import PrivacyPolicyPage from './features/staticContent/PrivacyPolicyPage'; // Updated path
import CookieConsentBanner from './components/common/CookieConsentBanner'; // Updated path
import TermsOfServicePage from './features/staticContent/TermsOfServicePage'; // Updated path

import AppRoutes from './routes/AppRoutes'; // Updated path
import { AuthProvider } from './contexts/AuthContext'; // Import AuthProvider

import CategoryPage from './features/categories/CategoryPage'; // Updated path
import SearchResultsPage from './features/search/SearchResultsPage'; // Updated path
import { supabase } from './services/supabaseClient.js'; // Updated path

// Memoized helper to pre-process search aliases for faster lookups
const usePreprocessedAliases = (searchAliasesData) => {
  return useMemo(() => {
    if (!searchAliasesData || Object.keys(searchAliasesData).length === 0) {
      return new Map();
    }
    const map = new Map();
    for (const key in searchAliasesData) {
      const aliasGroup = searchAliasesData[key];
      const groupSet = new Set(aliasGroup.map(term => term.toLowerCase()));
      aliasGroup.forEach(term => {
        // Each term maps to the entire group set
        map.set(term.toLowerCase(), groupSet);
      });
    }
    return map;
  }, [searchAliasesData]);
};

// Optimized helper function to get all related search terms
const getEffectiveSearchTerms = (query, preprocessedAliasesMap) => {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];

  const aliasGroupSet = preprocessedAliasesMap.get(lowerQuery);

  if (aliasGroupSet) {
    // If the query is part of an alias group, return all terms from that group
    // Ensure the original query term is also included (it should be by map construction)
    return Array.from(new Set([...aliasGroupSet, lowerQuery]));
  }
  return [lowerQuery]; // Query itself if not part of any alias group
};

function AppContent() { // Renamed App to AppContent to use hooks from react-router-dom
  const [productsData, setProductsData] = useState({});
  const [criticWeightsData, setCriticWeightsData] = useState({}); // Keep for now, or move to Supabase
  const [searchAliasesData, setSearchAliasesData] = useState({}); // State for search aliases
  const [allProductsArray, setAllProductsArray] = useState([]); // Flattened array for filtering
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // This state triggers filtering
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // For debounced filtering
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [cookieConsent, setCookieConsent] = useState({ analytics: false, marketing: false }); // New state for granular consent
  const [isAppDataLoading, setIsAppDataLoading] = useState(true); // New state for global data loading

  // State for header search functionality
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [headerSearchResults, setHeaderSearchResults] = useState(null);
  const navigate = useNavigate(); 
  const location = useLocation(); // Hook to get current location

  // Preprocess search aliases
  const preprocessedAliases = usePreprocessedAliases(searchAliasesData);

  // Create a memoized version of calculateCriticsScore that depends on criticWeightsData
  const calculateCriticsScore = useCallback((product) => { // Changed parameter name from 'reviews' to 'product'
    // The importedCalculateCriticsScore expects the full product object and criticWeightsData
    return importedCalculateCriticsScore(product, criticWeightsData);
  }, [criticWeightsData]);

  // Fetch data on component mount
  useEffect(() => {
    async function fetchData() {
      setIsAppDataLoading(true); // Explicitly set loading to true at the start
      // console.log("Fetching data from Supabase and local files..."); // Consider removing for prod
      try {
        // Parallelize fetching from Supabase and local JSON files
        const [
          productsResponse,
          categoriesResponse,
          weightsFileResponse, // Renamed to avoid conflict with fetchedWeights
          aliasesFileResponse  // Renamed to avoid conflict with fetchedAliases
        ] = await Promise.all([
          supabase
            .from('products')
            .select(`
              *,
              categories ( name ), 
              critic_reviews ( * )
            `),
          supabase
            .from('categories')
            .select('*') // Fetch all columns for categories
            .order('name', { ascending: true }),
          fetch('/data/criticWeights.json'),
          fetch('/data/searchAliases.json')
        ]);

        // Process Products
        if (productsResponse.error) {
          console.error("Supabase products error:", productsResponse.error);
          throw productsResponse.error;
        }
        const fetchedProducts = productsResponse.data || []; // Ensure it's an array
        const processedProducts = fetchedProducts.map(p => ({
          ...p,
          productName: p.product_name, // Map snake_case from DB to camelCase if needed
          imageURL: p.image_url,
          keySpecs: p.key_specs,
          description: p.description, // Assuming you have a description column
          bestBuySku: p.best_buy_sku,
          aiProsCons: p.ai_pros_cons,
          category: p.categories?.name || 'Unknown',
          criticReviews: p.critic_reviews || [],
          // Ensure these match the expected props in ProductCard and ProductPage
          preAggregatedCriticScore: p.pre_aggregated_critic_score,
          totalCriticReviewCount: p.total_critic_review_count,
          preAggregatedAudienceScore: p.pre_aggregated_audience_score,
          totalAudienceReviewCount: p.total_audience_review_count,
        }));
        setAllProductsArray(processedProducts);
        const productsByCategory = processedProducts.reduce((acc, product) => {
          const categoryName = product.category;
          if (!acc[categoryName]) acc[categoryName] = [];
          acc[categoryName].push(product);
          return acc;
        }, {});
        setProductsData(productsByCategory);

        // Process Categories
        if (categoriesResponse.error) {
          console.error("Supabase categories error:", categoriesResponse.error);
          throw categoriesResponse.error;
        }
        const fetchedCategories = categoriesResponse.data || []; // Ensure it's an array
        const processedCategories = fetchedCategories.map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          iconImageUrl: cat.icon_image_url, // Map from snake_case
          ariaLabel: cat.aria_label,       // Map from snake_case
        }));
        setAvailableCategories(processedCategories);

        // Process Local JSON files
        if (!weightsFileResponse.ok) throw new Error(`HTTP error! status: ${weightsFileResponse.status} for criticWeights.json`);
        if (!aliasesFileResponse.ok) throw new Error(`HTTP error! status: ${aliasesFileResponse.status} for searchAliases.json`);
        
        const fetchedWeights = await weightsFileResponse.json();
        const fetchedAliases = await aliasesFileResponse.json();
        setCriticWeightsData(fetchedWeights);
        setSearchAliasesData(fetchedAliases);

      } catch (error) {
        console.error("Error fetching or parsing data:", error);
        // You might want to set an error state here to display to the user
      } finally {
        setIsAppDataLoading(false); // Set loading to false after fetching or if an error occurred
      }
    }
    fetchData();
  }, []);

  // Effect for cookie consent
  useEffect(() => {
    const consentCookie = Cookies.get('userConsent');

    if (!consentCookie) {
      setShowCookieBanner(true);
    } else {
      setShowCookieBanner(false);
      try {
        // Handle new granular consent object from CookieSettingsPage
        const parsedConsent = JSON.parse(consentCookie);
        if (typeof parsedConsent === 'object' && parsedConsent !== null) {
          setCookieConsent({
            analytics: !!parsedConsent.analytics,
            marketing: !!parsedConsent.marketing,
          });
        }
      } catch (e) {
        // Fallback for old "accepted" / "declined" string values
        if (consentCookie === 'accepted') {
          setCookieConsent({ analytics: true, marketing: true });
        } else {
          // 'declined' or any other non-json string
          setCookieConsent({ analytics: false, marketing: false });
        }
      }
    }
  }, []);

  // This new effect will run whenever consent changes, allowing you to initialize scripts.
  useEffect(() => {
    if (cookieConsent.analytics) {
      console.log('Analytics enabled. Initializing analytics scripts...');
      // TODO: Add your analytics initialization code here (e.g., Google Analytics)
    }
    // You can add a similar block for marketing scripts
  }, [cookieConsent]);

  // Apply filters whenever productsData, debouncedSearchTerm, or selectedCategory changes
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
        product.productName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      return matchesSearchTerm;
    });
    setFilteredProducts(filtered);
  }, [productsData, allProductsArray, debouncedSearchTerm, selectedCategory]);

  // Debounce effect for searchTerm
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // Adjust debounce delay as needed (e.g., 300-500ms)

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Called by input fields directly
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = useCallback((event) => {
    setSelectedCategory(event.target.value);
  }, []); // setSelectedCategory is stable

  const handleProductCardClick = useCallback((product) => {
    setSelectedProduct(product);
  }, []); // setSelectedProduct is stable

  const handleBackToProducts = useCallback(() => {
    setSelectedProduct(null);
  }, []); // setSelectedProduct is stable

  const handleAcceptCookieConsent = () => {
    const newConsent = { analytics: true, marketing: true };
    Cookies.set('userConsent', JSON.stringify(newConsent), { expires: 365, path: '/' });
    setCookieConsent(newConsent);
    setShowCookieBanner(false);
    console.log('User accepted all cookies.');
  };

  const handleDeclineCookieConsent = () => {
    const newConsent = { analytics: false, marketing: false };
    Cookies.set('userConsent', JSON.stringify(newConsent), { expires: 365, path: '/' });
    setCookieConsent(newConsent);
    setShowCookieBanner(false);
    console.log('User declined non-essential cookies.');
  };

  // This function is called when the search is submitted from the Header
  const handleHeaderSearchSubmit = (query) => {
    setHeaderSearchQuery(query); 
    navigate('/search');
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
      const effectiveTerms = getEffectiveSearchTerms(headerSearchQuery, preprocessedAliases);

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
  }, [headerSearchQuery, allProductsArray, preprocessedAliases, location.pathname]);


  const isCurrentPageHome = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-brand-light-gray font-sans antialiased text-brand-text">
      <Header onSearchSubmit={handleHeaderSearchSubmit} isHomePage={isCurrentPageHome} />
      {/* 
        Pass `handleSearchChange` and `searchTerm` to components that need live input for the main filter,
        e.g., if MemoizedHomePageLayout has its own search bar for the `filteredProducts`.
        The Header's search bar uses `onSearchSubmit` for a different purpose (global search navigation).
      */}
       <main className="flex-grow">
        <AppRoutes
          selectedProduct={selectedProduct}
          onBackClick={handleBackToProducts}
          calculateCriticsScore={calculateCriticsScore}
          allProductsArray={allProductsArray}
          availableCategories={availableCategories}
          onProductClick={handleProductCardClick} // Passed to AppRoutes, then to MemoizedHomePageLayout
          headerSearchQuery={headerSearchQuery} // For SearchResultsPage
          headerSearchResults={headerSearchResults} // For SearchResultsPage
          isAppDataLoading={isAppDataLoading} // Global loading state
          // Props for main content filtering (if MemoizedHomePageLayout needs them)
          // searchTerm={searchTerm} // The live input value
          // onSearchChange={handleSearchChange} // The handler to update live input
          // filteredProducts={filteredProducts} // The debounced, filtered list
        />
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
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;