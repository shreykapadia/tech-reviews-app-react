// src/components/ProductPage/CriticsReviewSection.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
// Removed Link from 'react-router-dom' as it's no longer used for the main button
import { ChatBubbleLeftEllipsisIcon, ArrowRightIcon, StarIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'; // Added for expand/collapse
import { normalizeScore } from '../../../utils/scoreCalculations';
const ScoreBreakdownBarInternal = ({ percentage, colorClass, label }) => (
  <div className="flex items-center mb-1.5">
    <div className="w-20 text-xs text-gray-600 dark:text-slate-400 capitalize">{label}</div>
    <div className="flex-1 bg-gray-200 rounded-full h-3 sm:h-3.5 overflow-hidden mr-2">
      <div
        className={`${colorClass} h-full rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${percentage}%` }}
      />
    </div>
    <div className="w-10 text-xs text-gray-700 dark:text-slate-300 font-medium">{percentage.toFixed(0)}%</div>
  </div>
);
const ScoreBreakdownBar = React.memo(ScoreBreakdownBarInternal);

const CriticsReviewSectionComponent = ({ product }) => {
  const [showAllReviews, setShowAllReviews] = useState(false);

  if (!product || !product.criticReviews || product.criticReviews.length === 0) {
    return null;
  }

  const { criticReviews, aiProsCons, productName } = product;

  // Calculate score breakdown
  // Log raw critic reviews to inspect score and scale
  console.log(`[CriticsReviewSection] Product: ${productName} - Raw criticReviews:`, criticReviews.map(r => ({ score: r.score, scale: r.scale, publication: r.publication })));

  const normalizedScores = criticReviews.map(review => normalizeScore(review.score, review.scale)).filter(score => score !== null);

  // Log normalized scores to see what `normalizeScore` is producing
  console.log(`[CriticsReviewSection] Product: ${productName} - Normalized scores for sentiment (expected 0-100):`, normalizedScores);

  let positiveCount = 0;
  let neutralCount = 0;
  let negativeCount = 0;

  normalizedScores.forEach(score => {
    if (score >= 80) positiveCount++; // Positive: 80+
    else if (score >= 70) neutralCount++; // Neutral: 70-79 (implicitly < 80 due to first check)
    else negativeCount++; // Negative: below 70 (scores less than 70)
  });

  const totalScores = normalizedScores.length;
  const positivePercentage = totalScores > 0 ? (positiveCount / totalScores) * 100 : 0;
  const neutralPercentage = totalScores > 0 ? (neutralCount / totalScores) * 100 : 0;
  const negativePercentage = totalScores > 0 ? (negativeCount / totalScores) * 100 : 0;

  // For "Key Critic Insights", we'll use aiProsCons as the closest available data.
  // Ideally, this would be a separate AI summary derived specifically from critic reviews.
  const keyInsights = aiProsCons || { pros: [], cons: [] };

  // Select featured reviews (e.g., first 3 or based on some weighting if available)
  const featuredReviews = criticReviews.slice(0, 3);
  const reviewsToDisplay = showAllReviews ? criticReviews : featuredReviews;

  const handleToggleShowAll = () => {
    setShowAllReviews(prev => !prev);
  };

  return (
    <div className="py-8 sm:py-10 bg-white/85 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/60 dark:border-white/10 animate-fade-in-up mt-6 sm:mt-8 transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-2xl sm:text-3xl font-semibold text-brand-primary dark:text-blue-400 font-serif mb-6 sm:mb-8 text-center sm:text-left">
          Critics' Insights
        </h3>

        <div className="grid md:grid-cols-12 gap-6 sm:gap-8">
          {/* Left Column: Score Breakdown & AI Summary */}
          <div className="md:col-span-5 lg:col-span-4">
            {totalScores > 0 && (
              <div className="mb-6 sm:mb-8">
                <h4 className="text-md sm:text-lg font-semibold text-brand-text font-sans mb-3">Score Sentiment</h4>
                <ScoreBreakdownBar percentage={positivePercentage} colorClass="bg-green-500" label="Positive" />
                <ScoreBreakdownBar percentage={neutralPercentage} colorClass="bg-yellow-400" label="Neutral" />
                <ScoreBreakdownBar percentage={negativePercentage} colorClass="bg-red-500" label="Negative" />
                <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">Based on {totalScores} critic reviews.</p>
              </div>
            )}

            {(keyInsights.pros.length > 0 || keyInsights.cons.length > 0) && (
              <div>
                <h4 className="text-md sm:text-lg font-semibold text-brand-text font-sans mb-3 flex items-center">
                  <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-brand-primary mr-2" />
                  Key Takeaways
                </h4>
                {keyInsights.pros.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-green-700 mb-1">Praised for:</p>
                    <ul className="list-disc list-inside space-y-1 pl-1">
                      {keyInsights.pros.slice(0, 3).map((pro, index) => ( // Show top 3 pros
                        <li key={`pro-${index}`} className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed">{pro}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {keyInsights.cons.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-red-700 mb-1">Points of Concern:</p>
                    <ul className="list-disc list-inside space-y-1 pl-1">
                      {keyInsights.cons.slice(0, 3).map((con, index) => ( // Show top 3 cons
                        <li key={`con-${index}`} className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed">{con}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="mt-3 text-xs text-gray-500 dark:text-slate-500 italic">
                  AI-generated summary based on overall product analysis.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Featured Reviews */}
          <div className="md:col-span-7 lg:col-span-8">
            <h4 className="text-md sm:text-lg font-semibold text-brand-text font-sans mb-4">Featured Reviews</h4>
            {reviewsToDisplay.length > 0 ? (
              <div className="space-y-4">
                {reviewsToDisplay.map((review, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-600 hover:shadow-sm transition-shadow text-left">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-sm text-brand-text">{review.publication}</span>
                      {/* Individual score removed as per request */}
                    </div>
                    {review.summary ? (
                      <>
                        <p className="text-xs text-gray-700 dark:text-slate-300 mb-1 leading-relaxed">{review.summary}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-500 italic mb-2">AI-generated summary</p>
                      </>
                    ) : (
                      <p className="text-xs text-gray-600 dark:text-slate-400 italic mb-2">
                        Summary not available. Read the full review for more details.
                      </p>
                    )}
                    <a
                      href={review.link} // This already correctly uses review.link
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="text-xs text-brand-primary hover:text-blue-700 hover:underline font-medium inline-flex items-center"
                    >
                      Read Full Review <ArrowRightIcon className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-slate-400">No featured critic reviews available for this product yet.</p>
            )}

            {/* Only show button if there are more reviews than initially featured */}
            {criticReviews.length > featuredReviews.length && (
              <div className="mt-6 text-center sm:text-right">
                <button
                  type="button"
                  onClick={handleToggleShowAll}
                  className="inline-flex items-center px-5 py-2.5 bg-brand-primary text-white text-sm font-medium rounded-full hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-colors duration-200"
                >
                  {showAllReviews ? 'Show Fewer Reviews' : `See All ${criticReviews.length} Critic Reviews`}
                  {showAllReviews ? <ChevronUpIcon className="h-4 w-4 ml-2" /> : <ChevronDownIcon className="h-4 w-4 ml-2" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

CriticsReviewSectionComponent.propTypes = {
  product: PropTypes.shape({
    productName: PropTypes.string.isRequired,
    criticReviews: PropTypes.arrayOf(PropTypes.shape({
      publication: PropTypes.string.isRequired,
      score: PropTypes.number,
      scale: PropTypes.string,
      link: PropTypes.string,
      summary: PropTypes.string, // Added summary to PropTypes
    })),
    aiProsCons: PropTypes.shape({
      pros: PropTypes.arrayOf(PropTypes.string),
      cons: PropTypes.arrayOf(PropTypes.string),
    }),
  }).isRequired,
};

const CriticsReviewSection = React.memo(CriticsReviewSectionComponent);
CriticsReviewSection.displayName = 'CriticsReviewSection';
export default CriticsReviewSection;