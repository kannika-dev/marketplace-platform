import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// ตั้งค่าเชื่อมต่อ Cloudinary โดยดึงจากไฟล์ .env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true // บังคับให้ Cloudinary ส่งกลับ URL เป็น HTTPS เสมอ
});

// กำหนดค่าการจัดเก็บไฟล์บน Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'craftiverse_uploads', // โฟลเดอร์บน Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 1200, height: 1200, crop: 'limit' }] // ย่อขนาดให้อัตโนมัติถ้าใหญ่เกินไป
    }
});

// ตรวจสอบประเภทไฟล์รูปภาพ
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น (JPEG, PNG, WebP)'), false);
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // จำกัดขนาดไม่เกิน 10MB
});

/**
 * ฟังก์ชันช่วยแปลงและดึง URL ของ Cloudinary ที่เป็น HTTPS เต็มรูปแบบ 100%
 * ป้องกันปัญหา Mixed Content และภาพหายหลังรีเฟรช
 */
export const getSecureCloudinaryUrl = (file) => {
    if (!file) return null;
    let url = file.secure_url || file.path;
    if (!url) return null;
    // บังคับเปลี่ยน http:// เป็น https:// เสมอ
    if (url.startsWith('http://')) {
        url = url.replace(/^http:\/\//i, 'https://');
    }
    return url;
};

export { cloudinary };