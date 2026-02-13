// src/features/home/components/RecentlyViewedProducts.jsx
import React from 'react';
import ProductCard from '../../../components/ProductCard';
import Carousel from '../../../components/common/Carousel';
import { useRecentlyViewed } from '../../../hooks/useRecentlyViewed';

function RecentlyViewedProducts() {
    const { recentlyViewed } = useRecentlyViewed();

    const getProductKey = (product) => product.id || product.productName;

    const carouselConfig = {
        itemsPerPageDesktop: 4,
        maxItems: 12,
        mobileItemWidth: 'w-[85vw] sm:w-[70vw]',
        desktopPageContainerClassName: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 p-4 pb-12',
    };

    // Don't render anything if there are no recently viewed products
    if (!recentlyViewed || recentlyViewed.length === 0) {
        return null;
    }

    const renderProductItem = (product) => (
        <ProductCard
            key={getProductKey(product)}
            product={product}
            layoutType="carousel"
        />
    );

    return (
        <Carousel
            items={recentlyViewed}
            renderItem={renderProductItem}
            getItemKey={getProductKey}
            title="Recently Viewed"
            config={carouselConfig}
        />
    );
}

export default RecentlyViewedProducts;
