import prisma from '../prisma.js';

/**
 * Get all suppliers (with count of linked phones)
 * GET /api/suppliers
 */
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        _count: {
          select: { mobiles: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    return res.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return res.status(500).json({ error: 'Failed to retrieve suppliers.' });
  }
};

/**
 * Get single supplier by ID
 * GET /api/suppliers/:id
 */
export const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        mobiles: {
          select: {
            id: true,
            brand: true,
            model: true,
            variant: true,
            quantity: true,
          },
        },
      },
    });

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found.' });
    }

    return res.json(supplier);
  } catch (error) {
    console.error('Error fetching supplier:', error);
    return res.status(500).json({ error: 'Failed to retrieve supplier details.' });
  }
};

/**
 * Create a new supplier
 * POST /api/suppliers
 */
export const createSupplier = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Supplier name is required.' });
    }

    const supplier = await prisma.supplier.create({
      data: {
        name: name.trim(),
        phone: phone ? phone.trim() : null,
        email: email ? email.trim() : null,
        address: address ? address.trim() : null,
      },
    });

    return res.status(201).json({
      message: 'Supplier created successfully',
      supplier,
    });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return res.status(500).json({ error: 'Failed to create supplier.' });
  }
};

/**
 * Update a supplier
 * PUT /api/suppliers/:id
 */
export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address } = req.body;

    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Supplier not found.' });
    }

    const updated = await prisma.supplier.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone ? phone.trim() : null }),
        ...(email !== undefined && { email: email ? email.trim() : null }),
        ...(address !== undefined && { address: address ? address.trim() : null }),
      },
    });

    return res.json({
      message: 'Supplier updated successfully',
      supplier: updated,
    });
  } catch (error) {
    console.error('Error updating supplier:', error);
    return res.status(500).json({ error: 'Failed to update supplier.' });
  }
};

/**
 * Delete a supplier
 * DELETE /api/suppliers/:id
 */
export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Supplier not found.' });
    }

    // Set supplierId to null for any linked mobiles, then delete
    await prisma.supplier.delete({ where: { id } });

    return res.json({ message: 'Supplier deleted successfully.', id });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return res.status(500).json({ error: 'Failed to delete supplier.' });
  }
};
