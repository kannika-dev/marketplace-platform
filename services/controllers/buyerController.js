import db from '../config/db.js';

// ดึงข้อมูลโปรไฟล์ผู้ซื้อจาก Token หรือ ID
export const getBuyerProfile = async (req, res) => {
    try {
        // ใช้ userId จาก URL หรือถ้ามียศจาก Token ให้ดึงตาม Token ได้เลย
        const userId = req.params.userId || req.user?.id;

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

// อัปเดตข้อมูลโปรไฟล์และ avatar_url (ป้องกัน Error ด้วยการแปลง undefined เป็น null)
export const updateBuyerProfile = async (req, res) => {
    try {
        const userId = req.params.userId || req.user?.id;
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

        let avatar_url = req.body.avatar_url || null;
        if (req.file && req.file.path) {
            avatar_url = req.file.path;
        }

        const safeName = name ?? null;
        const safePhone = phone ?? null;
        const safeAddressNo = address_no ?? null;
        const safeSubdistrict = subdistrict ?? null;
        const safeDistrict = district ?? null;
        const safeProvince = province ?? null;
        const safeZipcode = zipcode ?? null;
        const safeFacebook = facebook ?? null;
        const safeInstagram = instagram ?? null;
        const safeLineId = line_id ?? null;
        const safeAvatarUrl = avatar_url ?? null;

        const query = `
            UPDATE users 
            SET name = ?, phone = ?, address_no = ?, subdistrict = ?, district = ?, province = ?, zipcode = ?, facebook = ?, instagram = ?, line_id = ?, avatar_url = ?
            WHERE id = ?
        `;

        await db.execute(query, [
            safeName,
            safePhone,
            safeAddressNo,
            safeSubdistrict,
            safeDistrict,
            safeProvince,
            safeZipcode,
            safeFacebook,
            safeInstagram,
            safeLineId,
            safeAvatarUrl,
            userId
        ]);

        res.status(200).json({
            success: true,
            message: '✨ บันทึกข้อมูลโปรไฟล์สำเร็จเรียบร้อยแล้ว!',
            avatar_url: safeAvatarUrl
        });
    } catch (error) {
        console.error('Error updating buyer profile:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};