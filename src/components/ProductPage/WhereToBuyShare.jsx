// src/components/ProductPage/WhereToBuyShare.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ShareIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

const BESTBUY_API_KEY = import.meta.env.VITE_BESTBUY_API_KEY;

const RetailerLink = ({ retailer }) => (
  <a
    href={retailer.url}
    target="_blank"
    rel="noopener noreferrer sponsored"
    className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all duration-200 group"
  >
    <div className="flex items-center">
      {retailer.logo && (
        <img src={retailer.logo} alt={`${retailer.name} logo`} className="h-8 w-8 sm:h-10 sm:w-10 mr-3 sm:mr-4 object-contain flex-shrink-0" />
      )}
      <div>
        <span className="font-semibold text-sm sm:text-base text-brand-text group-hover:text-brand-primary">
          {retailer.name}
        </span>
        {retailer.priceInfo && (
          <div className="text-xs text-gray-600 mt-0.5">
            {retailer.priceInfo.salePrice < retailer.priceInfo.regularPrice && (
              <span className="text-red-600 font-bold mr-1.5">${retailer.priceInfo.salePrice.toFixed(2)}</span>
            )}
            <span className={`${retailer.priceInfo.salePrice < retailer.priceInfo.regularPrice ? 'line-through text-gray-500' : 'text-gray-700 font-semibold'}`}>
              ${retailer.priceInfo.regularPrice.toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </div>
    <ShoppingCartIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 group-hover:text-brand-primary transition-colors" />
  </a>
);

const WhereToBuyShare = ({ product, productPageUrl }) => {
  const [bestBuyData, setBestBuyData] = useState(null);
  const [isLoadingBestBuy, setIsLoadingBestBuy] = useState(false);
  const [bestBuyError, setBestBuyError] = useState(null);

  const { productName, bestBuySku, retailersData = [] } = product;

  useEffect(() => {
    if (bestBuySku && BESTBUY_API_KEY) {
      const fetchBestBuyPrice = async () => {
        setIsLoadingBestBuy(true);
        setBestBuyError(null);
        setBestBuyData(null); // Clear previous product's data
        try {
          const response = await fetch(
            `https://api.bestbuy.com/v1/products(sku=${bestBuySku})?apiKey=${BESTBUY_API_KEY}&show=name,sku,regularPrice,salePrice,url,addToCartUrl,image&format=json`
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
    } else if (bestBuySku && !BESTBUY_API_KEY) {
        console.warn('Best Buy API key is missing. Price fetching disabled.');
        setBestBuyError('Best Buy API key not configured.');
    }
  }, [bestBuySku]);

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

  const allRetailers = [...retailersData];
  if (bestBuyData) {
    allRetailers.unshift({ // Add Best Buy to the top
      name: 'Best Buy',
      url: bestBuyData.url,
      logo: bestBuyData.image || '/images/retailer-logos/bestbuy.svg', // Provide a fallback Best Buy logo
      priceInfo: {
        regularPrice: bestBuyData.regularPrice,
        salePrice: bestBuyData.salePrice,
      },
    });
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 animate-fade-in-up">
      <div className="flex justify-between items-center mb-4 sm:mb-5">
        <h3 className="text-xl sm:text-2xl font-semibold text-brand-primary font-serif">Where to Buy</h3>
        <button
          onClick={handleShare}
          className="flex items-center text-sm text-gray-600 hover:text-brand-primary p-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1"
          aria-label="Share this product"
        >
          <ShareIcon className="h-5 w-5 mr-1.5" />
          Share
        </button>
      </div>

      {isLoadingBestBuy && <p className="text-sm text-gray-500 py-2">Loading Best Buy price...</p>}
      {bestBuyError && !isLoadingBestBuy && <p className="text-sm text-red-500 py-2">Could not load Best Buy price: {bestBuyError}</p>}

      {allRetailers.length > 0 ? (
        <div className="space-y-3">
          {allRetailers.map((retailer) => (
            <RetailerLink key={retailer.name} retailer={retailer} />
          ))}
        </div>
      ) : (
        !isLoadingBestBuy && <p className="text-sm text-gray-500">No purchasing options available at the moment.</p>
      )}
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
    })),
  }).isRequired,
  productPageUrl: PropTypes.string.isRequired,
};

export default WhereToBuyShare;