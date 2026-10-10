import React, { useState, useRef, useEffect } from 'react';
import { User, Phone, MapPin, Share2, Save, AlertCircle, CheckCircle2, UploadCloud, Image as ImageIcon } from 'lucide-react';

export const ProfileTab = () => {
    const BACKEND_URL = 'https://marketplace-platform.onrender.com';

    const [profile, setProfile] = useState({
        name: '',
        email: '',
        role: 'buyer',
        avatar_url: '',
        phone: '',
        address_no: '',
        subdistrict: '',
        district: '',
        province: '',
        zipcode: '',
        facebook: '',
        instagram: '',
        line_id: ''
    });

    const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
    const [previewAvatar, setPreviewAvatar] = useState(defaultAvatar);
    const [selectedFile, setSelectedFile] = useState(null);

    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const fileInputRef = useRef(null);

    const userId = localStorage.getItem('userId') || '1';

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${BACKEND_URL}/api/buyer/${userId}`, {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : ''
                    }
                });
                const result = await response.json();

                if (result.success && result.data) {
                    setProfile(result.data);
                    if (result.data.avatar_url) {
                        setPreviewAvatar(result.data.avatar_url);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch profile:', err);
                setErrorMsg('⚠️ ไม่สามารถโหลดข้อมูลโปรไฟล์จากฐานข้อมูลได้');
            }
        };

        fetchProfile();
    }, [userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setErrorMsg('⚠️ กรุณาเลือกไฟล์รูปภาพเท่านั้นค่ะ');
                return;
            }
            setSelectedFile(file);
            const imageUrl = URL.createObjectURL(file);
            setPreviewAvatar(imageUrl);
            setErrorMsg('');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            const imageUrl = URL.createObjectURL(file);
            setPreviewAvatar(imageUrl);
            setErrorMsg('');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (profile.role === 'buyer') {
            if (!profile.phone || !profile.address_no || !profile.province || !profile.zipcode) {
                setErrorMsg('⚠️ สำหรับผู้ซื้อ (Buyer) กรุณากรอกเบอร์โทรศัพท์และที่อยู่จัดส่งให้ครบถ้วนเพื่อใช้สำหรับระบบ Auto-Fill และการจัดส่งสินค้าค่ะ');
                return;
            }
        }

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();

            Object.keys(profile).forEach(key => {
                if (profile[key] !== null && profile[key] !== undefined) {
                    formData.append(key, profile[key]);
                }
            });

            if (selectedFile) {
                formData.append('avatar', selectedFile);
            }

            const response = await fetch(`${BACKEND_URL}/api/buyer/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                setSuccessMsg('✨ บันทึกข้อมูลโปรไฟล์และอัปเดตฟิลด์ avatar_url ในฐานข้อมูลสำเร็จเรียบร้อยแล้ว!');
                if (result.avatar_url) {
                    setPreviewAvatar(result.avatar_url);
                    setProfile(prev => ({ ...prev, avatar_url: result.avatar_url }));
                }
                setSelectedFile(null);
            } else {
                setErrorMsg(`⚠️ บันทึกไม่สำเร็จ: ${result.message}`);
            }
        } catch (err) {
            console.error('Failed to update profile:', err);
            setErrorMsg('⚠️ เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
        }
    };

    return (
        <div className="space-y-6 pb-16">
            <div className="border-b border-stone-100 pb-4">
                <h2 className="text-xl font-display font-extrabold text-stone-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#2A9D8F]" />
                    จัดการข้อมูลส่วนตัว (Profile & Auto-Fill Settings)
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                    ข้อมูลที่อยู่และเบอร์โทรศัพท์นี้จะถูกนำไปใช้กรอกอัตโนมัติ (Auto-Fill) เมื่อคุณทำการสั่งซื้อสินค้างานคราฟต์
                </p>
            </div>

            {errorMsg && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2 shadow-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs flex items-center gap-2 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2A9D8F]" />
                    <span>{successMsg}</span>
                </div>
            )}

            <div className="p-5 bg-emerald-50/40 rounded-3xl border-2 border-dashed border-emerald-200 flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md flex-shrink-0 bg-stone-100">
                    <img src={previewAvatar || defaultAvatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                </div>

                <div
                    className="flex-1 w-full text-center sm:text-left space-y-2 cursor-pointer"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-stone-800 font-bold text-xs">
                        <UploadCloud className="w-4 h-4 text-[#2A9D8F]" />
                        <span>คลิกเพื่ออัปโหลด หรือลากไฟล์รูปภาพมาวางที่นี่ (`avatar_url`)</span>
                    </div>
                    <p className="text-[11px] text-stone-400">
                        รองรับไฟล์รูปภาพ PNG, JPG หรือ WEBP จากเครื่องคอมพิวเตอร์ของคุณ
                    </p>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                        }}
                        className="px-3 py-1.5 bg-[#2A9D8F] text-white text-[11px] font-bold rounded-xl hover:bg-[#217A70] transition-colors shadow-sm inline-flex items-center gap-1"
                    >
                        <ImageIcon className="w-3.5 h-3.5" /> เลือกไฟล์รูปจากเครื่อง
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">ชื่อ -นามสกุล (`name`)</label>
                        <input
                            type="text"
                            name="name"
                            value={profile.name || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]/30"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">อีเมล (`email`)</label>
                        <input
                            type="email"
                            name="email"
                            value={profile.email || ''}
                            disabled
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs bg-stone-100 text-stone-500 cursor-not-allowed"
                        />
                        <span className="text-[10px] text-stone-400 mt-1 block">*อีเมลใช้สำหรับเข้าสู่ระบบ ไม่สามารถแก้ไขได้</span>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-stone-100">
                    <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#2A9D8F]" />
                        ข้อมูลการติดต่อหลัก {profile.role === 'buyer' && <span className="text-rose-500 text-[10px] font-normal">(บังคับสำหรับ Buyer)</span>}
                    </h3>

                    <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                            เบอร์โทรศัพท์สำหรับติดต่อ/จัดส่ง (`phone`) {profile.role === 'buyer' && <span className="text-rose-500">*</span>}
                        </label>
                        <input
                            type="text"
                            name="phone"
                            value={profile.phone || ''}
                            onChange={handleChange}
                            placeholder="เช่น 0812345678"
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]/30"
                        />
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-stone-100">
                    <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#2A9D8F]" />
                        ที่อยู่จัดส่งพัสดุ (สำหรับระบบ Auto-Fill ตอนชำระเงิน)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-stone-700 mb-1">บ้านเลขที่ / ซอย / หมู่ (`address_no`)</label>
                            <input
                                type="text"
                                name="address_no"
                                value={profile.address_no || ''}
                                onChange={handleChange}
                                placeholder="เช่น 123/45 หมู่บ้านคราฟต์วิลล์ ซอย 3"
                                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]/30"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-700 mb-1">ตำบล / แขวง (`subdistrict`)</label>
                            <input
                                type="text"
                                name="subdistrict"
                                value={profile.subdistrict || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]/30"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-700 mb-1">อำเภอ / เขต (`district`)</label>
                            <input
                                type="text"
                                name="district"
                                value={profile.district || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]/30"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-700 mb-1">จังหวัด (`province`)</label>
                            <input
                                type="text"
                                name="province"
                                value={profile.province || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]/30"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-700 mb-1">รหัสไปรษณีย์ (`zipcode`)</label>
                            <input
                                type="text"
                                name="zipcode"
                                value={profile.zipcode || ''}
                                onChange={handleChange}
                                placeholder="เช่น 10110"
                                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]/30"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-stone-100">
                    <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5 text-[#2A9D8F]" />
                        ช่องทางติดต่อเสริม (Social Links)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-700 mb-1">Facebook (`facebook`)</label>
                            <input
                                type="text"
                                name="facebook"
                                value={profile.facebook || ''}
                                onChange={handleChange}
                                placeholder="ชื่อเฟสบุ๊คหรือลิงก์"
                                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]/30"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-700 mb-1">Instagram (`instagram`)</label>
                            <input
                                type="text"
                                name="instagram"
                                value={profile.instagram || ''}
                                onChange={handleChange}
                                placeholder="@username"
                                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]/30"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-700 mb-1">Line ID (`line_id`)</label>
                            <input
                                type="text"
                                name="line_id"
                                value={profile.line_id || ''}
                                onChange={handleChange}
                                placeholder="ไอดีไลน์"
                                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]/30"
                            />
                        </div>
                    </div>
                </div>

                {/* ปุ่มบันทึกดีไซน์ใหม่ สีเขียวพรีเมียม ชัดเจน ไม่หาย */}
                <div className="pt-6 border-t border-stone-100 flex justify-end pb-12">
                    <button
                        type="submit"
                        className="px-6 py-3 rounded-2xl text-xs font-bold text-white bg-[#2A9D8F] hover:bg-[#217A70] active:scale-95 shadow-lg flex items-center gap-2 transition-all cursor-pointer"
                    >
                        <Save className="w-4 h-4" />
                        <span>บันทึกข้อมูลโปรไฟล์</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileTab;