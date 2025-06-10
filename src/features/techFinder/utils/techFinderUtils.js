// src/features/techFinder/utils/techFinderUtils.js

// Helper function to parse numeric values from strings like "120Hz", "1000 nits"
export const parseNumericValue = (str) => {
  if (typeof str === 'number') return str;
  if (typeof str !== 'string') return null;
  const match = str.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
};

// Helper function to get nested property values
export const getNestedValue = (obj, path) => {
  if (!path || !obj) return undefined;
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return undefined; // Path does not exist or value is not an object at some point
    }
  }
  return result;
};

// --- Laptop Specific Helper Functions ---
export const parseRam = (ramString) => {
  if (typeof ramString !== 'string') return null;
  const match = ramString.match(/(\d+)\s*GB/i);
  return match ? parseInt(match[1], 10) : null;
};

export const parseStorage = (storageString) => {
  if (typeof storageString !== 'string') return null;
  const match = storageString.match(/(\d+)\s*(GB|TB)/i);
  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2].toUpperCase();
    return unit === 'TB' ? value * 1024 : value; // Convert TB to GB
  }
  return null;
};

export const parseScreenSize = (screenSizeString) => {
  if (typeof screenSizeString !== 'string') return null;
  const match = screenSizeString.match(/(\d+(\.\d+)?)/); // Extracts numbers like 13.6, 15, 16.2
  return match ? parseFloat(match[1]) : null;
};

export const hasDedicatedGraphics = (keySpecs) => {
  if (!keySpecs) return false;
  const graphicsSpec = String(keySpecs.Graphics || keySpecs.gpu || '').toLowerCase();
  const processorSpec = String(keySpecs.Processor || '').toLowerCase();

  // Standard dedicated GPUs
  if (graphicsSpec.includes('nvidia') || graphicsSpec.includes('rtx') || graphicsSpec.includes('geforce') ||
      graphicsSpec.includes('amd radeon') || graphicsSpec.includes('intel arc')) {
    return true;
  }

  // Apple Silicon: Pro, Max, Ultra chips have significantly more powerful GPUs
  const appleProMaxUltraPattern = /m\d\s*(pro|max|ultra)/i;
  if (appleProMaxUltraPattern.test(processorSpec) || appleProMaxUltraPattern.test(graphicsSpec)) {
      return true;
  }
  
  return false;
};

export const parseBatteryLife = (batteryString) => {
  if (typeof batteryString !== 'string') return null;
  // Matches "Up to 18 hours", "10 hrs", "Approx. 12hr"
  const match = batteryString.match(/(\d+)\s*(?:hours|hrs|hr)/i);
  return match ? parseInt(match[1], 10) : null;
};

// --- Smartphone Specific Helper Functions ---
export const parseSmartphoneBatteryLife = (batteryString) => {
  if (typeof batteryString !== 'string') return null;

  // Try to parse "X hours"
  const hoursMatch = batteryString.match(/(\d+)\s*(?:hours|hrs|hr)/i);
  if (hoursMatch) {
    return parseInt(hoursMatch[1], 10);
  }

  // Heuristic for "All-Day"
  if (batteryString.toLowerCase().includes('all-day') || batteryString.toLowerCase().includes('allday')) {
    return 18; // Heuristic: Represents 15-20 hours
  }
  // Add mAh parsing here if needed, but it's less directly comparable for "how long"
  // For now, returning null if only mAh is found and no hours/all-day.
  return null;
};

export const getMaxMegapixels = (cameraSpec) => {
  if (typeof cameraSpec !== 'string') return null;
  const mpMatches = cameraSpec.match(/(\d+)\s*MP/gi); // Find all MP mentions
  if (!mpMatches) return null;
  
  let maxMp = 0;
  mpMatches.forEach(match => {
    const mpValue = parseInt(match, 10); // parseInt will correctly parse "48MP" to 48
    if (mpValue > maxMp) {
      maxMp = mpValue;
    }
  });
  return maxMp > 0 ? maxMp : null;
};