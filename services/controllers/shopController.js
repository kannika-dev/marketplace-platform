import pool from '../config/db.js';
import { getSecureCloudinaryUrl } from '../middleware/uploadMiddleware.js';

// ดึงข้อมูล Dashboard สรุปผลของร้านค้า
export const getSellerAnalytics = async (req, res) => {
    const { sellerId } = req.params;

    try {
        const [salesStats] = await pool.query(
            `SELECT 
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(oi.price * oi.quantity), 0) as total_revenue
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       WHERE p.seller_id = ? AND o.status != 'cancelled'`,
            [sellerId]
        );

        const [reviewStats] = await pool.query(
            `SELECT 
        COUNT(r.id) as total_reviews,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        SUM(CASE WHEN r.reply_text IS NULL THEN 1 ELSE 0 END) as pending_replies
       FROM reviews r
       JOIN products p ON r.product_id = p.id
       WHERE p.seller_id = ?`,
            [sellerId]
        );

        const [topProducts] = await pool.query(
            `SELECT 
        p.id, p.title as name, p.price, p.image_url,
        SUM(oi.quantity) as total_sold
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN orders o ON oi.order_id = o.id
       WHERE p.seller_id = ? AND o.status != 'cancelled'
       GROUP BY p.id
       ORDER BY total_sold DESC
       LIMIT 3`,
            [sellerId]
        );

        const [recentReviews] = await pool.query(
            `SELECT r.*, u.name as reviewer_name, p.title as product_name
       FROM reviews r
       JOIN products p ON r.product_id = p.id
       LEFT JOIN users u ON r.buyer_id = u.id
       WHERE p.seller_id = ?
       ORDER BY r.created_at DESC
       LIMIT 5`,
            [sellerId]
        );

        res.json({
            totalRevenue: Number(salesStats[0].total_revenue),
            totalOrders: Number(salesStats[0].total_orders),
            avgRating: Number(Number(reviewStats[0].avg_rating).toFixed(1)),
            totalReviews: Number(reviewStats[0].total_reviews),
            pendingReplies: Number(reviewStats[0].pending_replies),
            topProducts,
            recentReviews
        });
    } catch (error) {
        console.error('Error fetching seller analytics:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล Analytics' });
    }
};

// ดึงข้อมูลร้านค้าตาม sellerId
export const getShopBySellerId = async (req, res) => {
    const { sellerId } = req.params;
    try {
        const [shops] = await pool.query('SELECT * FROM shops WHERE seller_id = ?', [sellerId]);
        if (shops.length === 0) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลร้านค้า' });
        }
        res.json(shops[0]);
    } catch (error) {
        console.error('Error fetching shop:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลร้านค้า' });
    }
};

// อัปเดตหรือสร้างข้อมูลร้านค้าใหม่ (Upsert) - รองรับ Cloudinary ผ่าน req.files หรือ req.body
export const updateShopProfile = async (req, res) => {
    const { sellerId } = req.params;

    try {
        // 1. ดึงข้อมูลเดิมของร้านค้าจากฐานข้อมูลก่อน
        const [existingShops] = await pool.query('SELECT * FROM shops WHERE seller_id = ?', [sellerId]);
        const existing = existingShops.length > 0 ? existingShops[0] : null;

        let {
            shop_name, bio, logo_url, banner_url, phone, line_id,
            address, bank_name, bank_account, account_name,
            promptpay_number, qr_code_url, accept_credit_card
        } = req.body;

        // จัดการ Logo URL:
        // ถ้ามีไฟล์ใหม่ -> ใช้ Cloudinary HTTPS URL
        // ถ้าไม่มีไฟล์ใหม่ แต่ส่ง URL ที่ไม่ใช่ค่าว่างมา -> ใช้ URL นั้น
        // ถ้าไม่ส่งมา หรือเป็นค่าว่าง -> คงค่าเดิมใน DB ไว้ ห้ามทับด้วย null
        let finalLogoUrl = existing ? existing.logo_url : null;
        if (req.files && req.files.logo && req.files.logo[0]) {
            finalLogoUrl = getSecureCloudinaryUrl(req.files.logo[0]);
        } else if (req.file && req.body.type === 'logo') {
            finalLogoUrl = getSecureCloudinaryUrl(req.file);
        } else if (logo_url !== undefined && logo_url !== null && typeof logo_url === 'string' && logo_url.trim() !== '') {
            finalLogoUrl = logo_url.trim();
        }

        // จัดการ Banner URL:
        let finalBannerUrl = existing ? existing.banner_url : null;
        if (req.files && req.files.banner && req.files.banner[0]) {
            finalBannerUrl = getSecureCloudinaryUrl(req.files.banner[0]);
        } else if (req.file && req.body.type === 'banner') {
            finalBannerUrl = getSecureCloudinaryUrl(req.file);
        } else if (banner_url !== undefined && banner_url !== null && typeof banner_url === 'string' && banner_url.trim() !== '') {
            finalBannerUrl = banner_url.trim();
        }

        // จัดการ QR Code URL:
        let finalQrCodeUrl = existing ? existing.qr_code_url : null;
        if (req.files && req.files.qr_code && req.files.qr_code[0]) {
            finalQrCodeUrl = getSecureCloudinaryUrl(req.files.qr_code[0]);
        } else if (req.file && req.body.type === 'qr_code') {
            finalQrCodeUrl = getSecureCloudinaryUrl(req.file);
        } else if (qr_code_url !== undefined && qr_code_url !== null && typeof qr_code_url === 'string' && qr_code_url.trim() !== '') {
            finalQrCodeUrl = qr_code_url.trim();
        }

        const finalShopName = shop_name !== undefined ? shop_name : (existing?.shop_name || 'สตูดิโอช่างฝีมือ');
        const finalBio = bio !== undefined ? bio : (existing?.bio || '');
        const finalPhone = phone !== undefined ? phone : (existing?.phone || '');
        const finalLineId = line_id !== undefined ? line_id : (existing?.line_id || '');
        const finalAddress = address !== undefined ? address : (existing?.address || '');
        const finalBankName = bank_name !== undefined ? bank_name : (existing?.bank_name || 'กสิกรไทย (KBANK)');
        const finalBankAccount = bank_account !== undefined ? bank_account : (existing?.bank_account || '');
        const finalAccountName = account_name !== undefined ? account_name : (existing?.account_name || '');
        const finalPromptpay = promptpay_number !== undefined ? promptpay_number : (existing?.promptpay_number || '');
        const finalCreditCard = accept_credit_card !== undefined
            ? (accept_credit_card === true || accept_credit_card === 'true' || Number(accept_credit_card) === 1 ? 1 : 0)
            : (existing?.accept_credit_card || 0);

        if (!existing) {
            // ถ้ายังไม่มี ให้ INSERT ข้อมูลใหม่
            await pool.query(
                `INSERT INTO shops (
                    seller_id, shop_name, bio, logo_url, banner_url, 
                    phone, line_id, address, bank_name, bank_account, 
                    account_name, promptpay_number, qr_code_url, accept_credit_card
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    sellerId, finalShopName, finalBio, finalLogoUrl, finalBannerUrl,
                    finalPhone, finalLineId, finalAddress, finalBankName, finalBankAccount,
                    finalAccountName, finalPromptpay, finalQrCodeUrl, finalCreditCard
                ]
            );
        } else {
            // ถ้ามีแล้ว ให้ UPDATE โดยใช้ค่าที่ตรวจสอบแล้ว
            await pool.query(
                `UPDATE shops SET 
                    shop_name = ?, bio = ?, logo_url = ?, banner_url = ?, 
                    phone = ?, line_id = ?, address = ?, bank_name = ?, 
                    bank_account = ?, account_name = ?, promptpay_number = ?, 
                    qr_code_url = ?, accept_credit_card = ? 
                 WHERE seller_id = ?`,
                [
                    finalShopName, finalBio, finalLogoUrl, finalBannerUrl,
                    finalPhone, finalLineId, finalAddress, finalBankName,
                    finalBankAccount, finalAccountName, finalPromptpay,
                    finalQrCodeUrl, finalCreditCard,
                    sellerId
                ]
            );
        }

        res.json({
            success: true,
            message: 'บันทึกข้อมูลร้านค้าเรียบร้อยแล้ว',
            data: {
                logo_url: finalLogoUrl,
                banner_url: finalBannerUrl,
                qr_code_url: finalQrCodeUrl
            }
        });
    } catch (error) {
        console.error('Error updating/creating shop:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลร้านค้า: ' + error.message });
    }
};