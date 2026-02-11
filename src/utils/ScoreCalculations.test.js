import { normalizeScore, calculateCriticsScore, calculateAudienceScore } from './ScoreCalculations';

describe('ScoreCalculations Utility', () => {
  describe('normalizeScore', () => {
    test('normalizes "out of 10" scale correctly', () => {
      expect(normalizeScore(8, 'out of 10')).toBe(80);
      expect(normalizeScore(7.5, '/10')).toBe(75);
    });

    test('normalizes "out of 5 stars" scale correctly', () => {
      expect(normalizeScore(4, 'out of 5 stars')).toBe(80);
      expect(normalizeScore(2.5, '/5')).toBe(50);
    });

    test('normalizes "percent" scale correctly', () => {
      expect(normalizeScore(90, 'percent')).toBe(90);
      expect(normalizeScore(85, '/100')).toBe(85);
      expect(normalizeScore(70, 'out of 100')).toBe(70);
    });

    test('handles case sensitivity and whitespace in scale names', () => {
      expect(normalizeScore(4, '  OUT OF 5 STARS  ')).toBe(80);
      expect(normalizeScore(9, ' /10 ')).toBe(90);
    });

    test('normalizes to custom target scale', () => {
      expect(normalizeScore(4, '/5', 10)).toBe(8);
      expect(normalizeScore(8, '/10', 5)).toBe(4);
    });

    test('returns null for unknown scales', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      expect(normalizeScore(8, 'unknown')).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown or invalid scale'));
      consoleSpy.mockRestore();
    });

    test('returns null for invalid scores', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      expect(normalizeScore(null, '/10')).toBeNull();
      expect(normalizeScore(undefined, '/10')).toBeNull();
      expect(normalizeScore('8', '/10')).toBeNull();
      expect(normalizeScore(NaN, '/10')).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('calculateCriticsScore', () => {
    const mockCriticWeights = {
      'The Verge': 1.5,
      'CNET': 1.0,
      'default': 0.8
    };

    test('returns null if criticWeightsData is missing or empty', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      expect(calculateCriticsScore({}, null)).toBeNull();
      expect(calculateCriticsScore({}, {})).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Critic weights not loaded or empty'));
      consoleSpy.mockRestore();
    });

    test('returns null if product or criticReviews are missing or invalid', () => {
      expect(calculateCriticsScore(null, mockCriticWeights)).toBeNull();
      expect(calculateCriticsScore({}, mockCriticWeights)).toBeNull();
      expect(calculateCriticsScore({ criticReviews: 'not an array' }, mockCriticWeights)).toBeNull();
      expect(calculateCriticsScore({ criticReviews: [] }, mockCriticWeights)).toBeNull();
    });

    test('calculates weighted average for a single review with exact weight match', () => {
      const product = {
        criticReviews: [
          { score: 8, scale: '/10', publication: 'The Verge' }
        ]
      };
      // (80 * 1.5) / 1.5 = 80
      expect(calculateCriticsScore(product, mockCriticWeights)).toBe(80);
    });

    test('calculates weighted average using default weight when publication is not found', () => {
      const product = {
        criticReviews: [
          { score: 4, scale: '/5', publication: 'Unknown Pub' }
        ]
      };
      // (80 * 0.8) / 0.8 = 80
      expect(calculateCriticsScore(product, mockCriticWeights)).toBe(80);
    });

    test('calculates weighted average for multiple reviews', () => {
      const product = {
        criticReviews: [
          { score: 8, scale: '/10', publication: 'The Verge' }, // 80, weight 1.5
          { score: 4, scale: '/5', publication: 'CNET' },       // 80, weight 1.0
          { score: 90, scale: 'percent', publication: 'Unknown' } // 90, weight 0.8 (default)
        ]
      };
      // (80 * 1.5 + 80 * 1.0 + 90 * 0.8) / (1.5 + 1.0 + 0.8)
      // (120 + 80 + 72) / 3.3 = 272 / 3.3 = 82.4242...
      expect(calculateCriticsScore(product, mockCriticWeights)).toBeCloseTo(82.4242, 4);
    });

    test('skips reviews with invalid scores or unknown scales', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const product = {
        criticReviews: [
          { score: 8, scale: '/10', publication: 'The Verge' }, // 80, weight 1.5
          { score: null, scale: '/10', publication: 'CNET' },   // skip
          { score: 90, scale: 'invalid', publication: 'The Verge' } // skip
        ]
      };
      // Only first review is valid: (80 * 1.5) / 1.5 = 80
      expect(calculateCriticsScore(product, mockCriticWeights)).toBe(80);
      consoleSpy.mockRestore();
    });

    test('skips reviews when no valid weight and no default weight is available', () => {
      const weightsNoDefault = { 'The Verge': 1.5 };
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const product = {
        criticReviews: [
          { score: 8, scale: '/10', publication: 'Unknown' }
        ]
      };
      expect(calculateCriticsScore(product, weightsNoDefault)).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No valid weight found'));
      consoleSpy.mockRestore();
    });
  });

  describe('calculateAudienceScore', () => {
    test('calculates score from main audience rating string only (count 0)', () => {
      const result = calculateAudienceScore('4.5 / 5', 0);
      expect(result).toEqual({ score: 90, count: 0 });
    });

    test('calculates weighted average from main audience rating and count', () => {
      const result = calculateAudienceScore('4 / 5', 10);
      expect(result).toEqual({ score: 80, count: 10 });
    });

    test('calculates weighted average from retailer reviews only', () => {
      const retailerReviews = [
        { average: 4, count: 10, scale: 5 },  // 80, count 10
        { average: 9, count: 10, scale: 10 } // 90, count 10
      ];
      const result = calculateAudienceScore(null, 0, retailerReviews);
      // (80 * 10 + 90 * 10) / 20 = 1700 / 20 = 85
      expect(result).toEqual({ score: 85, count: 20 });
    });

    test('calculates combined weighted average from main and retailers', () => {
      const retailerReviews = [
        { average: 4.5, count: 20, scale: 5 } // 90, count 20
      ];
      // Main: 4/5 (80), count 10
      const result = calculateAudienceScore('4 / 5', 10, retailerReviews);
      // (80 * 10 + 90 * 20) / 30 = (800 + 1800) / 30 = 2600 / 30 = 86.666... -> 87
      expect(result).toEqual({ score: 87, count: 30 });
    });

    test('handles retailer reviews with default scale (5)', () => {
      const retailerReviews = [
        { average: 3, count: 10 } // assume scale 5 -> 60
      ];
      const result = calculateAudienceScore(null, 0, retailerReviews);
      expect(result).toEqual({ score: 60, count: 10 });
    });

    test('returns null score and count 0 for invalid inputs', () => {
      expect(calculateAudienceScore(null, 0, [])).toEqual({ score: null, count: 0 });
      expect(calculateAudienceScore('invalid', 0, [])).toEqual({ score: null, count: 0 });
    });

    test('skips invalid retailer reviews', () => {
      const retailerReviews = [
        { average: 4, count: 10, scale: 5 }, // 80, count 10
        { average: 'invalid', count: 5 },     // skip
        { average: 5, count: 0 }             // skip (count 0)
      ];
      const result = calculateAudienceScore(null, 0, retailerReviews);
      expect(result).toEqual({ score: 80, count: 10 });
    });
  });
});
