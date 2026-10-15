import prisma from '../prisma.js';

/**
 * List all mobile phones
 * Supports ?search=, ?category=, ?lowStock=true
 * GET /api/mobiles
 */
export const getMobiles = async (req, res) => {
  try {
    const { search, category, lowStock } = req.query;

    const where = {};

    // Filter by search query across brand, model, variant, or color
    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { brand: { contains: q, mode: 'insensitive' } },
        { model: { contains: q, mode: 'insensitive' } },
        { variant: { contains: q, mode: 'insensitive' } },
        { color: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Filter by category
    if (category && category !== 'All') {
      where.category = category;
    }

    // Filter by low stock: quantity <= reorder_level
    // In Prisma, filtering fieldA <= fieldB can be done using raw SQL or filtering post-query,
    // or using Prisma's field comparison where supported. Here we can use Prisma query filter.
    const mobiles = await prisma.mobile.findMany({
      where,
      include: {
        supplier: {
          select: { id: true, name: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // If lowStock flag is set, filter for items where quantity <= reorderLevel
    const result = lowStock === 'true'
      ? mobiles.filter((m) => m.quantity <= m.reorderLevel)
      : mobiles;

    return res.json(result);
  } catch (error) {
    console.error('Error fetching mobiles:', error);
    return res.status(500).json({ error: 'Failed to retrieve mobiles list.' });
  }
};

/**
 * Get single mobile by ID
 * GET /api/mobiles/:id
 */
export const getMobileById = async (req, res) => {
  try {
    const { id } = req.params;

    const mobile = await prisma.mobile.findUnique({
      where: { id },
      include: {
        supplier: true,
        stockTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!mobile) {
      return res.status(404).json({ error: 'Mobile phone not found.' });
    }

    return res.json(mobile);
  } catch (error) {
    console.error('Error fetching mobile by ID:', error);
    return res.status(500).json({ error: 'Failed to retrieve mobile details.' });
  }
};

/**
 * Create a new mobile phone
 * POST /api/mobiles
 */
export const createMobile = async (req, res) => {
  try {
    const {
      brand,
      model,
      variant,
      color,
      category = 'Smartphone',
      costPrice,
      sellingPrice,
      quantity = 0,
      reorderLevel = 5,
      supplierId,
      imageUrl,
    } = req.body;

    if (!brand || !model || !variant || !color) {
      return res.status(400).json({ error: 'Brand, model, variant, and color are required.' });
    }

    const parsedCost = parseFloat(costPrice);
    const parsedSelling = parseFloat(sellingPrice);
    const parsedQty = parseInt(quantity, 10) || 0;
    const parsedReorder = parseInt(reorderLevel, 10) || 5;

    if (isNaN(parsedCost) || parsedCost < 0) {
      return res.status(400).json({ error: 'Valid positive cost price is required.' });
    }

    if (isNaN(parsedSelling) || parsedSelling < 0) {
      return res.status(400).json({ error: 'Valid positive selling price is required.' });
    }

    if (parsedQty < 0) {
      return res.status(400).json({ error: 'Initial quantity cannot be negative.' });
    }

    // Verify supplier exists if supplied
    if (supplierId) {
      const supplierExists = await prisma.supplier.findUnique({ where: { id: supplierId } });
      if (!supplierExists) {
        return res.status(400).json({ error: 'Selected supplier does not exist.' });
      }
    }

    // Create mobile record (and initial stock transaction if qty > 0)
    const newMobile = await prisma.$transaction(async (tx) => {
      const mobile = await tx.mobile.create({
        data: {
          brand: brand.trim(),
          model: model.trim(),
          variant: variant.trim(),
          color: color.trim(),
          category: category || 'Smartphone',
          costPrice: parsedCost,
          sellingPrice: parsedSelling,
          quantity: parsedQty,
          reorderLevel: parsedReorder,
          supplierId: supplierId || null,
          imageUrl: imageUrl ? imageUrl.trim() : null,
        },
        include: { supplier: true },
      });

      if (parsedQty > 0) {
        await tx.stockTransaction.create({
          data: {
            mobileId: mobile.id,
            type: 'IN',
            quantity: parsedQty,
            note: 'Initial opening stock',
            userId: req.user ? req.user.id : null,
          },
        });
      }

      return mobile;
    });

    return res.status(201).json({
      message: 'Mobile phone created successfully',
      mobile: newMobile,
    });
  } catch (error) {
    console.error('Error creating mobile:', error);
    return res.status(500).json({ error: 'Failed to create mobile phone.' });
  }
};

/**
 * Update an existing mobile phone
 * PUT /api/mobiles/:id
 */
export const updateMobile = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      brand,
      model,
      variant,
      color,
      category,
      costPrice,
      sellingPrice,
      reorderLevel,
      supplierId,
      imageUrl,
    } = req.body;

    const existing = await prisma.mobile.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Mobile phone not found.' });
    }

    const dataToUpdate = {};
    if (brand !== undefined) dataToUpdate.brand = brand.trim();
    if (model !== undefined) dataToUpdate.model = model.trim();
    if (variant !== undefined) dataToUpdate.variant = variant.trim();
    if (color !== undefined) dataToUpdate.color = color.trim();
    if (category !== undefined) dataToUpdate.category = category;
    if (costPrice !== undefined) dataToUpdate.costPrice = parseFloat(costPrice);
    if (sellingPrice !== undefined) dataToUpdate.sellingPrice = parseFloat(sellingPrice);
    if (reorderLevel !== undefined) dataToUpdate.reorderLevel = parseInt(reorderLevel, 10);
    if (supplierId !== undefined) dataToUpdate.supplierId = supplierId || null;
    if (imageUrl !== undefined) dataToUpdate.imageUrl = imageUrl ? imageUrl.trim() : null;

    const updatedMobile = await prisma.mobile.update({
      where: { id },
      data: dataToUpdate,
      include: { supplier: true },
    });

    return res.json({
      message: 'Mobile phone updated successfully',
      mobile: updatedMobile,
    });
  } catch (error) {
    console.error('Error updating mobile:', error);
    return res.status(500).json({ error: 'Failed to update mobile phone.' });
  }
};

/**
 * Delete a mobile phone
 * DELETE /api/mobiles/:id
 */
export const deleteMobile = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.mobile.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Mobile phone not found.' });
    }

    await prisma.mobile.delete({ where: { id } });

    return res.json({ message: 'Mobile phone deleted successfully.', id });
  } catch (error) {
    console.error('Error deleting mobile:', error);
    return res.status(500).json({ error: 'Failed to delete mobile phone.' });
  }
};
