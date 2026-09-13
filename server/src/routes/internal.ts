import { Router } from 'express';
import * as db from '../db';
import { config } from '../config';
import { ApiError, asyncHandler } from '../utils';

const router = Router();

// POST /api/internal/downgrade-expired — protegido por header x-internal-secret.
router.post(
  '/downgrade-expired',
  asyncHandler(async (req, res) => {
    const secret = req.headers['x-internal-secret'];
    if (!config.internalJobSecret || secret !== config.internalJobSecret) {
      throw new ApiError(403, 'Acesso negado.');
    }

    const count = await db.downgradeExpiredSubscriptions();
    res.json({ downgraded: count });
  })
);

export default router;
