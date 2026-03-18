import { NextResponse } from 'next/server';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  try {
    const ofertas = await fetchQuery(api.ofertas.list, { limit: 50 });
    return NextResponse.json(ofertas);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
