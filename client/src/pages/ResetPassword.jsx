import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Lock, CheckCircle, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';

export const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!token) {
            setMessage({ type: 'error', text: 'ไม่พบ Token สำหรับรีเซ็ตรหัสผ่าน กรุณาลองขอลิงก์ใหม่อีกครั้ง' });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'รหัสผ่านทั้งสองช่องไม่ตรงกัน' });
            return;
        }

        setLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const res = await axios.post(`${API_URL}/auth/reset-password`, {
                token,
                newPassword
            });

            setMessage({ type: 'success', text: res.data.message || 'ตั้งรหัสผ่านใหม่สำเร็จแล้ว!' });

            // ส่งกลับไปหน้า Login หลังจากตั้งรหัสผ่านสำเร็จ 2.5 วินาที
            setTimeout(() => {
                navigate('/login');
            }, 2500);

        } catch (err) {
            setMessage({
                type: 'error',
                text: err.response?.data?.message || 'ลิงก์รีเซ็ตรหัสผ่านหมดอายุหรือไม่ถูกต้อง กรุณาทำรายการใหม่อีกครั้ง'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-stone-100">

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#2A9D8F]/10 text-[#2A9D8F] flex items-center justify-center font-bold">
                        <KeyRound className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold text-stone-900">ตั้งรหัสผ่านใหม่</h1>
                        <p className="text-xs text-stone-500">กรุณากรอกรหัสผ่านใหม่สำหรับเข้าใช้งานระบบ</p>
                    </div>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-2xl text-xs font-medium mb-5 flex items-start gap-2.5 ${message.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                        {message.type === 'success' ? (
                            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                        ) : (
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                        )}
                        <span>{message.text}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-stone-700 block mb-1.5">รหัสผ่านใหม่</label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
                            <input
                                type="password"
                                required
                                placeholder="อย่างน้อย 6 ตัวอักษร"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full text-xs pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F] focus:ring-4 focus:ring-[#2A9D8F]/10 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-stone-700 block mb-1.5">ยืนยันรหัสผ่านใหม่</label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
                            <input
                                type="password"
                                required
                                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full text-xs pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F] focus:ring-4 focus:ring-[#2A9D8F]/10 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-2xl bg-[#2A9D8F] hover:bg-[#238377] text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 mt-2"
                    >
                        {loading ? 'กำลังบันทึกรหัสผ่านใหม่...' : 'บันทึกรหัสผ่านใหม่'}
                    </button>
                </form>

                <div className="mt-6 pt-4 border-t border-stone-100 text-center">
                    <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 font-medium">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>กลับไปหน้าเข้าสู่ระบบ</span>
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default ResetPassword;