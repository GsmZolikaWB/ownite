import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.product.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Product deleted' })
  } catch (err) {
    console.error('Error deleting product:', err)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
