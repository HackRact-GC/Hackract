import express from 'express';
import * as controller from './member.controller.js';
import { protect } from '../../middleware/Auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', controller.add);
router.delete('/:organizationId/:userId', controller.remove);
router.patch('/:organizationId/:userId', controller.update);

export default router;
