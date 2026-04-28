import { Router } from 'express';

import * as AuthController from '../controllers/auth.controller.js';
import * as CenterController from '../controllers/center.controller.js';

const router = Router();

// Global routes (no center slug required)
router.post('/centers', CenterController.create);
router.get('/auth/me', AuthController.me);

export default router;
