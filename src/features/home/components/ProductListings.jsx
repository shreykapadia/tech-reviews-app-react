// src/features/home/components/ProductListings.jsx
import React, { useState, useEffect } from 'react';
import ProductCard from '../../../components/ProductCard';
import Carousel from '../../../components/common/Carousel';
import { fetchFeaturedProducts } from '../../../services/productService';

function ProductListings({ calculateCriticsScore }) {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getProductKey = (product) => product.id || product.productName;

  const carouselConfig = {
    itemsPerPageDesktop: 4,
    maxItems: 12,
    mobileItemWidth: 'w-[85vw] sm:w-[70vw]',
    desktopPageContainerClassName: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 p-4 pb-12',
  };

  useEffect(() => {
    const loadFeatured = async () => {
      setLoading(true);
      try {
        const products = await fetchFeaturedProducts(carouselConfig.maxItems);
        setFeaturedProducts(products);
      } catch (err) {
        console.error("Error loading featured products:", err);
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, [carouselConfig.maxItems]);

  if (loading) {
    return <div className="text-center py-8">Loading featured products...</div>;
  }

  if (featuredProducts.length === 0) {
    return <p className="text-center text-gray-600 dark:text-slate-400 py-8">No products found.</p>;
  }

  const renderProductItem = (product) => (
    <ProductCard
      key={getProductKey(product)}
      product={product}
      layoutType="carousel"
      calculateCriticsScore={calculateCriticsScore}
    />
  );

  return (
    <Carousel
      items={featuredProducts}
      renderItem={renderProductItem}
      getItemKey={getProductKey}
      title="Featured Reviews"
      config={carouselConfig}
    />
  );
}

export default ProductListings;
