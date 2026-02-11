// src/features/categories/AllCategoriesPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Breadcrumbs from '../products/components/Breadcrumbs'; 

function AllCategoriesPage({ availableCategories, areGlobalCategoriesLoading }) {
  if (areGlobalCategoriesLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16 mx-auto"></div>
        <p className="mt-4 text-lg text-gray-600">Loading categories...</p>
      </div>
    );
  }

  if (!availableCategories || availableCategories.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-gray-600">No categories available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 mt-16 md:mt-20">
    <Breadcrumbs crumbs={[{ label: 'Home', path: '/' }, { label: 'Categories' }]} />
      <h1 className="text-3xl sm:text-4xl font-bold text-brand-text font-serif mb-8 text-center">
        All Categories
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {availableCategories.map(category => (
          <Link
            key={category.slug || category.id}
            to={`/category/${category.slug}`}
            className="block p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-[0_16px_34px_rgba(8,38,67,0.12)] hover:shadow-[0_22px_42px_rgba(8,38,67,0.16)] border border-white/80 transition-shadow duration-300 ease-in-out text-center transform hover:-translate-y-1"
          >
            {category.iconImageUrl && (
              <img src={category.iconImageUrl} alt={`${category.name} icon`} className="w-16 h-16 mx-auto mb-4 object-contain" />
            )}
            <h2 className="text-xl font-semibold text-brand-text group-hover:text-brand-accent transition-colors">
              {category.name}
            </h2>
          </Link>
        ))}
      </div>
    </div>
  );
}

AllCategoriesPage.propTypes = {
  availableCategories: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.any.isRequired,
    name: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    iconImageUrl: PropTypes.string,
  })).isRequired,
  areGlobalCategoriesLoading: PropTypes.bool,
};

AllCategoriesPage.defaultProps = {
  areGlobalCategoriesLoading: false,
};

export default AllCategoriesPage;
