import express from 'express';
import * as controller from './agent.controller.js';
import { protect } from '../../middleware/Auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', controller.create);
router.get('/', controller.list);
router.get('/:id', controller.get);
router.patch('/:id', controller.update);

export default router;
