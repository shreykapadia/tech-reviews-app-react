import { parseStorage } from './techFinderUtils';

describe('parseStorage', () => {
  test('returns null for null or undefined input', () => {
    expect(parseStorage(null)).toBeNull();
    expect(parseStorage(undefined)).toBeNull();
  });

  test('returns the number itself if it is a positive number', () => {
    expect(parseStorage(256)).toBe(256);
    expect(parseStorage(512)).toBe(512);
    expect(parseStorage(1024.5)).toBe(1024.5);
  });

  test('returns null for zero or negative numbers', () => {
    expect(parseStorage(0)).toBeNull();
    expect(parseStorage(-10)).toBeNull();
  });

  test('returns null for empty or whitespace-only strings', () => {
    expect(parseStorage('')).toBeNull();
    expect(parseStorage('   ')).toBeNull();
  });

  test('parses plain numeric strings as GB', () => {
    expect(parseStorage('256')).toBe(256);
    expect(parseStorage(' 512 ')).toBe(512);
    expect(parseStorage('1024.5')).toBe(1024.5);
  });

  test('parses strings with GB unit (case-insensitive, optional spaces)', () => {
    expect(parseStorage('512GB')).toBe(512);
    expect(parseStorage('512gb')).toBe(512);
    expect(parseStorage('512 GB')).toBe(512);
    expect(parseStorage('256.5 gb')).toBe(256.5);
  });

  test('parses strings with TB unit and converts to GB (case-insensitive, optional spaces)', () => {
    expect(parseStorage('1TB')).toBe(1024);
    expect(parseStorage('1tb')).toBe(1024);
    expect(parseStorage('1 TB')).toBe(1024);
    expect(parseStorage('0.5 TB')).toBe(512);
    expect(parseStorage('2.5tb')).toBe(2560);
  });

  test('removes surrounding single or double quotes', () => {
    expect(parseStorage('"256GB"')).toBe(256);
    expect(parseStorage("'512GB'")).toBe(512);
    expect(parseStorage('"1TB"')).toBe(1024);
  });

  test('returns null for invalid strings', () => {
    expect(parseStorage('abc')).toBeNull();
    expect(parseStorage('GB512')).toBeNull();
    expect(parseStorage('TB1')).toBeNull();
  });

  test('extracts values even if there is extra text (based on current implementation)', () => {
    // Current implementation uses .match() without anchoring to start of string for units
    expect(parseStorage('capacity 512GB')).toBe(512);
    expect(parseStorage('about 1TB')).toBe(1024);
  });
});
