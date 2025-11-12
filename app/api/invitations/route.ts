import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { z } from 'zod'

const invitationSchema = z.object({
  email: z.string().email(),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { email } = invitationSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already registered' },
        { status: 400 }
      )
    }

    // Check if there's already an active invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    })

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'Active invitation already exists' },
        { status: 400 }
      )
    }

    // Create invitation
    const token = nanoid(32)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

    await prisma.invitation.create({
      data: {
        email,
        token,
        senderId: session.user.id,
        expiresAt,
      },
    })

    // Here you could send an email with the invitation link
    // const invitationUrl = `${process.env.NEXTAUTH_URL}/auth/register?token=${token}`

    return NextResponse.json(
      {
        message: 'Invitation created',
        token,
        invitationUrl: `/auth/register?token=${token}`,
      },
      { status: 201 }
    )
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
