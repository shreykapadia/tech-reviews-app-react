// src/components/ProductPage/WhereToBuyShare.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  ShareIcon,
  LinkIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
// Assuming you might have or want specific brand icons for social media.
// For simplicity, I'll use generic names and you can replace with actual SVG icons or a library.
import { FaTwitter, FaFacebookF } from 'react-icons/fa'; // Example using react-icons

const WhereToBuyShare = ({ retailersData, productPageUrl, productName }) => {
  const [copied, setCopied] = useState(false);

  // Placeholder retailer data - replace with prop or fetched data
  const defaultRetailers = [
    { id: 'amazon', name: 'Amazon', logoUrl: '/images/retailers/amazon_logo_placeholder.svg', price: '$999.99', link: '#' },
    { id: 'bestbuy', name: 'Best Buy', logoUrl: '/images/retailers/bestbuy_logo_placeholder.svg', price: '$999.00', link: '#' },
    { id: 'brandstore', name: 'Official Store', logoUrl: '/images/retailers/brand_logo_placeholder.svg', price: '$1099.00', link: '#' },
  ];

  const retailers = retailersData && retailersData.length > 0 ? retailersData : defaultRetailers;

  const handleShare = (platform) => {
    const text = `Check out the ${productName} on TechScore!`;
    let url = '';

    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(productPageUrl)}&text=${encodeURIComponent(text)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productPageUrl)}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(productPageUrl)}`;
        break;
      default:
        return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(productPageUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset copied status after 2 seconds
    }).catch(err => {
      console.error('Failed to copy: ', err);
      // You could add a more user-friendly error message here
    });
  };

  const ShareButton = ({ icon: Icon, label, onClick, brandColorClass = 'hover:text-brand-primary' }) => (
    <button
      onClick={onClick}
      aria-label={`Share via ${label}`}
      className={`p-2 rounded-full text-gray-500 ${brandColorClass} hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-colors`}
    >
      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
    </button>
  );

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 animate-fade-in-up">
      {/* "Where to Buy" Section */}
      <h3 className="text-xl sm:text-2xl font-semibold text-brand-text font-sans mb-4">
        Where to Buy
      </h3>
      <div className="space-y-4 mb-6">
        {retailers.map((retailer) => (
          <div key={retailer.id || retailer.name} className="flex flex-col sm:flex-row items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-100 hover:shadow-sm transition-shadow">
            <div className="flex items-center mb-3 sm:mb-0">
              {retailer.logoUrl ? (
                <img src={retailer.logoUrl} alt={`${retailer.name} logo`} className="h-8 w-auto mr-3 sm:mr-4 object-contain" />
              ) : (
                <span className="text-sm font-medium text-brand-text mr-3 sm:mr-4">{retailer.name}</span>
              )}
              <p className="text-lg font-semibold text-brand-primary">{retailer.price}</p>
            </div>
            <a
              href={retailer.link}
              target="_blank"
              rel="noopener noreferrer sponsored" // 'sponsored' for affiliate links
              className="w-full sm:w-auto px-5 py-2.5 bg-brand-primary text-white text-sm font-medium rounded-full hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-colors duration-200 text-center"
            >
              Shop Now
            </a>
          </div>
        ))}
      </div>

      {/* Affiliate Disclosure */}
      <p className="text-xs text-gray-500 italic mb-6 text-center sm:text-left">
        We may earn a commission from purchases made through these links. Prices and availability are subject to change.
      </p>

      {/* Share Buttons Section */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3">
          <ShareIcon className="h-5 w-5 sm:h-6 sm:h-6 text-gray-600 mr-1" aria-hidden="true" />
          <span className="text-sm font-medium text-gray-700 hidden sm:inline">Share:</span>
          <ShareButton icon={FaTwitter} label="Twitter" onClick={() => handleShare('twitter')} brandColorClass="hover:text-sky-500" />
          <ShareButton icon={FaFacebookF} label="Facebook" onClick={() => handleShare('facebook')} brandColorClass="hover:text-blue-600" />
          <ShareButton icon={EnvelopeIcon} label="Email" onClick={() => handleShare('email')} />
          <button
            onClick={handleCopyLink}
            aria-label="Copy product link"
            className={`p-2 rounded-full text-gray-500 ${copied ? 'text-green-600' : 'hover:text-brand-primary'} hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-colors relative`}
          >
            <LinkIcon className="h-5 w-5 sm:h-6 sm:h-6" />
            {copied && <span className="absolute -top-7 right-0 text-xs bg-gray-700 text-white px-2 py-1 rounded-md">Copied!</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

WhereToBuyShare.propTypes = {
  retailersData: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    logoUrl: PropTypes.string,
    price: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
  })),
  productPageUrl: PropTypes.string.isRequired,
  productName: PropTypes.string.isRequired,
};

WhereToBuyShare.defaultProps = {
  retailersData: [],
};

export default WhereToBuyShare;