// src/features/products/ProductPage.jsx
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
import { buildProductPath } from '../../utils/productRouting';
import { fetchProductBySlug, fetchProductsByCategory } from '../../services/productService';

const ProductPage = ({ calculateCriticsScore }) => {
  const { brandSlug, productNameSlug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retailerReviewData, setRetailerReviewData] = useState([]);
  const [featureInsights, setFeatureInsights] = useState([]);
  const { user, loading: authLoading } = useContext(AuthContext);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoritingLoading, setFavoritingLoading] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const foundProduct = await fetchProductBySlug(productNameSlug, brandSlug);
        console.log('ProductPage loadProduct result:', foundProduct);
        if (foundProduct) {
          setProduct(foundProduct);
          setError(null);

          // Fetch similar products from same category
          const { products: similar } = await fetchProductsByCategory(foundProduct.category, { limit: 5 });
          setSimilarProducts(similar.filter(p => p.id !== foundProduct.id));
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        console.error('Error loading product:', err);
        setError(`Failed to load product details. ${err.message}`);
      } finally {
        console.log('ProductPage loadProduct finally block reached');
        setLoading(false);
      }
    };

    if (productNameSlug) {
      loadProduct();
    }
  }, [brandSlug, productNameSlug]);

  useEffect(() => {
    if (!product) return;
    const canonicalPath = buildProductPath(product);
    const currentPath = brandSlug ? `/product/${brandSlug}/${productNameSlug}` : `/product/${productNameSlug}`;
    if (canonicalPath !== currentPath) {
      navigate(canonicalPath, { replace: true });
    }
  }, [product, brandSlug, productNameSlug, navigate]);

  useEffect(() => {
    const fetchFeatureInsights = async () => {
      if (product && product.id) {
        try {
          const { data, error: insightsError } = await supabase
            .from('product_feature_insights')
            .select('*')
            .eq('product_id', product.id);

          if (insightsError) throw insightsError;
          setFeatureInsights(data || []);
        } catch (err) {
          console.error('Error fetching feature insights:', err);
          setFeatureInsights([]);
        }
      }
    };
    fetchFeatureInsights();
  }, [product]);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!product || !user || authLoading) {
        if (!user && !authLoading) setIsFavorited(false);
        return;
      }
      try {
        setFavoritingLoading(true);
        const { data, error: favError } = await supabase
          .from('user_favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('product_id', product.id)
          .limit(1)
          .maybeSingle();

        if (favError && favError.code !== 'PGRST116') {
          console.error('Error checking favorite status:', favError);
          setIsFavorited(false);
        } else {
          setIsFavorited(!!data);
        }
      } catch (err) {
        console.error('Error in checkFavoriteStatus:', err);
      } finally {
        setFavoritingLoading(false);
      }
    };
    checkFavoriteStatus();
  }, [product, user, authLoading]);

  const handleFavoriteToggle = async (e) => {
    e.preventDefault();
    if (favoritingLoading || authLoading) return;
    if (!user) {
      alert('Please log in to favorite products!');
      return;
    }
    if (!product || !product.id) return;

    setFavoritingLoading(true);
    try {
      if (isFavorited) {
        await supabase.from('user_favorites').delete().match({ user_id: user.id, product_id: product.id });
        setIsFavorited(false);
      } else {
        await supabase.from('user_favorites').insert({ user_id: user.id, product_id: product.id });
        setIsFavorited(true);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setFavoritingLoading(false);
    }
  };

  const handleRetailerReviewDataUpdate = useCallback((data) => {
    setRetailerReviewData((prevData) => {
      // Simple deep equality check to prevent unnecessary re-renders
      if (JSON.stringify(prevData) === JSON.stringify(data)) {
        return prevData;
      }
      return data;
    });
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 text-center mt-16 md:mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
        <p className="mt-4 text-lg text-gray-600 dark:text-slate-400">Loading Product Details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10 text-center mt-16 md:mt-20">
        <h1 className="text-2xl font-semibold text-red-600 mb-4">{error}</h1>
        <Link to="/" className="text-brand-primary hover:underline">Go back to Homepage</Link>
      </div>
    );
  }

  if (!product) return null;

  const criticsScoreValue = product.preAggregatedCriticScore;
  const combinedAudienceScoreOutOf100 = product.preAggregatedAudienceScore;
  const combinedAudienceReviewCount = product.totalAudienceReviewCount;

  const categorySlug = product.category ? product.category.toLowerCase().replace(/\s+/g, '-') : 'unknown-category';
  const productPageCrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Categories', path: '/categories' },
  ];
  if (product.category) {
    productPageCrumbs.push({ label: product.category, path: `/category/${categorySlug}` });
  }
  productPageCrumbs.push({ label: product.productName });

  return (
    <>
      <Breadcrumbs crumbs={productPageCrumbs} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mt-16 md:mt-20">
        <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-x-8 gap-y-6 sm:gap-y-8 mb-8 sm:mb-10">
          <div className="order-1 lg:col-start-9 lg:col-span-4 lg:row-start-1">
            <ProductTitleBrand productName={product.productName} brand={product.brand} />
          </div>
          <div className="order-2 lg:col-start-1 lg:col-span-8 lg:row-start-1 lg:row-span-2">
            <ProductImageGallery
              galleryItems={(Array.isArray(product.gallery) && product.gallery.length > 0)
                ? product.gallery
                : [{ type: 'image', url: product.imageURL, alt: product.productName }]}
              productName={product.productName}
            />
          </div>
          <div className="order-3 lg:col-start-9 lg:col-span-4 lg:row-start-2 flex flex-col gap-4 sm:gap-5">
            <CriticsScoreDisplay criticsScore={criticsScoreValue} />
            <AudienceRatingDisplay
              scoreOutOf100={combinedAudienceScoreOutOf100}
              reviewCount={combinedAudienceReviewCount}
            />
            <ProsConsSummary aiProsCons={product.aiProsCons} />
            {!authLoading && user && (
              <div className="mt-auto pt-4">
                <button
                  onClick={handleFavoriteToggle}
                  disabled={favoritingLoading}
                  className={`w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out
                    ${isFavorited
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 focus:ring-red-500'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 focus:ring-brand-primary'}
                    ${favoritingLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isFavorited ? <HeartSolidIcon className="h-6 w-6 mr-2 text-red-600" /> : <HeartOutlineIcon className="h-6 w-6 mr-2" />}
                  {favoritingLoading ? 'Updating...' : (isFavorited ? 'Favorited' : 'Favorite')}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="mb-8 sm:mb-10">
          <WhereToBuyShare
            product={product}
            onRetailerReviewDataUpdate={handleRetailerReviewDataUpdate}
            productPageUrl={window.location.href}
          />
        </div>
        <ProductSpecifications product={product} />
        <CriticsReviewSection product={product} />
        <FeatureSpecificInsights product={product} insightsData={featureInsights} />
        <AudienceReviewSection product={product} />
        <CompareSimilarProducts
          currentProduct={product}
          allProducts={similarProducts}
          calculateCriticsScore={calculateCriticsScore}
        />
        <RelatedArticles currentProduct={product} />
      </div>
    </>
  );
};

export default ProductPage;
