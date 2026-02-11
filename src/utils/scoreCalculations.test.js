import { normalizeScore, calculateCriticsScore, calculateAudienceScore } from './scoreCalculations';

describe('normalizeScore', () => {
  const originalWarn = console.warn;
  const originalError = console.error;

  beforeAll(() => {
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterAll(() => {
    console.warn = originalWarn;
    console.error = originalError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('normalizes "out of 10" scale correctly', () => {
    expect(normalizeScore(8, 'out of 10')).toBe(80);
    expect(normalizeScore(10, 'out of 10')).toBe(100);
    expect(normalizeScore(0, 'out of 10')).toBe(0);
  });

  test('normalizes "/10" scale correctly', () => {
    expect(normalizeScore(5, '/10')).toBe(50);
    expect(normalizeScore(7.5, '/10')).toBe(75);
  });

  test('normalizes "out of 5 stars" scale correctly', () => {
    expect(normalizeScore(4, 'out of 5 stars')).toBe(80);
    expect(normalizeScore(5, 'out of 5 stars')).toBe(100);
    expect(normalizeScore(2.5, 'out of 5 stars')).toBe(50);
  });

  test('normalizes "/5" scale correctly', () => {
    expect(normalizeScore(3, '/5')).toBe(60);
    expect(normalizeScore(1, '/5')).toBe(20);
  });

  test('normalizes "percent" scale correctly', () => {
    expect(normalizeScore(90, 'percent')).toBe(90);
    expect(normalizeScore(100, 'percent')).toBe(100);
    expect(normalizeScore(0, 'percent')).toBe(0);
  });

  test('normalizes "/100" scale correctly', () => {
    expect(normalizeScore(75, '/100')).toBe(75);
  });

  test('normalizes "out of 100" scale correctly', () => {
    expect(normalizeScore(85, 'out of 100')).toBe(85);
  });

  test('handles custom targetScale', () => {
    expect(normalizeScore(8, 'out of 10', 10)).toBe(8);
    expect(normalizeScore(4, 'out of 5 stars', 10)).toBe(8);
    expect(normalizeScore(90, 'percent', 1)).toBe(0.9);
  });

  test('is case insensitive and handles whitespace in scale', () => {
    expect(normalizeScore(8, '  OUT OF 10  ')).toBe(80);
    expect(normalizeScore(4, 'Out Of 5 Stars')).toBe(80);
    expect(normalizeScore(90, ' PERCENT ')).toBe(90);
  });

  test('returns null for unknown scale', () => {
    expect(normalizeScore(8, 'out of 20')).toBeNull();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Unknown or invalid scale'));
  });

  test('returns null for invalid score types', () => {
    expect(normalizeScore('8', 'out of 10')).toBeNull();
    expect(normalizeScore(null, 'out of 10')).toBeNull();
    expect(normalizeScore(NaN, 'out of 10')).toBeNull();
    expect(normalizeScore(undefined, 'out of 10')).toBeNull();
    expect(console.warn).toHaveBeenCalledTimes(4);
  });

  test('handles scores exceeding the scale', () => {
    // Current implementation doesn't cap the score
    expect(normalizeScore(12, 'out of 10')).toBe(120);
    expect(normalizeScore(6, 'out of 5 stars')).toBe(120);
  });
});

describe('calculateCriticsScore', () => {
  const originalWarn = console.warn;

  beforeAll(() => {
    console.warn = jest.fn();
  });

  afterAll(() => {
    console.warn = originalWarn;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockWeights = {
    'Publication A': 1.5,
    'Publication B': 1.0,
    'default': 1.0,
  };

  test('calculates weighted score correctly', () => {
    const product = {
      criticReviews: [
        { publication: 'Publication A', score: 8, scale: 'out of 10' }, // normalized: 80, weighted: 80 * 1.5 = 120
        { publication: 'Publication B', score: 4, scale: 'out of 5 stars' }, // normalized: 80, weighted: 80 * 1.0 = 80
      ],
    };
    // totalWeightedScore = 120 + 80 = 200
    // totalWeight = 1.5 + 1.0 = 2.5
    // expected = 200 / 2.5 = 80
    expect(calculateCriticsScore(product, mockWeights)).toBe(80);
  });

  test('uses default weight for unknown publications', () => {
    const product = {
      criticReviews: [
        { publication: 'Unknown Pub', score: 70, scale: 'percent' }, // normalized: 70, weighted: 70 * 1.0 = 70
      ],
    };
    expect(calculateCriticsScore(product, mockWeights)).toBe(70);
  });

  test('returns null if criticWeightsData is empty or missing', () => {
    const product = { criticReviews: [{ publication: 'A', score: 80, scale: 'percent' }] };
    expect(calculateCriticsScore(product, {})).toBeNull();
    expect(calculateCriticsScore(product, null)).toBeNull();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Critic weights not loaded or empty'));
  });

  test('returns null if product has no reviews', () => {
    expect(calculateCriticsScore({ criticReviews: [] }, mockWeights)).toBeNull();
    expect(calculateCriticsScore({ criticReviews: null }, mockWeights)).toBeNull();
    expect(calculateCriticsScore(null, mockWeights)).toBeNull();
  });

  test('skips reviews with invalid scores', () => {
    const product = {
      criticReviews: [
        { publication: 'Publication A', score: 8, scale: 'out of 10' }, // 80 * 1.5 = 120
        { publication: 'Publication B', score: null, scale: 'out of 5 stars' }, // skipped
      ],
    };
    // totalWeightedScore = 120
    // totalWeight = 1.5
    // expected = 120 / 1.5 = 80
    expect(calculateCriticsScore(product, mockWeights)).toBe(80);
  });
});

describe('calculateAudienceScore', () => {
  test('parses rating string correctly when no counts provided', () => {
    const result = calculateAudienceScore('4.5 / 5');
    expect(result).toEqual({ score: 90, count: 0 });
  });

  test('handles rating string with decimal scale', () => {
    const result = calculateAudienceScore('8 / 10');
    expect(result).toEqual({ score: 80, count: 0 });
  });

  test('calculates weighted average with main count', () => {
    // 90 * 10 = 900
    // totalWeight = 10
    // expected = 90
    const result = calculateAudienceScore('4.5 / 5', 10);
    expect(result).toEqual({ score: 90, count: 10 });
  });

  test('calculates weighted average including retailer reviews', () => {
    // Main: 4.5 / 5 (90%), count 10 -> 900
    // Retailer 1: average 4, count 20, scale 5 (80%) -> 80 * 20 = 1600
    // Retailer 2: average 9, count 10, scale 10 (90%) -> 90 * 10 = 900
    // Total weighted score = 900 + 1600 + 900 = 3400
    // Total count = 10 + 20 + 10 = 40
    // Expected score = 3400 / 40 = 85
    const retailerReviews = [
      { average: 4, count: 20, scale: 5 },
      { average: 9, count: 10, scale: 10 },
    ];
    const result = calculateAudienceScore('4.5 / 5', 10, retailerReviews);
    expect(result).toEqual({ score: 85, count: 40 });
  });

  test('defaults retailer scale to 5 if not provided', () => {
    // Retailer: average 4, count 10, scale missing (assumed 5) -> 80%
    // score = 80, count = 10
    const retailerReviews = [{ average: 4, count: 10 }];
    const result = calculateAudienceScore(null, 0, retailerReviews);
    expect(result).toEqual({ score: 80, count: 10 });
  });

  test('handles zero count for main rating', () => {
    // If count is 0, main rating should not contribute to weighted average if retailer reviews exist
    // Retailer: 4 / 5 (80%), count 10 -> 800
    // Main: 5 / 5 (100%), count 0 -> 0
    // Total score = 800 / 10 = 80
    const result = calculateAudienceScore('5 / 5', 0, [{ average: 4, count: 10 }]);
    expect(result).toEqual({ score: 80, count: 10 });
  });

  test('returns score from string with count 0 if no reviews have count > 0', () => {
    const result = calculateAudienceScore('4 / 5', 0, [{ average: 3, count: 0 }]);
    expect(result).toEqual({ score: 80, count: 0 });
  });

  test('returns null score and 0 count for invalid inputs', () => {
    expect(calculateAudienceScore(null, 0, [])).toEqual({ score: null, count: 0 });
    expect(calculateAudienceScore('invalid', 0, [{ average: 3, count: 0 }])).toEqual({ score: null, count: 0 });
  });
});
