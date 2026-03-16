import { NextResponse } from 'next/server';
import { prisma } from '@/packages/database/src';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const skip = (page - 1) * limit;

  try {
    const ofertas = await prisma.oferta.findMany({
      skip,
      take: limit,
      orderBy: { score: 'desc' },
      include: { pagina: true },
    });

    const total = await prisma.oferta.count();

    return NextResponse.json({
      data: ofertas,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
