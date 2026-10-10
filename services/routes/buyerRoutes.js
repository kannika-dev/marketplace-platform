import express from 'express';
import { getBuyerProfile, updateBuyerProfile } from '../controllers/buyerController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// ดึงข้อมูลโปรไฟล์ผู้ซื้อ (ปลดล็อก verifyToken ชั่วคราวเพื่อให้ข้อมูลแสดงผลได้ทันที)[cite: 17]
router.get('/:userId', getBuyerProfile);

// อัปเดตข้อมูลโปรไฟล์และอัปโหลดรูปภาพ (ยังคงต้องใช้ verifyToken และ upload ตอนบันทึก)[cite: 17]
router.put('/:userId', verifyToken, upload.single('avatar'), updateBuyerProfile);

export default router;