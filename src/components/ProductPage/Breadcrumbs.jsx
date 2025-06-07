// src/components/ProductPage/Breadcrumbs.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/20/solid'; // Using solid for breadcrumb chevrons

const Breadcrumbs = ({ product }) => {
  if (!product) return null;

  const { category, productName } = product;
  const categorySlug = category ? category.toLowerCase().replace(/\s+/g, '-') : 'all';

  return (
    <nav aria-label="Breadcrumb" className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
      <ol role="list" className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm text-gray-500">
        <li>
          <Link to="/" className="hover:text-brand-primary hover:underline">Home</Link>
        </li>
        {category && (
          <li>
            <div className="flex items-center">
              <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
              <Link to={`/category/${categorySlug}`} className="ml-1.5 sm:ml-2 hover:text-brand-primary hover:underline">{category}</Link>
            </div>
          </li>
        )}
        <li>
          <div className="flex items-center">
            <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
            <span className="ml-1.5 sm:ml-2 font-medium text-brand-text">{productName}</span>
          </div>
        </li>
      </ol>
    </nav>
  );
};

Breadcrumbs.propTypes = {
  product: PropTypes.shape({
    category: PropTypes.string,
    productName: PropTypes.string.isRequired,
  }),
};

export default Breadcrumbs;