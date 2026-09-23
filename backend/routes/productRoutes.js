import express from 'express';
import { getCategories, getProducts, getProductById } from '../controllers/productController.js';

const router = express.Router();

router.get('/categories', getCategories);
router.get('/products', getProducts);
router.get('/products/:id', getProductById);

export default router;
