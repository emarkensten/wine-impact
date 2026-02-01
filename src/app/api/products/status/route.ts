import { NextResponse } from 'next/server';
import { getCacheStatus } from '@/lib/products-cache';

export async function GET() {
  const status = getCacheStatus();
  return NextResponse.json(status);
}
