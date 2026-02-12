import { supabase } from './supabaseClient';
import { withTimeout, retryOperation } from '../utils/asyncHelpers';

export const processProduct = (p) => ({
  ...p,
  productName: p.product_name,
  imageURL: p.image_url,
  gallery: p.gallery || [],
  keySpecs: p.key_specs,
  description: p.description,
  bestBuySku: p.best_buy_sku,
  aiProsCons: p.ai_pros_cons,
  category: p.categories?.name || 'Unknown',
  criticReviews: p.critic_reviews || [],
  preAggregatedCriticScore: p.pre_aggregated_critic_score,
  totalCriticReviewCount: p.total_critic_review_count,
  preAggregatedAudienceScore: p.pre_aggregated_audience_score,
  totalAudienceReviewCount: p.total_audience_review_count,
});

export const fetchProductBySlug = async (productNameSlug, brandSlug = null) => {
  console.log(`fetchProductBySlug called with slug: ${productNameSlug}, brand: ${brandSlug}`);
  let query = supabase
    .from('products')
    .select('      *,      categories ( name ),       critic_reviews ( * )    ');

  // This is a bit complex because we need to match the slugified name.
  // In a real app, you might have a 'slug' column in the DB.
  // Since we don't, we'll fetch products with a similar name and filter in JS,
  // OR we use a RPC / Postgres function if available.
  // For now, let's assume we can at least filter by name if we know it.

  // Fallback: search by name (this is less efficient but necessary without a slug column)
  const normalizedSlug = productNameSlug.replace(/-/g, '%'); // allow flexible matching
  const { data, error } = await retryOperation(() => withTimeout(query.ilike('product_name', `%${normalizedSlug}%`)));
  if (error) throw error;

  // Find the exact match after slugifying
  const slugify = (text) => text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');

  const found = data.find(p =>
    slugify(p.product_name) === productNameSlug &&
    (!brandSlug || slugify(p.brand) === brandSlug)
  );

  return found ? processProduct(found) : null;
};

export const fetchProductsByCategory = async (categoryName, { limit = 20, offset = 0, brands = [], minPrice, maxPrice } = {}) => {
  let query = supabase
    .from('products')
    .select('      *,      categories!inner ( name ),       critic_reviews ( * )    ', { count: 'exact' })
    .eq('categories.name', categoryName)
    .range(offset, offset + limit - 1);

  if (brands.length > 0) {
    query = query.in('brand', brands);
  }

  // Note: price filtering depends on how key_specs is stored.
  // If it's JSONB, we might need special syntax.
  // Assuming it's simple for now or handled by a computed column.
  // If we can't easily filter price in SQL, we might have to do it in JS for now,
  // but that's still better than fetching EVERYTHING.

  const { data, error, count } = await retryOperation(() => withTimeout(query));
  if (error) throw error;

  let products = data.map(processProduct);

  // Manual price filtering if needed (if not possible in SQL)
  if (minPrice !== undefined || maxPrice !== undefined) {
    products = products.filter(p => {
      const price = p.keySpecs?.retailPrice;
      if (typeof price !== 'number') return true;
      if (minPrice !== undefined && price < minPrice) return false;
      if (maxPrice !== undefined && price > maxPrice) return false;
      return true;
    });
  }

  return { products, totalCount: count };
};

export const searchProducts = async (searchTerm, { limit = 20 } = {}) => {
  if (!searchTerm) return [];

  const { data, error } = await supabase
    .from('products')
    .select('      *,      categories ( name ),       critic_reviews ( * )    ')
    .or(`product_name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%`)
    .limit(limit);

  if (error) throw error;
  return data.map(processProduct);
};

export const fetchFeaturedProducts = async (limit = 12) => {
  const { data, error } = await retryOperation(() => withTimeout(supabase
    .from('products')
    .select('      *,      categories ( name ),       critic_reviews ( * )    ')
    .limit(limit))); // In a real app, order by 'featured' or random

  if (error) throw error;
  return data.map(processProduct);
};

export const fetchBrandsByCategory = async (categoryName) => {
  const { data, error } = await retryOperation(() => withTimeout(supabase
    .from('products')
    .select('brand, categories!inner(name)')
    .eq('categories.name', categoryName)));

  if (error) throw error;
  return Array.from(new Set(data.map(p => p.brand).filter(Boolean))).sort();
};

export const fetchAllProducts = async () => {
  const { data, error } = await retryOperation(() => withTimeout(supabase
    .from('products')
    .select('      *,      categories ( name ),       critic_reviews ( * )    ')));

  if (error) throw error;
  return data.map(processProduct);
};
