// src/components/ProductListings.jsx
import React, { useState } from 'react';
import ProductCard from './ProductCard';

function ProductListings({ products, onProductClick, calculateCriticsScore }) {
  const [currentPage, setCurrentPage] = useState(0);
  const cardsPerPage = 4; // Changed from 4 to 5
  const maxCardsInCarousel = 12; // Changed from 8 to 15

  // Only take up to maxCardsInCarousel for the carousel display
  const productsForCarousel = products.slice(0, maxCardsInCarousel);

  if (!products || products.length === 0) {
    return <p className="text-center text-gray-600 col-span-full">No products found.</p>;
  }

  const totalPages = Math.ceil(productsForCarousel.length / cardsPerPage);
  const startIndex = currentPage * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const currentProducts = productsForCarousel.slice(startIndex, endIndex);

  const nextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages - 1));
  };

  const prevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const goToPage = (pageIndex) => {
    setCurrentPage(pageIndex);
  };

  return (
    <section className="container mx-auto pt-8"> {/* Removed horizontal padding, viewport will handle arrow spacing */}
      <h2 className="text-3xl font-bold text-brand-primary mb-8 text-center font-serif">Featured Reviews</h2>

      {productsForCarousel.length === 0 ? (
        <p className="text-center text-gray-600">No featured products to display in carousel.</p>
      ) : (
        <div className="relative px-12 md:px-16"> {/* Added padding for arrow spacing */}
          {/* Previous Arrow */}
          {totalPages > 1 && (
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className="absolute left-0 md:left-2 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/70 hover:bg-white rounded-full shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Previous page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-brand-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}
          {/* Carousel Viewport */}
          <div className="overflow-hidden">
            {/* Carousel Track - This will slide */}
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentPage * 100}%)` }}
            >
              {/* Render each page of products within the track */}
              {Array.from({ length: totalPages }).map((_, pageIndex) => {
                const pageProducts = productsForCarousel.slice(
                  pageIndex * cardsPerPage,
                  (pageIndex + 1) * cardsPerPage
                );
                return (
                  <div
                    key={pageIndex}
                    // Each page takes full width of the viewport and applies the grid for its content
                    className="w-full flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
                  >
                    {pageProducts.map(product => (
                      <ProductCard
                        key={product.productName}
                        product={product}
                        onCardClick={onProductClick}
                        calculateCriticsScore={calculateCriticsScore}
                      />
                    ))}
                    {/* Fill empty slots for layout consistency on this page */}
                    {pageProducts.length > 0 && pageProducts.length < cardsPerPage &&
                      Array.from({ length: cardsPerPage - pageProducts.length }).map((placeholderIndex, index) => (
                        <div key={`placeholder-${pageIndex}-${placeholderIndex}`} className="hidden sm:block"></div>
                      ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Arrow */}
          {totalPages > 1 && (
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              className="absolute right-0 md:right-2 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/70 hover:bg-white rounded-full shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Next page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-brand-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Dots Navigation */}
      {totalPages > 1 && productsForCarousel.length > 0 && (
        <div className="flex justify-center space-x-2 mt-10">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToPage(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${currentPage === index ? 'bg-blue-600 scale-110' : 'bg-gray-300 hover:bg-gray-400'}`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default ProductListings;
