import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ImageUploadDropzone from '../../components/common/ImageUploadDropzone';

export default function ShopProfile() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingField, setUploadingField] = useState(null); // 'logo', 'banner', หรือ 'qr'
    const [message, setMessage] = useState({ text: '', type: '' });

    const [formData, setFormData] = useState({
        shop_name: '',
        bio: '',
        logo_url: '',
        banner_url: '',
        phone: '',
        line_id: '',
        address: '',
        bank_name: 'กสิกรไทย (KBANK)',
        bank_account: '',
        account_name: '',
        promptpay_number: '',
        qr_code_url: '',
        accept_credit_card: false
    });

    useEffect(() => {
        if (user && user.id) {
            fetchShopProfile();
        }
    }, [user]);

    const fetchShopProfile = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/shops/seller/${user.id}`);
            if (res.data) {
                setFormData({
                    shop_name: res.data.shop_name || '',
                    bio: res.data.bio || '',
                    logo_url: res.data.logo_url || '',
                    banner_url: res.data.banner_url || '',
                    phone: res.data.phone || '',
                    line_id: res.data.line_id || '',
                    address: res.data.address || '',
                    bank_name: res.data.bank_name || 'กสิกรไทย (KBANK)',
                    bank_account: res.data.bank_account || '',
                    account_name: res.data.account_name || '',
                    promptpay_number: res.data.promptpay_number || '',
                    qr_code_url: res.data.qr_code_url || '',
                    accept_credit_card: Boolean(res.data.accept_credit_card)
                });
            }
        } catch (error) {
            console.error('Error fetching shop profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // ฟังก์ชันอัปโหลดรูปภาพไปยัง Cloudinary (รองรับ field เช่น logo_url, banner_url, qr_code_url)
    const handleImageUpload = async (file, fieldName) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setMessage({ text: 'กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น (JPEG, PNG, WebP)', type: 'error' });
            return;
        }

        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            setUploadingField(fieldName);
            setMessage({ text: '', type: '' });
            const res = await api.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data && res.data.url) {
                setFormData(prev => ({ ...prev, [fieldName]: res.data.url }));
                const fieldLabels = {
                    logo_url: 'โลโก้ร้าน',
                    banner_url: 'ภาพปกแบนเนอร์',
                    qr_code_url: 'QR Code'
                };
                setMessage({ text: `อัปโหลดรูปภาพ${fieldLabels[fieldName] || ''}ขึ้น Cloudinary สำเร็จ`, type: 'success' });
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            setMessage({ text: 'อัปโหลดรูปภาพไม่สำเร็จ กรุณาลองใหม่อีกครั้ง: ' + (error.response?.data?.message || error.message), type: 'error' });
        } finally {
            setUploadingField(null);
        }
    };

    const handlePaste = (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (let item of items) {
            if (item.type.indexOf('image') !== -1) {
                const file = item.getAsFile();
                if (file) {
                    // หากผู้ใช้ไม่ได้โฟกัสช่องไหนเป็นพิเศษ สามารถกำหนดค่าเริ่มต้นหรือเลือกอัปโหลดเป็นโลโก้/QR ได้ 
                    // แต่ในที่นี้หากผู้ใช้วางขณะอยู่ที่ฟอร์ม เราสามารถให้เลือก หรือถ้าอยากให้เจาะจง สามารถเพิ่ม Dropzone แยกแต่ละส่วนได้เลย
                    handleImageUpload(file, 'logo_url');
                    e.preventDefault();
                    break;
                }
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setMessage({ text: '', type: '' });
            await api.put(`/shops/seller/${user.id}`, formData);
            setMessage({ text: 'บันทึกข้อมูลโปรไฟล์ร้านค้าเรียบร้อยแล้ว', type: 'success' });
        } catch (error) {
            console.error('Error updating shop profile:', error);
            setMessage({ text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-6 text-center">กำลังโหลดข้อมูลโปรไฟล์ร้านค้า...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md my-6" onPaste={handlePaste}>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">ข้อมูลโปรไฟล์และช่องทางรับเงิน</h2>

            {message.text && (
                <div className={`p-4 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อร้านค้า / สตูดิโอ *</label>
                    <input
                        type="text"
                        name="shop_name"
                        value={formData.shop_name}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์ติดต่อ</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Line ID / ช่องทางโซเชียล</label>
                        <input
                            type="text"
                            name="line_id"
                            value={formData.line_id}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                </div>

                {/* ส่วนของโลโก้ร้าน และ แบนเนอร์ (รองรับ Drag & Drop, คลิกเลือกไฟล์ และพรีวิวทันที) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* โลโก้ร้าน */}
                    <div className="space-y-2">
                        <ImageUploadDropzone
                            label="โลโก้ร้านค้า (Store Logo)"
                            helperText="ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์ (JPEG, PNG, WebP)"
                            aspect="avatar"
                            initialUrl={formData.logo_url}
                            onFileSelect={(file) => {
                                if (file) handleImageUpload(file, 'logo_url');
                            }}
                        />
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">หรือระบุลิงก์รูปโลโก้โดยตรง (Logo URL):</label>
                            <input
                                type="text"
                                name="logo_url"
                                value={formData.logo_url}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md p-2 text-xs focus:ring-green-500 focus:border-green-500"
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    {/* ภาพปกแบนเนอร์ */}
                    <div className="space-y-2">
                        <ImageUploadDropzone
                            label="ภาพปกแบนเนอร์ร้านค้า (Store Banner)"
                            helperText="ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์ (JPEG, PNG, WebP)"
                            aspect="banner"
                            initialUrl={formData.banner_url}
                            onFileSelect={(file) => {
                                if (file) handleImageUpload(file, 'banner_url');
                            }}
                        />
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">หรือระบุลิงก์ภาพปกโดยตรง (Banner URL):</label>
                            <input
                                type="text"
                                name="banner_url"
                                value={formData.banner_url}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md p-2 text-xs focus:ring-green-500 focus:border-green-500"
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ประวัติหรือเรื่องราวแรงบันดาลใจ (Bio)</label>
                    <textarea
                        name="bio"
                        rows="3"
                        value={formData.bio}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
                    ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ธนาคารสำหรับรับเงิน</label>
                        <select
                            name="bank_name"
                            value={formData.bank_name}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="กสิกรไทย (KBANK)">กสิกรไทย (KBANK)</option>
                            <option value="ไทยพาณิชย์ (SCB)">ไทยพาณิชย์ (SCB)</option>
                            <option value="กรุงไทย (KTB)">กรุงไทย (KTB)</option>
                            <option value="กรุงเทพ (BBL)">กรุงเทพ (BBL)</option>
                            <option value="ทหารไทยธนชาต (TTB)">ทหารไทยธนชาต (TTB)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">เลขที่บัญชีธนาคาร</label>
                        <input
                            type="text"
                            name="bank_account"
                            value={formData.bank_account}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อบัญชี (เจ้าของร้าน)</label>
                        <input
                            type="text"
                            name="account_name"
                            value={formData.account_name}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์พร้อมเพย์</label>
                    <input
                        type="text"
                        name="promptpay_number"
                        value={formData.promptpay_number}
                        onChange={handleChange}
                        placeholder="เบอร์โทร หรือ เลขบัตร ปชช."
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
                    />
                </div>

                <div className="space-y-2">
                    <ImageUploadDropzone
                        label="รูปภาพ QR Code พร้อมเพย์สำหรับรับเงิน"
                        helperText="ลากไฟล์รูปภาพ QR Code มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์ หรือกด Ctrl+V เพื่อวางรูปภาพ"
                        aspect="square"
                        initialUrl={formData.qr_code_url}
                        onFileSelect={(file) => {
                            if (file) handleImageUpload(file, 'qr_code_url');
                        }}
                    />
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">หรือระบุลิงก์รูปภาพ QR Code โดยตรง (QR Code URL):</label>
                        <input
                            type="text"
                            name="qr_code_url"
                            value={formData.qr_code_url}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 text-xs focus:ring-green-500 focus:border-green-500"
                            placeholder="https://..."
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="accept_credit_card"
                        name="accept_credit_card"
                        checked={formData.accept_credit_card}
                        onChange={handleChange}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="accept_credit_card" className="text-sm text-gray-700">
                        เปิดใช้งานรับชำระเงินผ่านบัตรเครดิต / เดบิต สำหรับร้านนี้
                    </label>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition font-medium disabled:opacity-50"
                    >
                        {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                    </button>
                </div>
            </form>
        </div>
    );
}