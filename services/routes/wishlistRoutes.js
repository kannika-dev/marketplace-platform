import express from 'express';
import { getWishlist, toggleWishlist } from '../controllers/wishlistController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// กำหนด Endpoint สำหรับรายการโปรด (Wishlist) พร้อมระบบตรวจสอบ Token
router.get('/', verifyToken, getWishlist);
router.post('/toggle', verifyToken, toggleWishlist);

export default router;