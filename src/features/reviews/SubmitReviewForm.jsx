// src/features/reviews/SubmitReviewForm.jsx (New File)
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';
 
// Helper component: StarIcon
// (Ideally, this would be in a shared components directory)
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

// New StarRating input component
const StarRating = ({ rating, setRating, disabled }) => {
  const displayRating = rating > 0 ? rating.toFixed(1) : "0.0";
  const starContainerRef = React.useRef(null);
  // State for desktop hover preview
  const [hoverRating, setHoverRating] = React.useState(null);
  // State for tracking active touch interaction
  const [isTouchInteracting, setIsTouchInteracting] = React.useState(false);

  // Constants for rating scale
  const MIN_RATING = 0.0;
  const MAX_RATING = 5.0;


  const calculateRatingFromEvent = React.useCallback((event) => {
    if (!starContainerRef.current) return rating;

    const rect = starContainerRef.current.getBoundingClientRect();
    let clientXPosition;

    if (event.type.startsWith('touch')) {
      if (event.targetTouches.length > 0) {
        clientXPosition = event.targetTouches[0].clientX;
      } else if (event.changedTouches.length > 0) { // Handle touchend
        clientXPosition = event.changedTouches[0].clientX;
      } else {
        return rating; // No touch point available
      }
    } else {
      clientXPosition = event.clientX;
    }

    let offsetX = clientXPosition - rect.left;
    const width = rect.width;

    offsetX = Math.max(0, Math.min(width, offsetX)); // Clamp offsetX to [0, width]

    let newRating = (offsetX / width) * MAX_RATING;
    newRating = Math.max(MIN_RATING, Math.min(MAX_RATING, newRating));
    
    // Round to nearest 0.1
    newRating = Math.round(newRating * 10) / 10;
    return newRating;
  }, [rating]); // Depends on 'rating' for the fallback if ref is not available. MIN_RATING and MAX_RATING are stable.

  // --- Desktop Mouse Handlers ---
  const handleDesktopMouseMove = React.useCallback((event) => {
    if (disabled) return;
    const newHoverVal = calculateRatingFromEvent(event);
    setHoverRating(newHoverVal);
  }, [disabled, calculateRatingFromEvent]);

  const handleDesktopMouseLeave = React.useCallback(() => {
    if (disabled) return;
    setHoverRating(null); // Clear hover rating, stars will revert to 'rating' prop
  }, [disabled]);

  const handleDesktopClick = React.useCallback((event) => {
    if (disabled) return;
    const clickedRating = calculateRatingFromEvent(event);
    setRating(clickedRating); // Commit the rating
    // Optional: set hoverRating to clickedRating if you want the hover effect to "stick" until mouseleave
    // setHoverRating(clickedRating); 
  }, [disabled, calculateRatingFromEvent, setRating]);

  // --- Touch Handlers ---
  const handleTouchStart = React.useCallback((event) => {
    if (disabled) return;
    setHoverRating(null); // Clear any desktop hover effect
    setIsTouchInteracting(true);
    const newRating = calculateRatingFromEvent(event);
    setRating(newRating); // Directly set rating on touch start
  }, [disabled, calculateRatingFromEvent, setRating]);

  const handleTouchMove = React.useCallback((event) => {
    if (disabled || !isTouchInteracting) return;
    const newRating = calculateRatingFromEvent(event);
    setRating(newRating); // Directly set rating on touch move
  }, [disabled, isTouchInteracting, calculateRatingFromEvent, setRating]);

  const handleTouchEnd = React.useCallback(() => {
    if (disabled) return;
    setIsTouchInteracting(false);
  }, [disabled]);

  // Effect to add global event listeners for touchend/touchcancel to reset isTouchInteracting
  React.useEffect(() => {
    const handleGlobalTouchEnd = () => {
      if (isTouchInteracting) {
        setIsTouchInteracting(false);
      }
    };

    window.addEventListener('touchend', handleGlobalTouchEnd);
    window.addEventListener('touchcancel', handleGlobalTouchEnd);

    return () => {
      window.removeEventListener('touchend', handleGlobalTouchEnd);
      window.removeEventListener('touchcancel', handleGlobalTouchEnd);
    };
  }, [isTouchInteracting]);

  // Determine the rating to display (hovered or committed)
  // On desktop, if hoverRating is set, it takes precedence for display.
  // On touch, or if not hovering, the actual 'rating' prop is displayed.
  const valueToDisplay = hoverRating !== null ? hoverRating : rating;
  const displayRatingString = valueToDisplay > 0 ? valueToDisplay.toFixed(1) : "0.0";

  return (
    <div className="w-full">
      <div className="text-center text-sm text-gray-700 font-medium mb-2" aria-live="polite">
        Rating: {displayRatingString} / {MAX_RATING.toFixed(1)}
      </div>
      {/* New outer div for centering the inline-flex star group */}
      <div className="flex justify-center">
        <div
          ref={starContainerRef}
          className={`inline-flex space-x-0.5 mb-2 ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`} // Changed to inline-flex
          onClick={handleDesktopClick} // For desktop click
          onMouseMove={handleDesktopMouseMove} // For desktop hover
          onMouseLeave={handleDesktopMouseLeave} // For desktop hover end
          onTouchStart={handleTouchStart} // For touch interaction
          onTouchMove={handleTouchMove}   // For touch interaction
          onTouchEnd={handleTouchEnd}     // For touch interaction
          role="slider"
          aria-valuenow={valueToDisplay} // Reflects what's visually current
          aria-valuemin={MIN_RATING}
          aria-valuemax={MAX_RATING}
          aria-label={`Star rating input, current value ${displayRatingString} out of ${MAX_RATING.toFixed(1)}`}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0} // Make focusable for potential keyboard interactions
        >
          {[1, 2, 3, 4, 5].map((starPos) => {
            let fillLevel = 0;
            if (valueToDisplay >= starPos) fillLevel = 1; // Full star
            else if (valueToDisplay > starPos - 1 && valueToDisplay < starPos) fillLevel = valueToDisplay - (starPos - 1); // Partial star
            // Else fillLevel remains 0 (empty star)
            return <StarIcon key={starPos} fillLevel={fillLevel} sizeClasses="h-7 w-7 sm:h-8 sm:w-8 pointer-events-none" />;
          })}
        </div>
      </div>
    </div>
  );
};

function SubmitReviewForm({
  productId,
  onReviewSubmitted,
  initialReviewData = null, // { id, rating, comment }
  onCancel,
}) {
  const { user } = useContext(AuthContext);
  const [rating, setRating] = useState(initialReviewData?.rating || 0);
  const [comment, setComment] = useState(initialReviewData?.comment || '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const isEditMode = !!initialReviewData;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to submit a review.');
      return;
    }
    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      let supabaseError;
      if (isEditMode) {
        const { error: updateError } = await supabase
          .from('user_reviews')
          .update({ rating, comment, updated_at: new Date().toISOString() }) // Ensure updated_at is set
          .match({ id: initialReviewData.id, user_id: user.id });
        supabaseError = updateError;
      } else {
        // Attempt to insert. If unique constraint (user_id, product_id) violated, it will error.
        const { error: insertError } = await supabase.from('user_reviews').insert({
          user_id: user.id,
          product_id: productId,
          rating: rating,
          comment: comment,
        });
        supabaseError = insertError;
      }

      if (supabaseError) {
        // Handle unique constraint violation gracefully for inserts if not an edit
        if (supabaseError.code === '23505' && !isEditMode) { // 23505 is unique_violation
          setError('You have already submitted a review for this product. Please edit your existing review.');
        } else {
          setError(supabaseError.message || 'An error occurred.');
        }
        throw supabaseError; // Re-throw to be caught by outer catch
      }

      setSuccessMessage(isEditMode ? 'Review updated successfully!' : 'Review submitted successfully!');
      if (!isEditMode) { // Only clear form for new submissions
        setRating(0);
        setComment('');
      }
      if (onReviewSubmitted) {
        onReviewSubmitted(isEditMode ? { ...initialReviewData, rating, comment } : null); // Pass updated review or null for new
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      // Error state is already set if it's a Supabase error with a message
      if (!error && err.message) setError(err.message);
      else if (!error) setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="my-6 p-4 bg-gray-100 rounded-md text-center">
        <p className="text-gray-700">Please <a href="/login" className="text-brand-primary hover:underline">log in</a> to write a review.</p>
      </div>
    );
  }

  if (successMessage) {
    return (
      <div className="my-6 p-4 bg-green-100 text-green-700 rounded-md text-center" role="alert">
        <p>{successMessage}</p>
        {onCancel && !isEditMode && ( // Provide a way to close form after non-edit success
            <button onClick={onCancel} className="mt-2 text-sm text-brand-primary hover:underline">Close Form</button>
        )}
      </div>
    )
  }

  return (
    <div className="my-6 p-4 border border-gray-200 rounded-lg shadow">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">{isEditMode ? 'Edit Your Review' : 'Write a Review'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Rating</label>
          <StarRating rating={rating} setRating={setRating} disabled={submitting} />
        </div>
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
            Your Review (Optional)
          </label>
          <textarea
            id="comment"
            name="comment"
            rows="4"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:bg-gray-50"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={submitting}
            placeholder="Share your thoughts on this product..."
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (isEditMode ? 'Updating...' : 'Submitting...') : (isEditMode ? 'Update Review' : 'Submit Review')}
            </button>
            {onCancel && (
              <button type="button" onClick={onCancel} disabled={submitting} className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary-light disabled:opacity-50">
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default SubmitReviewForm;
