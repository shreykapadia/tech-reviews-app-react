// src/components/Carousel.jsx
import React, { useState, useEffect } from 'react';

const defaultConfig = {
  itemsPerPageDesktop: 4,
  maxItems: 12,
  mobileItemWidth: 'w-[75vw] sm:w-[60vw]', // Card takes % of viewport width on mobile
  desktopPageContainerClassName: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8', // Default grid for 4 items
  showDots: true,
  showArrows: true,
  placeholderClassName: 'hidden sm:block', // Class for placeholder items to fill grid
};

function Carousel({
  items,
  renderItem,
  getItemKey,
  title,
  config: userConfig = {},
  sectionClassName = "container mx-auto pt-10 pb-10 px-4",
  titleClassName = "text-3xl sm:text-4xl font-bold text-brand-text mb-8 text-center font-serif",
}) {
  const config = { ...defaultConfig, ...userConfig };
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768); // md breakpoint

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const itemsToDisplay = items.slice(0, config.maxItems);

  if (!items || items.length === 0) {
    return <p className="text-center text-gray-600 py-8">No items to display.</p>;
  }

  const totalPages = Math.ceil(itemsToDisplay.length / config.itemsPerPageDesktop);

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
    <section className={sectionClassName}>
      {title && <h2 className={titleClassName}>{title}</h2>}

      {itemsToDisplay.length === 0 ? (
        <p className="text-center text-gray-600">No items to display in carousel.</p>
      ) : (
        <div className="relative md:px-16"> {/* Desktop arrows need padding */}
          {/* Previous Arrow */}
          {!isMobileView && config.showArrows && totalPages > 1 && currentPage > 0 && (
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className="absolute left-0 md:left-2 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/85 hover:bg-white rounded-full shadow-[0_14px_28px_rgba(8,38,67,0.16)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Previous page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-brand-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}

          {/* Carousel Viewport */}
          <div className={`overflow-hidden ${isMobileView ? 'overflow-x-auto pb-4' : ''}`}>
            {/* Carousel Track */}
            <div
              className={`flex ${isMobileView ? 'space-x-4' : 'transition-transform duration-500 ease-in-out'}`}
              style={!isMobileView ? { transform: `translateX(-${currentPage * 100}%)` } : {}}
            >
              {isMobileView ? (
                itemsToDisplay.map((item, index) => (
                  <div key={getItemKey(item)} className={`flex-shrink-0 ${config.mobileItemWidth}`}>
                    {renderItem(item, index)}
                  </div>
                ))
              ) : (
                Array.from({ length: totalPages }).map((_, pageIndex) => {
                  const pageItems = itemsToDisplay.slice(
                    pageIndex * config.itemsPerPageDesktop,
                    (pageIndex + 1) * config.itemsPerPageDesktop
                  );
                  return (
                    <div
                      key={`carousel-page-${pageIndex}`}
                      className={`w-full flex-shrink-0 ${config.desktopPageContainerClassName}`}
                    >
                      {pageItems.map((item, itemIndex) => renderItem(item, itemIndex))}
                      {/* Fill empty slots for layout consistency on this page */}
                      {pageItems.length > 0 && pageItems.length < config.itemsPerPageDesktop &&
                        Array.from({ length: config.itemsPerPageDesktop - pageItems.length }).map((_ph, placeholderIndex) => (
                          <div key={`placeholder-${pageIndex}-${placeholderIndex}`} className={config.placeholderClassName}></div>
                        ))}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Next Arrow */}
          {!isMobileView && config.showArrows && totalPages > 1 && currentPage < totalPages - 1 && (
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              className="absolute right-0 md:right-2 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/85 hover:bg-white rounded-full shadow-[0_14px_28px_rgba(8,38,67,0.16)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
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
      {!isMobileView && config.showDots && totalPages > 1 && itemsToDisplay.length > 0 && (
        <div className="flex justify-center space-x-2 mt-10">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={`dot-${index}`}
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

export default Carousel;
