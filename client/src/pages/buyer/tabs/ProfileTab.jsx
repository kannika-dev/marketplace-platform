import React, { useState } from 'react';
import { User, Phone, MapPin, Share2, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ProfileTab = () => {
    // สมมติข้อมูลผู้ใช้จำลอง (เวลาใช้งานจริงดึงมาจาก State หลักหรือ API ของตาราง users)
    const [profile, setProfile] = useState({
        name: 'กานต์ดา มั่งคั่ง',
        email: 'kanda.craft@gmail.com',
        role: 'buyer', // 'buyer' หรือ 'admin' หรือ 'seller'
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

    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // ฟังก์ชันอัปเดตค่าในฟอร์ม
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // ฟังก์ชันกดบันทึกพร้อมเช็กเงื่อนไขบังคับเฉพาะ Buyer
    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        // เงื่อนไขสิทธิ์: ถ้าเป็น Buyer บังคับเบอร์โทร (phone) และที่อยู่จัดส่ง
        if (profile.role === 'buyer') {
            if (!profile.phone || !profile.address_no || !profile.province || !profile.zipcode) {
                setErrorMsg('⚠️ สำหรับผู้ซื้อ (Buyer) กรุณากรอกเบอร์โทรศัพท์และที่อยู่จัดส่งให้ครบถ้วนเพื่อใช้สำหรับระบบ Auto-Fill และการจัดส่งสินค้าค่ะ');
                return;
            }
        }

        // จำลองการบันทึกข้อมูลลงตาราง users สำเร็จ
        console.log('Saving to users table:', profile);
        setSuccessMsg('✨ บันทึกข้อมูลโปรไฟล์สำเร็จเรียบร้อยแล้ว!');
    };

    return (
        <div className="space-y-6">
            <div className="border-b border-stone-100 pb-4">
                <h2 className="text-xl font-display font-extrabold text-stone-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#2A9D8F]" />
                    จัดการข้อมูลส่วนตัว (Profile & Auto-Fill Settings)
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                    ข้อมูลที่อยู่และเบอร์โทรศัพท์นี้จะถูกนำไปใช้กรอกอัตโนมัติ (Auto-Fill) เมื่อคุณทำการสั่งซื้อสินค้างานคราฟต์
                </p>
            </div>

            {/* แจ้งเตือนข้อผิดพลาด (ถ้ามี) */}
            {errorMsg && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2 shadow-sm animate-shake">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* แจ้งเตือนบันทึกสำเร็จ */}
            {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs flex items-center gap-2 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2A9D8F]" />
                    <span>{successMsg}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* ข้อมูลพื้นฐานทั่วไป */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">ชื่อ -นามสกุล (`name`)</label>
                        <input
                            type="text"
                            name="name"
                            value={profile.name}
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
                            value={profile.email}
                            disabled
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs bg-stone-100 text-stone-500 cursor-not-allowed"
                        />
                        <span className="text-[10px] text-stone-400 mt-1 block">*อีเมลใช้สำหรับเข้าสู่ระบบ ไม่สามารถแก้ไขได้</span>
                    </div>
                </div>

                {/* ข้อมูลการติดต่อ (บังคับเบอร์โทรเฉพาะ Buyer) */}
                <div className="space-y-4 pt-4 border-t border-stone-100">
                    <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#2A9D8F]" />
                        ข้อมูลการติดต่อหลัก {profile.role === 'buyer' && <span className="text-rose-500 text-[10px] font-normal">(บังคับสำหรับ Buyer)</span>}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-700 mb-1">
                                เบอร์โทรศัพท์สำหรับติดต่อ/จัดส่ง (`phone`) {profile.role === 'buyer' && <span className="text-rose-500">*</span>}
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={profile.phone}
                                onChange={handleChange}
                                placeholder="เช่น 0812345678"
                                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]/30"
                            />
                        </div>
                    </div>
                </div>

                {/* ข้อมูลที่อยู่สำหรับ Auto-Fill */}
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
                                value={profile.address_no}
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
                                value={profile.subdistrict}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]/30"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-700 mb-1">อำเภอ / เขต (`district`)</label>
                            <input
                                type="text"
                                name="district"
                                value={profile.district}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]/30"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-700 mb-1">จังหวัด (`province`)</label>
                            <input
                                type="text"
                                name="province"
                                value={profile.province}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]/30"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-700 mb-1">รหัสไปรษณีย์ (`zipcode`)</label>
                            <input
                                type="text"
                                name="zipcode"
                                value={profile.zipcode}
                                onChange={handleChange}
                                placeholder="เช่น 10110"
                                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]/30"
                            />
                        </div>
                    </div>
                </div>

                {/* ช่องทางติดต่อเสริม (Social Links) */}
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
                                value={profile.facebook}
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
                                value={profile.instagram}
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
                                value={profile.line_id}
                                onChange={handleChange}
                                placeholder="ไอดีไลน์"
                                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]/30"
                            />
                        </div>
                    </div>
                </div>

                {/* ปุ่มบันทึก */}
                <div className="pt-6 border-t border-stone-100 flex justify-end">
                    <button
                        type="submit"
                        className="btn-3d-botanical px-6 py-3 rounded-2xl text-xs font-bold text-white shadow-md flex items-center gap-2 hover:opacity-90 transition-all"
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