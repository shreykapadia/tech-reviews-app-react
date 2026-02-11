import { parseStorage } from './techFinderUtils';

describe('parseStorage', () => {
  test('returns null for null or undefined input', () => {
    expect(parseStorage(null)).toBeNull();
    expect(parseStorage(undefined)).toBeNull();
  });

  test('handles numeric input correctly', () => {
    expect(parseStorage(256)).toBe(256);
    expect(parseStorage(512.5)).toBe(512.5);
    expect(parseStorage(0)).toBeNull();
    expect(parseStorage(-10)).toBeNull();
    expect(parseStorage(NaN)).toBeNull();
  });

  test('handles empty or whitespace-only strings', () => {
    expect(parseStorage('')).toBeNull();
    expect(parseStorage('   ')).toBeNull();
  });

  test('handles numeric strings without units (assumes GB)', () => {
    expect(parseStorage('256')).toBe(256);
    expect(parseStorage('512.5')).toBe(512.5);
    expect(parseStorage('0')).toBeNull(); // parseStorage returns null for non-positive
  });

  test('handles strings with GB units (various casing and spacing)', () => {
    expect(parseStorage('256GB')).toBe(256);
    expect(parseStorage('512gb')).toBe(512);
    expect(parseStorage('1024 GB')).toBe(1024);
    expect(parseStorage('128.5 gb')).toBe(128.5);
  });

  test('handles strings with TB units and converts to GB', () => {
    expect(parseStorage('1TB')).toBe(1024);
    expect(parseStorage('2tb')).toBe(2048);
    expect(parseStorage('0.5 TB')).toBe(512);
    expect(parseStorage('1.5tb')).toBe(1536);
  });

  test('handles strings with surrounding quotes', () => {
    expect(parseStorage('"256GB"')).toBe(256);
    expect(parseStorage("'1TB'")).toBe(1024);
    expect(parseStorage('"512"')).toBe(512);
  });

  test('handles invalid string inputs', () => {
    expect(parseStorage('large')).toBeNull();
    expect(parseStorage('GB512')).toBeNull();
    expect(parseStorage('128 MB')).toBeNull(); // MB is not handled, so it should be null if not purely numeric
  });

  test('extracts values from strings with extra text if units are present', () => {
    // Current implementation uses .match() which is not anchored for GB/TB
    expect(parseStorage('Total 512GB storage')).toBe(512);
    expect(parseStorage('1TB HDD')).toBe(1024);
  });
});
