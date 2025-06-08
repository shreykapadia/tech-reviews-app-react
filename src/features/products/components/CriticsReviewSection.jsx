// src/components/ProductPage/CriticsReviewSection.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ChatBubbleLeftEllipsisIcon, ArrowRightIcon, StarIcon } from '@heroicons/react/24/outline'; // Corrected: Added missing import for StarIcon
import { normalizeScore } from '../../../utils/scoreCalculations'; // Corrected path
const ScoreBreakdownBarInternal = ({ percentage, colorClass, label }) => (
  <div className="flex items-center mb-1.5">
    <div className="w-20 text-xs text-gray-600 capitalize">{label}</div>
    <div className="flex-1 bg-gray-200 rounded-full h-3 sm:h-3.5 overflow-hidden mr-2">
      <div
        className={`${colorClass} h-full rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${percentage}%` }}
      />
    </div>
    <div className="w-10 text-xs text-gray-700 font-medium">{percentage.toFixed(0)}%</div>
  </div>
);
    const ScoreBreakdownBar = React.memo(ScoreBreakdownBarInternal);

const CriticsReviewSectionComponent = ({ product }) => {
  if (!product || !product.criticReviews || product.criticReviews.length === 0) {
    return null;
  }

  const { criticReviews, aiProsCons, productName } = product;

  // Calculate score breakdown
  const normalizedScores = criticReviews.map(review => normalizeScore(review.score, review.scale)).filter(score => score !== null);
  
  let positiveCount = 0;
  let neutralCount = 0;
  let negativeCount = 0;

  normalizedScores.forEach(score => {
    if (score >= 75) positiveCount++;
    else if (score >= 50) neutralCount++;
    else negativeCount++;
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

  return (
    <div className="py-8 sm:py-10 bg-white rounded-lg shadow-md border border-gray-200 animate-fade-in-up mt-6 sm:mt-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-2xl sm:text-3xl font-semibold text-brand-primary font-serif mb-6 sm:mb-8 text-center sm:text-left">
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
                <p className="text-xs text-gray-500 mt-2">Based on {totalScores} critic reviews.</p>
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
                        <li key={`pro-${index}`} className="text-xs text-gray-700 leading-relaxed">{pro}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {keyInsights.cons.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-red-700 mb-1">Points of Concern:</p>
                    <ul className="list-disc list-inside space-y-1 pl-1">
                      {keyInsights.cons.slice(0, 3).map((con, index) => ( // Show top 3 cons
                        <li key={`con-${index}`} className="text-xs text-gray-700 leading-relaxed">{con}</li>
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

          {/* Right Column: Featured Reviews */}
          <div className="md:col-span-7 lg:col-span-8">
            <h4 className="text-md sm:text-lg font-semibold text-brand-text font-sans mb-4">Featured Reviews</h4>
            {featuredReviews.length > 0 ? (
              <div className="space-y-4">
                {featuredReviews.map((review, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-sm text-brand-text">{review.publication}</span>
                      {review.score !== null && (
                        <span className="text-xs text-gray-600 bg-gray-200 px-1.5 py-0.5 rounded-full flex items-center">
                          <StarIcon className="h-3 w-3 text-yellow-500 mr-0.5" />
                          {normalizeScore(review.score, review.scale)}/100
                        </span>
                      )}
                    </div>
                    {/* Placeholder for review snippet. Actual snippets would need to be in JSON or AI-generated. */}
                    <p className="text-xs text-gray-600 italic mb-2">
                      Full review snippet would appear here. Currently showing publication and score.
                    </p>
                    <a
                      href={review.link}
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
              <p className="text-sm text-gray-500">No featured critic reviews available for this product yet.</p>
            )}

            <div className="mt-6 text-center sm:text-right">
              <Link
                to={`/product/${encodeURIComponent(productName.toLowerCase().replace(/\s+/g, '-'))}/critic-reviews`}
                className="inline-flex items-center px-5 py-2.5 bg-brand-primary text-white text-sm font-medium rounded-full hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-colors duration-200"
              >
                See All Critic Reviews ({criticReviews.length})
              </Link>
            </div>
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