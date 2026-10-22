import express from 'express';
import {
    createOrder,
    getBuyerOrders,
    getOrderById,
    getSellerOrders,
    uploadPaymentSlip,
    uploadFinalPaymentSlip,
    confirmReceivedOrder,
    requestProductUpdate,
    resolveProductUpdate
} from '../controllers/orderController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Middleware ช่วยรองรับชื่อฟิลด์ทั้ง 'payment_slip' และ 'slip' ได้อย่างยืดหยุ่น
const uploadSlipMiddleware = (req, res, next) => {
    upload.fields([
        { name: 'payment_slip', maxCount: 1 },
        { name: 'slip', maxCount: 1 }
    ])(req, res, (err) => {
        if (err) return next(err);
        if (req.files) {
            if (req.files.payment_slip && req.files.payment_slip.length > 0) {
                req.file = req.files.payment_slip[0];
            } else if (req.files.slip && req.files.slip.length > 0) {
                req.file = req.files.slip[0];
            }
        }
        next();
    });
};

router.use(verifyToken);

// รองรับการแนบไฟล์สลิป (ฟิลด์ 'payment_slip' หรือ 'slip') พร้อมการสร้างออเดอร์ทันที
router.post('/', uploadSlipMiddleware, createOrder);

router.get('/my-orders', getBuyerOrders);
router.get('/seller-orders', getSellerOrders);
router.get('/seller/:sellerId', getSellerOrders);
router.get('/:id', getOrderById);

router.post('/:id/upload-slip', uploadSlipMiddleware, uploadPaymentSlip);
router.post('/:id/upload-final-slip', uploadSlipMiddleware, uploadFinalPaymentSlip);

// Route สำหรับผู้ซื้อยืนยันรับสินค้าและเสร็จสิ้นออเดอร์
router.patch('/:id/confirm-received', confirmReceivedOrder);

// 🔔 New Routes: ระบบส่งคำร้องขออัปเดตสินค้า และเคลียร์สถานะฝั่งผู้ขาย
router.post('/:id/request-update', requestProductUpdate);
router.patch('/:id/resolve-update', resolveProductUpdate);

export default router;