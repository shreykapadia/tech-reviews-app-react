import { parseRam } from './techFinderUtils';

describe('parseRam', () => {
  describe('Null and Undefined inputs', () => {
    test('should return null for null input', () => {
      expect(parseRam(null)).toBeNull();
    });

    test('should return null for undefined input', () => {
      expect(parseRam(undefined)).toBeNull();
    });
  });

  describe('Numeric inputs', () => {
    test('should return the numeric value for positive numbers', () => {
      expect(parseRam(16)).toBe(16);
      expect(parseRam(8)).toBe(8);
    });

    test('should return null for zero', () => {
      expect(parseRam(0)).toBeNull();
    });

    test('should return null for negative numbers', () => {
      expect(parseRam(-8)).toBeNull();
    });

    test('should return null for NaN', () => {
      expect(parseRam(NaN)).toBeNull();
    });
  });

  describe('Single String inputs', () => {
    test('should extract numeric value from strings like "16GB"', () => {
      expect(parseRam("16GB")).toBe(16);
    });

    test('should extract numeric value from strings like "8"', () => {
      expect(parseRam("8")).toBe(8);
    });

    test('should handle whitespace and units', () => {
      expect(parseRam("  32 GB  ")).toBe(32);
    });

    test('should return null for invalid strings', () => {
      expect(parseRam("invalid")).toBeNull();
      expect(parseRam("GB16")).toBeNull();
    });

    test('should return null for empty or whitespace-only strings', () => {
      expect(parseRam("")).toBeNull();
      expect(parseRam("   ")).toBeNull();
    });
  });

  describe('Comma-Separated String inputs', () => {
    test('should return the maximum value from a comma-separated string', () => {
      expect(parseRam("8GB, 16GB, 32GB")).toBe(32);
      expect(parseRam("16, 8")).toBe(16);
    });

    test('should ignore invalid parts in a comma-separated string', () => {
      expect(parseRam("invalid, 8GB")).toBe(8);
      expect(parseRam("8GB, unknown, 4GB")).toBe(8);
    });

    test('should return null if no parts are valid', () => {
      expect(parseRam("invalid, unknown")).toBeNull();
    });
  });

  describe('Array inputs', () => {
    test('should return the maximum value from an array of strings', () => {
      expect(parseRam(["8GB", "16GB"])).toBe(16);
      expect(parseRam(["32GB", "8GB"])).toBe(32);
    });

    test('should return null for an empty array', () => {
      expect(parseRam([])).toBeNull();
    });

    test('should ignore invalid elements in the array', () => {
      expect(parseRam(["invalid", "16GB"])).toBe(16);
      expect(parseRam([null, "8GB", undefined])).toBe(8);
    });

    test('should return null if no elements in the array are valid strings', () => {
      expect(parseRam(["invalid", "unknown"])).toBeNull();
      // Note: the implementation of extractRamValue only handles strings.
      // If an array contains non-string elements (other than null/undefined which are ignored),
      // extractRamValue will return null for them.
      expect(parseRam([null, undefined])).toBeNull();
    });
  });

  describe('Mixed/Edge Cases', () => {
    test('should handle complex mixed inputs', () => {
      expect(parseRam(["8", null, undefined, "16GB"])).toBe(16);
    });
  });
});
