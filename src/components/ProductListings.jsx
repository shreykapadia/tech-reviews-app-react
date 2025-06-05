// src/components/ProductListings.jsx
import React from 'react';
import ProductCard from './ProductCard';

function ProductListings({ products, onProductClick, calculateCriticsScore }) {
  if (!products || products.length === 0) {
    return <p className="text-center text-gray-600 col-span-full">No products found.</p>;
  }

  return (
    <section className="container mx-auto p-8 pt-8">
      <h2 className="text-3xl font-bold text-brand-primary mb-8 text-center font-serif">Featured Reviews</h2>
      <div id="product-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map(product => (
          <ProductCard
            key={product.productName}
            product={product}
            onCardClick={onProductClick}
            calculateCriticsScore={calculateCriticsScore}
          />
        ))}
      </div>
    </section>
  );
}

export default ProductListings;