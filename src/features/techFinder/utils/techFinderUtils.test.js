import { getDxoScore } from './techFinderUtils';

describe('getDxoScore', () => {
  test('returns the DXO score when it is a valid non-negative integer', () => {
    const keySpecs = { dxo: 140 };
    expect(getDxoScore(keySpecs)).toBe(140);
  });

  test('returns 0 when DXO score is 0', () => {
    const keySpecs = { dxo: 0 };
    expect(getDxoScore(keySpecs)).toBe(0);
  });

  test('returns null when keySpecs is null', () => {
    expect(getDxoScore(null)).toBeNull();
  });

  test('returns null when keySpecs is undefined', () => {
    expect(getDxoScore(undefined)).toBeNull();
  });

  test('returns null when keySpecs is not an object', () => {
    expect(getDxoScore('not an object')).toBeNull();
    expect(getDxoScore(123)).toBeNull();
  });

  test('returns null when dxo field is missing', () => {
    const keySpecs = { otherField: 'value' };
    expect(getDxoScore(keySpecs)).toBeNull();
  });

  test('returns null when dxo field is a string', () => {
    const keySpecs = { dxo: '140' };
    expect(getDxoScore(keySpecs)).toBeNull();
  });

  test('returns null when dxo field is a float', () => {
    const keySpecs = { dxo: 140.5 };
    expect(getDxoScore(keySpecs)).toBeNull();
  });

  test('returns null when dxo field is a negative integer', () => {
    const keySpecs = { dxo: -1 };
    expect(getDxoScore(keySpecs)).toBeNull();
  });

  test('returns null when dxo field is null', () => {
    const keySpecs = { dxo: null };
    expect(getDxoScore(keySpecs)).toBeNull();
  });

  test('returns null when dxo field is undefined', () => {
    const keySpecs = { dxo: undefined };
    expect(getDxoScore(keySpecs)).toBeNull();
  });

  test('returns null when dxo field is an object', () => {
    const keySpecs = { dxo: { value: 140 } };
    expect(getDxoScore(keySpecs)).toBeNull();
  });

  test('returns null when dxo field is an array', () => {
    const keySpecs = { dxo: [140] };
    expect(getDxoScore(keySpecs)).toBeNull();
  });
});
