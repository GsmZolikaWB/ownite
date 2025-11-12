import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const variantUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  sku: z.string().min(1).optional(),
  voltage: z.number().optional(),
  current: z.number().optional(),
  cells: z.number().int().optional(),
  cellType: z.string().optional(),
  price: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
})

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = variantUpdateSchema.parse(body)

    const variant = await prisma.productVariant.update({
      where: { id: params.id },
      data: validatedData,
    })

    return NextResponse.json({ message: 'Variant updated', variant })
  } catch (error) {
    console.error('Error updating variant:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update variant' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.productVariant.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Variant deleted' })
  } catch (error) {
    console.error('Error deleting variant:', error)
    return NextResponse.json({ error: 'Failed to delete variant' }, { status: 500 })
  }
}
