import type { Product } from '@/types';

export interface CacheStatus {
  isLoaded: boolean;
  isLoading: boolean;
  productCount: number;
  cacheAge: number | null;
  error: string | null;
}

export async function getCacheStatus(): Promise<CacheStatus> {
  const response = await fetch('/api/products/status');
  if (!response.ok) {
    throw new Error('Could not fetch cache status');
  }
  return response.json();
}

export async function searchProducts(query: string): Promise<Product[]> {
  const response = await fetch(
    `/api/products/search?q=${encodeURIComponent(query)}&limit=20`
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Kunde inte söka produkter. Försök igen senare.');
  }

  const data = await response.json();
  return data.products || [];
}

export async function getProductByBarcode(barcode: string): Promise<Product | null> {
  const response = await fetch(
    `/api/products/barcode?code=${encodeURIComponent(barcode)}`
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Kunde inte söka produkt. Försök igen senare.');
  }

  const data = await response.json();
  return data.product || null;
}
