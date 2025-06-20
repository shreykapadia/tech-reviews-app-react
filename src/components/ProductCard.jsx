// src/components/ProductCard.jsx
import React, { useMemo, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { AuthContext } from '../contexts/AuthContext'; // Adjust path if necessary
import { supabase } from '../services/supabaseClient'; // Adjust path if necessary
// calculateAudienceScore is no longer needed here as scores are pre-aggregated

const ProductCard = ({ product, layoutType = 'default' }) => {
  // Log the initial props received by the component
  // console.log('[ProductCard] Rendering with product:', product, 'Layout:', layoutType);

  const criticsScoreDisplay = useMemo(() => {
    if (!product) return '--';
    // Use pre-aggregated critic score directly from product
    // console.log('[ProductCard] Critic Score Data:', { preAggregatedCriticScore: product.preAggregatedCriticScore });
    const score = product.preAggregatedCriticScore;
    return typeof score === 'number' ? Math.round(score) : '--';
  }, [product.preAggregatedCriticScore]);

  const audienceScoreDisplay = useMemo(() => {
    if (!product) return '--';
    // Log the values being used for audience score calculation
    // console.log('[ProductCard] Audience Score Data:', { preAggregatedAudienceScore: product.preAggregatedAudienceScore });
    // Use pre-aggregated audience score directly from product
    const score = product.preAggregatedAudienceScore;
    return typeof score === 'number' ? score : '--';
  }, [product.preAggregatedAudienceScore]);

  const { user, loading: authLoading } = useContext(AuthContext);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoritingLoading, setFavoritingLoading] = useState(false);


  // const audienceScoreToDisplay = audienceScoreValue !== null ? audienceScoreValue : '--'; // Replaced by audienceScoreDisplay

  // Generalized score color function
  const getScoreColor = (score, defaultColorClass = 'text-brand-secondary') => {
    if (score === null || score === '--') return 'text-brand-secondary'; // Default or no score
    const numericScore = Number(score);
    if (isNaN(numericScore)) return defaultColorClass; // Fallback if score is not a number

    if (numericScore >= 85) return 'text-green-600';
    if (numericScore >= 70) return 'text-yellow-600';
    if (numericScore < 70 && numericScore >=0) return 'text-red-600'; // Scores can be 0
    return defaultColorClass; // Fallback for any other case
  };

  const audienceScoreColorClass = getScoreColor(audienceScoreDisplay);
  // Use 'text-brand-primary' as the default for critics score if no specific color applies
  const criticsScoreColorClass = getScoreColor(criticsScoreDisplay, 'text-brand-primary');

  const productNameSlug = product?.productName?.toLowerCase().replace(/\s+/g, '-') || 'unknown-product';

  const isCarousel = layoutType === 'carousel';

  // Base classes for the Link, Criterion I.3
  const baseLinkClasses = "group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out overflow-hidden border border-gray-200 animate-fade-in-up";
  // Layout specific classes for the Link, Criterion I.1
  const linkLayoutClasses = isCarousel
    ? "flex flex-col h-full relative" // Carousel: Vertical stack, h-full, relative for fav button
    : "flex flex-row relative";       // Default: Horizontal layout, relative for fav button

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      // Enhanced logging for debugging
      // console.log('[ProductCard] checkFavoriteStatus called. Product ID:', product?.id, 'User ID:', user?.id, 'Auth Loading:', authLoading);

      if (!product || !product.id || !user || authLoading) {
        if (!user && !authLoading) {
          // console.log('[ProductCard] User not logged in or auth state not ready, setting isFavorited to false.');
          setIsFavorited(false);
        }
        return;
      }
      try {
        // console.log(`[ProductCard] Querying user_favorites for user_id: ${user.id}, product_id: ${product.id}`);
        const { data, error: favError } = await supabase
          .from('user_favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('product_id', product.id)
          .limit(1) // Explicitly ask for at most one row
          .maybeSingle(); // Returns data as object if one row found, or null if none. Errors if limit(1) somehow fails and multiple are returned.

        if (favError && favError.code !== 'PGRST116') {
          console.error('[ProductCard] Error checking favorite status (Supabase):', favError.message, 'Code:', favError.code, 'Details:', favError.details, 'Hint:', favError.hint);
          setIsFavorited(false);
        } else {
          // console.log('[ProductCard] Favorite status checked. Data:', data, 'Is favorited:', !!data);
          setIsFavorited(!!data);
        }
      } catch (err) {
        // This catch block is for unexpected JS errors, not Supabase API errors (handled above)
        console.error('[ProductCard] Unexpected JavaScript error in checkFavoriteStatus:', err);
        setIsFavorited(false);
      }
    };
    checkFavoriteStatus();
  }, [product, user, authLoading]);

  const handleFavoriteToggle = async (e) => {
    e.preventDefault(); // IMPORTANT: Prevent Link navigation
    e.stopPropagation(); // IMPORTANT: Stop event from bubbling up to Link

    if (favoritingLoading || authLoading) return;

    if (!user) {
      alert('Please log in to favorite products!');
      return;
    }
    if (!product || !product.id) return;

    setFavoritingLoading(true);
    try {
      if (isFavorited) {
        const { error: deleteError } = await supabase.from('user_favorites').delete().match({ user_id: user.id, product_id: product.id });
        if (deleteError) throw deleteError;
        setIsFavorited(false);
      } else {
        const { error: insertError } = await supabase.from('user_favorites').insert({ user_id: user.id, product_id: product.id });
        if (insertError) throw insertError;
        setIsFavorited(true);
      }
    } catch (err) {
      console.error('Error toggling card favorite:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setFavoritingLoading(false);
    }
  };

  return (
    <Link
      to={`/product/${productNameSlug}`} // Direct navigation
      className={`${baseLinkClasses} ${linkLayoutClasses}`} // Criterion I.1, I.3
      aria-label={`View details for ${product.productName}`}
    >
      {/* Image Section - Top for carousel, Left for default. Criterion II.1 */}
      {/* Favorite button for ProductCard - positioned absolutely */}
      {user && !authLoading && ( // Only show if user state is determined
        <button
          onClick={handleFavoriteToggle}
          disabled={favoritingLoading}
          className={`absolute top-2 right-2 z-10 p-1.5 rounded-full transition-colors duration-150 ease-in-out
            ${isFavorited ? 'bg-red-500 hover:bg-red-600' : 'bg-black/40 hover:bg-black/60'}
            ${favoritingLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorited 
            ? <HeartSolidIcon className="h-5 w-5 text-white" /> 
            : <HeartOutlineIcon className="h-5 w-5 text-white" />}
        </button>
      )}
      <div
        className={
          isCarousel
            ? "relative w-full h-56 bg-white px-6 pt-6" // Carousel: Changed bg-gray-100 to bg-white
            : "relative w-24 sm:w-32 flex-shrink-0 bg-gray-100" // Default: Removed fixed height (h-24 sm:h-32) to allow vertical stretching
        }
      >
        <img
          src={product.imageURL || '/images/placeholder-image.webp'}
          alt={product.productName}
          className={`
            w-full h-full 
            ${isCarousel ? "object-contain group-hover:scale-105 transition-transform duration-300 rounded-md" : "object-contain"}
          `}
          loading="lazy" // Criterion II.5
        />
      </div>

      {/* Info Section - Below image for carousel, Right for default. Criterion I.2 */}
      <div
        className={
          isCarousel
            ? "p-4 flex flex-col flex-grow" // Carousel: Increased padding slightly for larger text
            : "p-3 flex flex-col flex-grow justify-between" // Default
        }
      >
        {/* Product Name & Brand Section - Criterion III.1 */}
        <div> {/* This container ensures Name/Brand are grouped at the top of the info section */}
          {isCarousel ? (
            <>
              <h3 className="text-xl font-semibold text-brand-text group-hover:text-brand-primary transition-colors mb-1 truncate" title={product.productName}>
                {product.productName}
              </h3>
              <p className="text-base text-gray-500 mb-2">{product.brand}</p>
            </>
          ) : (
            <>
              <h3 className="text-sm sm:text-base font-semibold text-brand-text group-hover:text-brand-primary transition-colors mb-0.5 truncate" title={product.productName}>
                {product.productName}
              </h3>
              <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
            </>
          )}

          {!isCarousel && product.description && ( // Description for default layout
            <p className="text-xs text-gray-600 mt-1 line-clamp-2 sm:line-clamp-1 md:line-clamp-2" title={product.description}>
              {product.description}
            </p>
          )}
          {/* Description for carousel is omitted as per Criterion V to prioritize main elements.
              If needed, it would go here with a tight line-clamp, e.g.:
              isCarousel && product.description && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-1 mb-2" title={product.description}>{product.description}</p>
              )
          */}
        </div>

        {/* Scores Section - Criterion IV.1 */}
        <div className={`flex ${
          isCarousel 
            ? "justify-around mt-auto pt-3 items-start" // Use justify-around for spacing, items-start for vertical alignment
            : "items-center text-xs gap-x-3 mt-2 flex-wrap gap-y-1" // Default for non-carousel
          }`}>
          {/* mt-auto for carousel pushes scores to the bottom of flex-grow area, pt-2 for spacing. Criterion IV.2, IV.6 */}
          {/* Critic Score Block */}
          <div className={`flex flex-col ${isCarousel ? "items-center" : ""}`}>
            <span className={`${isCarousel ? "text-2xl font-bold" : "font-semibold"} ${criticsScoreColorClass}`}>
              {criticsScoreDisplay}
            </span>
            <span className={`text-gray-500 ${isCarousel ? "text-xs mt-0.5" : "ml-0.5"}`}>Critics</span>
          </div>

          {/* Audience Score Block */}
          <div className={`flex flex-col ${isCarousel ? "items-center" : ""}`}>
            <span className={`${isCarousel ? "text-2xl font-bold" : "font-semibold"} ${audienceScoreColorClass}`}>
              {audienceScoreDisplay}
            </span>
            <span className={`text-gray-500 ${isCarousel ? "text-xs mt-0.5" : "ml-0.5"}`}>Audience</span>
            {/* Audience review count - omitted for carousel for simplicity (Criterion IV.3), shown for default */}
          </div>
        </div>
      </div>
    </Link>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, // Ensure ID is present
    productName: PropTypes.string.isRequired,
    brand: PropTypes.string.isRequired,
    imageURL: PropTypes.string,
    // audienceRating: PropTypes.string, // Original string might still exist
    description: PropTypes.string,
    // audienceReviewCount: PropTypes.number, // Original count might still exist
    // criticReviews: PropTypes.array, // Original reviews might still exist
    preAggregatedCriticScore: PropTypes.number, // New prop for pre-calculated critic score
    totalCriticReviewCount: PropTypes.number,
    preAggregatedAudienceScore: PropTypes.number, // New prop for pre-calculated audience score
    totalAudienceReviewCount: PropTypes.number,
  }).isRequired,
  // calculateCriticsScore: PropTypes.func.isRequired, // No longer needed for calculation here
  layoutType: PropTypes.oneOf(['default', 'carousel']), // New prop for layout context
  // retailerReviews prop is removed as it's not used for score calculation anymore
};

ProductCard.defaultProps = {
  layoutType: 'default', // Default to existing layout
};

export default ProductCard;