/**
 * Extracts the starting retail price from the retailPrice field in keySpecs.
 * The retailPrice field can be a number, an array of numbers, or an array of objects with a price property.
 * @param {number|number[]|object[]|null|undefined} retailPriceData - The retail price data from keySpecs.
 * @returns {number|null} The starting price (minimum price found), or null if not found.
 */
export const getStartingPrice = (retailPriceData) => {
    if (typeof retailPriceData === 'number') {
        return retailPriceData;
    }

    if (typeof retailPriceData === 'string') {
        const num = parseFloat(retailPriceData.replace(/[^\d.-]/g, ''));
        return isNaN(num) ? null : num;
    }

    if (Array.isArray(retailPriceData) && retailPriceData.length > 0) {
        const prices = retailPriceData
            .map(item => {
                if (typeof item === 'number') {
                    return item;
                }
                if (typeof item === 'object' && item !== null && typeof item.price === 'number') {
                    return item.price;
                }
                return Infinity;
            })
            .filter(price => price !== Infinity && typeof price === 'number' && !isNaN(price));

        if (prices.length > 0) {
            return Math.min(...prices);
        }
    }

    return null;
};
