export const slugifySegment = (value = '') =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export const buildProductPath = (product) => {
  const brandSlug = slugifySegment(product?.brand || 'brand');
  const productSlug = slugifySegment(product?.productName || 'product');
  return `/product/${brandSlug}/${productSlug}`;
};
