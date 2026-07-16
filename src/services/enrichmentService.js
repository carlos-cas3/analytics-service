const VENDOR_SERVICE_URL = process.env.VENDOR_SERVICE_URL || 'https://vendor-service-9wfb.onrender.com';
const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || 'https://catalog-service-production-58a6.up.railway.app';

const vendorCache = new Map();
const productsCache = new Map();

function clearCache() {
  vendorCache.clear();
  productsCache.clear();
}

async function getVendorName(vendorId) {
  const key = String(vendorId);
  if (vendorCache.has(key)) return vendorCache.get(key);
  try {
    const res = await fetch(`${VENDOR_SERVICE_URL}/api/vendors/${vendorId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const name = data.vendor_name || data.name || `Vendor #${vendorId}`;
    vendorCache.set(key, name);
    return name;
  } catch (err) {
    console.log(`[ENRICHMENT] Error fetching vendor ${vendorId}: ${err.message}`);
    return `Vendor #${vendorId}`;
  }
}

async function getProductsByVendor(vendorId) {
  const key = String(vendorId);
  if (productsCache.has(key)) return productsCache.get(key);
  try {
    const res = await fetch(`${CATALOG_SERVICE_URL}/api/vendor-products/${vendorId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const products = Array.isArray(data) ? data : [];
    productsCache.set(key, products);
    return products;
  } catch (err) {
    console.log(`[ENRICHMENT] Error fetching products for vendor ${vendorId}: ${err.message}`);
    return [];
  }
}

async function getProductInfo(vendorId, productId) {
  const products = await getProductsByVendor(vendorId);
  const product = products.find(
    (p) => String(p.id_producto) === String(productId) ||
      String(p.id) === String(productId) ||
      String(p.product_id) === String(productId) ||
      String(p.codigo) === String(productId),
  );
  if (product) {
    return {
      product_name: product.product_name || product.nombre || product.name || `Producto #${productId}`,
      category: product.category || product.categoria || 'Sin categoría',
    };
  }
  return { product_name: `Producto #${productId}`, category: 'Sin categoría' };
}

module.exports = { getVendorName, getProductInfo, clearCache };
