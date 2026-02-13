// src/hooks/useRecentlyViewed.js
import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'recentlyViewedProducts';
const MAX_ITEMS = 12;

// Only store the fields ProductCard needs — keeps localStorage lean
const extractProductSummary = (product) => ({
  id: product.id,
  productName: product.productName,
  brand: product.brand,
  imageURL: product.imageURL,
  category: product.category,
  preAggregatedCriticScore: product.preAggregatedCriticScore,
  preAggregatedAudienceScore: product.preAggregatedAudienceScore,
});

const readFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('[useRecentlyViewed] Error reading localStorage:', err);
    return [];
  }
};

const writeToStorage = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('[useRecentlyViewed] Error writing localStorage:', err);
  }
};

export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState(() => readFromStorage());

  // Sync across tabs — if another tab updates localStorage, keep this tab in sync
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY) {
        setRecentlyViewed(readFromStorage());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addRecentlyViewed = useCallback((product) => {
    if (!product || !product.id) return;

    setRecentlyViewed((prev) => {
      // Remove duplicate if it already exists
      const filtered = prev.filter((item) => item.id !== product.id);
      // Prepend the new product (most recent first), cap at MAX_ITEMS
      const updated = [extractProductSummary(product), ...filtered].slice(0, MAX_ITEMS);
      writeToStorage(updated);
      return updated;
    });
  }, []);

  return { recentlyViewed, addRecentlyViewed };
};
