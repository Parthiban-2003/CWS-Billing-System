import { prisma } from '../client'

const MENU = [
  { name: 'Chicken Biryani', category: 'Biryani', price: 180, stock: 60 },
  { name: 'Mutton Biryani', category: 'Biryani', price: 220, stock: 30 },
  { name: 'Veg Biryani', category: 'Biryani', price: 140, stock: 40 },
  { name: 'Full Meals', category: 'Meals', price: 120, stock: 50 },
  { name: 'Parotta + Salna', category: 'Food', price: 60, stock: 60 },
  { name: 'Idli (2 pcs)', category: 'Breakfast', price: 30, stock: 50 },
  { name: 'Dosa', category: 'Breakfast', price: 50, stock: 100 },
  { name: 'Tea', category: 'Beverages', price: 20, stock: 100 },
  { name: 'Coffee', category: 'Beverages', price: 30, stock: 80 },
  { name: 'Water Bottle', category: 'Beverages', price: 20, stock: 200 },
]

export async function seedProducts(tenantId: string) {
  await prisma.product.deleteMany({ where: { tenantId } })
  for (const [i, m] of MENU.entries()) {
    const p = await prisma.product.create({
      data: { ...m, tenantId, barcode: `SKU${String(i + 1).padStart(4, '0')}` },
    })
    if (m.category === 'Biryani') {
      await prisma.variant.createMany({
        data: [
          { productId: p.id, name: 'Small', delta: -40 },
          { productId: p.id, name: 'Medium', delta: 0 },
          { productId: p.id, name: 'Large', delta: 60 },
        ],
      })
    }

    await prisma.modifier.createMany({
      data: [
        { productId: p.id, name: 'Extra raita', delta: 20 },
        { productId: p.id, name: 'No onion', delta: 0 },
      ],
    }).catch(() => { })
  }
  console.log('✅ Products + variants seeded')
}
