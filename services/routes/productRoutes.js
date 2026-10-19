import express from 'express';
import {
    getProducts,
    getProductById,
    getSellerProducts,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/productController.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Seller routes (จัดการสินค้าของผู้ขาย)
router.get('/seller/products', getSellerProducts);
router.post('/seller/products', createProduct);
router.put('/seller/products/:id', updateProduct);       // 👈 ตัวนี้แหละที่หายไป!
router.delete('/seller/products/:id', deleteProduct);

export default router;