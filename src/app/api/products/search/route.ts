import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/products-cache';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  if (!query.trim()) {
    return NextResponse.json({ products: [] });
  }

  try {
    const products = await searchProducts(query, limit);
    // Strip internal fields before sending to client
    const clientProducts = products.map(({ searchText, ...product }) => product);
    return NextResponse.json(
      { products: clientProducts },
      {
        headers: {
          // Catalog refreshes daily, so results are safe to cache briefly.
          // Edge caches per-query; browser reuses repeated searches instantly.
          'Cache-Control':
            'public, max-age=60, s-maxage=300, stale-while-revalidate=3600',
        },
      }
    );
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Kunde inte söka produkter. Försök igen senare.' },
      { status: 500 }
    );
  }
}
