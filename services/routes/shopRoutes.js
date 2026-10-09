import express from 'express';
import {
    getSellerAnalytics,
    getShopBySellerId,
    updateShopProfile
} from '../controllers/shopController.js';
import { upload } from '../middleware/uploadMiddleware.js'; // นำเข้า middleware อัปโหลด

const router = express.Router();

router.get('/analytics/:sellerId', getSellerAnalytics);
router.get('/seller/:sellerId', getShopBySellerId);

// เพิ่ม upload.fields เพื่อรองรับการอัปโหลดทั้ง logo, banner และ qr_code พร้อมกันขึ้น Cloudinary
router.put(
    '/seller/:sellerId',
    upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'banner', maxCount: 1 },
        { name: 'qr_code', maxCount: 1 }
    ]),
    updateShopProfile
);

export default router;