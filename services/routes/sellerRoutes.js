import express from 'express';
import {
  getSellerDashboardStats,
  addProduct,
  getSellerProducts,
  getSellerOrders,
  updateCraftStatus,
  updateProduct,
  deleteProduct
} from '../controllers/sellerController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireRole('seller'));

router.get('/dashboard', getSellerDashboardStats);
router.get('/products', getSellerProducts);
router.post('/products', upload.single('image'), addProduct);
router.put('/products/:id', upload.single('image'), updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/orders', getSellerOrders);
router.patch('/orders/:orderId/craft-status', updateCraftStatus);

export default router;