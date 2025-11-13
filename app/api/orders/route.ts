import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const orderItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  imageUrl: z.string().optional(),
})

const orderSchema = z.object({
  items: z.array(orderItemSchema),
  shippingAddress: z.string(),
  shippingMethodId: z.string().optional(),
  shippingCost: z.number(),
  paymentMethod: z.enum(['paypal', 'revolut', 'cash_on_delivery']),
  totalAmount: z.number(),
})

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = orderSchema.parse(body)

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        orderNumber,
        totalAmount: validatedData.totalAmount,
        shippingAddress: validatedData.shippingAddress,
        shippingMethodId: validatedData.shippingMethodId,
        shippingCost: validatedData.shippingCost,
        paymentMethod: validatedData.paymentMethod,
        paymentStatus: validatedData.paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending',
        status: 'pending',
        items: {
          create: validatedData.items.map((item) => ({
            productId: item.id,
            productName: item.name,
            productPrice: item.price,
            quantity: item.quantity,
            totalPrice: item.price * item.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    // Handle different payment methods
    const responseData: {
      success: boolean
      orderId: string
      orderNumber: string
      paypalUrl?: string
      revolutUrl?: string
    } = {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    }

    if (validatedData.paymentMethod === 'paypal') {
      // TODO: Integrate PayPal SDK
      // For now, return a placeholder message
      // responseData.paypalUrl = await createPayPalCheckout(order)
      console.log('PayPal payment requested for order:', order.orderNumber)
    } else if (validatedData.paymentMethod === 'revolut') {
      // TODO: Integrate Revolut API
      // responseData.revolutUrl = await createRevolutCheckout(order)
      console.log('Revolut payment requested for order:', order.orderNumber)
    }

    return NextResponse.json(responseData, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
