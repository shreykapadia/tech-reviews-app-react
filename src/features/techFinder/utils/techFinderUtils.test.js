import { getNumericRamOptions } from './techFinderUtils';

describe('getNumericRamOptions', () => {
  test('returns an empty array for null or undefined input', () => {
    expect(getNumericRamOptions(null)).toEqual([]);
    expect(getNumericRamOptions(undefined)).toEqual([]);
  });

  test('handles a single numeric RAM value', () => {
    expect(getNumericRamOptions(16)).toEqual([16]);
  });

  test('handles a single string RAM value', () => {
    expect(getNumericRamOptions('16')).toEqual([16]);
    expect(getNumericRamOptions('16GB')).toEqual([16]);
    expect(getNumericRamOptions(' 16 GB ')).toEqual([16]);
  });

  test('handles comma-separated string RAM values', () => {
    expect(getNumericRamOptions('8,16,32')).toEqual([8, 16, 32]);
    expect(getNumericRamOptions('8GB, 16GB, 32GB')).toEqual([8, 16, 32]);
  });

  test('handles an array of RAM values', () => {
    expect(getNumericRamOptions([8, 16, 32])).toEqual([8, 16, 32]);
    expect(getNumericRamOptions(['8GB', '16GB', '32GB'])).toEqual([8, 16, 32]);
    expect(getNumericRamOptions([8, '16GB', '32'])).toEqual([8, 16, 32]);
  });

  test('returns unique and sorted values', () => {
    expect(getNumericRamOptions([32, 8, 16, 8, 32])).toEqual([8, 16, 32]);
    expect(getNumericRamOptions('32, 8, 16, 8')).toEqual([8, 16, 32]);
  });

  test('filters out invalid or non-positive values', () => {
    expect(getNumericRamOptions(['invalid', '0', '-8', 16])).toEqual([16]);
    expect(getNumericRamOptions(0)).toEqual([]);
    expect(getNumericRamOptions(-5)).toEqual([]);
    expect(getNumericRamOptions('')).toEqual([]);
    expect(getNumericRamOptions(['', '  ', null, undefined])).toEqual([]);
    expect(getNumericRamOptions([NaN, Infinity, -Infinity])).toEqual([]);
  });

  test('handles mixed types in array', () => {
    expect(getNumericRamOptions([8, '16', '32GB', null, 64])).toEqual([8, 16, 32, 64]);
  });

  test('handles whitespace in comma-separated strings', () => {
    expect(getNumericRamOptions('  8 ,  16  , 32  ')).toEqual([8, 16, 32]);
  });

  test('handles non-string non-number items in array gracefully', () => {
    expect(getNumericRamOptions([16, { ram: 32 }, [64], true])).toEqual([16]);
  });
});
