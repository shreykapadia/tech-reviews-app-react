// src/components/ProductPage/WhereToBuyShare.jsx
import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ShareIcon, ShoppingCartIcon, StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'; // For empty stars
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'; // For filled stars

// Comment out the API key to prevent API calls and usage of limits
// const BESTBUY_API_KEY = import.meta.env.VITE_BESTBUY_API_KEY;

// Updated RetailerLink to include a "Shop Now" button
const RetailerLink = ({ retailer }) => (
  <div className="flex flex-col sm:flex-row items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
    <div className="flex items-center w-full sm:w-auto mb-3 sm:mb-0">
      {retailer.logo && (
        <img src={retailer.logo} alt={`${retailer.name} logo`} className="h-10 w-10 sm:h-12 sm:w-12 mr-3 sm:mr-4 object-contain flex-shrink-0" />
      )}
      <div className="flex-grow">
        <span className="font-semibold text-base sm:text-lg text-brand-text">
          {retailer.name}
        </span>
        {retailer.priceInfo && (
          <div className="text-sm text-gray-600 dark:text-slate-400 mt-0.5">
            {retailer.priceInfo.salePrice < retailer.priceInfo.regularPrice && (
              <span className="text-red-600 font-bold mr-1.5 text-base">${retailer.priceInfo.salePrice.toFixed(2)}</span>
            )}
            <span className={`${retailer.priceInfo.salePrice < retailer.priceInfo.regularPrice ? 'line-through text-gray-500 text-xs' : 'text-gray-700 font-semibold text-base'}`}>
              ${retailer.priceInfo.regularPrice.toFixed(2)}
            </span>
          </div>
        )}
        {!retailer.priceInfo && retailer.pricePlaceholder && (
          <p className="text-sm text-gray-500 mt-0.5">{retailer.pricePlaceholder}</p>
        )}
        {/* Customer Rating Display */}
        {retailer.ratingInfo && (
          <div className="flex items-center mt-1 text-xs text-gray-500">
            <div className="flex items-center mr-1">
              {[...Array(5)].map((_, i) => {
                const ratingValue = retailer.ratingInfo.average || 0;
                if (ratingValue >= i + 1) {
                  return <StarSolidIcon key={i} className="h-3.5 w-3.5 text-yellow-400" />;
                } else if (ratingValue >= i + 0.5) {
                  // Optional: half-star logic can be added here if desired
                  return <StarOutlineIcon key={i} className="h-3.5 w-3.5 text-yellow-400" />; // Simple fallback for now
                }
                return <StarOutlineIcon key={i} className="h-3.5 w-3.5 text-gray-300" />;
              })}
            </div>
            <span className="mr-1">{retailer.ratingInfo.average ? retailer.ratingInfo.average.toFixed(1) : '-'}</span>
            {typeof retailer.ratingInfo.count === 'number' && (
              <span>({retailer.ratingInfo.count.toLocaleString()} reviews)</span>
            )}
          </div>
        )}
      </div>
    </div>
    <a
      href={retailer.url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="w-full sm:w-auto flex-shrink-0 px-4 py-2 sm:px-5 sm:py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-md hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-all duration-200 flex items-center justify-center group"
    >
      Shop Now
      <ShoppingCartIcon className="h-4 w-4 ml-2 opacity-80 group-hover:opacity-100 transition-opacity" />
    </a>
  </div>
);

const WhereToBuyShare = ({ product, productPageUrl, onRetailerReviewDataUpdate }) => {
  const [bestBuyData, setBestBuyData] = useState(null);
  const [isLoadingBestBuy, setIsLoadingBestBuy] = useState(false);
  const [bestBuyError, setBestBuyError] = useState(null);

  const { productName, bestBuySku, retailersData = [] } = product;

  // Determine if the Best Buy API should be used based on the presence of the API key
  const IS_BESTBUY_API_ENABLED = import.meta.env.VITE_BESTBUY_API_KEY;

  useEffect(() => {
    // Define BESTBUY_API_KEY here to check its existence locally within the hook
    // This ensures that if it's commented out globally, the fetch won't proceed.
    // const BESTBUY_API_KEY = import.meta.env.VITE_BESTBUY_API_KEY; // Already captured by IS_BESTBUY_API_ENABLED
    if (bestBuySku && IS_BESTBUY_API_ENABLED) {
      const fetchBestBuyPrice = async () => {
        setIsLoadingBestBuy(true);
        setBestBuyError(null);
        setBestBuyData(null); // Clear previous product's data
        try {
          const response = await fetch(
            // Use the proxied path. Your Vite dev server will forward this.
            `/bestbuy-api/v1/products(sku=${bestBuySku})?apiKey=${IS_BESTBUY_API_ENABLED}&show=name,sku,regularPrice,salePrice,url,addToCartUrl,image,customerReviewAverage,customerReviewCount&format=json`
          );
          if (!response.ok) {
            throw new Error(`Best Buy API request failed: ${response.status}`);
          }
          const data = await response.json();
          if (data.products && data.products.length > 0) {
            setBestBuyData(data.products[0]);
          } else {
            setBestBuyError('Product not found on Best Buy or SKU is invalid.');
          }
        } catch (error) {
          console.error('Error fetching Best Buy data:', error);
          setBestBuyError(error.message || 'Failed to fetch Best Buy price.');
        } finally {
          setIsLoadingBestBuy(false);
        }
      };
      fetchBestBuyPrice();
    } else if (bestBuySku && !IS_BESTBUY_API_ENABLED) {
      console.warn('Best Buy API key is missing. Price fetching disabled.');
      setBestBuyError('Best Buy API key not configured.');
    }
  }, [bestBuySku, IS_BESTBUY_API_ENABLED]);

  // Memoize allRetailers to stabilize its reference and optimize calculations
  const allRetailers = useMemo(() => {
    const baseRetailers = [...retailersData]; // Start with any static retailers from product data

    if (IS_BESTBUY_API_ENABLED && bestBuySku) { // API is enabled and SKU exists
      if (bestBuyData) { // API call was successful
        baseRetailers.unshift({
          name: 'Best Buy',
          url: bestBuyData.url || `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(productName)}`,
          logo: bestBuyData.image || '/images/retailer-logos/bestbuy.svg',
          priceInfo: {
            regularPrice: bestBuyData.regularPrice,
            salePrice: bestBuyData.salePrice,
          },
          ratingInfo: {
            average: bestBuyData.customerReviewAverage,
            count: bestBuyData.customerReviewCount,
            scale: 5,
          },
        });
      } else { // API enabled, SKU exists, but no data yet (loading or error)
        baseRetailers.unshift({
          name: 'Best Buy',
          url: `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(productName)}`,
          logo: '/images/retailer-logos/bestbuy.svg',
          pricePlaceholder: isLoadingBestBuy ? 'Checking price...' : (bestBuyError ? 'Price unavailable' : 'Check price'),
          ratingInfo: { average: null, count: null }
        });
      }
    } else if (bestBuySku) { // API is NOT enabled (key missing) but SKU exists - hardcode Best Buy
      baseRetailers.unshift({
        name: 'Best Buy',
        url: `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(productName)}`, // Fallback search URL
        logo: '/images/retailer-logos/bestbuy.svg',
        pricePlaceholder: '$XXX.XX', // Hardcoded price placeholder
        ratingInfo: { average: 4.5, count: 12345, scale: 5 }, // Hardcoded rating
      });
    }

    // Add static placeholders for Amazon and Walmart if not already present
    if (!baseRetailers.find(r => r.name === 'Amazon')) {
      baseRetailers.push({
        name: 'Amazon',
        url: `https://www.amazon.com/s?k=${encodeURIComponent(productName)}`, // Example search URL
        logo: '/images/retailer-logos/amazon.svg', // Provide this logo
        pricePlaceholder: 'Check price',
        ratingInfo: { average: 4.6, count: 1, scale: 5 }
      });
    }
    if (!baseRetailers.find(r => r.name === 'Walmart')) {
      baseRetailers.push({
        name: 'Walmart',
        url: `https://www.walmart.com/search?q=${encodeURIComponent(productName)}`, // Example search URL
        logo: '/images/retailer-logos/walmart.svg', // Provide this logo
        pricePlaceholder: 'Check price',
        ratingInfo: { average: 4.2, count: 1, scale: 5 }
      });
    }
    return baseRetailers;
  }, [retailersData, bestBuyData, bestBuySku, isLoadingBestBuy, IS_BESTBUY_API_ENABLED, productName, bestBuyError]);

  useEffect(() => {
    if (typeof onRetailerReviewDataUpdate === 'function' && allRetailers.length > 0) {
      const reviewData = allRetailers
        .filter(r => r.ratingInfo && r.ratingInfo.average !== undefined && r.ratingInfo.count !== undefined)
        .map(r => ({ ...r.ratingInfo, retailerName: r.name, scale: r.ratingInfo.scale || 5 })); // Assume scale 5 if not specified
      onRetailerReviewDataUpdate(reviewData);
    }
  }, [allRetailers, onRetailerReviewDataUpdate]); // Rerun when allRetailers changes

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out ${productName} on TechScore`,
          text: `I found this ${productName} review on TechScore, check it out!`,
          url: productPageUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback for browsers that support navigator.share but fail (e.g., user cancels)
        alert(`Copy this link: ${productPageUrl}`);
      }
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(productPageUrl)
        .then(() => alert('Link copied to clipboard!'))
        .catch(() => alert(`Could not copy link. Please manually copy: ${productPageUrl}`));
    }
  };

  return (
    <div className="bg-white/85 dark:bg-slate-800/70 backdrop-blur-xl p-4 sm:p-6 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/60 dark:border-white/10 animate-fade-in-up transition-all duration-300">
      <div className="flex justify-between items-center mb-4 sm:mb-5">
        <h3 className="text-xl sm:text-2xl font-semibold text-brand-primary font-serif">Find Best Deals</h3>
        <button
          onClick={handleShare}
          className="flex items-center text-sm text-gray-600 dark:text-slate-400 hover:text-brand-primary p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1"
          aria-label="Share this product"
        >
          <ShareIcon className="h-5 w-5 mr-1.5" />
          Share
        </button>
      </div>

      {/* Best Buy specific loading/error can be integrated into its placeholder or removed if placeholders handle it */}
      {IS_BESTBUY_API_ENABLED && isLoadingBestBuy && !bestBuyData && (
        <p className="text-sm text-gray-500 py-2 text-center">Loading Best Buy price...</p>
      )}
      {IS_BESTBUY_API_ENABLED && bestBuyError && !isLoadingBestBuy && !bestBuyData && (
        <p className="text-sm text-red-500 py-2 text-center">Could not load Best Buy price: {bestBuyError}</p>
      )}

      {allRetailers.length > 0 ? (
        <div className="space-y-3">
          {allRetailers.map((retailer) => (
            <RetailerLink key={retailer.name} retailer={retailer} />
          ))}
        </div>
      ) : (
        (!IS_BESTBUY_API_ENABLED || (!isLoadingBestBuy && !bestBuyError)) && <p className="text-sm text-gray-500">No purchasing options available at the moment.</p>
      )}

      <p className="text-xs text-gray-500 mt-6 pt-4 border-t border-gray-200">
        Disclosure: We may earn a commission from purchases made through these links. Prices and availability are subject to change.
      </p>
    </div>
  );
};

WhereToBuyShare.propTypes = {
  product: PropTypes.shape({
    productName: PropTypes.string.isRequired,
    bestBuySku: PropTypes.string, // Best Buy SKU for API fetching
    retailersData: PropTypes.arrayOf(PropTypes.shape({ // For other static retailers
      name: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      logo: PropTypes.string, // URL to the retailer's logo
      pricePlaceholder: PropTypes.string, // e.g., "Check Price" or "Price unavailable"
      ratingInfo: PropTypes.shape({
        average: PropTypes.number,
        count: PropTypes.number,
        scale: PropTypes.number, // e.g. 5 for a 5-star scale
      }),
    })),
  }).isRequired,
  productPageUrl: PropTypes.string.isRequired,
  onRetailerReviewDataUpdate: PropTypes.func, // Can be optional if not always used for score
};

export default WhereToBuyShare;