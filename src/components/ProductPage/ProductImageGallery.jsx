// src/components/ProductPage/ProductImageGallery.jsx
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { PlayCircleIcon, PhotoIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const ProductImageGallery = ({ galleryItems, productName }) => {
  const [validGalleryItems, setValidGalleryItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isTapZoom, setIsTapZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const mainDisplayRef = useRef(null);


  useEffect(() => {
    const items = Array.isArray(galleryItems) && galleryItems.length > 0
      ? galleryItems
      : [{ type: 'image', url: '/images/placeholder-image.webp', alt: `${productName || 'Product'} placeholder image` }];

    setValidGalleryItems(items);
    if (items.length > 0) {
      setSelectedItem(items[0]);
      setCurrentIndex(0);
    } else {
      setSelectedItem(null);
      setCurrentIndex(-1);
    }
  }, [galleryItems, productName]);

  const handleSelectItem = (item, index) => {
    setSelectedItem(item);
    setCurrentIndex(index);
    setIsTapZoom(false);
    setZoomPosition({ x: 50, y: 50 });
  };

  const navigateGallery = (direction) => {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < validGalleryItems.length) {
      handleSelectItem(validGalleryItems[newIndex], newIndex); // This will also reset zoom
    }
  };

  const handleMouseMoveForZoom = (e) => {
    if (!mainDisplayRef.current || !isEffectivelyZoomed || selectedItem?.type !== 'image') return;
    const rect = mainDisplayRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleClickForZoom = () => {
    if (selectedItem?.type !== 'image') return;
    setIsTapZoom(prev => !prev);
    if (isTapZoom) setZoomPosition({ x: 50, y: 50 }); // If un-zooming (current state isTapZoom is true, meaning it was just toggled to false)
  };

  const getYouTubeID = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getThumbnailUrl = (item) => {
    if (item.type === 'video') {
      const videoId = getYouTubeID(item.url);
      return item.thumbnailUrl || (videoId ? `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg` : '/images/default-video-thumb.webp');
    }
    return item.url;
  };

  if (!selectedItem) {
    return (
      <div className="w-full aspect-[4/3] sm:aspect-square bg-gray-200 flex items-center justify-center rounded-lg shadow-md animate-pulse">
        <PhotoIcon className="w-16 h-16 text-gray-400" />
      </div>
    );
  }

  const mainDisplayClasses = `relative aspect-[4/3] sm:aspect-square bg-gray-100 rounded-lg shadow-lg overflow-hidden group
    ${selectedItem?.type === 'image' && (isTapZoom ? 'cursor-zoom-out' : 'cursor-zoom-in')}`;
  const imageClasses = `w-full h-full object-contain transition-transform duration-200 ease-out
    ${selectedItem?.type === 'image' && isTapZoom ? 'scale-[1.75] sm:scale-[2]' : 'scale-100'}`;

  return (
    <div className="flex flex-col md:flex-row gap-4 sm:gap-6 animate-fade-in-up">
      {/* Thumbnail Column */}
      <div className={`md:w-1/5 order-2 md:order-1 ${validGalleryItems.length <= 1 ? 'hidden' : ''}`}>
        <div className="flex md:flex-col gap-2 sm:gap-3 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto pb-2 md:pb-0 md:max-h-[380px] lg:max-h-[480px]">
          {validGalleryItems.map((item, index) => (
            <button
              key={item.url + index}
              onClick={() => handleSelectItem(item, index)}
              className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-full md:h-auto md:aspect-square rounded-md overflow-hidden border-2 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-all duration-200
                          ${currentIndex === index ? 'border-brand-primary shadow-md' : 'border-gray-300 hover:border-gray-400'}`}
              aria-label={`View ${item.type} ${index + 1} of ${validGalleryItems.length}. ${item.alt || ''}`}
              aria-current={currentIndex === index}
            >
              <img
                src={getThumbnailUrl(item)}
                alt={item.alt || `${productName || 'Product'} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {item.type === 'video' && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity group-hover:bg-opacity-30">
                  <PlayCircleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white opacity-80 group-hover:opacity-100" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Display Area */}
      <div className="md:w-4/5 order-1 md:order-2 relative">
        <div
          ref={mainDisplayRef}
          className={mainDisplayClasses}
          onMouseMove={isTapZoom ? handleMouseMoveForZoom : undefined} // Only track mouse for zoom position if zoomed
          onClick={handleClickForZoom}
          role="figure"
          aria-label={selectedItem.alt || `${productName || 'Product'} main view`}
        >
          {selectedItem.type === 'image' ? (
            <img
              src={selectedItem.url}
              alt={selectedItem.alt || `${productName || 'Product'} main view`}
              className={imageClasses}
              style={selectedItem?.type === 'image' && isTapZoom ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : {}}
            />
          ) : (
            <iframe
              className="w-full h-full"
              src={selectedItem.url}
              title={selectedItem.alt || `${productName || 'Product'} video`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          )}
        </div>

        {/* Navigation Arrows for Main Image */}
        {validGalleryItems.length > 1 && (
          <>
            <button
              onClick={() => navigateGallery(-1)}
              disabled={currentIndex === 0}
              className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-gray-800"
              aria-label="Previous item"
            >
              <ChevronLeftIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={() => navigateGallery(1)}
              disabled={currentIndex === validGalleryItems.length - 1}
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-gray-800"
              aria-label="Next item"
            >
              <ChevronRightIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

ProductImageGallery.propTypes = {
  galleryItems: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(['image', 'video']).isRequired,
      url: PropTypes.string.isRequired,
      alt: PropTypes.string,
      thumbnailUrl: PropTypes.string,
    })
  ),
  productName: PropTypes.string,
};

ProductImageGallery.defaultProps = {
  galleryItems: [],
  productName: 'Product',
};

export default ProductImageGallery;