// src/utils/scoreCalculations.js

/**
 * Normalizes a numerical score from its original scale to a target scale using Min-Max normalization.
 */
// src/utils/scoreCalculations.js

export function normalizeScore(score, scale, targetScale = 100) { // Added default for targetScale
  let originalMax;
  const lowerScale = typeof scale === 'string' ? scale.toLowerCase().trim() : ''; // Normalize scale input

  // More robust scale matching
  if (lowerScale === 'out of 10' || lowerScale === '/10') {
    originalMax = 10;
  } else if (lowerScale === 'out of 5 stars' || lowerScale === '/5') {
    originalMax = 5;
  } else if (lowerScale === 'percent' || lowerScale === '/100' || lowerScale === 'out of 100') {
    originalMax = 100;
  } else {
    console.warn(`Unknown or invalid scale: "${scale}"`);
    return null; // Return null for unknown scales
  }

  if (score === null || typeof score !== 'number' || isNaN(score)) {
    console.warn(`Invalid score: ${score} (type: ${typeof score}) for scale: "${scale}"`);
    return null; // Return null for invalid scores
  }

  if (originalMax === 0) { // Safety check for division by zero
    console.error(`Original max scale is zero for scale: "${scale}". Cannot normalize.`);
    return null;
  }

  // Simplified calculation: originalMax is already set correctly for 'percent'
  return (score / originalMax) * targetScale;
}

// ... (the rest of your scoreCalculations.js file, like calculateCriticsScore, would go here)

  
  /**
   * Calculates a weighted average Critics Score from an array of critic reviews.
   */
  export function calculateCriticsScore(product, criticWeightsData) {
    if (!criticWeightsData || Object.keys(criticWeightsData).length === 0) {
      console.warn("Critic weights not loaded or empty. Cannot calculate critics score.");
      return null;
    }
  // Check if product exists and if product.criticReviews is a non-empty array
  if (!product || !Array.isArray(product.criticReviews) || product.criticReviews.length === 0) {
    // console.warn(`Product "${product?.productName || 'N/A'}" has no valid critic reviews or criticReviews is not an array.`);
    return null; // No reviews to score, or invalid structure
  }

    const reviews = product.criticReviews; // Use the actual reviews array from the product object
    let totalWeightedScore = 0;
    let totalWeight = 0;
  
    reviews.forEach(review => {
      const normalizedScore = normalizeScore(review.score, review.scale, 100);
      if (normalizedScore !== null) {
        let publicationWeight = criticWeightsData[review.publication];
        if (typeof publicationWeight !== 'number' || isNaN(publicationWeight)) {
          publicationWeight = criticWeightsData.default; // Fallback to default weight
        }
  
        if (typeof publicationWeight === 'number' && !isNaN(publicationWeight)) {
          totalWeightedScore += normalizedScore * publicationWeight;
          totalWeight += publicationWeight;
        } else {
          console.warn(`No valid weight found for publication "${review.publication}" (and no valid default). Skipping this review score.`);
        }
      }
    });
  
    return totalWeight === 0 ? null : totalWeightedScore / totalWeight;
  }

  /**
 * Calculates an aggregated audience score.
 * It considers the main product audience rating and count,
 * and optionally, an array of retailer reviews.
 * If actual review counts exist (main or retailer), it computes a weighted average.
 * If no review counts exist but audienceRatingString is parsable, it returns that score with a count of 0.
 * @param {string} audienceRatingString - E.g., "4.5 / 5".
 * @param {number} audienceReviewCountInput - Number of reviews for the main audienceRatingString.
 * @param {Array} retailerReviewsArray - Array of retailer review objects.
 *                                      Each object: { average: number, count: number, scale?: number }
 * @returns {object} - { score: number|null, count: number }
 */
export const calculateAudienceScore = (
  audienceRatingString,
  audienceReviewCountInput = 0,
  retailerReviewsArray = []
) => {
  let totalWeightedScore = 0;
  let totalReviewsAggregated = 0;
  let mainScore100 = null;

  const mainAudienceReviewCount = Number(audienceReviewCountInput) || 0;

  // Try to parse the main audience rating string regardless of count
  if (audienceRatingString) {
    const match = audienceRatingString.match(/(\d+(\.\d+)?)\s*\/\s*(\d+)/);
    if (match) {
      const score = parseFloat(match[1]);
      const scale = parseInt(match[3], 10);
      if (scale !== 0) {
        mainScore100 = (score / scale) * 100;
      }
    }
  }

  // If main audience rating is valid and has reviews, add to weighted average
  if (mainScore100 !== null && mainAudienceReviewCount > 0) {
    totalWeightedScore += mainScore100 * mainAudienceReviewCount;
    totalReviewsAggregated += mainAudienceReviewCount;
  }

  // Process retailer review data
  (retailerReviewsArray || []).forEach(retailer => {
    if (retailer && typeof retailer.average === 'number' && typeof retailer.count === 'number' && retailer.count > 0) {
      const scale = retailer.scale || 5; // Assume 5 if not provided
      if (scale !== 0) {
        const score100 = (retailer.average / scale) * 100;
        totalWeightedScore += score100 * retailer.count;
        totalReviewsAggregated += retailer.count;
      }
    }
  });

  if (totalReviewsAggregated > 0) {
    const finalCombinedScore = Math.round(totalWeightedScore / totalReviewsAggregated);
    return { score: finalCombinedScore, count: totalReviewsAggregated };
  } else if (mainScore100 !== null) {
    // No reviews contributed to weighted average, but main audience rating string was valid
    return { score: Math.round(mainScore100), count: 0 };
  } else {
    // No valid scores or reviews from any source
    return { score: null, count: 0 };
  }
};