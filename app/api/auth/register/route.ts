import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  invitationToken: z.string().min(1, 'Invitation token is required'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if invitation exists and is valid
    const invitation = await prisma.invitation.findUnique({
      where: { token: validatedData.invitationToken },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Érvénytelen meghívó kód' },
        { status: 400 }
      )
    }

    if (invitation.used) {
      return NextResponse.json(
        { error: 'Ez a meghívó már fel lett használva' },
        { status: 400 }
      )
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { error: 'Ez a meghívó lejárt' },
        { status: 400 }
      )
    }

    if (invitation.email !== validatedData.email) {
      return NextResponse.json(
        { error: 'Ez a meghívó másik email címre szól' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ezzel az email címmel már regisztráltak' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Create user and mark invitation as used
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: 'USER',
      },
    })

    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        used: true,
        usedById: user.id,
        usedAt: new Date(),
      },
    })

    return NextResponse.json(
      { message: 'Registration successful' },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validációs hiba', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Hiba történt a regisztráció során' },
      { status: 500 }
    )
  }
}
