// src/features/reviews/SubmitReviewForm.jsx (New File)
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';

// Simple StarRating component (can be more sophisticated)
const StarRating = ({ rating, setRating, disabled }) => {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          className={`text-2xl ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
          } ${disabled ? 'cursor-not-allowed' : ''}`}
          onClick={() => !disabled && setRating(star)}
        >
          ★
        </button>
      ))}
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
