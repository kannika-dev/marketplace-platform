import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Heart, Hammer, ShieldCheck, Leaf } from 'lucide-react';
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

      {/* Decorative Background Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#2D6A4F] rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#E76F51] rounded-full blur-3xl opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Top Statement & Newsletter */}
        <div className="border-b border-[#2D6A4F] pb-12 mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-mono tracking-widest text-[#FFE6A7] uppercase font-bold">
              CRAFTIVERSE // EDITORIAL &amp; MARKETPLACE
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white tracking-tight leading-tight">
              พื้นที่แห่งจิตวิญญาณ <br />
              <span className="text-[#FFE6A7] font-normal italic font-serif">งานฝีมือไทยสู่สากล</span>
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/70 font-normal leading-relaxed">
              เราเชื่อว่าทุกชิ้นงาน Handmade และ Craft มีเรื่องราวของลมหายใจและหยาดเหงื่อจากช่างฝีมือ
              ส่งมอบความประณีตแบบชิ้นเดียวในโลกตรงถึงมือคุณด้วยวิถี Made-to-Order 100%
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
              JOIN THE CRAFT COMMUNITY
            </span>
            <form onSubmit={handleSubscribe} className="relative">
              <input
                type="email"
                required
                placeholder="ใส่อีเมลเพื่อรับคอลเลกชันใหม่ก่อนใคร..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full pl-4 pr-12 py-3 bg-[#2D6A4F]/60 border border-emerald-500/40 rounded-full text-xs text-white placeholder-emerald-200/50 focus:outline-none focus:border-[#FFE6A7] focus:ring-1 focus:ring-[#FFE6A7]"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 bg-[#E76F51] hover:bg-[#D95D3F] text-white rounded-full flex items-center justify-center transition-all shadow-sm"
                title="สมัครรับข่าวสาร"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            {subscribed ? (
              <span className="text-[11px] text-[#FFE6A7] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> ยินดีต้อนรับสู่ชุมชน Craftiverse!
              </span>
            ) : (
              <span className="text-[10px] text-emerald-200/60 block">
                * รับสิทธิ์พิเศษ เรื่องราวเบื้องหลังช่างศิลป์ และส่วนลด Made-to-Order
              </span>
            )}
          </div>
        </div>

        {/* 3-Column Clean Directory (No Redundant Categories) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-xs">

          {/* Col 1: Brand Essence */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FFE6A7] text-[#1B4332] font-display font-extrabold flex items-center justify-center text-sm shadow-md">
                C
              </div>
              <span className="text-base font-display font-bold text-white">Craftiverse</span>
            </div>
            <p className="text-[9px] font-mono font-bold text-[#FFE6A7] uppercase tracking-widest">
              HANDMADE &amp; CRAFT MARKETPLACE
            </p>
            <p className="text-emerald-100/70 leading-relaxed font-normal">
              แพลตฟอร์มศูนย์รวมงานศิลปะและงานฝีมือไทย คัดสรรคุณภาพระดับมาสเตอร์พีซเพื่อสนับสนุนชุมชนช่างฝีมือท้องถิ่นอย่างยั่งยืน
            </p>
            <div className="text-[11px] font-mono text-[#FFE6A7] font-bold pt-1">
              EST. 2026 // BANGKOK, THAILAND
            </div>
          </div>

          {/* Col 2: Marketplace Guide */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFE6A7] mb-3.5">
              MARKETPLACE GUIDE
            </h4>
            <ul className="space-y-2 text-emerald-100/80 font-medium">
              <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FFE6A7]" /> มาตรฐานการคัดสรร Handmade
              </li>
              <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#FFE6A7]" /> Craft Artisan Verification
              </li>
              <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-[#FFE6A7]" /> นโยบายสินค้า Made-to-Order 100%
              </li>
              <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                <Leaf className="w-3.5 h-3.5 text-[#FFE6A7]" /> Eco-Packaging บรรจุภัณฑ์รักษ์โลก
              </li>
            </ul>
          </div>

          {/* Col 3: Open Your Studio CTA */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFE6A7] mb-3.5">
              OPEN YOUR CRAFT STUDIO
            </h4>
            <p className="text-emerald-100/70 leading-relaxed font-normal mb-4">
              หากคุณคือช่างฝีมือผู้สร้างสรรค์งานแฮนด์เมดหรือสตูดิโอคราฟต์ มาร่วมเปิดพื้นที่จัดแสดงและจำหน่ายผลงานของคุณกับเราได้เลย
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#1B4332] hover:bg-[#FFE6A7] text-xs font-bold transition-all shadow-md hover:scale-105"
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