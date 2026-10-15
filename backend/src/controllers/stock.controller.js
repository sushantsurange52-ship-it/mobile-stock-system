import prisma from '../prisma.js';

/**
 * Stock IN (Add stock / restock)
 * POST /api/stock/in
 * Body: { mobile_id, quantity, note }
 */
export const stockIn = async (req, res) => {
  try {
    const { mobile_id, quantity, note } = req.body;

    if (!mobile_id) {
      return res.status(400).json({ error: 'mobile_id is required.' });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive integer.' });
    }

    // Execute atomically in a Prisma interactive transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify mobile exists
      const mobile = await tx.mobile.findUnique({
        where: { id: mobile_id },
      });

      if (!mobile) {
        throw new Error('Mobile phone not found.');
      }

      // 2. Increment stock quantity
      const updatedMobile = await tx.mobile.update({
        where: { id: mobile_id },
        data: {
          quantity: {
            increment: qty,
          },
        },
      });

      // 3. Record audit transaction
      const transaction = await tx.stockTransaction.create({
        data: {
          mobileId: mobile_id,
          type: 'IN',
          quantity: qty,
          note: note ? note.trim() : 'Stock added',
          userId: req.user ? req.user.id : null,
        },
        include: {
          mobile: {
            select: { id: true, brand: true, model: true, variant: true },
          },
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return { updatedMobile, transaction };
    });

    return res.status(201).json({
      message: `Successfully added ${qty} unit(s) to stock.`,
      newQuantity: result.updatedMobile.quantity,
      mobile: result.updatedMobile,
      transaction: result.transaction,
    });
  } catch (error) {
    console.error('Error in stockIn:', error.message);
    const statusCode = error.message === 'Mobile phone not found.' ? 404 : 500;
    return res.status(statusCode).json({ error: error.message || 'Failed to add stock.' });
  }
};

/**
 * Stock OUT (Deduct stock / sale or disposal)
 * POST /api/stock/out
 * Body: { mobile_id, quantity, note }
 */
export const stockOut = async (req, res) => {
  try {
    const { mobile_id, quantity, note } = req.body;

    if (!mobile_id) {
      return res.status(400).json({ error: 'mobile_id is required.' });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive integer.' });
    }

    // Execute atomically in a Prisma interactive transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch current stock with row-level integrity
      const mobile = await tx.mobile.findUnique({
        where: { id: mobile_id },
      });

      if (!mobile) {
        const err = new Error('Mobile phone not found.');
        err.statusCode = 404;
        throw err;
      }

      // 2. Validate sufficient inventory (prevent negative stock)
      if (mobile.quantity < qty) {
        const err = new Error(
          `Insufficient stock. Available: ${mobile.quantity}, requested: ${qty}.`
        );
        err.statusCode = 400;
        throw err;
      }

      // 3. Decrement stock quantity safely
      const updatedMobile = await tx.mobile.update({
        where: { id: mobile_id },
        data: {
          quantity: {
            decrement: qty,
          },
        },
      });

      // 4. Record audit transaction
      const transaction = await tx.stockTransaction.create({
        data: {
          mobileId: mobile_id,
          type: 'OUT',
          quantity: qty,
          note: note ? note.trim() : 'Stock dispatched / sold',
          userId: req.user ? req.user.id : null,
        },
        include: {
          mobile: {
            select: { id: true, brand: true, model: true, variant: true },
          },
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return { updatedMobile, transaction };
    });

    return res.status(200).json({
      message: `Successfully deducted ${qty} unit(s) from stock.`,
      newQuantity: result.updatedMobile.quantity,
      mobile: result.updatedMobile,
      transaction: result.transaction,
    });
  } catch (error) {
    console.error('Error in stockOut:', error.message);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ error: error.message || 'Failed to deduct stock.' });
  }
};

/**
 * Get stock transactions list
 * GET /api/stock/transactions?mobile_id=&type=
 */
export const getTransactions = async (req, res) => {
  try {
    const { mobile_id, type } = req.query;

    const where = {};
    if (mobile_id) {
      where.mobileId = mobile_id;
    }
    if (type && (type === 'IN' || type === 'OUT')) {
      where.type = type;
    }

    const transactions = await prisma.stockTransaction.findMany({
      where,
      include: {
        mobile: {
          select: {
            id: true,
            brand: true,
            model: true,
            variant: true,
            color: true,
            sellingPrice: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Reasonable limit for responsiveness
    });

    return res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ error: 'Failed to retrieve stock transactions.' });
  }
};
