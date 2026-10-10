import express from 'express';
import { getBuyerProfile, updateBuyerProfile } from '../controllers/buyerController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// ดึงข้อมูลโปรไฟล์ผู้ซื้อ
router.get('/:userId', verifyToken, getBuyerProfile);

// อัปเดตข้อมูลโปรไฟล์และอัปโหลดรูปภาพ (avatar_url)
router.put('/:userId', verifyToken, upload.single('avatar'), updateBuyerProfile);

export default router;