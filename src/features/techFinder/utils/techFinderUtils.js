// src/features/techFinder/utils/techFinderUtils.js

/**
 * Parses RAM input to find the maximum RAM value in GB.
 * Input can be a string (e.g., "16GB"), an array of strings (e.g., ["8GB", "16GB", "32 GB"]),
 * or a number (assumed to be in GB).
 * @param {string|string[]|number|null|undefined} ramInput - The RAM specification(s).
 * @returns {number|null} The maximum RAM value in GB, or null if not parsable.
 */
export const parseRam = (ramInput) => {
  if (ramInput === null || ramInput === undefined) {
    return null;
  }

  let maxRam = 0;
  let foundRam = false;

  const extractRamValue = (ramStr) => {
    if (typeof ramStr !== 'string' || ramStr.trim() === "") return null;
    // parseInt will stop at the first non-digit, so "16GB" becomes 16.
    const num = parseInt(ramStr.trim(), 10);
    return !isNaN(num) && num > 0 ? num : null;
  };

  if (Array.isArray(ramInput)) {
    if (ramInput.length === 0) {
        return null; // Handle empty array explicitly
    }
    for (const ramOption of ramInput) {
      const ramValue = extractRamValue(ramOption);
      if (ramValue !== null) {
        maxRam = Math.max(maxRam, ramValue);
        foundRam = true;
      }
    }
  } else if (typeof ramInput === 'string') {
    // If it's a comma-separated string, find the max
    if (ramInput.includes(',')) {
        const parts = ramInput.split(',');
        for (const part of parts) {
            const ramValue = extractRamValue(part.trim());
            if (ramValue !== null) {
                maxRam = Math.max(maxRam, ramValue);
                foundRam = true;
            }
        }
    } else { // Single string value
        const ramValue = extractRamValue(ramInput);
        if (ramValue !== null) {
          maxRam = ramValue;
          foundRam = true;
        }
    }
  } else if (typeof ramInput === 'number') {
    if (!isNaN(ramInput) && ramInput > 0) {
      maxRam = ramInput;
      foundRam = true;
    }
  }

  return foundRam ? maxRam : null;
};

/**
 * Parses a string value to extract a numeric value.
 * Handles common currency symbols and units by stripping non-numeric characters (except decimal and minus).
 * @param {string|number|null|undefined} value - The value to parse.
 * @returns {number|null} The parsed numeric value, or null if not parsable.
 */
export const parseNumericValue = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value !== 'string' || value.trim() === "") return null;

  const num = parseFloat(value.replace(/[^\d.-]/g, ''));
  return isNaN(num) ? null : num;
};

/**
 * Safely retrieves a nested value from an object using a dot-separated path.
 * @param {object} obj - The object to traverse.
 * @param {string} path - The dot-separated path (e.g., "key.nestedKey.value").
 * @returns {*} The value at the specified path, or undefined if the path is invalid or not found.
 */
export const getNestedValue = (obj, path) => {
  if (!obj || typeof obj !== 'object' || !path || typeof path !== 'string') {
    return undefined;
  }
  return path.split('.').reduce((acc, part) => {
    if (acc && typeof acc === 'object' && acc[part] !== undefined) {
      return acc[part];
    }
    return undefined;
  }, obj);
};

/**
 * Parses a single storage specification string (e.g., "512GB", "1TB", "256") into GB.
 * Also accepts numbers, assuming they are already in GB.
 * Handles optional surrounding quotes for string inputs.
 * @param {string|number|null|undefined} storageSpec - The storage specification.
 * @returns {number|null} The storage value in GB, or null if not parsable.
 */
export const parseStorage = (storageSpec) => {
  if (storageSpec === null || storageSpec === undefined) return null;
  if (typeof storageSpec === 'number') {
    // If it's already a number, assume it's in GB and valid if positive
    return !isNaN(storageSpec) && storageSpec > 0 ? storageSpec : null;
  }
  if (typeof storageSpec !== 'string' || storageSpec.trim() === "") return null;

  let specStr = String(storageSpec).trim(); // Trim whitespace

  // Remove surrounding single or double quotes if present
  if ((specStr.startsWith('"') && specStr.endsWith('"')) || (specStr.startsWith("'") && specStr.endsWith("'"))) {
    specStr = specStr.substring(1, specStr.length - 1);
  }
  
  specStr = specStr.toLowerCase(); // Standardize to lowercase for matching "tb" or "gb"

  // Check for Terabytes (TB)
  const tbMatch = specStr.match(/(\d+(\.\d+)?)\s*tb/);
  if (tbMatch && tbMatch[1]) {
    return parseFloat(tbMatch[1]) * 1024; // Convert TB to GB
  }

  // Check for Gigabytes (GB)
  const gbMatch = specStr.match(/(\d+(\.\d+)?)\s*gb/);
  if (gbMatch && gbMatch[1]) {
    return parseFloat(gbMatch[1]);
  }

  // If no unit (TB/GB) is specified, assume the number is in GB
  // This handles "128", "256", "512"
  if (/^\d+(\.\d+)?$/.test(specStr)) { // Check if it's purely a numeric string
    const num = parseFloat(specStr);
    if (!isNaN(num) && num > 0) {
      return num; // Assume GB
    }
  }

  return null; // Return null if not parsable
};

/**
 * Parses screen size specification (e.g., "15.6 inch", "13", ["14", "16"]) into a number.
 * If an array is provided, it returns the first successfully parsed numeric size.
 * @param {string|number|string[]|null|undefined} screenSizeSpec - The screen size specification(s).
 * @returns {number|null} The screen size as a number, or null if not parsable.
 */
export const parseScreenSize = (screenSizeSpec) => {
  if (screenSizeSpec === null || screenSizeSpec === undefined) {
    return null;
  }

  const extractNumericSize = (spec) => {
    if (spec === null || spec === undefined) return null;
    if (typeof spec === 'number') {
      return !isNaN(spec) ? spec : null;
    }
    if (typeof spec !== 'string' || spec.trim() === "") return null;

    const match = String(spec).match(/(\d+(\.\d+)?)/); // Extracts the first number found
    return match ? parseFloat(match[1]) : null;
  };

  if (Array.isArray(screenSizeSpec)) {
    for (const item of screenSizeSpec) {
      const numericSize = extractNumericSize(item);
      if (numericSize !== null) {
        return numericSize; // Return the first valid numeric size found in the array
      }
    }
    return null; // No valid numeric size found in the array
  } else {
    // Handle single string or number input
    return extractNumericSize(screenSizeSpec);
  }
};

/**
 * Determines if a device has dedicated graphics based on its key specifications.
 * @param {object|null|undefined} keySpecs - The key specifications object for the product.
 * @returns {boolean} True if dedicated graphics are likely present, false otherwise.
 */
export const hasDedicatedGraphics = (keySpecs) => {
  if (!keySpecs || typeof keySpecs !== 'object') return false;

  const graphicsCard = keySpecs.dedicatedGraphics;
  const processor = keySpecs.processorOptions;

  if (typeof graphicsCard !== 'string') return false;

  const lowerGraphics = String(graphicsCard).toLowerCase();
  const lowerProcessor = String(processor || '').toLowerCase();

  if ((lowerProcessor.includes('m1') || lowerProcessor.includes('m2') || lowerProcessor.includes('m3') || lowerProcessor.includes('m4')) &&
      (lowerProcessor.includes('pro') || lowerProcessor.includes('max') || lowerProcessor.includes('ultra'))) {
    return true;
  }

  if (lowerGraphics.includes('integrated') ||
      lowerGraphics.includes('intel iris') ||
      lowerGraphics.includes('intel hd graphics') ||
      lowerGraphics.includes('intel uhd graphics') ||
      lowerGraphics.includes('intel graphics') ||
      (lowerGraphics.includes('amd radeon graphics') && !lowerGraphics.includes('rx')) ||
      lowerGraphics.includes('amd vega')) {
    return false;
  }

  if (lowerGraphics.includes('nvidia') || lowerGraphics.includes('geforce') ||
      lowerGraphics.includes('rtx') || lowerGraphics.includes('gtx') ||
      lowerGraphics.includes('quadro') ||
      lowerGraphics.includes('amd radeon rx') ||
      lowerGraphics.includes('amd radeon pro') ||
      lowerGraphics.includes('firepro')) {
    return true;
  }
  return false;
};

/**
 * Parses battery life specification into a number of hours.
 * Assumes input is an integer if it's a number, or null/undefined.
 * @param {number|null|undefined} inputBatterySpec - The battery life specification (expected as integer hours).
 * @returns {number|null} The battery life in hours, or null.
 */
export const parseBatteryLife = (inputBatterySpec) => {
  if (inputBatterySpec === null || inputBatterySpec === undefined) {
    return null;
  }
  if (typeof inputBatterySpec === 'number' && Number.isInteger(inputBatterySpec)) {
    return inputBatterySpec;
  }
  console.warn(`[parseBatteryLife] Expected an integer for battery spec, but received: ${inputBatterySpec} (type: ${typeof inputBatterySpec}). Returning null.`);
  return null;
};

/**
 * Parses smartphone battery life specification into a number of hours.
 * @param {string|number|null|undefined} batterySpec - The battery life specification.
 * @returns {number|null} The battery life in hours, or null if not parsable.
 */
export const parseSmartphoneBatteryLife = (batterySpec) => {
  // For now, uses the same logic as parseBatteryLife for integer inputs.
  // Can be expanded if smartphone battery specs differ (e.g., string "Up to X hours").
  if (batterySpec === null || batterySpec === undefined) return null;
  if (typeof batterySpec === 'number' && Number.isInteger(batterySpec)) {
    return batterySpec;
  }
  // If it's a string, you might add parsing logic here similar to other parsers.
  // For now, if it's not an integer, it will fall through or you can explicitly return null.
  console.warn(`[parseSmartphoneBatteryLife] Unhandled battery spec format: ${batterySpec}. Expected integer or needs string parsing logic.`);
  return null;
};

/*
* Retrieves the DXO score from key specifications.
* Expects keySpecs.dxo to be an integer.
* @param {object|null|undefined} keySpecs - The key specifications object for the product.
* @returns {number|null} The DXO score if it's a valid integer, or null otherwise.
*/
export const getDxoScore = (keySpecs) => {
 if (!keySpecs || typeof keySpecs !== 'object') {
   return null;
 }

 const dxoScore = keySpecs.dxo;

 if (typeof dxoScore === 'number' && Number.isInteger(dxoScore) && dxoScore >= 0) {
   return dxoScore;
 }

 return null; // Return null if dxoScore is not a valid non-negative integer
};

/**
 * Parses RAM specification to get an array of all available numeric RAM options in GB.
 * Input can be a number, a string (e.g., "16", "8,16,32"), or an array of strings (e.g., ["8", "16GB"]).
 * @param {string|string[]|number|null|undefined} ramSpec - The RAM specification(s).
 * @returns {number[]} An array of numeric RAM values in GB, sorted and unique.
 */
export const getNumericRamOptions = (ramSpec) => {
  if (ramSpec === null || ramSpec === undefined) {
    return [];
  }
  const options = new Set();

  const processItem = (item) => {
    let num = null;
    if (typeof item === 'number') {
      num = item;
    } else if (typeof item === 'string') {
      const parsed = parseInt(item.trim(), 10);
      if (!isNaN(parsed)) {
        num = parsed;
      }
    }
    if (num !== null && num > 0 && Number.isFinite(num)) {
      options.add(num);
    }
  };

  if (Array.isArray(ramSpec)) {
    ramSpec.forEach(processItem);
  } else if (typeof ramSpec === 'string') {
    if (ramSpec.includes(',')) {
      ramSpec.split(',').forEach(s => processItem(s.trim()));
    } else {
      processItem(ramSpec);
    }
  } else if (typeof ramSpec === 'number') {
    processItem(ramSpec);
  }
  
  return Array.from(options).sort((a, b) => a - b);
};

/**
 * Parses storage specification to get an array of all available numeric storage options in GB.
 * Input can be a number (GB), a string (e.g., "512GB", "1TB", "256"),
 * a comma-separated string (e.g., "256GB,512GB,1TB"),
 * or an array of such strings/numbers.
 * @param {string|string[]|number|null|undefined} storageSpecInput - The storage specification(s).
 * @returns {number[]} An array of numeric storage values in GB, sorted and unique.
 */
export const getNumericStorageOptions = (storageSpecInput) => {
  if (storageSpecInput === null || storageSpecInput === undefined) {
    return [];
  }
  const options = new Set();

  const processItem = (item) => {
    const numericValueInGB = parseStorage(item); // Uses the updated parseStorage
    if (numericValueInGB !== null && numericValueInGB > 0) {
      options.add(numericValueInGB);
    }
  };

  if (Array.isArray(storageSpecInput)) {
    storageSpecInput.forEach(processItem);
  } else if (typeof storageSpecInput === 'string') {
    // Handles comma-separated strings, e.g., "128,256GB,1TB"
    // Also handles if the string itself is quoted like "\"128\",\"256GB\""
    // by relying on parseStorage to handle individual quoted items.
    storageSpecInput.split(',').forEach(s => processItem(s.trim()));
  } else if (typeof storageSpecInput === 'number') {
    processItem(storageSpecInput); // Assumed to be in GB
  }
  
  return Array.from(options).sort((a, b) => a - b);
};

/**
 * Parses screen size specification to get an array of all available numeric screen size options.
 * Input can be a number, a string (e.g., "15.6", "14 inch"),
 * a comma-separated string (e.g., "13.6,15.3"),
 * or an array of such strings/numbers.
 * @param {string|string[]|number|null|undefined} screenSizeSpecInput - The screen size specification(s).
 * @returns {number[]} An array of numeric screen size values, sorted and unique.
 */
export const getNumericScreenSizeOptions = (screenSizeSpecInput) => {
  if (screenSizeSpecInput === null || screenSizeSpecInput === undefined) {
    return [];
  }
  const options = new Set();

  const processItem = (item) => {
    // Use the existing parseScreenSize to parse an individual item.
    // parseScreenSize is designed to extract a number from a single string/number.
    const numericValue = parseScreenSize(item); // parseScreenSize handles single "14", "15 inch", 14.0
    if (numericValue !== null && numericValue > 0) {
      options.add(numericValue);
    }
  };

  if (Array.isArray(screenSizeSpecInput)) {
    screenSizeSpecInput.forEach(processItem);
  } else if (typeof screenSizeSpecInput === 'string') {
    screenSizeSpecInput.split(',').forEach(s => processItem(s.trim()));
  } else if (typeof screenSizeSpecInput === 'number') {
    processItem(screenSizeSpecInput);
  }

  return Array.from(options).sort((a, b) => a - b);
};
/**
 * Retrieves the mobile screen size from key specifications.
 * Expects keySpecs.screenSize to be an integer or a string that can be parsed to an integer.
 * @param {object|null|undefined} keySpecs - The key specifications object for the product.
 * @returns {number|null} The screen size as an integer, or null otherwise.
 */
export const getMobileScreenSize = (keySpecs) => {
  if (!keySpecs || typeof keySpecs !== 'object' || keySpecs.screenSize === null || keySpecs.screenSize === undefined) {
    return null;
  }

  const screenSizeValue = keySpecs.screenSize;

  if (typeof screenSizeValue === 'number' && !isNaN(screenSizeValue) && screenSizeValue > 0) {
    return screenSizeValue;
  }
  // Attempt to parse if it's a string representation of an integer
  const parsedSize = parseInt(screenSizeValue, 10);
  if (typeof screenSizeValue === 'string' && !isNaN(parsedSize) && Number.isInteger(parsedSize) && parsedSize > 0) {
    return parsedSize;
  }

  return null; // Return null if not a valid positive integer
};
