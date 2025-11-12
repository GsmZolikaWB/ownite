import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const shippingMethodSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  estimatedDays: z.string().min(1),
  active: z.boolean().optional().default(true),
})

export async function GET() {
  try {
    const shippingMethods = await prisma.shippingMethod.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(shippingMethods)
  } catch (error) {
    console.error('Error fetching shipping methods:', error)
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
    const validatedData = shippingMethodSchema.parse(body)

    const shippingMethod = await prisma.shippingMethod.create({
      data: validatedData,
    })

    return NextResponse.json(
      { message: 'Shipping method created', shippingMethod },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating shipping method:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
