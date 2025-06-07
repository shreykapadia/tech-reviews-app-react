// src/components/ProductListings.jsx
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard'; // Assuming ProductCard is in its own file
import Carousel from './Carousel';

// Helper function to shuffle an array (Fisher-Yates shuffle)
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function ProductListings({ products, calculateCriticsScore }) {
  const [randomizedCarouselItems, setRandomizedCarouselItems] = useState([]);

  // Define how to get a unique key for each product (used for storage and React keys)
  const getProductKey = (product) => product.id || product.productName;

  const carouselConfig = {
    itemsPerPageDesktop: 3, // Show 3 cards for wider appearance
    maxItems: 12,
    mobileItemWidth: 'w-[85vw] sm:w-[70vw]', // Make cards wider on mobile
    desktopPageContainerClassName: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 md:gap-8', // Adjust grid for 3 items
  };

  useEffect(() => {
    if (!products || products.length === 0) {
      setRandomizedCarouselItems([]);
      return;
    }

    const now = Date.now();
    const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
    const storedTimestamp = localStorage.getItem('carouselShuffleTimestamp');
    const storedProductIdsJSON = localStorage.getItem('randomizedCarouselProductIds');
    const maxItems = carouselConfig.maxItems || 12;

    let productIdsToUse = [];
    let productsToDisplay = [];

    if (storedTimestamp && storedProductIdsJSON) {
      const lastShuffleTime = parseInt(storedTimestamp, 10);
      if (now - lastShuffleTime < twentyFourHoursInMs) {
        try {
          const parsedProductIds = JSON.parse(storedProductIdsJSON);
          if (Array.isArray(parsedProductIds) && parsedProductIds.length > 0) {
            productIdsToUse = parsedProductIds;
            const reconstructedProducts = productIdsToUse
              .map(id => products.find(p => getProductKey(p) === id))
              .filter(Boolean); 

            if (reconstructedProducts.length >= Math.min(maxItems, productIdsToUse.length * 0.8)) {
              productsToDisplay = reconstructedProducts.slice(0, maxItems);
            } else {
              // Not enough valid products from stored IDs, force a reshuffle
              productIdsToUse = [];
            }
          }
        } catch (error) {
          console.error("Error parsing stored carousel product IDs:", error);
        }
      }
    }

    if (productsToDisplay.length === 0) { 
      const shuffled = shuffleArray(products);
      productsToDisplay = shuffled.slice(0, maxItems);
      const idsToStore = productsToDisplay.map(p => getProductKey(p));
      localStorage.setItem('randomizedCarouselProductIds', JSON.stringify(idsToStore));
      localStorage.setItem('carouselShuffleTimestamp', now.toString());
    }
    
    setRandomizedCarouselItems(productsToDisplay);

  }, [products, carouselConfig.maxItems]); 

  if (!products || products.length === 0) {
    return <p className="text-center text-gray-600 py-8">No products found.</p>;
  }

  const renderProductItem = (product) => (
    <ProductCard
      key={getProductKey(product)}
      product={product}
      // onProductClick={onProductClick} // Not strictly needed if ProductCard handles navigation
      layoutType="carousel" // This enables the vertical layout
      calculateCriticsScore={calculateCriticsScore}
    />
  );

  return (
    <Carousel
      items={randomizedCarouselItems}
      renderItem={renderProductItem}
      getItemKey={getProductKey}
      title="Featured Reviews"
      config={carouselConfig}
    />
  );
}

export default ProductListings;
