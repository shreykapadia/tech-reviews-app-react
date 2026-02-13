// src/components/ProductPage/ProductSpecifications.jsx
import React from 'react';
import PropTypes from 'prop-types';

// Define the structure, labels, and data sources for specifications
const specDetailsMap = {
  // General
  brand: { label: 'Brand', category: 'General', source: 'product' },
  productName: { label: 'Model Name', category: 'General', source: 'product' },
  category: { label: 'Product Type', category: 'General', source: 'product' }, // From main product object
  operatingSystem: { label: 'Operating System', category: 'General', source: 'keySpecs' },
  formFactor: { label: 'Form Factor', category: 'General', source: 'keySpecs' }, // For Laptops
  // features: { label: 'Key Features', category: 'General', source: 'keySpecs' }, // Example, if present in keySpecs
  // design: { label: 'Design Highlights', category: 'General', source: 'keySpecs' }, // Example, if present in keySpecs
  // build: { label: 'Build Quality', category: 'General', source: 'keySpecs' }, // Example, if present in keySpecs

  // Display
  screenSize: { label: 'Screen Size', category: 'Display', source: 'keySpecs' },
  resolution: { label: 'Resolution', category: 'Display', source: 'keySpecs' },
  displayTech: { label: 'Display Technology', category: 'Display', source: 'keySpecs' },
  refreshRate: { label: 'Refresh Rate (Hz)', category: 'Display', source: 'keySpecs' },
  touchScreen: { label: 'Touch Screen', category: 'Display', source: 'keySpecs' }, // For Laptops
  displayPanelType: { label: 'Display Panel Type', category: 'Display', source: 'keySpecs' }, // For TVs
  displayBacklighting: { label: 'Display Backlighting', category: 'Display', source: 'keySpecs' }, // For TVs
  peakBrightness_nits: { label: 'Peak Brightness (nits)', category: 'Display', source: 'keySpecs' }, // For TVs

  // Performance
  processor: { label: 'Processor', category: 'Performance', source: 'keySpecs' },
  processorOptions: { label: 'Processor Options', category: 'Performance', source: 'keySpecs' }, // For Laptops
  ram: { label: 'RAM (GB)', category: 'Performance', source: 'keySpecs' },
  dedicatedGraphics: { label: 'Dedicated Graphics', category: 'Performance', source: 'keySpecs' }, // For Laptops (replaces 'graphics')
  // cooling: { label: 'Cooling System', category: 'Performance', source: 'keySpecs' }, // Example, if present in keySpecs

  // Camera (Primarily for Smartphones)
  cameraSpecs_MP: { label: 'Camera System (MP)', category: 'Camera', source: 'keySpecs' }, // Replaces 'camera'

  // Storage
  storage: { label: 'Storage', category: 'Storage', source: 'keySpecs' },

  // Battery & Power
  batteryCapacity: { label: 'Battery Capacity (mAh)', category: 'Battery & Power', source: 'keySpecs' }, // For Smartphones
  batteryCapacity_Wh: { label: 'Battery Capacity (Wh)', category: 'Battery & Power', source: 'keySpecs' }, // For Laptops
  ratedBatteryLife: { label: 'Rated Battery Life (hours)', category: 'Battery & Power', source: 'keySpecs' }, // For Smartphones

  // Audio (Primarily for TVs)
  audio: { label: 'Audio System', category: 'Audio', source: 'keySpecs' },

  // Smart Features (Primarily for TVs)
  smartTV: { label: 'Smart TV Platform', category: 'Smart Features', source: 'keySpecs' },

  // Smartwatch-specific
  caseSize: { label: 'Case Size', category: 'Design', source: 'keySpecs' },
  compatibility: { label: 'Compatibility', category: 'General', source: 'keySpecs' },
  batteryLife: { label: 'Battery Life', category: 'Battery & Power', source: 'keySpecs' },
  connectivity: { label: 'Connectivity', category: 'Connectivity', source: 'keySpecs' },
  healthSensors: { label: 'Health Sensors', category: 'Health & Sensors', source: 'keySpecs' },
  waterResistance: { label: 'Water Resistance', category: 'Design', source: 'keySpecs' },
};

// Define the order of categories for display
const orderedCategories = [
  'General',
  'Design',
  'Display',
  'Performance',
  'Camera',
  'Storage',
  'Audio',
  'Smart Features',
  'Connectivity',
  'Health & Sensors',
  'Battery & Power',
];

const ProductSpecifications = ({ product }) => {
  if (!product) {
    return null;
  }

  const { keySpecs = {} } = product;

  // Calculate starting retail price
  let startingPrice = null;
  const retailPriceData = keySpecs?.retailPrice;

  if (typeof retailPriceData === 'number') {
    startingPrice = retailPriceData;
  } else if (Array.isArray(retailPriceData) && retailPriceData.length > 0) {
    const prices = retailPriceData.map(item => {
      if (typeof item === 'number') {
        return item;
      }
      // Handles cases like [{ screenSize: "13", price: 999 }, ...]
      if (typeof item === 'object' && item !== null && typeof item.price === 'number') {
        return item.price;
      }
      return Infinity; // Ignore items not in expected format to ensure Math.min works correctly
    }).filter(price => typeof price === 'number'); // Ensure only numbers are considered for Math.min

    if (prices.length > 0) {
      startingPrice = Math.min(...prices);
    }
  }

  return (
    <div className="py-8 sm:py-10 bg-white/85 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/60 dark:border-white/10 animate-fade-in-up mt-6 sm:mt-8 transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-2xl sm:text-3xl font-semibold text-brand-primary dark:text-blue-400 font-serif mb-6 sm:mb-8 text-center sm:text-left">
          Full Specifications
        </h3>

        {/* Display Starting Retail Price */}
        {startingPrice !== null && (
          <div className="mb-6 sm:mb-8">
            <p className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-slate-300">
              Starting Retail Price:
              <span className="ml-2 text-xl sm:text-2xl font-bold text-brand-accent">
                ${startingPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </p>
          </div>
        )}

        {orderedCategories.map((categoryName) => {
          let specsToProcess = Object.entries(specDetailsMap)
            .filter(([, detail]) => detail.category === categoryName);

          const specsForCategory = specsToProcess
            .map(([key, detail]) => {
              let value;
              if (detail.source === 'product') {
                value = product[key];
              } else {
                value = keySpecs[key]; // Simplified: directly access key from keySpecs
              }

              // Ensure value is not undefined, null, or an empty string before considering it
              if (typeof value !== 'undefined' && value !== null && String(value).trim() !== '') {
                return { label: detail.label, value };
              } else if (detail.placeholder) {
                // return { label: detail.label, value: detail.placeholder }; // Optionally show placeholders
              }
              return null;
            })
            .filter(Boolean);

          if (specsForCategory.length === 0) {
            return null;
          }

          return (
            <div key={categoryName} className="mb-6 sm:mb-8 last:mb-0">
              <h4 className="text-lg sm:text-xl font-semibold text-brand-text dark:text-slate-100 font-sans mb-3 sm:mb-4 border-b border-gray-200 dark:border-slate-600 pb-2">
                {categoryName}
              </h4>
              <dl className="space-y-3">
                {specsForCategory.map((spec) => (
                  <div key={spec.label} className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 items-baseline">
                    <dt className="text-sm font-medium text-gray-600 dark:text-slate-400 sm:col-span-4 md:col-span-3">{spec.label}:</dt>
                    <dd className="text-sm text-brand-text sm:col-span-8 md:col-span-9">
                      {Array.isArray(spec.value)
                        ? spec.value.join(' / ') // Join array values with ' / '
                        : String(spec.value)
                      }
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          );
        })}
      </div>
    </div>
  );
};

ProductSpecifications.propTypes = {
  product: PropTypes.shape({
    productName: PropTypes.string,
    brand: PropTypes.string,
    category: PropTypes.string,
    keySpecs: PropTypes.object,
    // Add other top-level product properties if they are used directly by specDetailsMap with source: 'product'
  }).isRequired,
};

export default ProductSpecifications;