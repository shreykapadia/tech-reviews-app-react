import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../services/supabaseClient';

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const defaultKeySpecs = `{
  "screenSize": "",
  "processor": "",
  "ram": "",
  "storage": "",
  "retailPrice": 0
}`;

const emptyCategoryForm = {
  name: '',
  slug: '',
  iconImageUrl: '',
  ariaLabel: '',
};

const emptyProductForm = {
  productName: '',
  brand: '',
  categoryId: '',
  imageURL: '',
  description: '',
  bestBuySku: '',
  keySpecsText: defaultKeySpecs,
  prosText: '',
  consText: '',
};

const emptyCriticReviewForm = {
  publication: '',
  score: '',
  scale: '/10',
  link: '',
  summary: '',
};

const keySpecTemplatesByCategory = {
  smartphones: {
    operatingSystem: '',
    screenSize: '',
    resolution: '',
    displayTech: '',
    refreshRate: '',
    processor: '',
    ram: '',
    storage: '',
    cameraSpecs_MP: '',
    batteryCapacity: '',
    ratedBatteryLife: '',
    retailPrice: 0,
  },
  laptops: {
    operatingSystem: '',
    formFactor: '',
    screenSize: '',
    resolution: '',
    displayTech: '',
    refreshRate: '',
    touchScreen: '',
    processor: '',
    processorOptions: '',
    ram: '',
    storage: '',
    dedicatedGraphics: '',
    batteryCapacity_Wh: '',
    retailPrice: 0,
  },
  tvs: {
    screenSize: '',
    resolution: '',
    displayTech: '',
    refreshRate: '',
    displayPanelType: '',
    displayBacklighting: '',
    peakBrightness_nits: '',
    processor: '',
    smartTV: '',
    audio: '',
    retailPrice: 0,
  },
  default: {
    screenSize: '',
    processor: '',
    ram: '',
    storage: '',
    retailPrice: 0,
  },
};

const keySpecFieldLabels = {
  operatingSystem: 'Operating System',
  screenSize: 'Screen Size',
  resolution: 'Resolution',
  displayTech: 'Display Tech',
  refreshRate: 'Refresh Rate',
  processor: 'Processor',
  ram: 'RAM',
  storage: 'Storage',
  cameraSpecs_MP: 'Camera Specs (MP)',
  batteryCapacity: 'Battery Capacity (mAh)',
  ratedBatteryLife: 'Rated Battery Life',
  retailPrice: 'Retail Price',
  formFactor: 'Form Factor',
  touchScreen: 'Touch Screen',
  processorOptions: 'Processor Options',
  dedicatedGraphics: 'Dedicated Graphics',
  batteryCapacity_Wh: 'Battery Capacity (Wh)',
  displayPanelType: 'Display Panel Type',
  displayBacklighting: 'Display Backlighting',
  peakBrightness_nits: 'Peak Brightness (nits)',
  smartTV: 'Smart TV Platform',
  audio: 'Audio',
};

const LIST_PAGE_SIZE = 8;
const REVIEW_PAGE_SIZE = 8;

const getCategoryTemplateKey = (categoryName = '') => {
  const normalized = String(categoryName).toLowerCase();
  if (normalized.includes('smartphone')) return 'smartphones';
  if (normalized.includes('laptop')) return 'laptops';
  if (normalized === 'tv' || normalized.includes('television') || normalized.includes('tvs')) return 'tvs';
  return 'default';
};

const getKeySpecsTemplateObjectForCategory = (categoryName = '') => {
  const templateKey = getCategoryTemplateKey(categoryName);
  return keySpecTemplatesByCategory[templateKey] || keySpecTemplatesByCategory.default;
};

const getKeySpecsTemplateForCategory = (categoryName = '') =>
  JSON.stringify(getKeySpecsTemplateObjectForCategory(categoryName), null, 2);

const parseNumber = (value, fallback = null) => {
  if (value === '' || value === null || value === undefined) return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const safeParseJson = (text, fallback = {}) => {
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return { value: parsed, error: null };
    }
    return { value: fallback, error: 'Must be a JSON object.' };
  } catch (error) {
    return { value: fallback, error: error.message };
  }
};

const adminSelectClasses =
  'mt-1 w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-800 shadow-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition';

const adminInputClasses =
  'mt-1 w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-800 shadow-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition';

const paginate = (items, page, pageSize) => {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
};

function AdminPage() {
  const [activeTab, setActiveTab] = useState('products');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [status, setStatus] = useState({ type: '', message: '' });

  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [categoryFormErrors, setCategoryFormErrors] = useState({});
  const [slugTouched, setSlugTouched] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);

  const [productForm, setProductForm] = useState(emptyProductForm);
  const [productFormErrors, setProductFormErrors] = useState({});
  const [savingProduct, setSavingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);

  const [criticReviews, setCriticReviews] = useState([]);
  const [loadingCriticReviews, setLoadingCriticReviews] = useState(false);
  const [criticReviewCategoryId, setCriticReviewCategoryId] = useState('');
  const [criticReviewProductSearch, setCriticReviewProductSearch] = useState('');
  const [criticReviewProductId, setCriticReviewProductId] = useState('');
  const [criticReviewForm, setCriticReviewForm] = useState(emptyCriticReviewForm);
  const [criticReviewFormErrors, setCriticReviewFormErrors] = useState({});
  const [editingCriticReviewId, setEditingCriticReviewId] = useState(null);
  const [savingCriticReview, setSavingCriticReview] = useState(false);
  const [deletingCriticReviewId, setDeletingCriticReviewId] = useState(null);

  const [categoryListSearch, setCategoryListSearch] = useState('');
  const [categoryPage, setCategoryPage] = useState(1);
  const [productListSearch, setProductListSearch] = useState('');
  const [productPage, setProductPage] = useState(1);
  const [criticReviewListSearch, setCriticReviewListSearch] = useState('');
  const [criticReviewPage, setCriticReviewPage] = useState(1);

  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach((cat) => map.set(String(cat.id), cat));
    return map;
  }, [categories]);

  const getCategoryNameById = (categoryId) => {
    if (!categoryId) return '';
    return categoryMap.get(String(categoryId))?.name || '';
  };

  const parsedKeySpecsResult = useMemo(
    () => safeParseJson(productForm.keySpecsText, {}),
    [productForm.keySpecsText]
  );

  const currentProductCategoryName = getCategoryNameById(productForm.categoryId);
  const currentKeySpecTemplate = useMemo(
    () => getKeySpecsTemplateObjectForCategory(currentProductCategoryName),
    [currentProductCategoryName]
  );

  const mergedKeySpecsFields = useMemo(() => {
    const parsed = parsedKeySpecsResult.value || {};
    return { ...currentKeySpecTemplate, ...parsed };
  }, [currentKeySpecTemplate, parsedKeySpecsResult.value]);

  const criticReviewProducts = useMemo(() => {
    if (!criticReviewCategoryId) return [];
    return products.filter((product) => String(product.category_id) === String(criticReviewCategoryId));
  }, [products, criticReviewCategoryId]);

  const filteredCriticReviewProducts = useMemo(() => {
    const term = criticReviewProductSearch.trim().toLowerCase();
    if (!term) return criticReviewProducts;
    return criticReviewProducts.filter((product) =>
      `${product.product_name} ${product.brand}`.toLowerCase().includes(term)
    );
  }, [criticReviewProducts, criticReviewProductSearch]);

  const filteredCategories = useMemo(() => {
    const term = categoryListSearch.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((category) => `${category.name} ${category.slug}`.toLowerCase().includes(term));
  }, [categories, categoryListSearch]);

  const categoryPageCount = Math.max(1, Math.ceil(filteredCategories.length / LIST_PAGE_SIZE));
  const pagedCategories = useMemo(() => paginate(filteredCategories, categoryPage, LIST_PAGE_SIZE), [filteredCategories, categoryPage]);

  const filteredProducts = useMemo(() => {
    const term = productListSearch.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) =>
      `${product.product_name} ${product.brand} ${product.categories?.name || ''}`.toLowerCase().includes(term)
    );
  }, [products, productListSearch]);

  const productPageCount = Math.max(1, Math.ceil(filteredProducts.length / LIST_PAGE_SIZE));
  const pagedProducts = useMemo(() => paginate(filteredProducts, productPage, LIST_PAGE_SIZE), [filteredProducts, productPage]);

  const filteredCriticReviews = useMemo(() => {
    const term = criticReviewListSearch.trim().toLowerCase();
    if (!term) return criticReviews;
    return criticReviews.filter((review) =>
      `${review.publication} ${review.summary || ''} ${review.scale || ''}`.toLowerCase().includes(term)
    );
  }, [criticReviews, criticReviewListSearch]);

  const criticReviewPageCount = Math.max(1, Math.ceil(filteredCriticReviews.length / REVIEW_PAGE_SIZE));
  const pagedCriticReviews = useMemo(
    () => paginate(filteredCriticReviews, criticReviewPage, REVIEW_PAGE_SIZE),
    [filteredCriticReviews, criticReviewPage]
  );

  const loadAdminData = async () => {
    setLoadingData(true);

    const [categoriesResponse, productsResponse] = await Promise.all([
      supabase
        .from('categories')
        .select('id, name, slug, icon_image_url, aria_label')
        .order('name', { ascending: true }),
      supabase
        .from('products')
        .select(`
          id,
          product_name,
          brand,
          category_id,
          image_url,
          description,
          best_buy_sku,
          key_specs,
          ai_pros_cons,
          categories(name)
        `)
        .order('id', { ascending: false })
        .limit(1000),
    ]);

    if (categoriesResponse.error) {
      setStatus({ type: 'error', message: `Failed to load categories: ${categoriesResponse.error.message}` });
    } else {
      setCategories(categoriesResponse.data || []);
    }

    if (productsResponse.error) {
      setStatus({ type: 'error', message: `Failed to load products: ${productsResponse.error.message}` });
    } else {
      setProducts(productsResponse.data || []);
    }

    setLoadingData(false);
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    setCategoryPage(1);
  }, [categoryListSearch]);

  useEffect(() => {
    if (categoryPage > categoryPageCount) setCategoryPage(categoryPageCount);
  }, [categoryPage, categoryPageCount]);

  useEffect(() => {
    setProductPage(1);
  }, [productListSearch]);

  useEffect(() => {
    if (productPage > productPageCount) setProductPage(productPageCount);
  }, [productPage, productPageCount]);

  useEffect(() => {
    setCriticReviewPage(1);
  }, [criticReviewListSearch, criticReviewProductId]);

  useEffect(() => {
    if (criticReviewPage > criticReviewPageCount) setCriticReviewPage(criticReviewPageCount);
  }, [criticReviewPage, criticReviewPageCount]);

  useEffect(() => {
    if (!productForm.categoryId && categories.length > 0) {
      const nextCategoryId = String(categories[0].id);
      const nextCategoryName = getCategoryNameById(nextCategoryId);
      setProductForm((prev) => ({
        ...prev,
        categoryId: nextCategoryId,
        keySpecsText: editingProductId ? prev.keySpecsText : getKeySpecsTemplateForCategory(nextCategoryName),
      }));
    }
  }, [categories, productForm.categoryId, editingProductId]);

  useEffect(() => {
    if (editingProductId) {
      const editingProduct = products.find((product) => String(product.id) === String(editingProductId));
      if (editingProduct) {
        setCriticReviewCategoryId(editingProduct.category_id ? String(editingProduct.category_id) : '');
        setCriticReviewProductId(String(editingProduct.id));
      }
      return;
    }
    if (!criticReviewCategoryId && categories.length > 0) {
      setCriticReviewCategoryId(String(categories[0].id));
    }
  }, [editingProductId, products, criticReviewCategoryId, categories]);

  useEffect(() => {
    if (!criticReviewCategoryId) {
      setCriticReviewProductId('');
      setCriticReviews([]);
      return;
    }

    if (filteredCriticReviewProducts.length === 0) {
      setCriticReviewProductId('');
      setCriticReviews([]);
      return;
    }

    const selectedStillVisible = filteredCriticReviewProducts.some(
      (product) => String(product.id) === String(criticReviewProductId)
    );
    if (!selectedStillVisible) {
      setCriticReviewProductId(String(filteredCriticReviewProducts[0].id));
      resetCriticReviewForm();
    }
  }, [criticReviewCategoryId, filteredCriticReviewProducts, criticReviewProductId]);

  useEffect(() => {
    if (criticReviewProductId) {
      loadCriticReviews(criticReviewProductId);
    } else {
      setCriticReviews([]);
    }
  }, [criticReviewProductId]);

  const resetCategoryForm = () => {
    setCategoryForm(emptyCategoryForm);
    setCategoryFormErrors({});
    setSlugTouched(false);
    setEditingCategoryId(null);
  };

  const resetCriticReviewForm = () => {
    setCriticReviewForm(emptyCriticReviewForm);
    setCriticReviewFormErrors({});
    setEditingCriticReviewId(null);
  };

  const resetProductForm = () => {
    const firstCategoryId = categories[0]?.id ? String(categories[0].id) : '';
    const firstCategoryName = getCategoryNameById(firstCategoryId);
    setProductForm({
      ...emptyProductForm,
      categoryId: firstCategoryId,
      keySpecsText: getKeySpecsTemplateForCategory(firstCategoryName),
    });
    setProductFormErrors({});
    setEditingProductId(null);
  };

  const loadCriticReviews = async (productId) => {
    if (!productId) {
      setCriticReviews([]);
      return;
    }

    setLoadingCriticReviews(true);
    const { data, error } = await supabase
      .from('critic_reviews')
      .select('id, publication, score, scale, link, summary, product_id')
      .eq('product_id', productId)
      .order('id', { ascending: false });

    if (error) {
      setStatus({ type: 'error', message: `Failed to load critic reviews: ${error.message}` });
      setCriticReviews([]);
    } else {
      setCriticReviews(data || []);
    }
    setLoadingCriticReviews(false);
  };

  const updateKeySpecField = (key, nextValue) => {
    const { value: parsed } = safeParseJson(productForm.keySpecsText, {});
    const updated = { ...parsed, [key]: key === 'retailPrice' ? Number(nextValue || 0) : nextValue };
    setProductForm((prev) => ({ ...prev, keySpecsText: JSON.stringify(updated, null, 2) }));
  };

  const buildProductPayload = () => {
    const parsedKeySpecsResultLocal = safeParseJson(productForm.keySpecsText, {});
    if (parsedKeySpecsResultLocal.error) {
      throw new Error(parsedKeySpecsResultLocal.error);
    }

    const pros = productForm.prosText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const cons = productForm.consText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    return {
      product_name: productForm.productName.trim(),
      brand: productForm.brand.trim(),
      category_id: productForm.categoryId || null,
      image_url: productForm.imageURL.trim() || null,
      description: productForm.description.trim() || null,
      best_buy_sku: productForm.bestBuySku.trim() || null,
      key_specs: parsedKeySpecsResultLocal.value,
      ai_pros_cons: { pros, cons },
    };
  };

  const validateCategoryForm = () => {
    const errors = {};
    if (!categoryForm.name.trim()) errors.name = 'Name is required.';
    const computedSlug = slugify(categoryForm.slug || categoryForm.name);
    if (!computedSlug) errors.slug = 'Slug is required.';
    if (categoryForm.slug && !/^[a-z0-9-]+$/.test(categoryForm.slug)) {
      errors.slug = 'Slug should use lowercase letters, numbers, and hyphens only.';
    }
    return errors;
  };

  const validateProductForm = () => {
    const errors = {};
    if (!productForm.productName.trim()) errors.productName = 'Product name is required.';
    if (!productForm.brand.trim()) errors.brand = 'Brand is required.';
    if (!productForm.categoryId) errors.categoryId = 'Category is required.';

    const parsed = safeParseJson(productForm.keySpecsText, {});
    if (parsed.error) {
      errors.keySpecsText = `Invalid JSON: ${parsed.error}`;
    }

    return errors;
  };

  const validateCriticReviewForm = () => {
    const errors = {};
    if (!criticReviewProductId) errors.product = 'Select a product.';
    if (!criticReviewForm.publication.trim()) errors.publication = 'Publication is required.';
    if (parseNumber(criticReviewForm.score) === null) errors.score = 'Score must be a valid number.';
    if (!criticReviewForm.scale.trim()) errors.scale = 'Scale is required.';
    return errors;
  };

  const onCategoryNameChange = (value) => {
    setCategoryForm((prev) => ({
      ...prev,
      name: value,
      slug: slugTouched ? prev.slug : slugify(value),
    }));
  };

  const handleSaveCategory = async (event) => {
    event.preventDefault();
    const errors = validateCategoryForm();
    setCategoryFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSavingCategory(true);
    setStatus({ type: '', message: '' });

    const payload = {
      name: categoryForm.name.trim(),
      slug: slugify(categoryForm.slug || categoryForm.name),
      icon_image_url: categoryForm.iconImageUrl.trim() || null,
      aria_label: categoryForm.ariaLabel.trim() || `${categoryForm.name.trim()} category`,
    };

    const response = editingCategoryId
      ? await supabase.from('categories').update(payload).eq('id', editingCategoryId)
      : await supabase.from('categories').insert(payload);

    if (response.error) {
      setStatus({
        type: 'error',
        message: `Could not ${editingCategoryId ? 'update' : 'create'} category: ${response.error.message}`,
      });
      setSavingCategory(false);
      return;
    }

    setStatus({
      type: 'success',
      message: `Category ${editingCategoryId ? 'updated' : 'created'} successfully.`,
    });
    resetCategoryForm();
    setSavingCategory(false);
    await loadAdminData();
  };

  const handleSaveProduct = async (event) => {
    event.preventDefault();
    const errors = validateProductForm();
    setProductFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSavingProduct(true);
    setStatus({ type: '', message: '' });

    try {
      let payload;
      try {
        payload = buildProductPayload();
      } catch (parseError) {
        setProductFormErrors({ keySpecsText: `Invalid JSON: ${parseError.message}` });
        return;
      }

      const response = editingProductId
        ? await supabase.from('products').update(payload).eq('id', editingProductId)
        : await supabase.from('products').insert(payload).select('id').single();

      if (response.error) {
        setStatus({
          type: 'error',
          message: `Could not ${editingProductId ? 'update' : 'create'} product: ${response.error.message}`,
        });
        return;
      }

      if (!editingProductId && response.data?.id) {
        setCriticReviewCategoryId(productForm.categoryId ? String(productForm.categoryId) : '');
        setCriticReviewProductId(String(response.data.id));
        setActiveTab('critic-reviews');
        setStatus({
          type: 'success',
          message: 'Product created successfully. You can now add critic reviews in the Critic Reviews tab.',
        });
      } else {
        setStatus({
          type: 'success',
          message: `Product ${editingProductId ? 'updated' : 'created'} successfully.`,
        });
      }

      resetProductForm();
      await loadAdminData();
    } catch (error) {
      setStatus({
        type: 'error',
        message: `Could not ${editingProductId ? 'update' : 'create'} product: ${
          error instanceof Error ? error.message : 'Unexpected error while saving.'
        }`,
      });
    } finally {
      setSavingProduct(false);
    }
  };

  const startCategoryEdit = (category) => {
    setActiveTab('categories');
    setEditingCategoryId(category.id);
    setSlugTouched(true);
    setCategoryFormErrors({});
    setCategoryForm({
      name: category.name || '',
      slug: category.slug || '',
      iconImageUrl: category.icon_image_url || '',
      ariaLabel: category.aria_label || '',
    });
    setStatus({ type: '', message: '' });
  };

  const startProductEdit = (product) => {
    setActiveTab('products');
    setEditingProductId(product.id);
    setCriticReviewCategoryId(product.category_id ? String(product.category_id) : '');
    setCriticReviewProductId(String(product.id));
    setProductFormErrors({});
    resetCriticReviewForm();
    setProductForm({
      productName: product.product_name || '',
      brand: product.brand || '',
      categoryId: product.category_id ? String(product.category_id) : (categories[0]?.id ? String(categories[0].id) : ''),
      imageURL: product.image_url || '',
      description: product.description || '',
      bestBuySku: product.best_buy_sku || '',
      keySpecsText: JSON.stringify(product.key_specs || {}, null, 2),
      prosText: (product.ai_pros_cons?.pros || []).join('\n'),
      consText: (product.ai_pros_cons?.cons || []).join('\n'),
    });
    setStatus({ type: '', message: '' });
  };

  const duplicateProductToForm = (product) => {
    setActiveTab('products');
    setEditingProductId(null);
    setProductFormErrors({});
    setProductForm({
      productName: `${product.product_name || ''} Copy`.trim(),
      brand: product.brand || '',
      categoryId: product.category_id ? String(product.category_id) : (categories[0]?.id ? String(categories[0].id) : ''),
      imageURL: product.image_url || '',
      description: product.description || '',
      bestBuySku: '',
      keySpecsText: JSON.stringify(product.key_specs || {}, null, 2),
      prosText: (product.ai_pros_cons?.pros || []).join('\n'),
      consText: (product.ai_pros_cons?.cons || []).join('\n'),
    });
    setStatus({ type: 'success', message: 'Product duplicated into form. Update fields and click Create Product.' });
  };

  const handleSaveCriticReview = async (event) => {
    event.preventDefault();
    const errors = validateCriticReviewForm();
    setCriticReviewFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSavingCriticReview(true);
    setStatus({ type: '', message: '' });

    const payload = {
      product_id: Number(criticReviewProductId),
      publication: criticReviewForm.publication.trim(),
      score: parseNumber(criticReviewForm.score),
      scale: criticReviewForm.scale.trim(),
      link: criticReviewForm.link.trim() || null,
      summary: criticReviewForm.summary.trim() || null,
    };

    const response = editingCriticReviewId
      ? await supabase.from('critic_reviews').update(payload).eq('id', editingCriticReviewId)
      : await supabase.from('critic_reviews').insert(payload);

    if (response.error) {
      setStatus({
        type: 'error',
        message: `Could not ${editingCriticReviewId ? 'update' : 'create'} critic review: ${response.error.message}`,
      });
      setSavingCriticReview(false);
      return;
    }

    setStatus({
      type: 'success',
      message: `Critic review ${editingCriticReviewId ? 'updated' : 'created'} successfully.`,
    });
    resetCriticReviewForm();
    setSavingCriticReview(false);
    await loadCriticReviews(criticReviewProductId);
    await loadAdminData();
  };

  const startCriticReviewEdit = (review) => {
    setEditingCriticReviewId(review.id);
    setCriticReviewFormErrors({});
    setCriticReviewForm({
      publication: review.publication || '',
      score: review.score ?? '',
      scale: review.scale || '/10',
      link: review.link || '',
      summary: review.summary || '',
    });
  };

  const handleDeleteCriticReview = async (review) => {
    const ok = window.confirm(`Delete critic review from "${review.publication}"?`);
    if (!ok) return;

    setDeletingCriticReviewId(review.id);
    setStatus({ type: '', message: '' });

    const { error } = await supabase.from('critic_reviews').delete().eq('id', review.id);
    if (error) {
      setStatus({
        type: 'error',
        message: `Could not delete critic review: ${error.message}`,
      });
      setDeletingCriticReviewId(null);
      return;
    }

    if (editingCriticReviewId === review.id) {
      resetCriticReviewForm();
    }
    setStatus({ type: 'success', message: 'Critic review deleted successfully.' });
    setDeletingCriticReviewId(null);
    await loadCriticReviews(criticReviewProductId);
    await loadAdminData();
  };

  const handleDeleteCategory = async (category) => {
    const ok = window.confirm(`Delete category "${category.name}"? This cannot be undone.`);
    if (!ok) return;

    setDeletingCategoryId(category.id);
    setStatus({ type: '', message: '' });

    const { error } = await supabase.from('categories').delete().eq('id', category.id);
    if (error) {
      setStatus({
        type: 'error',
        message: `Could not delete category: ${error.message}`,
      });
      setDeletingCategoryId(null);
      return;
    }

    if (editingCategoryId === category.id) {
      resetCategoryForm();
    }
    setStatus({ type: 'success', message: 'Category deleted successfully.' });
    setDeletingCategoryId(null);
    await loadAdminData();
  };

  const handleDeleteProduct = async (product) => {
    const ok = window.confirm(`Delete product "${product.product_name}"? This cannot be undone.`);
    if (!ok) return;

    setDeletingProductId(product.id);
    setStatus({ type: '', message: '' });

    const { error } = await supabase.from('products').delete().eq('id', product.id);
    if (error) {
      setStatus({
        type: 'error',
        message: `Could not delete product: ${error.message}`,
      });
      setDeletingProductId(null);
      return;
    }

    if (editingProductId === product.id) {
      resetProductForm();
    }
    setStatus({ type: 'success', message: 'Product deleted successfully.' });
    setDeletingProductId(null);
    await loadAdminData();
  };

  return (
    <main className="container mx-auto px-4 py-10 mt-16 md:mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-text font-serif">Admin Portal</h1>
          <p className="text-slate-600 mt-2">Phase 1: schema forms, search/pagination, validation, and duplicate workflows.</p>
        </div>

        {status.message && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 ${
              status.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            {status.message}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white/90 backdrop-blur-sm border border-white/80 rounded-2xl shadow-[0_20px_44px_rgba(8,38,67,0.12)] p-5">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    activeTab === 'products' ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Manage Products
                </button>
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    activeTab === 'categories' ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Manage Categories
                </button>
                <button
                  onClick={() => setActiveTab('critic-reviews')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    activeTab === 'critic-reviews' ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Manage Critic Reviews
                </button>
              </div>
            </div>

            {activeTab === 'categories' && (
              <section className="bg-white/90 backdrop-blur-sm border border-white/80 rounded-2xl shadow-[0_20px_44px_rgba(8,38,67,0.12)] p-6">
                <h2 className="text-2xl font-bold font-serif text-brand-text mb-4">
                  {editingCategoryId ? 'Edit Category' : 'Create Category'}
                </h2>
                <form onSubmit={handleSaveCategory} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="text-sm text-slate-700">
                    Name
                    <input
                      required
                      value={categoryForm.name}
                      onChange={(e) => onCategoryNameChange(e.target.value)}
                      className={adminInputClasses}
                      placeholder="Smartphones"
                    />
                    {categoryFormErrors.name && <p className="text-xs text-red-600 mt-1">{categoryFormErrors.name}</p>}
                  </label>
                  <label className="text-sm text-slate-700">
                    Slug
                    <input
                      required
                      value={categoryForm.slug}
                      onChange={(e) => {
                        setSlugTouched(true);
                        setCategoryForm((prev) => ({ ...prev, slug: e.target.value }));
                      }}
                      className={adminInputClasses}
                      placeholder="smartphones"
                    />
                    {categoryFormErrors.slug && <p className="text-xs text-red-600 mt-1">{categoryFormErrors.slug}</p>}
                  </label>
                  <label className="text-sm text-slate-700 md:col-span-2">
                    Icon Image URL
                    <input
                      value={categoryForm.iconImageUrl}
                      onChange={(e) => setCategoryForm((prev) => ({ ...prev, iconImageUrl: e.target.value }))}
                      className={adminInputClasses}
                      placeholder="https://..."
                    />
                  </label>
                  <label className="text-sm text-slate-700 md:col-span-2">
                    ARIA Label
                    <input
                      value={categoryForm.ariaLabel}
                      onChange={(e) => setCategoryForm((prev) => ({ ...prev, ariaLabel: e.target.value }))}
                      className={adminInputClasses}
                      placeholder="Browse smartphone products"
                    />
                  </label>
                  <div className="md:col-span-2 flex gap-3">
                    <button
                      type="submit"
                      disabled={savingCategory}
                      className="px-5 py-2.5 rounded-full bg-brand-primary text-white font-semibold hover:bg-brand-primary-dark disabled:opacity-60"
                    >
                      {savingCategory ? 'Saving...' : editingCategoryId ? 'Save Changes' : 'Create Category'}
                    </button>
                    {editingCategoryId && (
                      <button
                        type="button"
                        onClick={resetCategoryForm}
                        className="px-5 py-2.5 rounded-full bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              </section>
            )}

            {activeTab === 'products' && (
              <section className="bg-white/90 backdrop-blur-sm border border-white/80 rounded-2xl shadow-[0_20px_44px_rgba(8,38,67,0.12)] p-6">
                <h2 className="text-2xl font-bold font-serif text-brand-text mb-4">
                  {editingProductId ? 'Edit Product' : 'Create Product'}
                </h2>
                <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="text-sm text-slate-700">
                    Product Name
                    <input
                      required
                      value={productForm.productName}
                      onChange={(e) => setProductForm((prev) => ({ ...prev, productName: e.target.value }))}
                      className={adminInputClasses}
                      placeholder="Galaxy S26 Ultra"
                    />
                    {productFormErrors.productName && <p className="text-xs text-red-600 mt-1">{productFormErrors.productName}</p>}
                  </label>
                  <label className="text-sm text-slate-700">
                    Brand
                    <input
                      required
                      value={productForm.brand}
                      onChange={(e) => setProductForm((prev) => ({ ...prev, brand: e.target.value }))}
                      className={adminInputClasses}
                      placeholder="Samsung"
                    />
                    {productFormErrors.brand && <p className="text-xs text-red-600 mt-1">{productFormErrors.brand}</p>}
                  </label>

                  <label className="text-sm text-slate-700">
                    Category
                    <select
                      required
                      value={productForm.categoryId}
                      onChange={(e) => {
                        const nextCategoryId = e.target.value;
                        const nextCategoryName = getCategoryNameById(nextCategoryId);
                        setProductForm((prev) => ({
                          ...prev,
                          categoryId: nextCategoryId,
                          keySpecsText: editingProductId ? prev.keySpecsText : getKeySpecsTemplateForCategory(nextCategoryName),
                        }));
                      }}
                      className={adminSelectClasses}
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={String(category.id)}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {productFormErrors.categoryId && <p className="text-xs text-red-600 mt-1">{productFormErrors.categoryId}</p>}
                  </label>
                  <label className="text-sm text-slate-700">
                    Image URL
                    <input
                      value={productForm.imageURL}
                      onChange={(e) => setProductForm((prev) => ({ ...prev, imageURL: e.target.value }))}
                      className={adminInputClasses}
                      placeholder="/images/products/example.webp or https://..."
                    />
                  </label>

                  <label className="text-sm text-slate-700 md:col-span-2">
                    Description
                    <textarea
                      rows={3}
                      value={productForm.description}
                      onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
                      className={adminInputClasses}
                    />
                  </label>

                  <label className="text-sm text-slate-700">
                    Best Buy SKU
                    <input
                      value={productForm.bestBuySku}
                      onChange={(e) => setProductForm((prev) => ({ ...prev, bestBuySku: e.target.value }))}
                      className={adminInputClasses}
                    />
                  </label>

                  <div className="md:col-span-2 border-t border-slate-200 pt-4 mt-2">
                    <p className="text-sm font-semibold text-slate-700 mb-2">Key Specs Fields (Category Schema)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.keys(currentKeySpecTemplate).map((key) => (
                        <label key={key} className="text-sm text-slate-700">
                          {keySpecFieldLabels[key] || key}
                          {key === 'retailPrice' ? (
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={mergedKeySpecsFields[key] ?? 0}
                              onChange={(e) => updateKeySpecField(key, e.target.value)}
                              className={adminInputClasses}
                            />
                          ) : (
                            <input
                              value={mergedKeySpecsFields[key] ?? ''}
                              onChange={(e) => updateKeySpecField(key, e.target.value)}
                              className={adminInputClasses}
                            />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  <label className="text-sm text-slate-700 md:col-span-2">
                    Raw Key Specs JSON (Advanced)
                    <textarea
                      rows={8}
                      value={productForm.keySpecsText}
                      onChange={(e) => setProductForm((prev) => ({ ...prev, keySpecsText: e.target.value }))}
                      className={`${adminInputClasses} font-mono text-xs`}
                    />
                    {(productFormErrors.keySpecsText || parsedKeySpecsResult.error) && (
                      <p className="text-xs text-red-600 mt-1">
                        {productFormErrors.keySpecsText || `Invalid JSON: ${parsedKeySpecsResult.error}`}
                      </p>
                    )}
                  </label>

                  <label className="text-sm text-slate-700">
                    Pros (one per line)
                    <textarea
                      rows={5}
                      value={productForm.prosText}
                      onChange={(e) => setProductForm((prev) => ({ ...prev, prosText: e.target.value }))}
                      className={adminInputClasses}
                    />
                  </label>
                  <label className="text-sm text-slate-700">
                    Cons (one per line)
                    <textarea
                      rows={5}
                      value={productForm.consText}
                      onChange={(e) => setProductForm((prev) => ({ ...prev, consText: e.target.value }))}
                      className={adminInputClasses}
                    />
                  </label>

                  <div className="md:col-span-2 flex gap-3 flex-wrap">
                    <button
                      type="submit"
                      disabled={savingProduct || categories.length === 0}
                      className="px-5 py-2.5 rounded-full bg-brand-primary text-white font-semibold hover:bg-brand-primary-dark disabled:opacity-60"
                    >
                      {savingProduct ? 'Saving...' : editingProductId ? 'Save Changes' : 'Create Product'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const categoryName = getCategoryNameById(productForm.categoryId);
                        setProductForm((prev) => ({
                          ...prev,
                          keySpecsText: getKeySpecsTemplateForCategory(categoryName),
                        }));
                      }}
                      className="px-5 py-2.5 rounded-full bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300"
                    >
                      Reset Category Specs Template
                    </button>
                    {editingProductId && (
                      <button
                        type="button"
                        onClick={resetProductForm}
                        className="px-5 py-2.5 rounded-full bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              </section>
            )}

            {activeTab === 'critic-reviews' && (
              <section className="bg-white/90 backdrop-blur-sm border border-white/80 rounded-2xl shadow-[0_20px_44px_rgba(8,38,67,0.12)] p-6">
                <h2 className="text-2xl font-bold font-serif text-brand-text mb-4">Manage Critic Reviews</h2>
                <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="text-sm text-slate-700">
                    Select Category
                    <select
                      value={criticReviewCategoryId}
                      onChange={(e) => {
                        setCriticReviewCategoryId(e.target.value);
                        setCriticReviewProductSearch('');
                        resetCriticReviewForm();
                      }}
                      className={adminSelectClasses}
                    >
                      <option value="">Select a category...</option>
                      {categories.map((category) => (
                        <option key={category.id} value={String(category.id)}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm text-slate-700">
                    Search Product
                    <input
                      value={criticReviewProductSearch}
                      onChange={(e) => setCriticReviewProductSearch(e.target.value)}
                      placeholder="Type product or brand..."
                      className={adminInputClasses}
                      disabled={!criticReviewCategoryId}
                    />
                  </label>
                  <label className="text-sm text-slate-700">
                    Select Product
                    <select
                      value={criticReviewProductId}
                      onChange={(e) => {
                        setCriticReviewProductId(e.target.value);
                        resetCriticReviewForm();
                      }}
                      className={adminSelectClasses}
                      disabled={!criticReviewCategoryId || filteredCriticReviewProducts.length === 0}
                    >
                      <option value="">
                        {!criticReviewCategoryId
                          ? 'Select a category first...'
                          : filteredCriticReviewProducts.length === 0
                            ? 'No products in this category'
                            : 'Select a product...'}
                      </option>
                      {filteredCriticReviewProducts.map((product) => (
                        <option key={product.id} value={String(product.id)}>
                          {product.product_name} ({product.brand})
                        </option>
                      ))}
                    </select>
                    {criticReviewFormErrors.product && <p className="text-xs text-red-600 mt-1">{criticReviewFormErrors.product}</p>}
                  </label>
                </div>

                {!criticReviewProductId ? (
                  <p className="text-sm text-slate-600">Select a product above to manage critic reviews.</p>
                ) : (
                  <div className="space-y-5">
                    <form onSubmit={handleSaveCriticReview} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="text-sm text-slate-700">
                        Publication
                        <input
                          required
                          value={criticReviewForm.publication}
                          onChange={(e) => setCriticReviewForm((prev) => ({ ...prev, publication: e.target.value }))}
                          className={adminInputClasses}
                          placeholder="The Verge"
                        />
                        {criticReviewFormErrors.publication && <p className="text-xs text-red-600 mt-1">{criticReviewFormErrors.publication}</p>}
                      </label>
                      <label className="text-sm text-slate-700">
                        Score
                        <input
                          required
                          type="number"
                          step="0.1"
                          value={criticReviewForm.score}
                          onChange={(e) => setCriticReviewForm((prev) => ({ ...prev, score: e.target.value }))}
                          className={adminInputClasses}
                          placeholder="8.5"
                        />
                        {criticReviewFormErrors.score && <p className="text-xs text-red-600 mt-1">{criticReviewFormErrors.score}</p>}
                      </label>
                      <label className="text-sm text-slate-700">
                        Scale
                        <input
                          required
                          value={criticReviewForm.scale}
                          onChange={(e) => setCriticReviewForm((prev) => ({ ...prev, scale: e.target.value }))}
                          className={adminInputClasses}
                          placeholder="/10, /5, /100"
                        />
                        {criticReviewFormErrors.scale && <p className="text-xs text-red-600 mt-1">{criticReviewFormErrors.scale}</p>}
                      </label>
                      <label className="text-sm text-slate-700">
                        Review Link
                        <input
                          value={criticReviewForm.link}
                          onChange={(e) => setCriticReviewForm((prev) => ({ ...prev, link: e.target.value }))}
                          className={adminInputClasses}
                          placeholder="https://..."
                        />
                      </label>
                      <label className="text-sm text-slate-700 md:col-span-2">
                        Summary
                        <textarea
                          rows={3}
                          value={criticReviewForm.summary}
                          onChange={(e) => setCriticReviewForm((prev) => ({ ...prev, summary: e.target.value }))}
                          className={adminInputClasses}
                          placeholder="AI summary or excerpt"
                        />
                      </label>
                      <div className="md:col-span-2 flex gap-3 flex-wrap">
                        <button
                          type="submit"
                          disabled={savingCriticReview}
                          className="px-5 py-2.5 rounded-full bg-brand-primary text-white font-semibold hover:bg-brand-primary-dark disabled:opacity-60"
                        >
                          {savingCriticReview ? 'Saving...' : editingCriticReviewId ? 'Save Review Changes' : 'Add Critic Review'}
                        </button>
                        {editingCriticReviewId && (
                          <button
                            type="button"
                            onClick={resetCriticReviewForm}
                            className="px-5 py-2.5 rounded-full bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300"
                          >
                            Cancel Review Edit
                          </button>
                        )}
                      </div>
                    </form>

                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                        <h4 className="text-sm font-semibold text-slate-700">Existing reviews for this product</h4>
                        <input
                          value={criticReviewListSearch}
                          onChange={(e) => setCriticReviewListSearch(e.target.value)}
                          placeholder="Search reviews..."
                          className="w-full sm:w-64 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                      </div>
                      {loadingCriticReviews ? (
                        <p className="text-sm text-slate-500">Loading critic reviews...</p>
                      ) : filteredCriticReviews.length === 0 ? (
                        <p className="text-sm text-slate-500">No critic reviews yet.</p>
                      ) : (
                        <>
                          <ul className="space-y-2 max-h-80 overflow-auto pr-1">
                            {pagedCriticReviews.map((review) => (
                              <li key={review.id} className="rounded-lg border border-slate-200 px-3 py-2 bg-white">
                                <p className="text-sm font-semibold text-slate-800">
                                  {review.publication} - {review.score}
                                  {review.scale}
                                </p>
                                {review.summary && <p className="text-xs text-slate-600 mt-1 line-clamp-2">{review.summary}</p>}
                                <div className="mt-2 flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => startCriticReviewEdit(review)}
                                    className="text-sm px-3.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                                  >
                                    Edit Review
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCriticReview(review)}
                                    disabled={deletingCriticReviewId === review.id}
                                    className="text-sm px-3.5 py-1.5 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 disabled:opacity-60"
                                  >
                                    {deletingCriticReviewId === review.id ? 'Deleting...' : 'Delete Review'}
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-3 flex items-center justify-between text-sm">
                            <span className="text-slate-500">
                              Page {criticReviewPage} of {criticReviewPageCount}
                            </span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={criticReviewPage <= 1}
                                onClick={() => setCriticReviewPage((prev) => Math.max(1, prev - 1))}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 disabled:opacity-40"
                              >
                                Prev
                              </button>
                              <button
                                type="button"
                                disabled={criticReviewPage >= criticReviewPageCount}
                                onClick={() => setCriticReviewPage((prev) => Math.min(criticReviewPageCount, prev + 1))}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 disabled:opacity-40"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>

          <div className="space-y-6">
            <section className="bg-white/90 backdrop-blur-sm border border-white/80 rounded-2xl shadow-[0_20px_44px_rgba(8,38,67,0.12)] p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="text-lg font-bold text-brand-text font-serif">Categories</h3>
                <input
                  value={categoryListSearch}
                  onChange={(e) => setCategoryListSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-40 px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              {loadingData ? (
                <p className="text-sm text-slate-500">Loading...</p>
              ) : (
                <>
                  <ul className="space-y-2 max-h-80 overflow-auto pr-1">
                    {pagedCategories.map((category) => (
                      <li key={category.id} className="rounded-lg border border-slate-200 px-3 py-2 bg-white">
                        <p className="text-sm font-semibold text-slate-800">{category.name}</p>
                        <p className="text-xs text-slate-500">{category.slug}</p>
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => startCategoryEdit(category)}
                            className="text-sm px-3.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(category)}
                            disabled={deletingCategoryId === category.id}
                            className="text-sm px-3.5 py-1.5 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 disabled:opacity-60"
                          >
                            {deletingCategoryId === category.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Page {categoryPage} of {categoryPageCount}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={categoryPage <= 1}
                        onClick={() => setCategoryPage((prev) => Math.max(1, prev - 1))}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <button
                        type="button"
                        disabled={categoryPage >= categoryPageCount}
                        onClick={() => setCategoryPage((prev) => Math.min(categoryPageCount, prev + 1))}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </section>

            <section className="bg-white/90 backdrop-blur-sm border border-white/80 rounded-2xl shadow-[0_20px_44px_rgba(8,38,67,0.12)] p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="text-lg font-bold text-brand-text font-serif">Products</h3>
                <input
                  value={productListSearch}
                  onChange={(e) => setProductListSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-40 px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              {loadingData ? (
                <p className="text-sm text-slate-500">Loading...</p>
              ) : (
                <>
                  <ul className="space-y-2 max-h-96 overflow-auto pr-1">
                    {pagedProducts.map((product) => (
                      <li key={product.id} className="rounded-lg border border-slate-200 px-3 py-2 bg-white">
                        <p className="text-sm font-semibold text-slate-800">{product.product_name}</p>
                        <p className="text-xs text-slate-500">
                          {product.brand} • {product.categories?.name || categoryMap.get(String(product.category_id))?.name || 'Unknown'}
                        </p>
                        <div className="mt-2 flex gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => startProductEdit(product)}
                            className="text-sm px-3.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => duplicateProductToForm(product)}
                            className="text-sm px-3.5 py-1.5 rounded-lg bg-amber-100 text-amber-800 font-semibold hover:bg-amber-200"
                          >
                            Duplicate
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product)}
                            disabled={deletingProductId === product.id}
                            className="text-sm px-3.5 py-1.5 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 disabled:opacity-60"
                          >
                            {deletingProductId === product.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Page {productPage} of {productPageCount}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={productPage <= 1}
                        onClick={() => setProductPage((prev) => Math.max(1, prev - 1))}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <button
                        type="button"
                        disabled={productPage >= productPageCount}
                        onClick={() => setProductPage((prev) => Math.min(productPageCount, prev + 1))}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AdminPage;
