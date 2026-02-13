// src/components/ProductPage/AudienceReviewSection.jsx
import React, { useState, useEffect, useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../../../services/supabaseClient'; // Adjust path as needed
import { AuthContext } from '../../../contexts/AuthContext'; // Adjust path as needed
import SubmitReviewForm from '../../reviews/SubmitReviewForm'; // Adjust path as needed
import {
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
  StarIcon as StarOutline,
  CheckBadgeIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
// import { StarIcon as StarSolid } from '@heroicons/react/24/solid'; // Replaced by custom StarIcon

// Helper component: StarIcon (also used in SubmitReviewForm)
// (Ideally, this would be in a shared components directory and imported)
const StarIcon = ({ fillLevel, sizeClasses = "h-6 w-6" }) => {
  // React.useId is preferred for unique IDs, with a fallback for older React versions
  const uniqueId = React.useId ? React.useId() : `grad-${Math.random().toString(36).substring(2, 9)}`;
  const starPath = "M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.116 3.986 1.241 5.385c.275 1.183-.984 2.126-2.056 1.532L12 18.22l-4.994 2.695c-1.072.593-2.331-.35-2.056-1.532l1.24-5.385L1.08 10.955c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z";

  return (
    <svg className={`${sizeClasses} inline-block`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={uniqueId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset={`${Math.max(0, Math.min(100, fillLevel * 100))}%`} className="text-yellow-400" stopColor="currentColor" />
          <stop offset={`${Math.max(0, Math.min(100, fillLevel * 100))}%`} className="text-gray-300" stopColor="currentColor" />
        </linearGradient>
      </defs>
      <path d={starPath} fill={`url(#${uniqueId})`} />
    </svg>
  );
};

const RatingDistributionBar = ({ rating, percentage, count, colorClass = 'bg-yellow-400' }) => (
  <div className="flex items-center space-x-2 mb-1 text-xs">
    <span className="w-12 text-gray-600 dark:text-slate-400">{rating} star</span>
    <div className="flex-1 bg-gray-200 rounded-full h-2.5 sm:h-3 overflow-hidden">
      <div
        className={`${colorClass} h-full rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${percentage}%` }}
      />
    </div>
    <span className="w-10 text-gray-700 dark:text-slate-300 font-medium text-right">{count}</span>
  </div>
);

const UserReviewCard = ({ review, currentUserId, onEdit, onDelete }) => {
  const renderStars = (rating) => {
    // rating is now a float, e.g., 3.7
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      let fillLevel = 0;
      if (rating >= i) { // Full star
        fillLevel = 1;
      } else if (rating > i - 1 && rating < i) { // Partial star
        fillLevel = rating - (i - 1);
      } // Else, fillLevel remains 0 (empty star)
      stars.push(<StarIcon key={i} fillLevel={fillLevel} sizeClasses="h-4 w-4" />);
    }
    return stars;
  };

  // Attempt to get a display name
  const displayName = review.profiles?.username || review.profiles?.full_name || review.user_email?.email || 'User';
  const reviewDate = review.created_at ? new Date(review.created_at).toLocaleDateString() : 'N/A';

  return (
    <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-600 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <span className="font-semibold text-sm text-brand-text mr-2">{displayName}</span>
          {/* Verified Purchase logic would need to be implemented if data is available */}
          {/* {review.verifiedPurchase && (
            <CheckBadgeIcon className="h-4 w-4 text-green-600 mr-1" title="Verified Purchase" />
          )} */}
          <div className="flex">{renderStars(review.rating)}</div>
        </div>
        <span className="text-xs text-gray-500 dark:text-slate-400">{reviewDate}</span>
      </div>
      <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{review.comment}</p>
      {currentUserId === review.user_id && (
        <div className="mt-3 flex items-center space-x-3">
          <button
            onClick={() => onEdit(review)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"
            aria-label="Edit your review"
          >
            <PencilSquareIcon className="h-4 w-4 mr-1" /> Edit
          </button>
          <button
            onClick={() => onDelete(review.id)}
            className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center"
            aria-label="Delete your review"
          >
            <TrashIcon className="h-4 w-4 mr-1" /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

const AudienceReviewSection = ({ product }) => {
  const { user, userProfile, loading: authLoading } = useContext(AuthContext);
  const [userReviews, setUserReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null); // Stores the review object to edit
  const location = useLocation();

  const productId = product?.id; // Assuming product object has an 'id' field for the database

  const fetchReviews = async () => {
    if (!productId) {
      setUserReviews([]);
      setIsLoadingReviews(false);
      return;
    }
    setIsLoadingReviews(true);
    setReviewsError(null);
    try {
      const { data, error } = await supabase
        .from('user_reviews')
        .select(`
          id,
          user_id,
          rating,
          comment,
          created_at,
          user_email:user_id(email),
          profiles (
            username,
            full_name
          )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setReviewsError('Could not load reviews. Please try again later.');
      setUserReviews([]);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    } else {
      // If productId is not available, we can't fetch reviews.
      // Set loading to false and clear any previous review data/error.
      setIsLoadingReviews(false);
      setUserReviews([]);
      setReviewsError(null);
    }
  }, [productId]); // Note: For more complex scenarios, fetchReviews might also be a dependency if not memoized.

  const currentUserReview = useMemo(() => {
    if (!user || !userReviews.length) return null;
    return userReviews.find(review => review.user_id === user.id) || null;
  }, [user, userReviews]);

  const handleReviewSubmitted = (updatedReviewData) => {
    setShowReviewForm(false);
    setEditingReview(null);
    fetchReviews(); // Re-fetch all reviews to get the latest state
    // Optionally, you could optimistically update the UI here
  };

  const handleToggleReviewForm = () => {
    if (currentUserReview && !showReviewForm) { // If opening form and user has a review, set to edit mode
      setEditingReview(currentUserReview);
    } else { // If closing form or user has no review, clear editing state
      setEditingReview(null);
    }
    setShowReviewForm(!showReviewForm);
  };

  const handleEditReview = (reviewToEdit) => {
    setEditingReview(reviewToEdit);
    setShowReviewForm(true);
    // Scroll to form if it's far down the page
    // document.getElementById('submit-review-form-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteReview = async (reviewIdToDelete) => {
    if (!window.confirm('Are you sure you want to delete your review? This action cannot be undone.')) {
      return;
    }
    try {
      const { error } = await supabase
        .from('user_reviews')
        .delete()
        .match({ id: reviewIdToDelete, user_id: user.id }); // Ensure user can only delete their own
      if (error) throw error;
      fetchReviews(); // Refresh reviews
      if (showReviewForm && editingReview?.id === reviewIdToDelete) { // If deleted review was being edited
        setShowReviewForm(false);
        setEditingReview(null);
      }
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('Failed to delete review. Please try again.');
    }
  };

  const ratingDistribution = useMemo(() => {
    const distributionBuckets = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }; // Initialize with numeric keys
    let totalRatingsValidForDistribution = 0;

    userReviews.forEach(review => {
      // Ensure rating is a number and strictly positive for distribution (0 means not rated yet)
      if (typeof review.rating === 'number' && review.rating > 0 && review.rating <= 5) {
        const roundedRating = Math.round(review.rating); // e.g., 3.7 -> 4, 3.2 -> 3
        // Clamp roundedRating to be between 1 and 5.
        // e.g. if rating is 0.2 (should not happen if form prevents 0), rounded is 0. Clamped to 1.
        const clampedRating = Math.max(1, Math.min(5, roundedRating));

        if (clampedRating >= 1 && clampedRating <= 5) {
          distributionBuckets[clampedRating]++;
          totalRatingsValidForDistribution++;
        }
      }
    });

    if (totalRatingsValidForDistribution === 0) return null;

    const finalDistributionData = {};
    // Iterate 5 down to 1 for the typical display order of rating bars
    for (let i = 5; i >= 1; i--) {
      finalDistributionData[i.toString()] = { // Keys will be '5', '4', '3', '2', '1'
        count: distributionBuckets[i] || 0,
        percentage: totalRatingsValidForDistribution > 0 ? ((distributionBuckets[i] || 0) / totalRatingsValidForDistribution) * 100 : 0,
      };
    }
    return finalDistributionData;
  }, [userReviews]);

  const totalReviewCount = userReviews.length;
  const averageRating = useMemo(() => {
    if (!totalReviewCount) return "N/A";
    const sum = userReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / totalReviewCount).toFixed(1);
  }, [userReviews, totalReviewCount]);


  if (!product || !productId) {
    return null;
  }

  const { aiProsCons, productName } = product;
  const keyInsights = aiProsCons || { pros: [], cons: [] };

  return (
    <div className="py-8 sm:py-10 bg-white dark:bg-slate-800 rounded-lg shadow-md dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)] border border-gray-200 dark:border-slate-700 animate-fade-in-up mt-6 sm:mt-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-2xl sm:text-3xl font-semibold text-brand-primary dark:text-blue-400 font-serif mb-6 sm:mb-8 text-center sm:text-left">
          Community Rating
        </h3>

        <div className="grid md:grid-cols-12 gap-6 sm:gap-8">
          {/* Left Column: Rating Breakdown & AI Summary */}
          <div className="md:col-span-5 lg:col-span-4">
            <div className="mb-6 sm:mb-8">
              <h4 className="text-md sm:text-lg font-semibold text-brand-text font-sans mb-1">User Rating</h4>
              <p className="text-2xl font-bold text-brand-secondary mb-3">{averageRating}/5</p>
              {ratingDistribution && totalReviewCount > 0 ? (
                <>
                  <div className="space-y-1">
                    <RatingDistributionBar rating="5" percentage={ratingDistribution['5'].percentage} count={ratingDistribution['5'].count} colorClass="bg-green-500" />
                    <RatingDistributionBar rating="4" percentage={ratingDistribution['4'].percentage} count={ratingDistribution['4'].count} colorClass="bg-green-400" />
                    <RatingDistributionBar rating="3" percentage={ratingDistribution['3'].percentage} count={ratingDistribution['3'].count} colorClass="bg-yellow-400" />
                    <RatingDistributionBar rating="2" percentage={ratingDistribution['2'].percentage} count={ratingDistribution['2'].count} colorClass="bg-orange-400" />
                    <RatingDistributionBar rating="1" percentage={ratingDistribution['1'].percentage} count={ratingDistribution['1'].count} colorClass="bg-red-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Based on {totalReviewCount.toLocaleString()} user rating{totalReviewCount === 1 ? '' : 's'}.</p>
                </>
              ) : (
                <p className="text-xs text-gray-500 mt-2">No user ratings yet for this product.</p>
              )}
            </div>

            {(keyInsights.pros.length > 0 || keyInsights.cons.length > 0) && (
              <div>
                <h4 className="text-md sm:text-lg font-semibold text-brand-text font-sans mb-3 flex items-center">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-brand-secondary mr-2" />
                  Common Themes
                </h4>
                {keyInsights.pros.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-green-700 mb-1">Often Praised:</p>
                    <ul className="list-disc list-inside space-y-1 pl-1">
                      {keyInsights.pros.slice(0, 2).map((pro, index) => ( // Show top 2 pros
                        <li key={`audience-pro-${index}`} className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed">{pro}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {keyInsights.cons.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-red-700 mb-1">Common Concerns:</p>
                    <ul className="list-disc list-inside space-y-1 pl-1">
                      {keyInsights.cons.slice(0, 2).map((con, index) => ( // Show top 2 cons
                        <li key={`audience-con-${index}`} className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed">{con}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="mt-3 text-xs text-gray-500 italic">
                  AI-generated summary based on overall product analysis.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: User Reviews & CTAs */}
          <div className="md:col-span-7 lg:col-span-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
              <h4 className="text-md sm:text-lg font-semibold text-brand-text font-sans mb-2 sm:mb-0">Recent User Reviews</h4>
              {!authLoading && user && !showReviewForm && (
                <button
                  onClick={handleToggleReviewForm}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-white text-sm font-medium rounded-md shadow-sm bg-brand-primary hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors duration-200"
                >
                  <PencilSquareIcon className="h-4 w-4 mr-2" />
                  {currentUserReview ? 'Edit Your Review' : 'Write Your Review'}
                </button>
              )}
              {!authLoading && !user && (
                <Link
                  to="/login"
                  state={{ from: location }} // Pass current location to redirect back after login
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-white text-sm font-medium rounded-md shadow-sm bg-brand-primary hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors duration-200"
                >
                  Log in to write a review
                </Link>
              )}
            </div>

            {/* This div can be used to scroll to the form if needed */}
            <div id="submit-review-form-section">
              {showReviewForm && user && (
                <SubmitReviewForm
                  productId={productId}
                  initialReviewData={editingReview}
                  onReviewSubmitted={handleReviewSubmitted}
                  onCancel={() => { setShowReviewForm(false); setEditingReview(null); }}
                />
              )}
            </div>

            {isLoadingReviews && <p className="text-sm text-gray-500 dark:text-slate-400 py-4 text-center">Loading reviews...</p>}
            {reviewsError && <p className="text-sm text-red-500 py-4 text-center">{reviewsError}</p>}

            {!isLoadingReviews && !reviewsError && userReviews.length > 0 ? (
              <div className="space-y-4">
                {userReviews.map((review) => (
                  <UserReviewCard
                    key={review.id}
                    review={review}
                    currentUserId={user?.id}
                    onEdit={handleEditReview}
                    onDelete={handleDeleteReview}
                  />
                ))}
              </div>
            ) : (!isLoadingReviews && !reviewsError && !showReviewForm && ( // Don't show "no reviews" if form is open
              <p className="text-sm text-gray-500 dark:text-slate-400 py-4 text-center">No user reviews available for this product yet. Be the first to write one!</p>
            ))}

            {/* "See All User Reviews" link - adjust if you have a separate page for all reviews */}
            {/* This is just an example, you might not need it if all reviews are shown here or paginated */}
            {/* {totalReviewCount > 0 && (
              <div className="mt-6 text-center sm:text-right">
                <Link to={`/product/${productNameSlug}/all-user-reviews`} className="text-brand-primary hover:underline text-sm">See All {totalReviewCount} User Reviews</Link>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

AudienceReviewSection.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, // Database ID of the product
    productName: PropTypes.string.isRequired,
    // audienceRating: PropTypes.string, // This will now be calculated from fetched reviews
    aiProsCons: PropTypes.shape({
      pros: PropTypes.arrayOf(PropTypes.string),
      cons: PropTypes.arrayOf(PropTypes.string),
    }),
    // Pre-aggregated scores from product might still be used elsewhere,
    // but this component derives its own stats from fetched user_reviews.
    // preAggregatedAudienceScore: PropTypes.number,
    // totalAudienceReviewCount: PropTypes.number,
  }).isRequired,
};

export default AudienceReviewSection;