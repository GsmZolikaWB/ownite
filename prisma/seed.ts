import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mechatronics.hu' },
    update: {},
    create: {
      email: 'admin@mechatronics.hu',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  console.log('✅ Admin user created:', admin.email)

  // Create some sample products
  const products = [
    {
      name: 'PLC Siemens S7-1200',
      description: 'Kompakt PLC vezérlő ipari automatizáláshoz, 14 digitális bemenet/kimenet',
      price: 150000,
      category: 'PLC Vezérlők',
      inStock: true,
    },
    {
      name: 'Servo Motor 400W',
      description: 'Nagy pontosságú servo motor pozícionálási alkalmazásokhoz',
      price: 85000,
      category: 'Motorok',
      inStock: true,
    },
    {
      name: 'HMI Panel 7"',
      description: 'Érintőképernyős operátori panel, grafikus megjelenítéssel',
      price: 95000,
      category: 'HMI Panelek',
      inStock: true,
    },
    {
      name: 'Proximity Sensor',
      description: 'Induktív érzékelő fémek detektálásához, M18 méret',
      price: 12000,
      category: 'Érzékelők',
      inStock: true,
    },
    {
      name: 'Pneumatikus Henger 50mm',
      description: 'Dupla működésű pneumatikus henger, ISO 15552 szabvány',
      price: 28000,
      category: 'Pneumatika',
      inStock: true,
    },
    {
      name: 'Frequency Inverter 2.2kW',
      description: 'Frekvenciaváltó háromfázisú motorokhoz',
      price: 120000,
      category: 'Meghajtástechnika',
      inStock: true,
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.name }, // Using name as temp ID
      update: {},
      create: product,
    })
  }

  console.log('✅ Sample products created')
  console.log('\n📝 Login credentials:')
  console.log('   Email: admin@mechatronics.hu')
  console.log('   Password: admin123')
  console.log('\n⚠️  Please change the admin password after first login!\n')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
