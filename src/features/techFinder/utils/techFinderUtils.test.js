import { parseScreenSize } from './techFinderUtils';

describe('parseScreenSize', () => {
  test('returns null for null or undefined input', () => {
    expect(parseScreenSize(null)).toBeNull();
    expect(parseScreenSize(undefined)).toBeNull();
  });

  test('returns the number when input is a number', () => {
    expect(parseScreenSize(15.6)).toBe(15.6);
    expect(parseScreenSize(13)).toBe(13);
    expect(parseScreenSize(0)).toBe(0);
  });

  test('extracts number from a string', () => {
    expect(parseScreenSize('15.6 inch')).toBe(15.6);
    expect(parseScreenSize('13')).toBe(13);
    expect(parseScreenSize('14"')).toBe(14);
    expect(parseScreenSize('Size: 15.6')).toBe(15.6);
  });

  test('returns null for strings without numbers', () => {
    expect(parseScreenSize('no size')).toBeNull();
    expect(parseScreenSize('')).toBeNull();
    expect(parseScreenSize('   ')).toBeNull();
  });

  test('handles arrays by returning the first valid numeric size', () => {
    expect(parseScreenSize(['14', '16'])).toBe(14);
    expect(parseScreenSize([null, '15.6'])).toBe(15.6);
    expect(parseScreenSize(['invalid', '13-inch'])).toBe(13);
  });

  test('returns null for arrays with no valid numeric sizes', () => {
    expect(parseScreenSize([])).toBeNull();
    expect(parseScreenSize(['invalid', 'also invalid'])).toBeNull();
    expect(parseScreenSize([null, undefined])).toBeNull();
  });

  test('handles multiple numbers in string by picking the first one', () => {
    expect(parseScreenSize('15.6 or 14 inch')).toBe(15.6);
  });
});
