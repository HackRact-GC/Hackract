import express from 'express';
import * as controller from './auditLog.controller.js';
import { protect, restrictTo } from '../../middleware/Auth.middleware.js';

const router = express.Router();

router.use(protect);

// Only admins can view audit logs
router.get('/', restrictTo('SUPER_ADMIN', 'ORG_ADMIN'), controller.list);
router.get('/:id', restrictTo('SUPER_ADMIN', 'ORG_ADMIN'), controller.get);

// Manual log creation (typically done programmatically)
router.post('/', restrictTo('SUPER_ADMIN'), controller.create);

export default router;
