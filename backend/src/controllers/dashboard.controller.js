import prisma from '../prisma.js';

/**
 * Get dashboard summary metrics
 * GET /api/dashboard/summary
 */
export const getDashboardSummary = async (req, res) => {
  try {
    // 1. Fetch all mobiles with needed fields
    const mobiles = await prisma.mobile.findMany({
      select: {
        id: true,
        brand: true,
        model: true,
        quantity: true,
        costPrice: true,
        sellingPrice: true,
        reorderLevel: true,
      },
    });

    const totalMobiles = mobiles.length;
    let totalStockUnits = 0;
    let totalCostValue = 0;
    let totalRetailValue = 0;
    let lowStockCount = 0;
    const brandQuantityMap = {};

    mobiles.forEach((mobile) => {
      const qty = mobile.quantity;
      const cost = parseFloat(mobile.costPrice) || 0;
      const retail = parseFloat(mobile.sellingPrice) || 0;

      totalStockUnits += qty;
      totalCostValue += qty * cost;
      totalRetailValue += qty * retail;

      if (qty <= mobile.reorderLevel) {
        lowStockCount += 1;
      }

      // Group by brand
      const brand = mobile.brand || 'Other';
      brandQuantityMap[brand] = (brandQuantityMap[brand] || 0) + qty;
    });

    // Format top 5 brands for Recharts
    const topBrands = Object.entries(brandQuantityMap)
      .map(([brand, quantity]) => ({ brand, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // 2. Fetch latest 5 transactions for quick feed
    const recentTransactions = await prisma.stockTransaction.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        mobile: {
          select: {
            brand: true,
            model: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    // 3. Count total suppliers
    const totalSuppliers = await prisma.supplier.count();

    return res.json({
      summary: {
        totalMobiles,
        totalStockUnits,
        totalCostValue: Math.round(totalCostValue * 100) / 100,
        totalRetailValue: Math.round(totalRetailValue * 100) / 100,
        potentialProfit: Math.round((totalRetailValue - totalCostValue) * 100) / 100,
        lowStockCount,
        totalSuppliers,
      },
      topBrands,
      recentTransactions,
    });
  } catch (error) {
    console.error('Error in getDashboardSummary:', error);
    return res.status(500).json({ error: 'Failed to retrieve dashboard metrics.' });
  }
};
