import { supabase } from './supabaseClient';
import { withTimeout, retryOperation } from '../utils/asyncHelpers';
import { getStartingPrice } from '../utils/productUtils';

export const processProduct = (p) => {
  try {
    return {
      ...p,
      productName: p.product_name,
      imageURL: p.image_url,
      gallery: p.gallery || [],
      keySpecs: p.key_specs,
      description: p.description,
      bestBuySku: p.best_buy_sku,
      aiProsCons: p.ai_pros_cons,
      startingPrice: getStartingPrice(p.key_specs?.retailPrice),
      category: p.categories?.name || 'Unknown',
      criticReviews: p.critic_reviews || [],
      preAggregatedCriticScore: p.pre_aggregated_critic_score,
      totalCriticReviewCount: p.total_critic_review_count,
      preAggregatedAudienceScore: p.pre_aggregated_audience_score,
      totalAudienceReviewCount: p.total_audience_review_count,
    };
  } catch (err) {
    console.error('Error in processProduct:', err, p);
    return null;
  }
};

export const fetchProductBySlug = async (productNameSlug, brandSlug = null) => {
  console.log(`fetchProductBySlug called with slug: ${productNameSlug}, brand: ${brandSlug}`);
  let query = supabase
    .from('products')
    .select('      *,      categories ( name ),       critic_reviews ( * )    ');

  // Fallback: search by name
  const normalizedSlug = productNameSlug.replace(/-/g, '%');
  const { data, error } = await retryOperation(() => withTimeout(query.ilike('product_name', `%${normalizedSlug}%`)));
  if (error) throw error;

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

  const { data, error, count } = await retryOperation(() => withTimeout(query));
  if (error) throw error;

  let products = data.map(processProduct).filter(p => p !== null);

  if (minPrice !== undefined || maxPrice !== undefined) {
    products = products.filter(p => {
      const price = p.startingPrice;
      if (price === null) return true;
      if (minPrice !== undefined && price < minPrice) return false;
      if (maxPrice !== undefined && price > maxPrice) return false;
      return true;
    });
  }

  return { products, totalCount: count };
};

export const searchProducts = async (searchTerm, { limit = 40 } = {}) => {
  if (!searchTerm || typeof searchTerm !== 'string') return [];

  const term = searchTerm.trim().toLowerCase();
  if (term.length === 0) return [];

  console.log(`[Search] Initiating advanced search for: "${term}"`);

  // 1. Defining Smart Category Mappings (Expansion)
  const categoryTerms = {
    'computer': ['Laptops'],
    'laptop': ['Laptops'],
    'notebook': ['Laptops'],
    'pc': ['Laptops'],
    'phone': ['Smartphones'],
    'smartphone': ['Smartphones'],
    'mobile': ['Smartphones'],
    'tv': ['TVs'],
    'television': ['TVs'],
    'screen': ['TVs'],
    'watch': ['Smartwatches'],
    'smartwatch': ['Smartwatches'],
    'wrist': ['Smartwatches'],
    'health': ['Smartwatches', 'Smartphones']
  };

  let relevantCategories = [];
  for (const [key, cats] of Object.entries(categoryTerms)) {
    if (term.includes(key)) {
      relevantCategories = [...new Set([...relevantCategories, ...cats])];
    }
  }

  try {
    // 2. Building Search Queries
    let directMatchQuery = supabase
      .from('products')
      .select('*, categories(name), critic_reviews(*)')
      .or(`product_name.ilike.%${term}%,brand.ilike.%${term}%,description.ilike.%${term}%`);

    let categoryQuery = null;
    if (relevantCategories.length > 0) {
      categoryQuery = supabase
        .from('products')
        .select('*, categories!inner(name), critic_reviews(*)')
        .in('categories.name', relevantCategories);
    }

    // 3. Executing Queries Parallelly
    const promises = [retryOperation(() => withTimeout(directMatchQuery.limit(limit)))];
    if (categoryQuery) {
      promises.push(retryOperation(() => withTimeout(categoryQuery.limit(limit))));
    }

    const results = await Promise.all(promises);

    // 4. Collecting and Deduplicating Results
    const uniqueMap = new Map();
    results.forEach((res, idx) => {
      console.log(`[Search] Query ${idx} found ${res.data?.length || 0} items`);
      if (res.error) console.error(`[Search] Query ${idx} error:`, res.error);
      if (res.data) {
        res.data.forEach(p => uniqueMap.set(p.id, p));
      }
    });

    let finalResults = Array.from(uniqueMap.values());

    // 5. Broadening Fallback
    if (finalResults.length === 0) {
      console.log(`[Search] No direct results for "${term}", broadening keywords...`);
      const keywords = term.split(/\s+/).filter(k => k.length > 2);
      if (keywords.length > 0) {
        const broadQuery = supabase
          .from('products')
          .select('*, categories(name), critic_reviews(*)')
          .or(keywords.map(k => `product_name.ilike.%${k}%,brand.ilike.%${k}%`).join(','))
          .limit(limit);

        const { data: broadData, error: broadError } = await retryOperation(() => withTimeout(broadQuery));
        if (broadError) console.error(`[Search] Broad fallback error:`, broadError);
        if (broadData) {
          console.log(`[Search] Broad fallback found ${broadData.length} items`);
          broadData.forEach(p => uniqueMap.set(p.id, p));
          finalResults = Array.from(uniqueMap.values());
        }
      }
    }

    // 6. Processing and Final Sort
    const processed = finalResults.map(processProduct).filter(p => p !== null);
    console.log(`[Search] Final results count: ${processed.length}`);

    return processed
      .sort((a, b) => {
        const aName = (a.productName || '').toLowerCase();
        const bName = (b.productName || '').toLowerCase();
        const aMatch = aName.includes(term);
        const bMatch = bName.includes(term);
        // Boost exact matches or name matches to the top
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;

        // Secondary sort by critic score
        const aScore = a.preAggregatedCriticScore || 0;
        const bScore = b.preAggregatedCriticScore || 0;
        return bScore - aScore;
      })
      .slice(0, limit);

  } catch (err) {
    console.error("[Search] Critical search error:", err);
    return [];
  }
};

export const fetchFeaturedProducts = async (limit = 12) => {
  const { data, error } = await retryOperation(() => withTimeout(supabase
    .from('products')
    .select('      *,      categories ( name ),       critic_reviews ( * )    ')
    .limit(limit)));

  if (error) throw error;
  return data.map(processProduct).filter(p => p !== null);
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
  return data.map(processProduct).filter(p => p !== null);
};
