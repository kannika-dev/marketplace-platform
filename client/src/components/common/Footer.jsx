import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Heart, Scissors, Hammer } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 3500);
    }
  };

  return (
    <footer className="bg-[#1B4332] text-[#F4F9F4] rounded-t-[2.5rem] sm:rounded-t-[3.5rem] mt-24 pt-16 pb-12 overflow-hidden shadow-2xl relative">

      {/* Decorative Background */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#2D6A4F] rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#E76F51] rounded-full blur-3xl opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Top Statement */}
        <div className="border-b border-[#2D6A4F] pb-12 mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-mono tracking-widest text-[#FFE6A7] uppercase font-bold">
              CRAFTIVERSE // HANDMADE &amp; CRAFT MARKETPLACE
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white tracking-tight leading-tight">
              Market place งาน Handmade <br />
              <span className="text-[#FFE6A7] font-normal italic font-serif">และงาน</span> Craft
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/70 font-normal leading-relaxed">
              Craftiverse คือแพลตฟอร์ม Handmade &amp; Craft Marketplace แห่งแรกของไทยที่ยกระดับทั้งงานทำมือชิ้นเดียวในโลก
              และงาน Craft จากสตูดิโอช่างฝีมือสู่มาตรฐานระดับสากล ด้วยวิถี Made-to-Order 100%
            </p>
            {/* Dual Identity Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E76F51]/20 border border-[#E76F51]/40 text-[#FFD7BA] text-[10px] font-mono font-bold tracking-wider">
                <Heart className="w-3 h-3" /> HANDMADE ORIGIN
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE6A7]/15 border border-[#FFE6A7]/30 text-[#FFE6A7] text-[10px] font-mono font-bold tracking-wider">
                <Hammer className="w-3 h-3" /> MASTERPIECE CRAFT
              </span>
            </div>
          </div>

          {/* Newsletter Box */}
          <div className="w-full lg:w-96 space-y-2.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFE6A7] block">
              JOIN THE HANDMADE &amp; CRAFT COMMUNITY
            </span>
            <form onSubmit={handleSubscribe} className="relative">
              <input
                type="email"
                required
                placeholder="ใส่อีเมลเพื่อรับข่าวสาร Handmade & Craft ใหม่ก่อนใคร..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full pl-4 pr-12 py-3 bg-[#2D6A4F]/60 border border-emerald-500/40 rounded-full text-xs text-white placeholder-emerald-200/50 focus:outline-none focus:border-[#FFE6A7] focus:ring-1 focus:ring-[#FFE6A7]"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 bg-[#E76F51] hover:bg-[#D95D3F] text-white rounded-full flex items-center justify-center transition-all"
                title="สมัครรับข่าวสาร"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            {subscribed ? (
              <span className="text-[11px] text-[#FFE6A7] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> ยินดีต้อนรับสู่ชุมชน Handmade &amp; Craft!
              </span>
            ) : (
              <span className="text-[10px] text-emerald-200/60 block">
                * รับบทความเบื้องหลังงาน Handmade &amp; Craft และสิทธิ์สั่งทำพิเศษก่อนใคร
              </span>
            )}
          </div>
        </div>

        {/* 4-Column Directory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-xs">

          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FFE6A7] text-[#1B4332] font-display font-extrabold flex items-center justify-center text-sm">
                C
              </div>
              <span className="text-base font-display font-bold text-white">Craftiverse</span>
            </div>
            <p className="text-[9px] font-mono font-bold text-[#FFE6A7] uppercase tracking-widest">
              HANDMADE &amp; CRAFT MARKETPLACE
            </p>
            <p className="text-emerald-100/70 leading-relaxed font-normal">
              ศูนย์รวมงาน Handmade ประณีตชิ้นเดียวในโลก และงาน Craft ระดับมาสเตอร์พีซจากสตูดิโอช่างฝีมือทั่วประเทศ
            </p>
            <div className="text-[11px] font-mono text-[#FFE6A7] font-bold">
              EST. 2026 // BANGKOK, THAILAND
            </div>
          </div>

          {/* Col 2: Handmade & Craft Categories */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFE6A7] mb-3.5">
              HANDMADE &amp; CRAFT CATEGORIES
            </h4>
            <ul className="space-y-2 text-emerald-100/80 font-medium">
              <li><Link to="/products?category=Ceramics" className="hover:text-[#FFE6A7] transition-colors">🍵 เซรามิก &amp; งานปั้น Craft</Link></li>
              <li><Link to="/products?category=Woodcraft" className="hover:text-[#FFE6A7] transition-colors">🪵 งานไม้ &amp; Craft ทำมือ</Link></li>
              <li><Link to="/products?category=Leather" className="hover:text-[#FFE6A7] transition-colors">👜 เครื่องหนัง Handmade</Link></li>
              <li><Link to="/products?category=Textiles" className="hover:text-[#FFE6A7] transition-colors">🧶 งานเย็บปักถักร้อย</Link></li>
              <li><Link to="/products?category=Jewelry" className="hover:text-[#FFE6A7] transition-colors">💍 เครื่องประดับ Handmade</Link></li>
              <li><Link to="/products?category=Candles" className="hover:text-[#FFE6A7] transition-colors">🕯️ เทียนหอม &amp; สกินแคร์ Handmade</Link></li>
            </ul>
          </div>

          {/* Col 3: Marketplace Info */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFE6A7] mb-3.5">
              MARKETPLACE GUIDE
            </h4>
            <ul className="space-y-2 text-emerald-100/80 font-medium">
              <li><span className="hover:text-white cursor-pointer">เกี่ยวกับ Craftiverse Marketplace</span></li>
              <li><span className="hover:text-white cursor-pointer">มาตรฐานการคัดสรร Handmade</span></li>
              <li><span className="hover:text-white cursor-pointer">Craft Artisan Verification</span></li>
              <li><span className="hover:text-white cursor-pointer">นโยบายสินค้า Made-to-Order</span></li>
              <li><span className="hover:text-white cursor-pointer">Eco-Packaging สีเขียว</span></li>
              <li><span className="hover:text-white cursor-pointer">ติดต่อฝ่ายสนับสนุน</span></li>
            </ul>
          </div>

          {/* Col 4: Open Your Studio CTA */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFE6A7] mb-3.5">
              OPEN YOUR CRAFT STUDIO
            </h4>
            <p className="text-emerald-100/70 leading-relaxed font-normal mb-4">
              ไม่ว่าคุณจะเป็นผู้สร้างงาน Handmade รายบุคคล หรือช่าง Craft ระดับสตูดิโอ — Craftiverse พร้อมเป็นพื้นที่แสดงและขายผลงานของคุณ
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-[#1B4332] hover:bg-[#FFE6A7] text-xs font-bold transition-colors shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E76F51]" />
              <span>เปิดร้าน Handmade &amp; Craft</span>
            </Link>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#2D6A4F] mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-100/60 gap-2">
          <p>© {new Date().getFullYear()} Craftiverse — Thailand's Premier Handmade &amp; Craft Marketplace. All rights reserved.</p>
          <div className="font-mono text-[11px] text-[#FFE6A7] flex items-center gap-3">
            <span>100% HANDMADE ORIGIN</span>
            <span>•</span>
            <span>MASTERPIECE CRAFT</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
