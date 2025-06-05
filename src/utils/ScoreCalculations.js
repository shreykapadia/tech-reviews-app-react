// src/utils/scoreCalculations.js

/**
 * Normalizes a numerical score from its original scale to a target scale using Min-Max normalization.
 */
export function normalizeScore(score, scale, targetScale) {
    let originalMax;
  
    if (scale === 'out of 10') {
      originalMax = 10;
    } else if (scale === 'out of 5 stars') {
      originalMax = 5;
    } else if (scale === 'percent') {
      originalMax = 100;
    } else {
      console.warn(`Unknown or invalid scale: ${scale}`);
      return null;
    }
  
    if (score === null || typeof score !== 'number' || isNaN(score)) {
      return null;
    }
  
    if (originalMax === 0) { // Safety check for division by zero
      return null;
    }
  
    if (scale === 'percent') {
        return (score / 100) * targetScale;
    } else {
        return (score / originalMax) * targetScale;
    }
  }
  
  /**
   * Calculates a weighted average Critics Score from an array of critic reviews.
   */
  export function calculateCriticsScore(criticReviews, criticWeightsData) {
    if (!criticWeightsData || Object.keys(criticWeightsData).length === 0) {
      console.warn("Critic weights not loaded or empty. Cannot calculate critics score.");
      return null;
    }
  
    let totalWeightedScore = 0;
    let totalWeight = 0;
  
    criticReviews.forEach(review => {
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