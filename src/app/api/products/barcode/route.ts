import { NextRequest, NextResponse } from 'next/server';
import { getProductByBarcode } from '@/lib/products-cache';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const barcode = searchParams.get('code') || '';

  if (!barcode.trim()) {
    return NextResponse.json(
      { error: 'Streckkod krävs' },
      { status: 400 }
    );
  }

  try {
    const product = await getProductByBarcode(barcode);

    if (!product) {
      return NextResponse.json(
        { error: 'Produkten kunde inte hittas' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Barcode lookup error:', error);
    return NextResponse.json(
      { error: 'Kunde inte söka produkt. Försök igen senare.' },
      { status: 500 }
    );
  }
}
