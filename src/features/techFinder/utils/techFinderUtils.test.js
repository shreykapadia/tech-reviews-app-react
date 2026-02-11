import { getMobileScreenSize } from './techFinderUtils';

describe('getMobileScreenSize', () => {
  test('returns null if keySpecs is null or undefined', () => {
    expect(getMobileScreenSize(null)).toBeNull();
    expect(getMobileScreenSize(undefined)).toBeNull();
  });

  test('returns null if keySpecs is not an object', () => {
    expect(getMobileScreenSize('not an object')).toBeNull();
    expect(getMobileScreenSize(123)).toBeNull();
  });

  test('returns null if screenSize is null or undefined in keySpecs', () => {
    expect(getMobileScreenSize({ screenSize: null })).toBeNull();
    expect(getMobileScreenSize({ screenSize: undefined })).toBeNull();
    expect(getMobileScreenSize({})).toBeNull();
  });

  test('returns the number if screenSize is a positive number', () => {
    expect(getMobileScreenSize({ screenSize: 6 })).toBe(6);
    expect(getMobileScreenSize({ screenSize: 6.7 })).toBe(6.7);
  });

  test('returns null if screenSize is 0 or negative', () => {
    expect(getMobileScreenSize({ screenSize: 0 })).toBeNull();
    expect(getMobileScreenSize({ screenSize: -1 })).toBeNull();
  });

  test('returns numeric value if screenSize is a positive numeric string', () => {
    expect(getMobileScreenSize({ screenSize: '6' })).toBe(6);
  });

  test('returns decimal value if screenSize is a positive decimal string', () => {
    // Current behavior: "6.7" becomes 6 because of parseInt
    // Desired behavior: "6.7" remains 6.7
    expect(getMobileScreenSize({ screenSize: '6.7' })).toBe(6.7);
  });

  test('returns null if screenSize is a non-numeric string or empty string', () => {
    expect(getMobileScreenSize({ screenSize: 'abc' })).toBeNull();
    expect(getMobileScreenSize({ screenSize: '' })).toBeNull();
    expect(getMobileScreenSize({ screenSize: '0' })).toBeNull();
  });
});
