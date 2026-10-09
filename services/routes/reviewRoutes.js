import express from 'express';
import {
    createReview,
    getProductReviews,
    updateReview,
    deleteReview,
    replyReview
} from '../controllers/reviewController.js';

const router = express.Router();

// ดึงและสร้างรีวิว
router.post('/', createReview);
router.get('/product/:productId', getProductReviews);

// แก้ไข ลบ และตอบกลับรีวิว
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);
router.put('/:id/reply', replyReview);

export default router;