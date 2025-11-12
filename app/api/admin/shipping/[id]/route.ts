import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const shippingMethodSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  estimatedDays: z.string().min(1).optional(),
  active: z.boolean().optional(),
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
    const validatedData = shippingMethodSchema.parse(body)

    const shippingMethod = await prisma.shippingMethod.update({
      where: { id: params.id },
      data: validatedData,
    })

    return NextResponse.json({ message: 'Shipping method updated', shippingMethod })
  } catch (error) {
    console.error('Error updating shipping method:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update shipping method' }, { status: 500 })
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
    await prisma.shippingMethod.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Shipping method deleted' })
  } catch (error) {
    console.error('Error deleting shipping method:', error)
    return NextResponse.json({ error: 'Failed to delete shipping method' }, { status: 500 })
  }
}
