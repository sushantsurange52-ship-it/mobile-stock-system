import bcrypt from 'bcryptjs';
import prisma from '../src/prisma.js';

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing tables in correct relational order
  await prisma.stockTransaction.deleteMany();
  await prisma.mobileUnit.deleteMany();
  await prisma.mobile.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned previous data.');

  // 1. Create Admin User
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const admin = await prisma.user.create({
    data: {
      name: 'Shop Manager',
      email: 'admin@phonestore.com',
      passwordHash,
      role: 'admin',
    },
  });
  console.log(`👤 Created user: ${admin.email}`);

  // 2. Create Suppliers
  const suppliersData = [
    {
      name: 'Apex Mobile Wholesale',
      phone: '+1-555-0199',
      email: 'orders@apexmobiles.com',
      address: '123 Logistics Way, San Jose, CA',
    },
    {
      name: 'Global Tech Distributors',
      phone: '+1-555-0248',
      email: 'sales@globaltechdist.com',
      address: '450 Harbor Blvd, Seattle, WA',
    },
    {
      name: 'Prime Cellular Supply',
      phone: '+1-555-0311',
      email: 'support@primecellular.com',
      address: '780 Industrial Pkwy, Dallas, TX',
    },
    {
      name: 'Horizon Wireless Partners',
      phone: '+1-555-0455',
      email: 'b2b@horizonwireless.com',
      address: '99 Commerce Dr, Atlanta, GA',
    },
  ];

  const createdSuppliers = [];
  for (const s of suppliersData) {
    const supp = await prisma.supplier.create({ data: s });
    createdSuppliers.push(supp);
  }
  console.log(`🏢 Created ${createdSuppliers.length} suppliers.`);

  // 3. Create Mobiles
  const sApex = createdSuppliers[0].id;
  const sGlobal = createdSuppliers[1].id;
  const sPrime = createdSuppliers[2].id;
  const sHorizon = createdSuppliers[3].id;

  const sampleMobiles = [
    {
      brand: 'Apple',
      model: 'iPhone 15 Pro',
      variant: '128GB / 8GB RAM',
      color: 'Natural Titanium',
      category: 'Smartphone',
      costPrice: 850.0,
      sellingPrice: 999.0,
      quantity: 14,
      reorderLevel: 5,
      supplierId: sApex,
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80',
    },
    {
      brand: 'Apple',
      model: 'iPhone 15',
      variant: '128GB / 6GB RAM',
      color: 'Blue',
      category: 'Smartphone',
      costPrice: 680.0,
      sellingPrice: 799.0,
      quantity: 8,
      reorderLevel: 4,
      supplierId: sApex,
      imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&q=80',
    },
    {
      brand: 'Apple',
      model: 'iPhone 14',
      variant: '128GB / 6GB RAM',
      color: 'Midnight',
      category: 'Smartphone',
      costPrice: 550.0,
      sellingPrice: 679.0,
      quantity: 3, // LOW STOCK
      reorderLevel: 5,
      supplierId: sApex,
      imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&q=80',
    },
    {
      brand: 'Samsung',
      model: 'Galaxy S24 Ultra',
      variant: '512GB / 12GB RAM',
      color: 'Titanium Gray',
      category: 'Smartphone',
      costPrice: 1050.0,
      sellingPrice: 1299.0,
      quantity: 6,
      reorderLevel: 3,
      supplierId: sGlobal,
      imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80',
    },
    {
      brand: 'Samsung',
      model: 'Galaxy S24',
      variant: '256GB / 8GB RAM',
      color: 'Onyx Black',
      category: 'Smartphone',
      costPrice: 680.0,
      sellingPrice: 799.0,
      quantity: 2, // LOW STOCK
      reorderLevel: 5,
      supplierId: sGlobal,
      imageUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&q=80',
    },
    {
      brand: 'Samsung',
      model: 'Galaxy A54 5G',
      variant: '128GB / 8GB RAM',
      color: 'Awesome Violet',
      category: 'Smartphone',
      costPrice: 320.0,
      sellingPrice: 449.0,
      quantity: 15,
      reorderLevel: 6,
      supplierId: sGlobal,
      imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80',
    },
    {
      brand: 'Google',
      model: 'Pixel 8 Pro',
      variant: '128GB / 12GB RAM',
      color: 'Bay Blue',
      category: 'Smartphone',
      costPrice: 780.0,
      sellingPrice: 949.0,
      quantity: 5,
      reorderLevel: 3,
      supplierId: sPrime,
      imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80',
    },
    {
      brand: 'Google',
      model: 'Pixel 7a',
      variant: '128GB / 8GB RAM',
      color: 'Charcoal',
      category: 'Smartphone',
      costPrice: 380.0,
      sellingPrice: 499.0,
      quantity: 1, // LOW STOCK
      reorderLevel: 4,
      supplierId: sPrime,
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80',
    },
    {
      brand: 'OnePlus',
      model: 'OnePlus 12',
      variant: '256GB / 12GB RAM',
      color: 'Flowy Emerald',
      category: 'Smartphone',
      costPrice: 650.0,
      sellingPrice: 799.0,
      quantity: 9,
      reorderLevel: 4,
      supplierId: sHorizon,
      imageUrl: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&q=80',
    },
    {
      brand: 'OnePlus',
      model: 'Nord CE 3',
      variant: '128GB / 8GB RAM',
      color: 'Aqua Surge',
      category: 'Smartphone',
      costPrice: 240.0,
      sellingPrice: 329.0,
      quantity: 11,
      reorderLevel: 5,
      supplierId: sHorizon,
      imageUrl: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&q=80',
    },
    {
      brand: 'Xiaomi',
      model: 'Xiaomi 14 Ultra',
      variant: '512GB / 16GB RAM',
      color: 'Black',
      category: 'Smartphone',
      costPrice: 900.0,
      sellingPrice: 1199.0,
      quantity: 4,
      reorderLevel: 2,
      supplierId: sApex,
      imageUrl: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400&q=80',
    },
    {
      brand: 'Xiaomi',
      model: 'Redmi Note 13 Pro',
      variant: '256GB / 8GB RAM',
      color: 'Midnight Black',
      category: 'Smartphone',
      costPrice: 220.0,
      sellingPrice: 299.0,
      quantity: 18,
      reorderLevel: 8,
      supplierId: sApex,
      imageUrl: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=400&q=80',
    },
    {
      brand: 'Nokia',
      model: '105 4G',
      variant: '128MB / 48MB RAM',
      color: 'Charcoal',
      category: 'Feature Phone',
      costPrice: 18.0,
      sellingPrice: 29.0,
      quantity: 24,
      reorderLevel: 10,
      supplierId: sPrime,
      imageUrl: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?w=400&q=80',
    },
    {
      brand: 'Nokia',
      model: '2660 Flip',
      variant: '128MB / 48MB RAM',
      color: 'Classic Red',
      category: 'Feature Phone',
      costPrice: 42.0,
      sellingPrice: 65.0,
      quantity: 2, // LOW STOCK
      reorderLevel: 5,
      supplierId: sPrime,
      imageUrl: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&q=80',
    },
  ];

  for (const m of sampleMobiles) {
    const mobile = await prisma.mobile.create({
      data: m,
    });

    // Create initial IN stock transaction
    await prisma.stockTransaction.create({
      data: {
        mobileId: mobile.id,
        type: 'IN',
        quantity: mobile.quantity + 4, // Started with 4 more
        note: 'Opening supplier batch delivery',
        userId: admin.id,
      },
    });

    // Create a sample OUT sale transaction
    await prisma.stockTransaction.create({
      data: {
        mobileId: mobile.id,
        type: 'OUT',
        quantity: 4,
        note: 'In-store retail customer sales',
        userId: admin.id,
      },
    });
  }

  console.log(`📱 Seeded ${sampleMobiles.length} sample mobile phones with initial stock transactions!`);
  console.log('✅ Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
