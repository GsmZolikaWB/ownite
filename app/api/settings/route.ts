import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const settingsSchema = z.object({
  siteName: z.string().min(1),
  logo: z.string().optional(),
  contactEmail: z.string().email(),
  contactPhone: z.string(),
  contactAddress: z.string(),
  contactPhoto: z.string().optional(),
  heroImage: z.string().optional(),
  aboutText: z.string().optional(),
})

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findFirst()

    if (!settings) {
      // Create default settings
      settings = await prisma.siteSettings.create({
        data: {
          siteName: 'Mechatronics Engineering',
          contactEmail: 'info@mechatronics.hu',
          contactPhone: '+36 XX XXX XXXX',
          contactAddress: 'Budapest, Magyarország',
        },
      })
    }

    return NextResponse.json(settings)
  } catch (err) {
    console.error('Settings fetch error:', err)
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = settingsSchema.parse(body)

    let settings = await prisma.siteSettings.findFirst()

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: validatedData,
      })
    } else {
      settings = await prisma.siteSettings.update({
        where: { id: settings.id },
        data: validatedData,
      })
    }

    return NextResponse.json(settings)
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error(err);
    return NextResponse.json(
        { error: 'Validation error', details: err.errors },
        { status: 400 }
      )
    }

    console.error('Settings update error:', err)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
