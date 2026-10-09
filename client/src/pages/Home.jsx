import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  Leaf,
  Star,
  Clock,
  Hammer,
  CheckCircle2,
  TrendingUp,
  Palette,
  Eye,
  Award,
  ArrowUpRight,
  PackageOpen
} from 'lucide-react';
import ProductCard from '../components/products/ProductCard';
import { getProducts } from '../services/productService';

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await getProducts({ sort: 'newest' });
        if (res && res.data && res.data.length > 0) {
          setFeaturedProducts(res.data.slice(0, 4));
        } else {
          throw new Error('No data returned from API');
        }
      } catch (err) {
        console.warn('Using mock showcase:', err.message);
        setFeaturedProducts([
          {
            id: 1,
            title: 'แจกันดินเผาเคลือบขี้เถ้าธรรมชาติ (Ash Glazed Ceramic Vase)',
            category: 'Ceramics',
            price: 1850,
            is_made_to_order: 1,
            lead_time_days: 7,
            shop_name: 'เตาเผาดอยสะเก็ด',
            image_url: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=800&q=80'
          },
          {
            id: 2,
            title: 'กระเป๋าหนังฟอกฝาดเย็บมืออิตาเลียน (Vegetable Tanned Leather Tote)',
            category: 'Leather',
            price: 3490,
            is_made_to_order: 1,
            lead_time_days: 5,
            shop_name: 'Studio Tannery',
            image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80'
          },
          {
            id: 3,
            title: 'ชามไม้สักทองกลึงมือลายเกรนธรรมชาติ (Hand-turned Teak Wood Bowl)',
            category: 'Woodcraft',
            price: 1200,
            is_made_to_order: 0,
            lead_time_days: 2,
            shop_name: 'ช่างไม้แพร่สตูดิโอ',
            image_url: 'https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?auto=format&fit=crop&w=800&q=80'
          },
          {
            id: 4,
            title: 'ผ้าคลุมไหล่ย้อมครามลายสายหมอก (Handwoven Indigo Dye Scarf)',
            category: 'Textiles',
            price: 950,
            is_made_to_order: 0,
            lead_time_days: 3,
            shop_name: 'บ้านครามสกล',
            image_url: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="space-y-28 pb-20 editorial-canvas overflow-hidden">

      {/* 📖 1. HERO SECTION: "Cover Issue No. 01" Editorial Runway */}
      <section className="relative pt-6 sm:pt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Editorial Top Border Tag */}
        <div className="border-t-2 border-b border-stone-900 py-2.5 mb-8 flex items-center justify-between text-[11px] font-mono tracking-widest uppercase text-stone-700">
          <span className="font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E76F51]" />
            ISSUE 01 // HANDMADE &amp; CRAFT MARKETPLACE
          </span>
          <span className="hidden md:inline font-semibold text-stone-500">
            HANDMADE ORIGIN • MASTERPIECE CRAFT
          </span>
          <span className="font-bold text-[#1B4332]">
            BANGKOK • CHIANG MAI • NAN
          </span>
        </div>

        {/* Asymmetric Split: Large Editorial Headline (Left) + Tall Runway Look (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* Left Column: Bold Editorial Typography (7 cols) */}
          <div className="lg:col-span-7 space-y-7 text-left">

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1B4332] text-white text-[10px] font-mono tracking-widest uppercase">
              <Sparkles className="w-3 h-3 text-[#FFE6A7]" />
              <span>HANDMADE &amp; CRAFT MARKETPLACE 2026</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-stone-900 tracking-tight leading-[1.08]">
              Market place งาน <span className="text-[#E76F51]">Handmade</span> <br />
              <span className="font-serif italic font-normal text-[#1B4332]">&amp; งาน Craft</span>
            </h1>

            <p className="text-sm sm:text-base text-stone-600 max-w-xl font-normal leading-relaxed">
              สัมผัสเสน่ห์งานทำมือประณีตชิ้นต่อชิ้น และผลงาน Craft จากสตูดิโอช่างฝีมือทั่วประเทศ
              พร้อมติดตามทุกขั้นตอนการผลิตผ่าน Crafting Journey Tracker
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                to="/products"
                className="btn-runway-terracotta px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 group shadow-lg"
              >
                <span>สำรวจงาน Handmade &amp; Craft</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/register"
                className="px-8 py-4 rounded-full bg-white hover:bg-stone-50 text-stone-900 text-xs font-bold uppercase tracking-wider border border-stone-300 shadow-xs hover:border-stone-900 transition-all flex items-center justify-center gap-2"
              >
                <span>เปิดร้าน Handmade &amp; Craft</span>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="pt-6 border-t border-stone-200 grid grid-cols-3 gap-4 text-left">
              <div>
                <span className="text-2xl sm:text-3xl font-display font-extrabold text-[#1B4332] block">100%</span>
                <span className="text-[10px] sm:text-xs text-stone-500 font-mono uppercase tracking-wider">HANDMADE ORIGIN</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-display font-extrabold text-[#E76F51] block">1,200+</span>
                <span className="text-[10px] sm:text-xs text-stone-500 font-mono uppercase tracking-wider">Craft Artisans</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-display font-extrabold text-stone-900 block">0%</span>
                <span className="text-[10px] sm:text-xs text-stone-500 font-mono uppercase tracking-wider">Mass-Produced</span>
              </div>
            </div>

          </div>

          {/* Right Column: Tall Runway Magazine Cover Look (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-white magazine-cover bg-stone-100 group">

              <img
                src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80"
                alt="Runway Masterpiece"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

              {/* Floating Top Editorial Tag */}
              <div className="absolute top-5 left-5 z-10">
                <span className="bg-[#1B4332]/90 backdrop-blur-md text-[#FFE6A7] text-xs font-mono font-bold tracking-widest px-3 py-1.5 rounded-full border border-[#FFE6A7]/30">
                  100% HANDMADE ORIGIN
                </span>
              </div>

              {/* Live Crafting Status Badge */}
              <div className="absolute top-5 right-5 z-10 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E76F51] animate-ping" />
                <span className="text-xs font-bold text-[#1B4332] font-mono">
                  MASTERPIECE CRAFT ✦
                </span>
              </div>

              {/* Bottom Cover Info */}
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#FFE6A7] block font-bold">
                  AUTUMN 2026 FEATURED PIECE
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-extrabold tracking-tight leading-snug">
                  ถ้วยชาเซรามิกเคลือบขี้เถ้าเตาฟืนโบราณ
                </h3>
                <div className="flex items-center justify-between text-xs text-stone-300 pt-1 border-t border-white/20">
                  <span>โดย เตาเผาดอยสะเก็ด</span>
                  <span className="font-mono font-bold text-white text-sm">฿1,450</span>
                </div>
              </div>

            </div>

            {/* Decorative Offset Floating Pill */}
            <div className="absolute -bottom-6 -left-6 hidden sm:flex bg-[#1B4332] text-[#F4F9F4] p-4 rounded-2xl shadow-xl border border-white/20 items-center gap-3 animate-float-slow">
              <div className="w-8 h-8 rounded-xl bg-[#FFE6A7] text-[#1B4332] flex items-center justify-center font-bold font-display">
                ★
              </div>
              <div className="text-left">
                <span className="text-[10px] font-mono text-[#FFE6A7] block font-bold">CURATOR'S CHOICE</span>
                <span className="text-xs font-bold">ศิลปะที่จับต้องและใช้งานได้จริง</span>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* 📖 2. RUNWAY GALLERY: Masonry Magazine Lookbook (Product Showcase) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#E76F51] block mb-1">
              HANDMADE &amp; CRAFT COLLECTION // CURATED PIECES
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-stone-900 tracking-tight">
              งาน Handmade &amp; Craft คัดสรรประจำฤดูกาล
            </h2>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-900 hover:text-[#E76F51] transition-colors"
          >
            <span>ดู Lookbook ทั้งหมด ({featuredProducts.length}+ ชิ้น)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Lookbook Runway Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="runway-card rounded-3xl h-96 animate-pulse bg-stone-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}

      </section>

      {/* 📖 3. SELLER CTA BANNER: "Artisan Spotlight Column" Magazine Spread */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[2.5rem] bg-[#1B4332] text-white p-8 sm:p-14 lg:p-16 overflow-hidden shadow-2xl border border-emerald-800">

          {/* Subtle editorial circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#2D6A4F] rounded-full blur-3xl opacity-40 pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-[#E76F51] rounded-full blur-3xl opacity-20 pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

            {/* Left Side: Editorial Typography & Perks (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-left">

              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFE6A7] text-[#1B4332] text-xs font-mono font-bold tracking-widest uppercase">
                <Award className="w-3.5 h-3.5 text-[#E76F51]" />
                <span>HANDMADE CREATOR &amp; CRAFT ARTISAN SPOTLIGHT</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white tracking-tight leading-tight">
                เปลี่ยน passion งาน Handmade <br />
                <span className="text-[#FFE6A7] font-serif italic font-normal">และงาน Craft สู่สตูดิโอสร้างรายได้</span>
              </h2>

              <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed font-normal">
                ไม่ว่าคุณจะเป็น <strong className="text-[#FFE6A7]">ผู้สร้างงาน Handmade</strong> รายบุคคล
                หรือ <strong className="text-[#FFE6A7]">ช่าง Craft</strong> ระดับสตูดิโอ —
                Craftiverse พร้อมเปิดพื้นที่แสดงผลงาน บริหาร Made-to-Order และสร้างรายได้ที่มั่นคง ไร้ค่าธรรมเนียมแอบแฝง
              </p>

              {/* Key Bullet Perks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-emerald-100 font-medium">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FFE6A7] shrink-0" />
                  <span>เปิดรับทั้ง Handmade ชิ้นเดียวในโลก</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FFE6A7] shrink-0" />
                  <span>และงาน Craft Studio ระดับมาสเตอร์พีซ</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FFE6A7] shrink-0" />
                  <span>Crafting Journey Tracker ทุกขั้นตอน</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FFE6A7] shrink-0" />
                  <span>การันตีการชำระเงินตรงเวลา 100%</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/register"
                  className="btn-runway-terracotta inline-flex items-center gap-2 px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider shadow-xl"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>เปิดร้าน Handmade &amp; Craft Studio</span>
                </Link>
              </div>

            </div>

            {/* Right Side: Tall Fashion-Style Portrait Card (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/30 group">
                <img
                  src="https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80"
                  alt="Artisan Portrait"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Badge: Artisan of the Month */}
                <div className="absolute top-4 left-4">
                  <span className="bg-[#FFE6A7] text-[#1B4332] text-[10px] font-mono font-extrabold tracking-widest px-3 py-1 rounded-full uppercase shadow-md">
                    ARTISAN OF THE MONTH
                  </span>
                </div>

                {/* Artisan Bio Card at bottom */}
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                  <h4 className="text-xl font-display font-bold">
                    อาจารย์ประสิทธิ์ จันทร์สว่าง
                  </h4>
                  <p className="text-xs text-[#FFE6A7] font-mono">
                    ผู้สืบทอดเตาเผาโบราณดอยสะเก็ด • 30 ปีแห่งงานปั้นดิน
                  </p>
                  <p className="text-[11px] text-stone-300 italic pt-1 font-serif">
                    “งานคราฟต์คือบทสนทนาระหว่างดิน น้ำ ลม ไฟ และจิตวิญญาณของผู้สร้างสรรค์”
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 📖 4. RUNWAY VALUES: Editorial Triple Column */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-stone-300 pt-12 grid grid-cols-1 md:grid-cols-3 gap-10">

          <div className="space-y-3 text-left">
            <span className="text-xs font-mono font-bold text-[#E76F51] uppercase tracking-widest block">
              01 // HANDMADE ORIGIN
            </span>
            <h3 className="text-xl font-display font-bold text-stone-900">
              ❤ งาน Handmade ชิ้นเดียวในโลก
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
              ทุกชิ้นงาน Handmade ผ่านการคัดสรรจากผู้สร้างรายบุคคล ไร้การผลิตแบบอุตสาหกรรม
              แต่ละชิ้นจึงมีเอกลักษณ์เฉพาะตัวไม่ซ้ำใครในโลก พร้อมจัดส่งทันที
            </p>
          </div>

          <div className="space-y-3 text-left">
            <span className="text-xs font-mono font-bold text-[#1B4332] uppercase tracking-widest block">
              02 // MASTERPIECE CRAFT
            </span>
            <h3 className="text-xl font-display font-bold text-stone-900">
              🔨 งาน Craft Studio Made-to-Order
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
              สั่งทำงาน Craft ระดับมาสเตอร์พีซ ปรับแต่งสี วัสดุ หรือขนาดตามต้องการ
              พร้อมติดตามทุกขั้นตอนการผลิตผ่าน Crafting Journey Tracker
            </p>
          </div>

          <div className="space-y-3 text-left">
            <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-widest block">
              03 // ECO MARKETPLACE
            </span>
            <h3 className="text-xl font-display font-bold text-stone-900">
              🌿 Zero-Plastic Eco Packaging
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
              งาน Handmade &amp; Craft ทุกชิ้นใช้วัตถุดิบธรรมชาติ และบรรจุภัณฑ์สีเขียว
              ส่งตรงจากสตูดิโอช่างฝีมือถึงมือคุณอย่างปลอดภัย
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;