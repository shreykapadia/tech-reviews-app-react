import { parseStorage, getNumericStorageOptions } from './techFinderUtils';

describe('techFinderUtils', () => {
  describe('parseStorage', () => {
    test('returns null for null or undefined input', () => {
      expect(parseStorage(null)).toBeNull();
      expect(parseStorage(undefined)).toBeNull();
    });

    test('handles numeric inputs correctly', () => {
      expect(parseStorage(256)).toBe(256);
      expect(parseStorage(512.5)).toBe(512.5);
      expect(parseStorage(0)).toBeNull();
      expect(parseStorage(-256)).toBeNull();
      expect(parseStorage(NaN)).toBeNull();
    });

    test('parses Gigabytes (GB) strings correctly', () => {
      expect(parseStorage('256GB')).toBe(256);
      expect(parseStorage('512 GB')).toBe(512);
      expect(parseStorage('128.5gb')).toBe(128.5);
      expect(parseStorage('  256 GB  ')).toBe(256);
    });

    test('parses Terabytes (TB) strings correctly and converts to GB', () => {
      expect(parseStorage('1TB')).toBe(1024);
      expect(parseStorage('2 TB')).toBe(2048);
      expect(parseStorage('0.5tb')).toBe(512);
      expect(parseStorage('  1.5 TB  ')).toBe(1536);
    });

    test('assumes GB for numeric strings without units', () => {
      expect(parseStorage('256')).toBe(256);
      expect(parseStorage('512.5')).toBe(512.5);
      expect(parseStorage('0')).toBeNull();
      expect(parseStorage('-128')).toBeNull();
    });

    test('handles quoted string inputs', () => {
      expect(parseStorage('"256GB"')).toBe(256);
      expect(parseStorage("'512GB'")).toBe(512);
      expect(parseStorage('"1TB"')).toBe(1024);
      expect(parseStorage("'256'")).toBe(256);
    });

    test('returns null for invalid strings', () => {
      expect(parseStorage('')).toBeNull();
      expect(parseStorage('   ')).toBeNull();
      expect(parseStorage('invalid')).toBeNull();
      expect(parseStorage('GB')).toBeNull();
      expect(parseStorage('TB')).toBeNull();
    });
  });

  describe('getNumericStorageOptions', () => {
    test('returns empty array for null or undefined input', () => {
      expect(getNumericStorageOptions(null)).toEqual([]);
      expect(getNumericStorageOptions(undefined)).toEqual([]);
    });

    test('handles single numeric and string inputs', () => {
      expect(getNumericStorageOptions(256)).toEqual([256]);
      expect(getNumericStorageOptions('512GB')).toEqual([512]);
      expect(getNumericStorageOptions('1TB')).toEqual([1024]);
    });

    test('handles comma-separated strings', () => {
      expect(getNumericStorageOptions('256, 512GB, 1TB')).toEqual([256, 512, 1024]);
      expect(getNumericStorageOptions('"128GB","256GB"')).toEqual([128, 256]);
      expect(getNumericStorageOptions(' 512 , 256 ')).toEqual([256, 512]);
    });

    test('handles arrays of mixed types', () => {
      expect(getNumericStorageOptions([256, '512GB', '1TB'])).toEqual([256, 512, 1024]);
    });

    test('removes duplicate storage values', () => {
      expect(getNumericStorageOptions([256, '256GB', 256])).toEqual([256]);
      expect(getNumericStorageOptions('512, 512GB, 512 GB')).toEqual([512]);
    });

    test('returns values sorted numerically', () => {
      expect(getNumericStorageOptions(['1TB', '256GB', 512])).toEqual([256, 512, 1024]);
      expect(getNumericStorageOptions([1024, 256, 512])).toEqual([256, 512, 1024]);
      expect(getNumericStorageOptions('1TB, 256, 512')).toEqual([256, 512, 1024]);
    });

    test('ignores invalid or non-positive values', () => {
      expect(getNumericStorageOptions(['invalid', '512GB', 0, -128])).toEqual([512]);
      expect(getNumericStorageOptions('')).toEqual([]);
      expect(getNumericStorageOptions(' , ')).toEqual([]);
    });
  });
});
