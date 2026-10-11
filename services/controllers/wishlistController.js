import db from '../config/db.js';

// 1. ดึงรายการโปรดทั้งหมดของผู้ใช้ พร้อมระบบดักจับ Error และป้องกันข้อมูลสูญหาย
export const getWishlist = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is missing from token' });
        }

        const query = `
      SELECT w.id as wishlist_id, p.*, s.shop_name 
      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      LEFT JOIN shops s ON p.seller_id = s.seller_id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `;

        const [rows] = await db.query(query, [userId]);

        // ส่งข้อมูลกลับไปแบบยืดหยุ่น (ถึงแม้จะไม่มีรายการโปรด ก็ส่ง array เปล่าไปแทนที่จะเป็น error)
        return res.status(200).json({
            success: true,
            count: rows.length,
            data: rows || []
        });

    } catch (error) {
        console.error('Error fetching wishlist:', error);
        return res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงรายการโปรด กรุณาลองใหม่อีกครั้ง',
            error: error.message
        });
    }
};

// 2. เพิ่มหรือลบสินค้าออกจากรายการโปรด (Toggle) พร้อมเช็กความถูกต้องรอบด้าน
export const toggleWishlist = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { productId } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง' });
        }

        if (!productId) {
            return res.status(400).json({ success: false, message: 'ไม่พบรหัสสินค้าที่ต้องการกดถูกใจ' });
        }

        // ตรวจสอบก่อนว่าสินค้าชิ้นนี้มีอยู่จริงในระบบหรือไม่
        const [productCheck] = await db.query('SELECT id FROM products WHERE id = ?', [productId]);
        if (productCheck.length === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบสินค้าชิ้นนี้ในระบบ' });
        }

        // เช็คสถานะการกดถูกใจเดิม
        const [existing] = await db.query(
            'SELECT * FROM wishlists WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        if (existing.length > 0) {
            // ถ้ามีอยู่แล้ว -> ลบออก (Unfavorite)
            await db.query('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?', [userId, productId]);
            return res.status(200).json({
                success: true,
                status: 'removed',
                message: 'นำออกจากรายการโปรดเรียบร้อยแล้ว'
            });
        } else {
            // ถ้ายังไม่มี -> เพิ่มเข้าไป (Favorite)
            await db.query('INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)', [userId, productId]);
            return res.status(200).json({
                success: true,
                status: 'added',
                message: 'เพิ่มลงในรายการโปรดเรียบร้อยแล้ว'
            });
        }

    } catch (error) {
        console.error('Error toggling wishlist:', error);
        return res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการบันทึกรายการโปรด',
            error: error.message
        });
    }
};