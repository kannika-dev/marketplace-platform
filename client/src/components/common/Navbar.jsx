import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingBag,
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  PlusCircle,
  ClipboardList,
  Menu,
  X,
  LogOut,
  ArrowRight,
  Store // 👈 เพิ่มไอคอน Store สำหรับปุ่มโปรไฟล์ร้านค้า
} from 'lucide-react';
import Badge from './Badge';

// Quick-Filter Category Bar data
const QUICK_CATEGORIES = [
  { emoji: '🧶', label: 'งานเย็บปักถักร้อย', id: 'Textiles' },
  { emoji: '🕯️', label: 'เทียนหอม & สกินแคร์', id: 'Candles' },
  { emoji: '🍵', label: 'เซรามิก & งานปั้น', id: 'Ceramics' },
  { emoji: '👜', label: 'เครื่องหนังทำมือ', id: 'Leather' },
  { emoji: '🪵', label: 'งานไม้ & Craft', id: 'Woodcraft' },
  { emoji: '💍', label: 'เครื่องประดับ Handmade', id: 'Jewelry' },
];

export const Navbar = () => {
  const { user, role, logout, cart, upgradeToSeller } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleUpgradeToSeller = async () => {
    if (!window.confirm('คุณต้องการเปิดสตูดิโอบบน Craftiverse Handmade & Craft Marketplace หรือไม่?')) {
      return;
    }
    setIsUpgrading(true);
    try {
      await upgradeToSeller({
        shop_name: `${user.name}'s Handmade Studio`,
        shop_bio: 'งาน Handmade ทำมือและงาน Craft ระดับมาสเตอร์พีซ ผสานจิตวิญญาณแห่งศิลปะร่วมสมัย'
      });
      alert('ยินดีด้วย! สตูดิโอ Handmade & Craft ของคุณเปิดให้บริการแล้ว');
      navigate('/seller/dashboard');
    } catch (err) {
      alert('ไม่สามารถอัปเกรดบทบาทได้: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF9F5]/95 backdrop-blur-md border-b border-stone-200/80 transition-all">

      {/* ── TOP ANNOUNCEMENT BAR ── */}
      <div className="bg-[#1B4332] text-[#F4F9F4] text-[10px] sm:text-[11px] font-mono tracking-widest py-2 px-4 text-center">
        <span className="inline-flex items-center gap-2 flex-wrap justify-center">
          <span className="text-[#FFE6A7] animate-pulse">✨</span>
          <span className="font-bold">
            ศูนย์รวมงาน Handmade ประณีต &amp; งาน Craft
          </span>
          <span className="hidden sm:inline text-[#95D5B2] mx-1">|</span>
          <span className="hidden sm:inline">
            🚚 จัดส่งฟรีเมื่อสั่ง Made-to-Order ครบ{' '}
            <strong className="text-[#FFE6A7]">999.-</strong>
          </span>
        </span>
      </div>

      {/* ── MAIN NAV BAR ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo & Brand Tagline */}
          <Link to="/" className="flex items-center gap-3.5 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#1B4332] flex items-center justify-center text-[#FFE6A7] font-display font-extrabold text-xl shadow-md transition-transform duration-300 group-hover:scale-105">
              C
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-stone-900 block leading-none">
                Craftiverse<span className="text-[#E76F51]">.</span>
              </span>
              <span className="text-[8px] sm:text-[9px] tracking-[0.22em] text-stone-400 uppercase font-mono font-bold block mt-0.5">
                HANDMADE &amp; CRAFT MARKETPLACE
              </span>
            </div>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-bold uppercase tracking-wider text-stone-700">
            <Link
              to="/"
              className="hover:text-[#E76F51] transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-[#E76F51] after:transition-all"
            >
              หน้าหลัก
            </Link>
            <Link
              to="/products"
              className="hover:text-[#E76F51] transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-[#E76F51] after:transition-all"
            >
              Marketplace
            </Link>

            {/* Seller Navigation */}
            {role === 'seller' && (
              <div className="flex items-center gap-2.5 bg-white px-3.5 py-1.5 rounded-full border border-stone-200 shadow-xs">
                <Link to="/seller/dashboard" className="flex items-center gap-1 text-stone-900 hover:text-[#E76F51]">
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#1B4332]" />
                  Dashboard
                </Link>
                <span className="text-stone-300">|</span>
                <Link to="/seller/add-product" className="flex items-center gap-1 text-stone-900 hover:text-[#E76F51]">
                  <PlusCircle className="w-3.5 h-3.5 text-[#E76F51]" />
                  เพิ่มงาน
                </Link>
                <span className="text-stone-300">|</span>
                <Link to="/seller/orders" className="flex items-center gap-1 text-stone-900 hover:text-[#E76F51]">
                  <ClipboardList className="w-3.5 h-3.5 text-[#1B4332]" />
                  ออเดอร์
                </Link>
                <span className="text-stone-300">|</span>
                <Link to="/seller/profile" className="flex items-center gap-1 text-emerald-800 hover:text-emerald-700 font-bold">
                  <Store className="w-3.5 h-3.5" />
                  โปรไฟล์ร้าน
                </Link>
              </div>
            )}

            {/* Admin Navigation */}
            {role === 'admin' && (
              <div className="flex items-center gap-3 bg-[#FFF9EC] px-4 py-1.5 rounded-full border border-[#FFE6A7] shadow-xs">
                <Link to="/admin/dashboard" className="flex items-center gap-1.5 text-stone-900 hover:text-[#E76F51]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  Admin Board
                </Link>
                <span className="text-amber-200">|</span>
                <Link to="/admin/verify-payments" className="text-stone-900 hover:text-[#E76F51]">
                  ตรวจสลิป
                </Link>
                <span className="text-amber-200">|</span>
                <Link to="/admin/users" className="text-stone-900 hover:text-[#E76F51]">
                  ผู้ใช้งาน
                </Link>
              </div>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center gap-4">

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full bg-white border border-stone-200 hover:border-stone-400 text-stone-800 shadow-xs transition-all hover:scale-105"
              title="ตะกร้า Handmade & Craft"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E76F51] text-white text-[10px] font-mono font-bold rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-stone-200">

                {role === 'buyer' && (
                  <button
                    onClick={handleUpgradeToSeller}
                    disabled={isUpgrading}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-full bg-white text-stone-800 border border-stone-300 hover:border-[#E76F51] hover:text-[#E76F51] shadow-xs transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#E76F51]" />
                    <span>{isUpgrading ? 'กำลังเปิด...' : 'เปิดร้าน Handmade'}</span>
                  </button>
                )}

                <Link
                  to="/orders"
                  className="text-xs font-bold uppercase tracking-wider text-stone-600 hover:text-stone-900 px-2 py-1"
                >
                  My Orders
                </Link>

                <div className="flex items-center gap-2.5 bg-white pl-3.5 pr-2 py-1.5 rounded-full border border-stone-200 shadow-xs">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-stone-900 leading-tight">{user.name}</span>
                    <Badge variant={role === 'admin' ? 'emerald' : role === 'seller' ? 'terracotta' : 'ivory'} size="xs">
                      {role === 'seller' ? 'Craft Artisan' : role === 'admin' ? 'Admin' : 'Collector'}
                    </Badge>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1 text-stone-400 hover:text-rose-500 rounded-full hover:bg-stone-50 transition-colors"
                    title="ออกจากระบบ"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-xs font-bold uppercase tracking-wider text-stone-700 hover:text-stone-900 px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-runway-terracotta text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full shadow-md"
                >
                  Join Marketplace
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center gap-3">
            <Link to="/cart" className="relative p-2 text-stone-800">
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-[#E76F51] text-white text-[10px] font-mono font-bold rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-700 hover:text-stone-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── CATEGORY QUICK-FILTER BAR (Desktop) ── */}
      <div className="hidden md:block border-t border-stone-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-none">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-stone-400 shrink-0 pr-2 border-r border-stone-200 mr-2">
              หมวดหมู่
            </span>
            {QUICK_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-medium text-stone-600 hover:bg-[#1B4332] hover:text-white transition-all border border-transparent hover:border-[#1B4332] whitespace-nowrap"
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </Link>
            ))}
            <Link
              to="/products"
              className="shrink-0 ml-auto flex items-center gap-1 text-[11px] font-bold text-[#E76F51] hover:text-[#D95D3F] transition-colors whitespace-nowrap pl-4"
            >
              ดูทั้งหมด <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF9F5] border-b border-stone-200 px-5 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-bold uppercase tracking-wider text-stone-800"
          >
            หน้าหลัก
          </Link>
          <Link
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-bold uppercase tracking-wider text-stone-800"
          >
            Handmade Lookbook
          </Link>

          {/* Mobile Category Quick-Filter */}
          <div className="pt-2 border-t border-stone-200 space-y-1">
            <span className="text-[10px] uppercase text-[#E76F51] font-mono font-bold tracking-widest block mb-2">หมวดหมู่ Handmade & Craft</span>
            <div className="grid grid-cols-2 gap-1.5">
              {QUICK_CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-700 bg-white border border-stone-200 hover:border-[#1B4332] hover:text-[#1B4332] transition-all"
                >
                  <span>{cat.emoji}</span>
                  <span className="truncate">{cat.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {user && (
            <Link
              to="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-bold uppercase tracking-wider text-stone-800"
            >
              My Orders
            </Link>
          )}

          {role === 'seller' && (
            <div className="pt-2 border-t border-stone-200 space-y-1">
              <span className="text-[10px] uppercase text-[#E76F51] font-mono font-bold tracking-widest">Craft Studio</span>
              <Link to="/seller/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-xs font-semibold text-stone-700">แดชบอร์ด Handmade Studio</Link>
              <Link to="/seller/add-product" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-xs font-semibold text-stone-700">เพิ่มงาน Handmade & Craft</Link>
              <Link to="/seller/orders" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-xs font-semibold text-stone-700">จัดการคำสั่งซื้อ</Link>
              <Link to="/seller/profile" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-xs font-bold text-emerald-800">โปรไฟล์ร้านค้า</Link>
            </div>
          )}

          {role === 'admin' && (
            <div className="pt-2 border-t border-stone-200 space-y-1">
              <span className="text-[10px] uppercase text-[#1B4332] font-mono font-bold tracking-widest">Admin Board</span>
              <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-xs font-semibold text-stone-700">ภาพรวมระบบ</Link>
              <Link to="/admin/verify-payments" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-xs font-semibold text-stone-700">ตรวจสอบสลิป</Link>
              <Link to="/admin/users" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-xs font-semibold text-stone-700">จัดการผู้ใช้</Link>
            </div>
          )}

          <div className="pt-4 border-t border-stone-200 flex flex-col gap-2">
            {user ? (
              <>
                {role === 'buyer' && (
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleUpgradeToSeller(); }}
                    className="w-full text-center py-2.5 text-xs font-bold uppercase tracking-wider rounded-full bg-white text-stone-900 border border-stone-300"
                  >
                    เปิดร้าน Handmade & Craft
                  </button>
                )}
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="w-full text-center py-2 text-xs font-bold uppercase text-stone-600 hover:text-rose-600"
                >
                  ออกจากระบบ ({user.name})
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 text-stone-800 border border-stone-300 rounded-full text-xs font-bold uppercase"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 btn-runway-terracotta rounded-full text-xs font-bold uppercase"
                >
                  Join Marketplace
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;