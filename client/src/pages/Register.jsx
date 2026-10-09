import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Leaf,
  Lock,
  Mail,
  User,
  Star,
  CheckCircle2,
  Heart,
  Palette
} from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      setErrorMsg('กรุณากดยอมรับข้อกำหนดการให้บริการเพื่อดำเนินการต่อ');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      await register(name, email, password);
      alert('สร้างบัญชีผู้ซื้อเรียบร้อยแล้ว! คุณสามารถเปิดร้านขายงานคราฟต์ได้ตลอดเวลาจากเมนูด้านบน');
      navigate('/products');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    setName('สมศรี ผู้หลงใหลงานคราฟต์');
    setEmail(`user_${Math.floor(Math.random() * 10000)}@craftiverse.com`);
    setPassword('123456');
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="max-w-5xl w-full clay-card rounded-3xl sm:rounded-[2.5rem] overflow-hidden border border-white shadow-2xl grid grid-cols-1 lg:grid-cols-12 bg-white/90">
        
        {/* LEFT SIDE: Editorial Visual & Floating 3D Showcase (50% on desktop) */}
        <div className="lg:col-span-6 relative bg-gradient-to-br from-[#E76F51] via-[#F4A261] to-[#2A9D8F] p-8 sm:p-12 text-white flex flex-col justify-between min-h-[420px] lg:min-h-[660px] overflow-hidden">
          
          {/* Ambient organic background glows */}
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-[#FFE6A7] rounded-full blur-3xl opacity-30 pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-[#1B4332] rounded-full blur-3xl opacity-30 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

          {/* Top Brand Tag */}
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold tracking-wide text-white shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#FFE6A7]" />
              <span>JOIN HANDMADE &amp; CRAFT MARKETPLACE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-white leading-tight">
              เปิดโลกงาน Handmade <br />
              <span className="text-[#FFE6A7]">&amp; Craft ที่สร้างเพื่อคุณ</span>
            </h2>
          </div>

          {/* Center Image with Clay Layer */}
          <div className="relative my-6 z-10">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/30 group">
              <img
                src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"
                alt="Woodcrafting and handmade design"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/90">
                <span className="font-semibold flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#FFE6A7]" /> งานไม้สักทองแพร่แท้ 100%
                </span>
                <span className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-mono">
                  Made-to-Order
                </span>
              </div>
            </div>

            {/* Floating 3D Badge */}
            <div className="absolute -bottom-5 -left-3 sm:-left-4 bg-white/95 backdrop-blur-lg p-3.5 sm:p-4 rounded-2xl shadow-xl border border-white text-stone-800 max-w-[240px] animate-float-slow">
              <div className="flex items-center gap-1.5 mb-1 text-[#2A9D8F] font-bold text-xs">
                <Leaf className="w-4 h-4" />
                <span>1,200+ Handmade &amp; Craft Artisans</span>
              </div>
              <p className="text-[11px] text-stone-600 leading-snug font-medium">
                ร่วมเป็นส่วนหนึ่งของชุมชน Handmade &amp; Craft ไทยที่ใหญ่ที่สุด
              </p>
            </div>
          </div>

          {/* Bottom Trust Indicators */}
          <div className="relative z-10 pt-4 border-t border-white/20 flex items-center justify-between text-xs text-white/90 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#FFE6A7]" />
              <span>สมัครฟรี ไร้ข้อผูกมัด</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-200" />
              <span>อัปเกรดเป็นผู้ขายได้ฟรี</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Spacious Clean Form (50% on desktop) */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between space-y-6">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FFF0EB] text-[#E76F51] flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs uppercase tracking-wider font-bold text-[#E76F51]">
                Join Handmade &amp; Craft Marketplace
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-900">
              สร้างบัญชีสมาชิกใหม่
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-normal">
              เริ่มต้นเป็น 'ผู้ซื้อ (Buyer)' และเปิดร้าน Handmade &amp; Craft ได้ทุกเมื่อ
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 bg-rose-50 text-rose-700 text-xs rounded-2xl border border-rose-200 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Google Signup Shortcut Button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 hover:border-[#E76F51] text-stone-700 text-xs font-bold flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group"
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
            <span className="group-hover:text-stone-900">สมัครสมาชิกด่วนด้วย Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-stone-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-stone-400 uppercase tracking-wider absolute">
              หรือกรอกข้อมูลสมัครสมาชิก
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">
                ชื่อ-นามสกุล หรือ นามปากกา
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="เช่น กานต์ดา ช่างปั้นศิลป์"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs pl-11 pr-4 py-3 bg-stone-50/80 border border-stone-200 rounded-2xl focus:outline-none focus:border-[#E76F51] focus:ring-4 focus:ring-[#E76F51]/10 focus:bg-white shadow-xs transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">อีเมล</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="your.email@craftiverse.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pl-11 pr-4 py-3 bg-stone-50/80 border border-stone-200 rounded-2xl focus:outline-none focus:border-[#E76F51] focus:ring-4 focus:ring-[#E76F51]/10 focus:bg-white shadow-xs transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">
                รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-11 pr-4 py-3 bg-stone-50/80 border border-stone-200 rounded-2xl focus:outline-none focus:border-[#E76F51] focus:ring-4 focus:ring-[#E76F51]/10 focus:bg-white shadow-xs transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded-lg accent-[#E76F51] cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-stone-600 cursor-pointer font-medium">
                ฉันยอมรับ <span className="text-[#2A9D8F] font-bold hover:underline">ข้อกำหนดการใช้งาน</span> และ <span className="text-[#2A9D8F] font-bold hover:underline">นโยบายความเป็นส่วนตัว</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl btn-3d-peach text-sm font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 mt-3"
            >
              <span>{loading ? 'กำลังลงทะเบียน...' : 'สมัครสมาชิกทันที'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-stone-500 font-medium">
            มีบัญชีสมาชิกอยู่แล้ว?{' '}
            <Link to="/login" className="text-[#2A9D8F] font-bold hover:underline">
              เข้าสู่ระบบที่นี่
            </Link>
          </p>

        </div>

      </div>
    </div>
  );
};

export default Register;
