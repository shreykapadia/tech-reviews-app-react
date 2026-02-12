import { hasDedicatedGraphics, parseSmartwatchBatteryLife } from './techFinderUtils';

describe('parseSmartwatchBatteryLife', () => {
  test('returns null for null/undefined input', () => {
    expect(parseSmartwatchBatteryLife(null)).toBe(null);
    expect(parseSmartwatchBatteryLife(undefined)).toBe(null);
  });

  test('returns number as is', () => {
    expect(parseSmartwatchBatteryLife(18)).toBe(18);
    expect(parseSmartwatchBatteryLife(36.5)).toBe(36.5);
  });

  test('parses hours from string', () => {
    expect(parseSmartwatchBatteryLife('18h')).toBe(18);
    expect(parseSmartwatchBatteryLife('18 hours')).toBe(18);
    expect(parseSmartwatchBatteryLife('Up to 36h')).toBe(36);
    expect(parseSmartwatchBatteryLife('Approx 24 hour')).toBe(24);
  });

  test('parses days and converts to hours', () => {
    expect(parseSmartwatchBatteryLife('1 day')).toBe(24);
    expect(parseSmartwatchBatteryLife('2 days')).toBe(48);
    expect(parseSmartwatchBatteryLife('1.5 days')).toBe(36);
    expect(parseSmartwatchBatteryLife('Up to 14 days')).toBe(336);
  });

  test('handles mixed or messy input', () => {
    expect(parseSmartwatchBatteryLife('  18h  ')).toBe(18);
    expect(parseSmartwatchBatteryLife('2 days (typical use)')).toBe(48);
  });

  test('returns number if string is just a number', () => {
    expect(parseSmartwatchBatteryLife('48')).toBe(48);
  });

  test('returns null for invalid strings', () => {
    expect(parseSmartwatchBatteryLife('invalid')).toBe(null);
    expect(parseSmartwatchBatteryLife('')).toBe(null);
  });
});

describe('hasDedicatedGraphics', () => {
  test('returns false for non-object or null/undefined keySpecs', () => {
    expect(hasDedicatedGraphics(null)).toBe(false);
    expect(hasDedicatedGraphics(undefined)).toBe(false);
    expect(hasDedicatedGraphics('not an object')).toBe(false);
    expect(hasDedicatedGraphics(123)).toBe(false);
  });

  test('returns false if dedicatedGraphics is missing or not a string', () => {
    expect(hasDedicatedGraphics({})).toBe(false);
    expect(hasDedicatedGraphics({ dedicatedGraphics: null })).toBe(false);
    expect(hasDedicatedGraphics({ dedicatedGraphics: 123 })).toBe(false);
  });

  test('returns true for Apple Silicon high-performance tiers', () => {
    expect(hasDedicatedGraphics({ processorOptions: 'Apple M1 Pro', dedicatedGraphics: 'Apple M1 Pro' })).toBe(true);
    expect(hasDedicatedGraphics({ processorOptions: 'Apple M2 Max', dedicatedGraphics: 'Apple M2 Max' })).toBe(true);
    expect(hasDedicatedGraphics({ processorOptions: 'Apple M3 Ultra', dedicatedGraphics: 'Apple M3 Ultra' })).toBe(true);
    expect(hasDedicatedGraphics({ processorOptions: 'M4 Pro', dedicatedGraphics: 'M4 Pro' })).toBe(true);
  });

  test('returns false for standard Apple Silicon tiers or non-Pro/Max/Ultra strings', () => {
    // Note: The implementation requires processorOptions to include m1-m4 AND pro/max/ultra for this specific check.
    // If it's just 'Apple M2', it will fall through.
    expect(hasDedicatedGraphics({ processorOptions: 'Apple M2', dedicatedGraphics: 'Integrated' })).toBe(false);
  });

  test('returns false for various integrated graphics strings', () => {
    expect(hasDedicatedGraphics({ dedicatedGraphics: 'Integrated Graphics' })).toBe(false);
    expect(hasDedicatedGraphics({ dedicatedGraphics: 'Intel Iris Xe' })).toBe(false);
    expect(hasDedicatedGraphics({ dedicatedGraphics: 'Intel HD Graphics 620' })).toBe(false);
    expect(hasDedicatedGraphics({ dedicatedGraphics: 'Intel UHD Graphics' })).toBe(false);
    expect(hasDedicatedGraphics({ dedicatedGraphics: 'Intel Graphics' })).toBe(false);
    expect(hasDedicatedGraphics({ dedicatedGraphics: 'AMD Radeon Graphics' })).toBe(false);
    expect(hasDedicatedGraphics({ dedicatedGraphics: 'AMD Vega 8' })).toBe(false);
  });

  test('returns true for various dedicated graphics strings', () => {
    expect(hasDedicatedGraphics({ dedicatedGraphics: 'NVIDIA GeForce RTX 3060' })).toBe(true);
    expect(hasDedicatedGraphics({ dedicatedGraphics: 'GeForce GTX 1650' })).toBe(true);
    expect(hasDedicatedGraphics({ dedicatedGraphics: 'RTX 4090' })).toBe(true);
    expect(hasDedicatedGraphics({ dedicatedGraphics: 'GTX 1080' })).toBe(true);
    expect(hasDedicatedGraphics({ dedicatedGraphics: 'NVIDIA Quadro P1000' })).toBe(true);
    expect(hasDedicatedGraphics({ dedicatedGraphics: 'AMD Radeon RX 6700 XT' })).toBe(true);
    expect(hasDedicatedGraphics({ dedicatedGraphics: 'AMD Radeon Pro W6600' })).toBe(true);
    expect(hasDedicatedGraphics({ dedicatedGraphics: 'AMD FirePro W5100' })).toBe(true);
  });

  test('returns false for unrecognized graphics cards', () => {
    expect(hasDedicatedGraphics({ dedicatedGraphics: 'Some Random Unknown GPU' })).toBe(false);
  });

  test('is case insensitive', () => {
    expect(hasDedicatedGraphics({ dedicatedGraphics: 'nvidia geforce rtx' })).toBe(true);
    expect(hasDedicatedGraphics({ dedicatedGraphics: 'INTEL IRIS XE' })).toBe(false);
  });

  test('AMD Radeon Graphics with RX should be true', () => {
    // The implementation says: (lowerGraphics.includes('amd radeon graphics') && !lowerGraphics.includes('rx')) -> false
    // So if it has both, it should fall through to the next check which might catch 'rx'.
    expect(hasDedicatedGraphics({ dedicatedGraphics: 'AMD Radeon RX 6600' })).toBe(true);
  });
});
