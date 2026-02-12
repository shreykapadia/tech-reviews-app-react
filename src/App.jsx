// src/App.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Added useLocation, useMemo
import Cookies from 'js-cookie'; // Import js-cookie
import { BrowserRouter as Router, useNavigate, useLocation } from 'react-router-dom';
import Header from './layouts/Header'; // Updated path
import Footer from './layouts/Footer'; // Updated path
import { normalizeScore, calculateCriticsScore as importedCalculateCriticsScore } from "./utils/scoreCalculations";
import { initGA, trackPageView } from "./utils/analytics";
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
  const [criticWeightsData, setCriticWeightsData] = useState({}); // Keep for now, or move to Supabase
  const [searchAliasesData, setSearchAliasesData] = useState({}); // State for search aliases
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [cookieConsent, setCookieConsent] = useState({ analytics: false, marketing: false }); // New state for granular consent
  const [isAppDataLoading, setIsAppDataLoading] = useState(true); // New state for global data loading

  // State for header search functionality
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
        const [categoriesResponse, weightsFileResponse, aliasesFileResponse] = await Promise.all([
          supabase.from("categories").select("*").order("name", { ascending: true }),
          fetch("/data/criticWeights.json"),
          fetch("/data/searchAliases.json")
        ]);

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
      initGA();
    }
    // You can add a similar block for marketing scripts
  }, [cookieConsent.analytics]);

  // Track page views when location or consent changes
  useEffect(() => {
    if (cookieConsent.analytics) {
      trackPageView(location.pathname + location.search);
    }
  }, [location, cookieConsent.analytics]);


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

  const handleProductCardClick = useCallback((product) => {
    setSelectedProduct(product);
  }, []);

  const handleBackToProducts = useCallback(() => {
    setSelectedProduct(null);
  }, []);
  // This function is called when the search is submitted from the Header
  const handleHeaderSearchSubmit = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };



  const isCurrentPageHome = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen font-sans antialiased text-brand-text">
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
          availableCategories={availableCategories}
          onProductClick={handleProductCardClick} // Passed to AppRoutes, then to MemoizedHomePageLayout
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
