import { PrismaClient, Status } from '@prisma/client';

const prisma = new PrismaClient()

async function seed() {
  try {
    // Create a test user
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123', // In a real app, this would be hashed
      },
    })

    console.log('Created user:', user)

    // Create a test receipt
    const receipt = await prisma.receipt.create({
      data: {
        blob_url: 'https://storage.example.com/receipts/receipt1.pdf',
        content: {
          store: 'Grocery Store',
          date: '2025-07-20',
          total: 42.99,
          items: [
            { name: 'Milk', price: 3.99 },
            { name: 'Bread', price: 2.49 },
            { name: 'Eggs', price: 5.99 }
          ]
        },
        authorId: user.id,
      },
    })

    console.log('Created receipt:', receipt)

    // Create a second receipt for comparison
    const receipt2 = await prisma.receipt.create({
      data: {
        blob_url: 'https://storage.example.com/receipts/receipt2.pdf',
        content: {
          store: 'Grocery Store',
          date: '2025-07-21',
          total: 38.50,
          items: [
            { name: 'Milk', price: 3.99 },
            { name: 'Bread', price: 2.49 },
            { name: 'Cheese', price: 6.99 }
          ]
        },
        authorId: user.id,
      },
    })

    console.log('Created second receipt:', receipt2)

    // Create a comparison between the two receipts
    const comparison = await prisma.comparison.create({
      data: {
        userId: user.id,
        receiptId: [receipt.id, receipt2.id],
        status: Status.COMPLETED,
        parsedData: {
          commonItems: ['Milk', 'Bread'],
          priceDifferences: {
            total: 4.49,
            items: {
              'Milk': 0,
              'Bread': 0
            }
          },
          uniqueItems: {
            'receipt1': ['Eggs'],
            'receipt2': ['Cheese']
          }
        }
      },
    })

    console.log('Created comparison:', comparison)
    console.log('Database has been seeded successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
  }
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
