import express from 'express';
import { getProducts, getProductById, getSellerProducts } from '../controllers/productController.js';

const router = express.Router();

router.get('/', getProducts);
// ย้ายเส้นทางที่เป็นคำเฉพาะเจาะจงมาไว้ข้างบน ก่อนหน้า :id เสมอ
router.get('/seller/products', getSellerProducts);
router.get('/:id', getProductById);

export default router;