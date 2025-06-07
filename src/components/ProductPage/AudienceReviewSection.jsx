// src/components/ProductPage/AudienceReviewSection.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
  StarIcon as StarOutline,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

const RatingDistributionBar = ({ rating, percentage, count, colorClass = 'bg-yellow-400' }) => (
  <div className="flex items-center space-x-2 mb-1 text-xs">
    <span className="w-12 text-gray-600">{rating} star</span>
    <div className="flex-1 bg-gray-200 rounded-full h-2.5 sm:h-3 overflow-hidden">
      <div
        className={`${colorClass} h-full rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${percentage}%` }}
      />
    </div>
    <span className="w-10 text-gray-700 font-medium text-right">{count}</span>
  </div>
);

const UserReviewCard = ({ review }) => {
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <StarSolid key={i} className="h-4 w-4 text-yellow-400" />
        ) : (
          <StarOutline key={i} className="h-4 w-4 text-gray-300" />
        )
      );
    }
    return stars;
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <span className="font-semibold text-sm text-brand-text mr-2">{review.username}</span>
          {review.verifiedPurchase && (
            <CheckBadgeIcon className="h-4 w-4 text-green-600 mr-1" title="Verified Purchase" />
          )}
          <div className="flex">{renderStars(review.rating)}</div>
        </div>
        <span className="text-xs text-gray-500">{review.date}</span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{review.text}</p>
    </div>
  );
};

// Placeholder data - in a real app, this would come from props/API
const placeholderUserReviews = [
  { id: 1, username: 'TechEnthusiast123', rating: 5, date: '2024-07-15', text: "Absolutely love this product! Exceeded all my expectations. The performance is top-notch and the design is sleek. Highly recommend to anyone on the fence.", verifiedPurchase: true },
  { id: 2, username: 'GadgetGirl', rating: 4, date: '2024-07-10', text: "Pretty good, does what it says on the tin. Battery life could be a bit better, but overall a solid device for the price. The camera is a standout feature.", verifiedPurchase: true },
  { id: 3, username: 'AverageJoe', rating: 3, date: '2024-07-05', text: "It's okay. Nothing spectacular, but it gets the job done. Had some minor issues with the software initially, but a recent update seems to have fixed them. Decent value.", verifiedPurchase: false },
];

// Placeholder for rating distribution - this would ideally be calculated from actual user reviews
const placeholderRatingDistribution = {
  '5': { percentage: 65, count: 1300 },
  '4': { percentage: 20, count: 400 },
  '3': { percentage: 8, count: 160 },
  '2': { percentage: 4, count: 80 },
  '1': { percentage: 3, count: 60 },
};

const AudienceReviewSection = ({ product }) => {
  if (!product) {
    return null;
  }

  const { aiProsCons, productName, audienceRating } = product;
  const [userReviews, setUserReviews] = useState(placeholderUserReviews.slice(0, 2)); // Show initial 2 reviews
  // In a real app, pagination or "load more" would fetch more reviews

  // For "Key Audience Insights", we'll use aiProsCons.
  const keyInsights = aiProsCons || { pros: [], cons: [] };

  // Extract overall rating for display, e.g., "4.7/5"
  const overallAudienceRatingDisplay = audienceRating || "N/A";

  return (
    <div className="py-8 sm:py-10 bg-white rounded-lg shadow-md border border-gray-200 animate-fade-in-up mt-6 sm:mt-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-2xl sm:text-3xl font-semibold text-brand-primary font-serif mb-6 sm:mb-8 text-center sm:text-left">
          What Users Are Saying
        </h3>

        <div className="grid md:grid-cols-12 gap-6 sm:gap-8">
          {/* Left Column: Rating Breakdown & AI Summary */}
          <div className="md:col-span-5 lg:col-span-4">
            <div className="mb-6 sm:mb-8">
              <h4 className="text-md sm:text-lg font-semibold text-brand-text font-sans mb-1">Audience Rating</h4>
              <p className="text-2xl font-bold text-brand-secondary mb-3">{overallAudienceRatingDisplay}</p>
              <div className="space-y-1">
                <RatingDistributionBar rating="5" percentage={placeholderRatingDistribution['5'].percentage} count={placeholderRatingDistribution['5'].count} colorClass="bg-green-500" />
                <RatingDistributionBar rating="4" percentage={placeholderRatingDistribution['4'].percentage} count={placeholderRatingDistribution['4'].count} colorClass="bg-green-400" />
                <RatingDistributionBar rating="3" percentage={placeholderRatingDistribution['3'].percentage} count={placeholderRatingDistribution['3'].count} colorClass="bg-yellow-400" />
                <RatingDistributionBar rating="2" percentage={placeholderRatingDistribution['2'].percentage} count={placeholderRatingDistribution['2'].count} colorClass="bg-orange-400" />
                <RatingDistributionBar rating="1" percentage={placeholderRatingDistribution['1'].percentage} count={placeholderRatingDistribution['1'].count} colorClass="bg-red-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Based on {Object.values(placeholderRatingDistribution).reduce((sum, item) => sum + item.count, 0).toLocaleString()} user ratings.</p>
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
                        <li key={`audience-pro-${index}`} className="text-xs text-gray-700 leading-relaxed">{pro}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {keyInsights.cons.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-red-700 mb-1">Common Concerns:</p>
                    <ul className="list-disc list-inside space-y-1 pl-1">
                      {keyInsights.cons.slice(0, 2).map((con, index) => ( // Show top 2 cons
                        <li key={`audience-con-${index}`} className="text-xs text-gray-700 leading-relaxed">{con}</li>
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
              <button
                onClick={() => alert('Open "Write a Review" modal/form here.')} // Placeholder action
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-brand-secondary text-white text-sm font-medium rounded-full hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-colors duration-200"
              >
                <PencilSquareIcon className="h-4 w-4 mr-2" />
                Write Your Review
              </button>
            </div>

            {userReviews.length > 0 ? (
              <div className="space-y-4">
                {userReviews.map((review) => (
                  <UserReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No user reviews available for this product yet.</p>
            )}

            <div className="mt-6 text-center sm:text-right">
              <Link
                to={`/product/${encodeURIComponent(productName.toLowerCase().replace(/\s+/g, '-'))}/user-reviews`}
                className="inline-flex items-center px-5 py-2.5 bg-brand-primary text-white text-sm font-medium rounded-full hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-colors duration-200"
              >
                See All User Reviews ({placeholderUserReviews.length})
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

AudienceReviewSection.propTypes = {
  product: PropTypes.shape({
    productName: PropTypes.string.isRequired,
    audienceRating: PropTypes.string, // e.g., "4.7/5"
    aiProsCons: PropTypes.shape({
      pros: PropTypes.arrayOf(PropTypes.string),
      cons: PropTypes.arrayOf(PropTypes.string),
    }),
    // In a real app, you'd pass userReviews and ratingDistribution here
  }).isRequired,
};

export default AudienceReviewSection;