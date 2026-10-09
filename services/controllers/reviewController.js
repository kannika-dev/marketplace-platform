import pool from '../config/db.js';

// เพิ่มรีวิวใหม่
export const createReview = async (req, res) => {
    const { product_id, buyer_id, rating, comment } = req.body;

    if (!product_id || !buyer_id || !rating) {
        return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO reviews (product_id, buyer_id, rating, comment) VALUES (?, ?, ?, ?)',
            [product_id, buyer_id, rating, comment]
        );
        res.status(201).json({ message: 'บันทึกรีวิวสำเร็จ', reviewId: result.insertId });
    } catch (error) {
        console.error('Error inserting review:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกรีวิว' });
    }
};

// ดึงรีวิวของสินค้านั้นๆ
export const getProductReviews = async (req, res) => {
    const { productId } = req.params;

    try {
        const [reviews] = await pool.query(
            `SELECT r.*, u.name as reviewer_name 
       FROM reviews r 
       LEFT JOIN users u ON r.buyer_id = u.id 
       WHERE r.product_id = ? 
       ORDER BY r.created_at DESC`,
            [productId]
        );

        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? (reviews.reduce((acc, cur) => acc + cur.rating, 0) / totalReviews).toFixed(1)
            : 0;

        res.json({
            averageRating: Number(averageRating),
            totalReviews,
            reviews
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรีวิว' });
    }
};
// 1. แก้ไขรีวิว (เฉพาะเจ้าของรีวิว)
export const updateReview = async (req, res) => {
    const { id } = req.params;
    const { buyer_id, rating, comment } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE reviews SET rating = ?, comment = ? WHERE id = ? AND buyer_id = ?',
            [rating, comment, id, buyer_id]
        );

        if (result.affectedRows === 0) {
            return res.status(403).json({ message: 'ไม่สามารถแก้ไขได้ (ไม่ใช่เจ้าของรีวิว หรือไม่พบรีวิว)' });
        }

        res.json({ message: 'แก้ไขรีวิวเรียบร้อยแล้ว' });
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแก้ไขรีวิว' });
    }
};

// 2. ลบรีวิว (เจ้าของรีวิว หรือ Admin)
export const deleteReview = async (req, res) => {
    const { id } = req.params;
    const { user_id, role } = req.body;

    try {
        let query = 'DELETE FROM reviews WHERE id = ?';
        let params = [id];

        if (role !== 'admin') {
            query += ' AND buyer_id = ?';
            params.push(user_id);
        }

        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(403).json({ message: 'ไม่มีสิทธิ์ลบรีวิวนี้' });
        }

        res.json({ message: 'ลบรีวิวเรียบร้อยแล้ว' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบรีวิว' });
    }
};

// 3. ร้านค้าตอบกลับรีวิว
export const replyReview = async (req, res) => {
    const { id } = req.params;
    const { reply_text } = req.body;

    if (!reply_text) {
        return res.status(400).json({ message: 'กรุณากรอกข้อความตอบกลับ' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE reviews SET reply_text = ?, replied_at = CURRENT_TIMESTAMP WHERE id = ?',
            [reply_text, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'ไม่พบรีวิวที่ต้องการตอบกลับ' });
        }

        res.json({ message: 'บันทึกคำตอบกลับเรียบร้อยแล้ว' });
    } catch (error) {
        console.error('Error replying to review:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการตอบกลับรีวิว' });
    }
};