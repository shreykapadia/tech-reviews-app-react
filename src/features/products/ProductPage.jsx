// src/features/products/ProductPage.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import Breadcrumbs from './components/Breadcrumbs'; // Corrected path
import ProductTitleBrand from './components/ProductTitleBrand'; // Corrected path
import ProductImageGallery from './components/ProductImageGallery'; // Corrected path
import CriticsScoreDisplay from './components/CriticsScoreDisplay'; // Corrected path
import AudienceRatingDisplay from './components/AudienceRatingDisplay'; // Corrected path
import ProsConsSummary from './components/ProsConsSummary'; // Corrected path
import WhereToBuyShare from './components/WhereToBuyShare'; // Corrected path
import ProductSpecifications from './components/ProductSpecifications'; // Corrected path
import CriticsReviewSection from './components/CriticsReviewSection'; // Corrected path
import AudienceReviewSection from './components/AudienceReviewSection'; // Corrected path
import FeatureSpecificInsights from './components/FeatureSpecificInsights'; // Corrected path
import CompareSimilarProducts from './components/CompareSimilarProducts'; // Corrected path
import RelatedArticles from './components/RelatedArticles'; // Corrected path

import { normalizeScore } from '../../utils/scoreCalculations'; // Corrected path

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
    if (product && product.criticReviews) {
      return calculateCriticsScore(product.criticReviews);
    }
    return null;
  }, [product, calculateCriticsScore]);

  const { combinedAudienceScoreOutOf100, combinedAudienceReviewCount } = useMemo(() => {
    let totalWeightedScore = 0;
    let totalReviews = 0;

    // Process original product audience rating
    if (product?.audienceRating && product?.audienceReviewCount > 0) {
      const match = product.audienceRating.match(/(\d+(\.\d+)?)\s*\/\s*(\d+)/);
      if (match) {
        const score = parseFloat(match[1]);
        const scale = parseInt(match[3], 10);
        if (scale !== 0) {
          const score100 = (score / scale) * 100;
          totalWeightedScore += score100 * product.audienceReviewCount;
          totalReviews += product.audienceReviewCount;
        }
      }
    }

    // Process retailer review data
    retailerReviewData.forEach(retailer => {
      if (retailer.average && retailer.count > 0) {
        const scale = retailer.scale || 5; // Assume 5 if not provided
        const score100 = (retailer.average / scale) * 100;
        totalWeightedScore += score100 * retailer.count;
        totalReviews += retailer.count;
      }
    });

    if (totalReviews === 0) {
      return { combinedAudienceScoreOutOf100: null, combinedAudienceReviewCount: 0 };
    }

    const finalCombinedScore = Math.round(totalWeightedScore / totalReviews);
    return { combinedAudienceScoreOutOf100: finalCombinedScore, combinedAudienceReviewCount: totalReviews };
  }, [product, retailerReviewData]);

  const handleRetailerReviewDataUpdate = useCallback((data) => {
    setRetailerReviewData(prevData => {
      // Check if data has meaningfully changed
      if (prevData.length !== data.length) {
        return data; // Length changed, definitely update
      }

      // Compare content of each item
      const hasChanged = data.some((newItem, index) => {
        const oldItem = prevData[index];
        if (!oldItem) return true; // Should not happen if lengths are same
        return oldItem.retailerName !== newItem.retailerName ||
               oldItem.average !== newItem.average ||
               oldItem.count !== newItem.count ||
               oldItem.scale !== newItem.scale;
      });

      return hasChanged ? data : prevData; // Only update if content changed
    });
  }, []); // Empty dependency array: setRetailerReviewData is stable

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
        "ratingCount": (product.criticReviews?.length || 0) + combinedAudienceReviewCount,
        "reviewCount": (product.criticReviews?.length || 0) + combinedAudienceReviewCount
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
