import type { PackagingType, ProductionMethod } from '@/types';
import { promises as fs } from 'fs';
import path from 'path';

interface SystembolagetProduct {
  productId: string;
  productNumber: string;
  productNameBold: string;
  productNameThin?: string;
  producerName?: string;
  isOrganic?: boolean;
  bottleText?: string;
  volume?: number;
  price?: number;
  country?: string;
  originLevel1?: string;
  categoryLevel1?: string;
  categoryLevel2?: string;
  alcoholPercentage?: number;
  packagingLevel1?: string;
  isClimateSmartPackaging?: boolean;
  images?: { imageUrl?: string }[];
}

interface CachedProduct {
  id: string;
  productNumber: string;
  name: string;
  imageUrl: string;
  packagingType: PackagingType;
  originCountry: string;
  productionMethod: ProductionMethod;
  volumeMl: number;
  price: number;
  category?: string;
  producer?: string;
  alcoholPercentage?: number;
  searchText: string;
}

interface FileCache {
  timestamp: number;
  products: CachedProduct[];
}

// In-memory cache
let productsCache: CachedProduct[] | null = null;
let lastFetchTime: number = 0;
let isLoading: boolean = false;
let loadError: string | null = null;

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_FILE = path.join(process.cwd(), '.cache', 'products.json');

export interface CacheStatus {
  isLoaded: boolean;
  isLoading: boolean;
  productCount: number;
  cacheAge: number | null;
  error: string | null;
}

export function getCacheStatus(): CacheStatus {
  return {
    isLoaded: productsCache !== null,
    isLoading,
    productCount: productsCache?.length || 0,
    cacheAge: lastFetchTime ? Date.now() - lastFetchTime : null,
    error: loadError,
  };
}

function mapPackaging(packagingLevel1?: string, bottleText?: string): PackagingType {
  const packaging = (packagingLevel1 || bottleText || '').toLowerCase();

  if (packaging.includes('box') || packaging.includes('bag-in-box') || packaging.includes('bib')) {
    return 'bag_in_box';
  }
  if (packaging.includes('burk') || packaging.includes('can') || packaging.includes('pantburk')) {
    return 'aluminum_can';
  }
  if (packaging.includes('pet') || packaging.includes('plast')) {
    return 'pet';
  }
  if (packaging.includes('tetra') || packaging.includes('papp')) {
    return 'tetra';
  }
  if (packaging.includes('lättglas') || packaging.includes('lättvikt')) {
    return 'glass_light';
  }
  return 'glass_heavy';
}

function mapProduct(item: SystembolagetProduct): CachedProduct {
  const name = item.productNameThin
    ? `${item.productNameBold} ${item.productNameThin}`
    : item.productNameBold;

  const category = item.categoryLevel2 || item.categoryLevel1 || undefined;
  const originCountry = item.country || item.originLevel1 || 'Okänt';

  return {
    id: item.productId || item.productNumber,
    productNumber: item.productNumber,
    name,
    imageUrl: item.images?.[0]?.imageUrl
      ? `${item.images[0].imageUrl}_200.webp`
      : '/placeholder-bottle.svg',
    packagingType: mapPackaging(item.packagingLevel1, item.bottleText),
    originCountry,
    productionMethod: item.isOrganic ? 'organic' : 'conventional',
    volumeMl: item.volume || 750,
    price: item.price || 0,
    category,
    producer: item.producerName,
    alcoholPercentage: item.alcoholPercentage,
    searchText: `${name} ${item.producerName || ''} ${category || ''} ${originCountry} ${item.productNumber}`.toLowerCase(),
  };
}

async function loadFromFileCache(): Promise<CachedProduct[] | null> {
  try {
    const data = await fs.readFile(CACHE_FILE, 'utf-8');
    const cache: FileCache = JSON.parse(data);

    // Check if cache is still valid
    if (Date.now() - cache.timestamp < CACHE_DURATION) {
      console.log(`Loaded ${cache.products.length} products from file cache`);
      lastFetchTime = cache.timestamp;
      return cache.products;
    }
    console.log('File cache expired');
    return null;
  } catch {
    // Cache file doesn't exist or is invalid
    return null;
  }
}

async function saveToFileCache(products: CachedProduct[]): Promise<void> {
  try {
    const cacheDir = path.dirname(CACHE_FILE);
    await fs.mkdir(cacheDir, { recursive: true });

    const cache: FileCache = {
      timestamp: Date.now(),
      products,
    };

    await fs.writeFile(CACHE_FILE, JSON.stringify(cache));
    console.log(`Saved ${products.length} products to file cache`);
  } catch (error) {
    console.error('Failed to save cache file:', error);
  }
}

export async function getProducts(): Promise<CachedProduct[]> {
  const now = Date.now();

  // Return from memory cache if valid
  if (productsCache && (now - lastFetchTime) < CACHE_DURATION) {
    return productsCache;
  }

  // Prevent multiple simultaneous fetches
  if (isLoading) {
    // Wait for current load to complete
    while (isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (productsCache) return productsCache;
  }

  isLoading = true;
  loadError = null;

  try {
    // Try to load from file cache first
    const fileCached = await loadFromFileCache();
    if (fileCached) {
      productsCache = fileCached;
      isLoading = false;
      return productsCache;
    }

    console.log('Fetching products from Systembolaget API...');

    const response = await fetch('https://susbolaget.emrik.org/v1/products', {
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data: SystembolagetProduct[] = await response.json();

    productsCache = data.map(mapProduct);
    lastFetchTime = now;

    console.log(`Fetched ${productsCache.length} products from API`);

    // Save to file cache in background
    saveToFileCache(productsCache).catch(console.error);

    return productsCache;
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to load products:', loadError);
    throw error;
  } finally {
    isLoading = false;
  }
}

export async function searchProducts(query: string, limit: number = 20): Promise<CachedProduct[]> {
  const products = await getProducts();
  const lowerQuery = query.toLowerCase().trim();

  if (!lowerQuery) {
    return [];
  }

  const terms = lowerQuery.split(/\s+/);

  const matches = products.filter(product =>
    terms.every(term => product.searchText.includes(term))
  );

  // Sort by relevance (name starts with query first)
  matches.sort((a, b) => {
    const aStartsWith = a.name.toLowerCase().startsWith(lowerQuery) ? 0 : 1;
    const bStartsWith = b.name.toLowerCase().startsWith(lowerQuery) ? 0 : 1;
    return aStartsWith - bStartsWith;
  });

  return matches.slice(0, limit);
}

export async function getProductByBarcode(barcode: string): Promise<CachedProduct | null> {
  const products = await getProducts();
  const cleanBarcode = barcode.trim();

  // Only exact matches to avoid wrong products

  // Try exact match on productNumber
  let product = products.find(p => p.productNumber === cleanBarcode);
  if (product) return product;

  // Try exact match on productId
  product = products.find(p => p.id === cleanBarcode);
  if (product) return product;

  // No partial matching or name search - too error-prone
  return null;
}
