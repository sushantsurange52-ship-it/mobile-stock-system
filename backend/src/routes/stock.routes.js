import { Router } from 'express';
import { stockIn, stockOut, getTransactions } from '../controllers/stock.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Protected routes
router.use(authenticateToken);

router.post('/in', stockIn);
router.post('/out', stockOut);
router.get('/transactions', getTransactions);

export default router;
