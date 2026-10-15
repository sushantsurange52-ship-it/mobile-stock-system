import { Router } from 'express';
import {
  getMobiles,
  getMobileById,
  createMobile,
  updateMobile,
  deleteMobile,
} from '../controllers/mobiles.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Apply auth middleware to all mobile endpoints
router.use(authenticateToken);

router.get('/', getMobiles);
router.get('/:id', getMobileById);
router.post('/', createMobile);
router.put('/:id', updateMobile);
router.delete('/:id', deleteMobile);

export default router;
