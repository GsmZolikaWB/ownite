import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const variantSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  sku: z.string().min(1),
  voltage: z.number().optional(),
  current: z.number().optional(),
  cells: z.number().int().optional(),
  cellType: z.string().optional(),
  price: z.number().min(0),
  stock: z.number().int().min(0),
})

export async function GET() {
  try {
    const variants = await prisma.productVariant.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(variants)
  } catch (error) {
    console.error('Error fetching variants:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = variantSchema.parse(body)

    // Check if SKU already exists
    const existingSku = await prisma.productVariant.findUnique({
      where: { sku: validatedData.sku },
    })

    if (existingSku) {
      return NextResponse.json(
        { error: 'SKU already exists' },
        { status: 400 }
      )
    }

    const variant = await prisma.productVariant.create({
      data: validatedData,
    })

    return NextResponse.json(
      { message: 'Variant created', variant },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating variant:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
