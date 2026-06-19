import { Router } from 'express';
import authRoutes from './auth.js';
import gameRoutes from './game.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/game', gameRoutes);

export default router;
