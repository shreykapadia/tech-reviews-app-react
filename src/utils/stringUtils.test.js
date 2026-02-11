import { slugify } from './stringUtils';

describe('slugify', () => {
  test('converts strings to lowercase', () => {
    expect(slugify('HELLO WORLD')).toBe('hello-world');
  });

  test('trims whitespace', () => {
    expect(slugify('  hello world  ')).toBe('hello-world');
  });

  test('replaces spaces with hyphens', () => {
    expect(slugify('hello world')).toBe('hello-world');
  });

  test('removes special characters', () => {
    expect(slugify('hello world!@#$%^&*()')).toBe('hello-world');
  });

  test('collapses multiple hyphens', () => {
    expect(slugify('hello--world')).toBe('hello-world');
  });

  test('handles multiple spaces', () => {
    expect(slugify('hello   world')).toBe('hello-world');
  });

  test('handles null or undefined', () => {
    expect(slugify(null)).toBe('');
    expect(slugify(undefined)).toBe('');
    expect(slugify('')).toBe('');
  });

  test('handles alphanumeric and hyphens correctly', () => {
    expect(slugify('iPhone-15 Pro')).toBe('iphone-15-pro');
  });

  test('removes non-alphanumeric but keeps hyphens', () => {
    expect(slugify('hello.world_test-123')).toBe('helloworldtest-123');
  });
});
