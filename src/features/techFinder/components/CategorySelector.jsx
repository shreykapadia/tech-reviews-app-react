// src/features/techFinder/components/CategorySelector.jsx
import React from 'react';
import PropTypes from 'prop-types';

const CategorySelector = ({ availableCategories, onCategorySelect, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
        <p className="ml-3 text-gray-500">Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return <p className="col-span-full text-center text-red-500 bg-red-50 p-4 rounded-md">{error}</p>;
  }

  if (!availableCategories || availableCategories.length === 0) {
    return <p className="col-span-full text-center text-gray-500">No categories available.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
      {availableCategories.map((category) => (
        <button
          key={category.id || category.slug}
          onClick={() => onCategorySelect(category)}
          aria-label={`Select category: ${category.name}`}
          className="group bg-white rounded-xl shadow-lg p-4 sm:p-6 transform hover:scale-105 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-brand-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary flex flex-col items-center justify-center text-center aspect-square"
        >
          {category.iconImageUrl ? (
            <img
              src={category.iconImageUrl}
              alt="" // Decorative, as button has aria-label
              aria-hidden="true"
              className="h-20 w-20 sm:h-28 sm:w-28 md:h-32 md:w-32 object-contain mb-2 sm:mb-3 group-hover:opacity-80 transition-opacity"
            />
          ) : (
            <div aria-hidden="true" className="h-20 w-20 sm:h-28 sm:w-28 md:h-32 md:w-32 bg-gray-200 rounded-md mb-2 sm:mb-3 flex items-center justify-center text-gray-400 text-4xl sm:text-5xl">?</div>
          )}
          <span className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 group-hover:text-brand-primary transition-colors">
            {category.name}
          </span>
        </button>
      ))}
    </div>
  );
};

CategorySelector.propTypes = {
  availableCategories: PropTypes.array.isRequired,
  onCategorySelect: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
};

export default CategorySelector;