import db from '../services/config/db.js'; // ตัวเชื่อมต่อ TiDB กลางของโปรเจกต์

// 1. ดึงข้อมูลโปรไฟล์ผู้ซื้อ
export const getBuyerProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const [rows] = await db.execute(
            'SELECT id, name, email, role, phone, address_no, subdistrict, district, province, zipcode, facebook, instagram, line_id, avatar_url FROM users WHERE id = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลผู้ใช้งานนี้' });
        }

        res.status(200).json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error fetching buyer profile:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. อัปเดตข้อมูลโปรไฟล์และ avatar_url (รองรับไฟล์รูปจาก Cloudinary)
export const updateBuyerProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const {
            name,
            phone,
            address_no,
            subdistrict,
            district,
            province,
            zipcode,
            facebook,
            instagram,
            line_id
        } = req.body;

        // เช็กว่ามีการอัปโหลดไฟล์รูปภาพใหม่เข้ามาผ่าน Cloudinary middleware หรือไม่
        let avatar_url = req.body.avatar_url; // กรณีส่งมาเป็นลิงก์เดิมหรือลิงก์ออนไลน์
        if (req.file && req.file.path) {
            avatar_url = req.file.path; // ลิงก์รูปภาพที่ปลอดภัยจาก Cloudinary ที่อัปโหลดจากเครื่อง
        }

        // อัปเดตข้อมูลลงตาราง users ใน TiDB
        const query = `
            UPDATE users 
            SET name = ?, phone = ?, address_no = ?, subdistrict = ?, district = ?, province = ?, zipcode = ?, facebook = ?, instagram = ?, line_id = ?, avatar_url = ?
            WHERE id = ?
        `;

        await db.execute(query, [
            name,
            phone,
            address_no,
            subdistrict,
            district,
            province,
            zipcode,
            facebook,
            instagram,
            line_id,
            avatar_url,
            userId
        ]);

        res.status(200).json({
            success: true,
            message: '✨ บันทึกข้อมูลโปรไฟล์และอัปเดตฟิลด์ avatar_url สำเร็จเรียบร้อยแล้ว!',
            avatar_url: avatar_url // ส่งค่ารูปล่าสุดกลับไปแสดงผลที่หน้าบ้าน
        });
    } catch (error) {
        console.error('Error updating buyer profile:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};