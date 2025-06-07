// src/components/ProductPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';

import Breadcrumbs from './ProductPage/Breadcrumbs';
import ProductTitleBrand from './ProductPage/ProductTitleBrand';
import ProductImageGallery from './ProductPage/ProductImageGallery';
import CriticsScoreDisplay from './ProductPage/CriticsScoreDisplay';
import AudienceRatingDisplay from './ProductPage/AudienceRatingDisplay';
import ProsConsSummary from './ProductPage/ProsConsSummary';
import WhereToBuyShare from './ProductPage/WhereToBuyShare';
import ProductSpecifications from './ProductPage/ProductSpecifications';
import CriticsReviewSection from './ProductPage/CriticsReviewSection';
import AudienceReviewSection from './ProductPage/AudienceReviewSection';
import FeatureSpecificInsights from './ProductPage/FeatureSpecificInsights';
import CompareSimilarProducts from './ProductPage/CompareSimilarProducts';
import RelatedArticles from './ProductPage/RelatedArticles';

import { normalizeScore } from '../utils/scoreCalculations'; // Assuming this path is correct

const ProductPage = ({ allProducts, calculateCriticsScore }) => {
  const { productNameSlug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    if (product && product.criticReviews) {
      return calculateCriticsScore(product.criticReviews);
    }
    return null;
  }, [product, calculateCriticsScore]);

  const audienceScoreOutOf100 = useMemo(() => {
    if (product && product.audienceRating) {
      const match = product.audienceRating.match(/(\d+(\.\d+)?)\s*\/\s*(\d+)/);
      if (match) {
        const score = parseFloat(match[1]);
        const scale = parseInt(match[3], 10);
        if (scale !== 0) return Math.round((score / scale) * 100);
      }
    }
    return null;
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
    ...(criticsScoreValue !== null || audienceScoreOutOf100 !== null ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": criticsScoreValue !== null ? criticsScoreValue : audienceScoreOutOf100, // Prioritize critics or use audience
        "bestRating": "100",
        "worstRating": "0",
        "ratingCount": (product.criticReviews?.length || 0) + (product.audienceReviewCount || 0 || placeholderUserReviews.length), // Example count
        "reviewCount": (product.criticReviews?.length || 0) + (product.audienceReviewCount || 0 || placeholderUserReviews.length)
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

      <Breadcrumbs product={product} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6 sm:pt-16 sm:pb-8">
        {/* Hero Section for Product Page */}
        {/* Mobile: Info (Title etc.) first, then Gallery. */}
        {/* Desktop (lg+): Gallery first (left), then Info (right). */}
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 mb-8 sm:mb-10">
          {/* Info column - order-1 on mobile, order-2 (right) on lg */}
          <div className="order-1 lg:order-2 w-full lg:w-4/12 flex flex-col gap-4 sm:gap-5">
            <ProductTitleBrand productName={product.productName} brand={product.brand} />
            <CriticsScoreDisplay criticsScore={criticsScoreValue} />
            <AudienceRatingDisplay
              audienceRatingString={product.audienceRating}
              audienceReviewCount={product.audienceReviewCount || placeholderUserReviews.length} // Use placeholder if actual count not in JSON
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
                retailersData={product.retailersData} // Assuming this might be added to products.json
                productPageUrl={productPageUrl}
                productName={product.productName}
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
    </HelmetProvider>
  );
};

// Placeholder for data not in products.json, used in AudienceRatingDisplay and Schema
const placeholderUserReviews = [1,2,3]; // Just to get a count

export default ProductPage;
