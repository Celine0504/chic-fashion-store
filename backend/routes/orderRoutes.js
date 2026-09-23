import express from 'express';
import { createOrder, getOrderDetails, confirmOrderPayment } from '../controllers/orderController.js';

const router = express.Router();

router.post('/orders', createOrder);
router.get('/orders/:orderNumber', getOrderDetails);
router.post('/orders/:orderNumber/confirm', confirmOrderPayment);

export default router;
