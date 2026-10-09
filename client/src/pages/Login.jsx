import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Leaf,
  Lock,
  Mail,
  Star,
  CheckCircle2,
  Heart,
  X,
  Send,
  CheckCircle
} from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // States สำหรับ Modal ลืมรหัสผ่าน
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatus, setForgotStatus] = useState({ type: '', msg: '' });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'seller') {
        navigate('/seller/dashboard');
      } else {
        navigate('/products');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotStatus({ type: '', msg: '' });
    setForgotLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email: forgotEmail });
      setForgotStatus({
        type: 'success',
        msg: res.data.message || 'ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณเรียบร้อยแล้ว'
      });
    } catch (err) {
      setForgotStatus({
        type: 'error',
        msg: err.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง'
      });
    } finally {
      setForgotLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('123456');
  };

  const handleGoogleLogin = () => {
    fillDemoAccount('buyer@craftiverse.com');
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-10 relative">
      <div className="max-w-5xl w-full clay-card rounded-3xl sm:rounded-[2.5rem] overflow-hidden border border-white shadow-2xl grid grid-cols-1 lg:grid-cols-12 bg-white/90">

        {/* LEFT SIDE: Editorial Visual & Floating 3D Testimonial */}
        <div className="lg:col-span-6 relative bg-gradient-to-br from-[#2A9D8F] via-[#358F80] to-[#1B4332] p-8 sm:p-12 text-white flex flex-col justify-between min-h-[420px] lg:min-h-[640px] overflow-hidden">

          <div className="absolute -top-12 -left-12 w-64 h-64 bg-[#FFE6A7] rounded-full blur-3xl opacity-20 pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-[#F4A261] rounded-full blur-3xl opacity-25 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-bold tracking-wide text-[#FFE6A7]">
              <Sparkles className="w-3.5 h-3.5 text-[#FFE6A7]" />
              <span>HANDMADE &amp; CRAFT MARKETPLACE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-white leading-tight">
              เชื่อมต่องาน Handmade <br />
              <span className="text-[#FFE6A7]">&amp; Craft</span> ที่มีจิตวิญญาณ
            </h2>
          </div>

          <div className="relative my-6 z-10">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/30 group">
              <img
                src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80"
                alt="Ceramic Crafting"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/90">
                <span className="font-semibold flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-[#95D5B2]" /> สตูดิโอ Handmade เชียงใหม่
                </span>
                <span className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-mono">
                  100% HANDMADE ORIGIN
                </span>
              </div>
            </div>

            <div className="absolute -bottom-5 -right-3 sm:-right-4 bg-white/95 backdrop-blur-lg p-3.5 sm:p-4 rounded-2xl shadow-xl border border-white text-stone-800 max-w-[240px] animate-float-slow">
              <div className="flex items-center gap-1 text-amber-400 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-[11px] font-semibold text-stone-800 leading-snug">
                “Crafted with passion — สัมผัสเสน่ห์งาน Handmade &amp; Craft ที่แท้จริง”
              </p>
              <span className="text-[10px] text-[#2A9D8F] font-bold block mt-1">
                คุณพลอย • สมาชิก Craftiverse Marketplace
              </span>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-white/80">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#95D5B2]" />
              <span>คุ้มครองคำสั่งซื้อ 100%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-[#FFD7BA]" />
              <span>สนับสนุนช่างฝีมือไทย</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Clean Form */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between space-y-6">

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#E8F7F3] text-[#2A9D8F] flex items-center justify-center font-bold">
                <Leaf className="w-4 h-4" />
              </div>
              <span className="text-xs uppercase tracking-wider font-bold text-[#2A9D8F]">
                Welcome Back to Handmade &amp; Craft Marketplace
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-900">
              เข้าสู่ระบบ Craftiverse
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-normal">
              เข้าสู่ระบบเพื่อติดตามงาน Handmade &amp; Craft คู่ของคุณ หรือจัดการร้านคราฟต์สตูดิโอ
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 bg-rose-50 text-rose-700 text-xs rounded-2xl border border-rose-200 font-medium">
              {errorMsg}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 hover:border-[#2A9D8F] text-stone-700 text-xs font-bold flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="group-hover:text-stone-900">ดำเนินการต่อด้วยบัญชี Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-stone-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-stone-400 uppercase tracking-wider absolute">
              หรือเข้าสู่ระบบด้วยอีเมล
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">อีเมล</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="artisan@craftiverse.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pl-11 pr-4 py-3 bg-stone-50/80 border border-stone-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F] focus:ring-4 focus:ring-[#2A9D8F]/10 focus:bg-white shadow-xs transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-700">รหัสผ่าน</label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotStatus({ type: '', msg: '' });
                    setShowForgotModal(true);
                  }}
                  className="text-[11px] font-bold text-[#E76F51] hover:underline"
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-11 pr-4 py-3 bg-stone-50/80 border border-stone-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F] focus:ring-4 focus:ring-[#2A9D8F]/10 focus:bg-white shadow-xs transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl btn-3d-peach text-sm font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 mt-3"
            >
              <span>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="p-4 bg-gradient-to-r from-[#F0F9F7] to-[#FFF9EC] rounded-2xl border border-emerald-100/80">
            <p className="text-[10px] font-bold text-[#2A9D8F] mb-2 uppercase tracking-wider text-center">
              💡 บัญชีสำหรับทดสอบระบบ (Quick Demo Click)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('buyer@craftiverse.com')}
                className="py-2 px-2 bg-white hover:bg-[#D8F3DC] text-[#2A9D8F] text-[11px] rounded-xl font-bold border border-[#A2D9D2] shadow-2xs transition-all text-center"
              >
                ผู้ซื้อ (Buyer)
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('seller@craftiverse.com')}
                className="py-2 px-2 bg-white hover:bg-[#FFE8D6] text-[#E76F51] text-[11px] rounded-xl font-bold border border-[#FFCBBF] shadow-2xs transition-all text-center"
              >
                ช่างฝีมือ (Seller)
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@craftiverse.com')}
                className="py-2 px-2 bg-stone-800 hover:bg-stone-900 text-white text-[11px] rounded-xl font-bold shadow-2xs transition-all text-center"
              >
                แอดมิน (Admin)
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-stone-500 font-medium">
            ยังไม่มีบัญชี Craftiverse?{' '}
            <Link to="/register" className="text-[#E76F51] font-bold hover:underline">
              สมัครสมาชิกใหม่
            </Link>
          </p>

        </div>

      </div>

      {/* MODAL POP-UP: ลืมรหัสผ่าน */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-100 relative animate-scale-up">
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#E76F51]/10 text-[#E76F51] flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">รีเซ็ตรหัสผ่าน</h3>
                <p className="text-xs text-stone-500">กรอกอีเมลของคุณเพื่อรับลิงก์ตั้งรหัสผ่านใหม่</p>
              </div>
            </div>

            {forgotStatus.msg && (
              <div className={`p-4 rounded-2xl text-xs font-medium mb-4 flex items-start gap-2 ${forgotStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                {forgotStatus.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" /> : null}
                <span>{forgotStatus.msg}</span>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1.5">อีเมลบัญชีของคุณ</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="artisan@craftiverse.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full text-xs pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F] focus:ring-4 focus:ring-[#2A9D8F]/10 focus:bg-white shadow-xs transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-1/2 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-1/2 py-3 rounded-2xl bg-[#2A9D8F] hover:bg-[#238377] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{forgotLoading ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ต'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;