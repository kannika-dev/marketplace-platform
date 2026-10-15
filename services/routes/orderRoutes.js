import express from 'express';
import {
    createOrder,
    getBuyerOrders,
    getOrderById,
    uploadPaymentSlip,
    uploadFinalPaymentSlip,
    confirmReceivedOrder
} from '../controllers/orderController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', createOrder);
router.get('/my-orders', getBuyerOrders);
router.get('/:id', getOrderById);
router.post('/:id/upload-slip', upload.single('slip'), uploadPaymentSlip);
router.post('/:id/upload-final-slip', upload.single('slip'), uploadFinalPaymentSlip);

// เพิ่ม Route สำหรับยืนยันรับสินค้าและเสร็จสิ้นออเดอร์
router.patch('/:id/confirm-received', confirmReceivedOrder);

export default router;