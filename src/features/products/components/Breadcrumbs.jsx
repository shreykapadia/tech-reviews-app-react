// src/components/ProductPage/Breadcrumbs.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/20/solid';

const BreadcrumbsComponent = ({ crumbs }) => {
  if (!crumbs || crumbs.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <ol role="list" className="flex items-center space-x-1.5 sm:space-x-2 text-sm text-gray-500">
        {crumbs.map((crumb, index) => (
          <li key={crumb.label + index}>
            <div className="flex items-center">
              {index > 0 && (
                <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-gray-400 mr-1.5 sm:mr-2" aria-hidden="true" />
              )}
              {crumb.path ? (
                <Link to={crumb.path} className="hover:text-brand-primary hover:underline">
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-medium text-brand-text">{crumb.label}</span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

BreadcrumbsComponent.propTypes = {
  crumbs: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    path: PropTypes.string, // Path is optional, for the last item or non-linkable items
  })).isRequired,
};

const Breadcrumbs = React.memo(BreadcrumbsComponent);
Breadcrumbs.displayName = 'Breadcrumbs';
export default Breadcrumbs;