// src/components/ProductPage/ProductSpecifications.jsx
import React from 'react';
import PropTypes from 'prop-types';

// Define the structure, labels, and data sources for specifications
const specDetailsMap = {
  // General
  brand: { label: 'Brand', category: 'General', source: 'product' },
  productName: { label: 'Model Name', category: 'General', source: 'product' },
  category: { label: 'Product Type', category: 'General', source: 'product' },
  operatingSystem: { label: 'Operating System', category: 'General', source: 'keySpecs', placeholder: 'Varies by model' }, // Example, not in current JSON
  features: { label: 'Key Features', category: 'General', source: 'keySpecs' }, // e.g., S Pen, Anti-Reflection Screen
  design: { label: 'Design Highlights', category: 'General', source: 'keySpecs' }, // e.g., Compact Design
  build: { label: 'Build Quality', category: 'General', source: 'keySpecs' }, // e.g., Premium Build

  // Display
  screenSize: { label: 'Screen Size', category: 'Display', source: 'keySpecs' },
  resolution: { label: 'Resolution', category: 'Display', source: 'keySpecs' }, // Primarily for TVs
  displayTech: { label: 'Display Technology', category: 'Display', source: 'keySpecs' }, // e.g., ProMotion, Liquid Retina, PixelSense
  refreshRate: { label: 'Refresh Rate', category: 'Display', source: 'keySpecs' }, // Primarily for TVs

  // Performance
  processor: { label: 'Processor', category: 'Performance', source: 'keySpecs' },
  ram: { label: 'RAM', category: 'Performance', source: 'keySpecs' }, // For Phones
  memory: { label: 'Memory', category: 'Performance', source: 'keySpecs' }, // For Laptops (often 'ram' is used in keySpecs for phones)
  graphics: { label: 'Graphics', category: 'Performance', source: 'keySpecs' }, // For Laptops
  cooling: { label: 'Cooling System', category: 'Performance', source: 'keySpecs' }, // For Laptops

  // Camera (Primarily for Smartphones)
  camera: { label: 'Main Camera System', category: 'Camera', source: 'keySpecs' },

  // Storage
  storage: { label: 'Storage Capacity', category: 'Storage', source: 'keySpecs' },

  // Battery & Power
  battery: { label: 'Battery', category: 'Battery & Power', source: 'keySpecs' },

  // Audio (Primarily for TVs)
  audio: { label: 'Audio System', category: 'Audio', source: 'keySpecs' },

  // Smart Features (Primarily for TVs)
  smartTV: { label: 'Smart TV Platform', category: 'Smart Features', source: 'keySpecs' },
};

// Define the order of categories for display
const orderedCategories = [
  'General',
  'Display',
  'Performance',
  'Camera',
  'Storage',
  'Audio',
  'Smart Features',
  'Battery & Power',
];

const ProductSpecifications = ({ product }) => {
  if (!product) {
    return null;
  }

  const { keySpecs = {} } = product;

  return (
    <div className="py-8 sm:py-10 bg-white rounded-lg shadow-md border border-gray-200 animate-fade-in-up mt-6 sm:mt-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-2xl sm:text-3xl font-semibold text-brand-primary font-serif mb-6 sm:mb-8 text-center sm:text-left">
          Full Specifications
        </h3>

        {orderedCategories.map((categoryName) => {
          const specsForCategory = Object.entries(specDetailsMap)
            .filter(([, detail]) => detail.category === categoryName)
            .map(([key, detail]) => {
              let value;
              if (detail.source === 'product') {
                value = product[key];
              } else {
                // Handle cases where 'ram' might be used for 'memory' label or vice-versa if one is missing
                if (key === 'memory' && !keySpecs.memory && keySpecs.ram) value = keySpecs.ram;
                else if (key === 'ram' && !keySpecs.ram && keySpecs.memory) value = keySpecs.memory;
                else value = keySpecs[key];
              }

              if (value) {
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
              <h4 className="text-lg sm:text-xl font-semibold text-brand-text font-sans mb-3 sm:mb-4 border-b border-gray-200 pb-2">
                {categoryName}
              </h4>
              <dl className="space-y-3">
                {specsForCategory.map((spec) => (
                  <div key={spec.label} className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 items-baseline">
                    <dt className="text-sm font-medium text-gray-600 sm:col-span-4 md:col-span-3">{spec.label}:</dt>
                    <dd className="text-sm text-brand-text sm:col-span-8 md:col-span-9">{String(spec.value)}</dd>
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