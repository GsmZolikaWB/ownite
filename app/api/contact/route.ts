import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = contactSchema.parse(body)

    await prisma.contactMessage.create({
      data: validatedData,
    })

    // Here you could also send an email notification
    // using nodemailer if configured

    return NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 200 }
    )
  } catch (err) {
    console.error(err)
    if (error instanceof z.ZodError) {
      console.error(err);
    return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
