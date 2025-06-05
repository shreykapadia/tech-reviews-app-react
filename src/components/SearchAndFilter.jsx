// src/components/SearchAndFilter.jsx
import React from 'react';

function SearchAndFilter({ searchTerm, onSearchChange, selectedCategory, onCategoryChange, categories }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-fade-in delay-200">
        {/* Search Input */}
        <div className="w-full sm:w-auto sm:flex-grow relative">
          <input
            type="search"
            id="search-input"
            placeholder="Search products by name or brand..."
            className="w-full p-4 pr-12 text-lg rounded-full border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 shadow-md text-brand-text placeholder-gray-400"
            value={searchTerm}
            onChange={onSearchChange}
          />
        </div>
        {/* Category Filter Dropdown */}
        <div className="w-full sm:w-auto sm:min-w-[200px]">
          <select
            id="category-filter"
            className="w-full p-4 text-lg rounded-full border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 shadow-md text-brand-text bg-white appearance-none"
            value={selectedCategory}
            onChange={onCategoryChange}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default SearchAndFilter;