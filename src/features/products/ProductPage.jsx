// src/features/products/ProductPage.jsx
import React, { useEffect, useState, useMemo, useCallback, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
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
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { AuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';

// calculateAudienceScore is no longer needed here for the primary score
// normalizeScore might still be used if displaying individual critic review scores that need normalization

const ProductPage = ({ allProducts, calculateCriticsScore }) => {
  // Log props received by ProductPage
  // console.log('[ProductPage] Props received:', { allProducts, calculateCriticsScore });

  const { productNameSlug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retailerReviewData, setRetailerReviewData] = useState([]);
  const [featureInsights, setFeatureInsights] = useState([]);
  const { user, loading: authLoading } = useContext(AuthContext);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoritingLoading, setFavoritingLoading] = useState(false);

  useEffect(() => {
    if (productNameSlug && allProducts.length > 0) {
      // console.log(`[ProductPage] Searching for product with slug: "${productNameSlug}" in allProducts (count: ${allProducts.length})`);
      const foundProduct = allProducts.find(
        (p) => p.productName.toLowerCase().replace(/\s+/g, '-') === productNameSlug
      );
      if (foundProduct) {
        // console.log('[ProductPage] Product found and set:', foundProduct);
        setProduct(foundProduct);
      } else {
        console.error(`[ProductPage] Product with slug "${productNameSlug}" not found.`);
        setError('Product not found.');
      }
    }
    // Only set loading to false once allProducts has been processed or if productNameSlug is missing
    if (allProducts.length > 0 || !productNameSlug) {
        setLoading(false);
    }
  }, [productNameSlug, allProducts]);

  useEffect(() => {
    const fetchFeatureInsights = async () => {
      if (product && product.id) {
        // console.log(`[ProductPage] Fetching feature insights for product ID: ${product.id}`);
        try {
          const { data, error: insightsError } = await supabase
            .from('product_feature_insights')
            .select('*')
            .eq('product_id', product.id);

          if (insightsError) {
            throw insightsError;
          }
          // console.log('[ProductPage] Feature insights fetched:', data); // Ensure this line is uncommented
          setFeatureInsights(data || []);
        } catch (err) {
          console.error('Error fetching feature insights:', err);
          setFeatureInsights([]); // Set to empty array on error
        }
      }
    };
    fetchFeatureInsights();
  }, [product]); // Changed dependency to 'product'

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!product || !user || authLoading) {
        if (!user && !authLoading) setIsFavorited(false); // Explicitly set to false if user is null and auth is loaded
        return;
      }
      try {
        setFavoritingLoading(true); // Indicate loading favorite status
        const { data, error: favError } = await supabase
          .from('user_favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('product_id', product.id) // Ensure product.id is the correct BIGINT ID
          .limit(1)
          .maybeSingle();

        if (favError && favError.code !== 'PGRST116') { // PGRST116: "No rows found" - not an error for this check
          console.error('Error checking favorite status:', favError);
          setIsFavorited(false);
        } else {
          setIsFavorited(!!data);
        }
      } catch (err) {
        console.error('Unexpected error checking favorite status:', err);
        setIsFavorited(false);
      } finally {
        setFavoritingLoading(false);
      }
    };
    checkFavoriteStatus();
  }, [product, user, authLoading]);

  const criticsScoreValue = useMemo(() => {
    if (product) { // Check if the product object exists
      // Use pre-aggregated critic score directly
      // console.log('[ProductPage] Critic Score Data:', { preAggregatedCriticScore: product.preAggregatedCriticScore, totalCriticReviewCount: product.totalCriticReviewCount });
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
    // console.log('[ProductPage] Audience Score Data:', { preAggregatedAudienceScore: product.preAggregatedAudienceScore, totalAudienceReviewCount: product.totalAudienceReviewCount });
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
    // console.log('[ProductPage] handleRetailerReviewDataUpdate called with:', data);

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

  const handleFavoriteToggle = async (e) => {
    e.preventDefault(); // Good practice if this button might be nested
    // e.stopPropagation(); // Use if it's inside another clickable element and you want to prevent that click

    if (favoritingLoading || authLoading) return;

    if (!user) {
      alert('Please log in to favorite products!');
      // Optionally, navigate to login: navigate('/login', { state: { from: location } });
      return;
    }

    if (!product || !product.id) {
      console.error("Product or product ID is missing for favoriting.");
      alert("Could not favorite product. Please try again.");
      return;
    }

    setFavoritingLoading(true);
    try {
      if (isFavorited) {
        const { error: deleteError } = await supabase.from('user_favorites').delete().match({ user_id: user.id, product_id: product.id });
        if (deleteError) throw deleteError;
        setIsFavorited(false);
        // alert('Removed from favorites!'); // Consider less intrusive feedback
      } else {
        const { error: insertError } = await supabase.from('user_favorites').insert({ user_id: user.id, product_id: product.id });
        if (insertError) throw insertError;
        setIsFavorited(true);
        // alert('Added to favorites!'); // Consider less intrusive feedback
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setFavoritingLoading(false);
    }
  };

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
    <>
      <title>{`${product.productName} Reviews & Scores - TechScore`}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={productPageUrl} />
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
      {/* Add a wrapper div with top padding to account for the fixed header */}
      <div className="pt-16 md:pt-20">
        <Breadcrumbs crumbs={productPageCrumbs} />

        {/* Adjust top padding of this container to py-6 sm:py-8 for consistent spacing after breadcrumbs */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/*
            Main layout for Product Hero section.
            Mobile: Uses flexbox with order properties.
            Desktop (lg+): Uses CSS Grid for a two-column layout.
          */}
          <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-x-8 gap-y-6 sm:gap-y-8 mb-8 sm:mb-10">

            {/* Title & Brand: Mobile order-1. Desktop: top of the right column. */}
            <div className="order-1 lg:col-start-9 lg:col-span-4 lg:row-start-1">
              <ProductTitleBrand productName={product.productName} brand={product.brand} />
            </div>

            {/* Image Gallery: Mobile order-2. Desktop: main left column. */}
            <div className="order-2 lg:col-start-1 lg:col-span-8 lg:row-start-1 lg:row-span-2">
              <ProductImageGallery galleryItems={product.gallery || [{ type: 'image', url: product.imageURL, alt: product.productName }]} productName={product.productName} />
            </div>

            {/* Rest of Info (Scores, ProsCons, Favorite): Mobile order-3. Desktop: bottom of the right column. */}
            <div className="order-3 lg:col-start-9 lg:col-span-4 lg:row-start-2 flex flex-col gap-4 sm:gap-5">
              <CriticsScoreDisplay criticsScore={criticsScoreValue} />
              <AudienceRatingDisplay
                scoreOutOf100={combinedAudienceScoreOutOf100}
                reviewCount={combinedAudienceReviewCount}
              />
              <ProsConsSummary aiProsCons={product.aiProsCons} />
              {/* Favorite Button Container - Only show if user is logged in and auth state is determined */}
              {!authLoading && user && (
                <div className="mt-auto pt-4"> {/* mt-auto pushes to bottom of flex container */}
                  <button
                    onClick={handleFavoriteToggle}
                    disabled={favoritingLoading} // authLoading check is now part of the parent conditional
                    className={`w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out
                      ${isFavorited 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-brand-primary'}
                      ${favoritingLoading ? 'opacity-50 cursor-not-allowed' : ''}`} // authLoading check removed from here
                    aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                  >
                    {isFavorited ? <HeartSolidIcon className="h-6 w-6 mr-2 text-red-600" /> : <HeartOutlineIcon className="h-6 w-6 mr-2" />}
                    {favoritingLoading ? 'Updating...' : (isFavorited ? 'Favorited' : 'Favorite')}
                  </button>
                </div>
              )}
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
          <FeatureSpecificInsights product={product} insightsData={featureInsights} />
          <AudienceReviewSection product={product} />
          <CompareSimilarProducts
              currentProduct={product}
              allProducts={allProducts}
              calculateCriticsScore={calculateCriticsScore}
          />
          <RelatedArticles currentProduct={product} />
        </div>
      </div>
    </>
  );
};

export default ProductPage;
