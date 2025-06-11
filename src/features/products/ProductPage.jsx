// src/features/products/ProductPage.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import Breadcrumbs from './components/Breadcrumbs'; 
import ProductTitleBrand from './components/ProductTitleBrand'; 
import ProductImageGallery from './components/ProductImageGallery'; 
import CriticsScoreDisplay from './components/CriticsScoreDisplay'; 
import AudienceRatingDisplay from './components/AudienceRatingDisplay'; 
import ProsConsSummary from './components/ProsConsSummary'; 
import WhereToBuyShare from './components/WhereToBuyShare'; 
import ProductSpecifications from './components/ProductSpecifications'; 
import CriticsReviewSection from './components/CriticsReviewSection'; 
import AudienceReviewSection from './components/AudienceReviewSection'; 
import FeatureSpecificInsights from './components/FeatureSpecificInsights'; 
import CompareSimilarProducts from './components/CompareSimilarProducts'; 
import RelatedArticles from './components/RelatedArticles'; 

// calculateAudienceScore is no longer needed here for the primary score
// normalizeScore might still be used if displaying individual critic review scores that need normalization

const ProductPage = ({ allProducts, calculateCriticsScore }) => {
  const { productNameSlug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retailerReviewData, setRetailerReviewData] = useState([]);

  useEffect(() => {
    if (productNameSlug && allProducts.length > 0) {
      const foundProduct = allProducts.find(
        (p) => p.productName.toLowerCase().replace(/\s+/g, '-') === productNameSlug
      );
      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        setError('Product not found.');
      }
    }
    // Only set loading to false once allProducts has been processed or if productNameSlug is missing
    if (allProducts.length > 0 || !productNameSlug) {
        setLoading(false);
    }
  }, [productNameSlug, allProducts]);

  const criticsScoreValue = useMemo(() => {
    if (product) { // Check if the product object exists
      // Use pre-aggregated critic score directly
      console.log('[ProductPage] Critic Score Data:', { preAggregatedCriticScore: product.preAggregatedCriticScore, totalCriticReviewCount: product.totalCriticReviewCount });
      return typeof product.preAggregatedCriticScore === 'number' ? product.preAggregatedCriticScore : null;
    }
    return null;
  }, [product]);

  const { combinedAudienceScoreOutOf100, combinedAudienceReviewCount } = useMemo(() => {
    // Log the product and retailerReviewData when this memo recalculates
    // console.log('[ProductPage] Using pre-aggregated audience score. Product:', product); // This log is already good for the whole product

    if (!product) {
      console.log('[ProductPage] No product data available for audience score calculation.');
      return { combinedAudienceScoreOutOf100: null, combinedAudienceReviewCount: 0 };
    }
    // Use pre-aggregated audience score and count directly
    console.log('[ProductPage] Audience Score Data:', { preAggregatedAudienceScore: product.preAggregatedAudienceScore, totalAudienceReviewCount: product.totalAudienceReviewCount });
    const score = typeof product.preAggregatedAudienceScore === 'number' ? product.preAggregatedAudienceScore : null;
    const count = typeof product.totalAudienceReviewCount === 'number' ? product.totalAudienceReviewCount : 0;
    
    // console.log('[ProductPage] Using pre-aggregated audience score:', score, 'Count:', count); // This log shows the processed values

    return {
      combinedAudienceScoreOutOf100: score,
      combinedAudienceReviewCount: count,
    };
  }, [product]);

  const handleRetailerReviewDataUpdate = useCallback((data) => {
    // Log when retailer review data is updated
    console.log('[ProductPage] handleRetailerReviewDataUpdate called with:', data);

    setRetailerReviewData(prevData => {
      if (prevData.length !== data.length || 
          data.some((newItem, index) => {
            const oldItem = prevData[index];
            return !oldItem || JSON.stringify(newItem) !== JSON.stringify(oldItem);
          })) {
        return data;
      }
      return prevData;
    });
  }, []);
  // Log initial product state and when it changes
  useEffect(() => {
    console.log('[ProductPage] Product state initialized or changed:', product);
  }, [product]);


  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
        <p className="mt-4 text-lg text-gray-600">Loading Product Details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <h1 className="text-2xl font-semibold text-red-600 mb-4">{error}</h1>
        <Link to="/" className="text-brand-primary hover:underline">Go back to Homepage</Link>
      </div>
    );
  }

  if (!product) {
    // This case should ideally be covered by the error state if product isn't found
    // but as a fallback:
    return (
        <div className="container mx-auto px-4 py-10 text-center">
            <h1 className="text-2xl font-semibold text-gray-700 mb-4">Product details are unavailable.</h1>
            <Link to="/" className="text-brand-primary hover:underline">Go back to Homepage</Link>
        </div>
    );
  }

  const productPageUrl = window.location.href;
  const metaDescription = product.description ? product.description.substring(0, 160) : `Find reviews, scores, and specifications for ${product.productName}. TechScore helps you decide.`;

  // Prepare breadcrumbs data
  const categorySlug = product.category ? product.category.toLowerCase().replace(/\s+/g, '-') : 'unknown-category';
  const productPageCrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Categories', path: '/categories' },
  ];
  if (product.category) {
    productPageCrumbs.push({ label: product.category, path: `/category/${categorySlug}` });
  }
  productPageCrumbs.push({ label: product.productName }); // Current page, no path


  // Schema Markup
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.productName,
    "image": product.imageURL ? `${window.location.origin}${product.imageURL}` : undefined,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    ...(criticsScoreValue !== null || combinedAudienceScoreOutOf100 !== null ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": criticsScoreValue !== null ? criticsScoreValue : combinedAudienceScoreOutOf100, // Prioritize critics or use audience
        "bestRating": "100",
        "worstRating": "0",
        "ratingCount": (product.totalCriticReviewCount || 0) + (product.totalAudienceReviewCount || 0), // Use total counts from backend
        "reviewCount": (product.totalCriticReviewCount || 0) + (product.totalAudienceReviewCount || 0)  // Use total counts from backend
      }
    } : {}),
    // "review": product.criticReviews?.map(r => ({ // Can be extensive
    //   "@type": "Review",
    //   "author": {"@type": "Organization", "name": r.publication},
    //   "reviewRating": {"@type": "Rating", "ratingValue": normalizeScore(r.score, r.scale), "bestRating": "100"},
    //   "url": r.link
    // })) || []
  };

  return (
    <HelmetProvider>
      <Helmet>
        <title>{`${product.productName} Reviews & Scores - TechScore`}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={productPageUrl} />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      {/* Add a wrapper div with top padding to account for the fixed header */}
      <div className="pt-16 md:pt-20">
        <Breadcrumbs crumbs={productPageCrumbs} />

        {/* Adjust top padding of this container to py-6 sm:py-8 for consistent spacing after breadcrumbs */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Hero Section for Product Page */}
          {/* Mobile: Info (Title etc.) first, then Gallery. */}
          {/* Desktop (lg+): Gallery first (left), then Info (right). */}
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 mb-8 sm:mb-10">
            {/* Info column - order-1 on mobile, order-2 (right) on lg */}
            <div className="order-1 lg:order-2 w-full lg:w-4/12 flex flex-col gap-4 sm:gap-5">
              <ProductTitleBrand productName={product.productName} brand={product.brand} />
              <CriticsScoreDisplay criticsScore={criticsScoreValue} />
              <AudienceRatingDisplay
                scoreOutOf100={combinedAudienceScoreOutOf100}
                reviewCount={combinedAudienceReviewCount}
              />
              <ProsConsSummary aiProsCons={product.aiProsCons} />
            </div>
            {/* Image Gallery column - order-2 on mobile, order-1 (left) on lg */}
            <div className="order-2 lg:order-1 w-full lg:w-8/12">
              <ProductImageGallery galleryItems={product.gallery || [{ type: 'image', url: product.imageURL, alt: product.productName }]} productName={product.productName} />
            </div>
          </div>

          {/* Where to Buy - might be part of hero or its own section */}
          <div className="mb-8 sm:mb-10">
               <WhereToBuyShare
                  product={product} // Pass the whole product object
                  onRetailerReviewDataUpdate={handleRetailerReviewDataUpdate}
                  productPageUrl={productPageUrl}
              />
          </div>

          {/* Main Content Sections */}
          <ProductSpecifications product={product} />
          <CriticsReviewSection product={product} />
          <AudienceReviewSection product={product} />
          <FeatureSpecificInsights product={product} />
          <CompareSimilarProducts
              currentProduct={product}
              allProducts={allProducts}
              calculateCriticsScore={calculateCriticsScore}
          />
          <RelatedArticles currentProduct={product} />
        </div>
      </div>
    </HelmetProvider>
  );
};

export default ProductPage;
