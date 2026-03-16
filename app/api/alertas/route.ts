import { NextResponse } from 'next/server';
import { prisma } from '@/packages/database/src';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const skip = (page - 1) * limit;

  try {
    const alertas = await prisma.alerta.findMany({
      skip,
      take: limit,
      orderBy: { criadoEm: 'desc' },
      include: { oferta: true },
    });

    const total = await prisma.alerta.count();

    return NextResponse.json({
      data: alertas,
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
