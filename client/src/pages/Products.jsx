import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import ProductFilter from '../components/products/ProductFilter';
import { getProducts } from '../services/productService';
import { PackageOpen, SlidersHorizontal, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

// รายการสไลด์แบนเนอร์ (รูปภาพพื้นหลังพรีเมียม + ข้อความซ้อนทับ overlay)
const HERO_SLIDES = [
  {
    tag: 'CURATED MARKETPLACE',
    title: 'Handmade & Craft Collection',
    desc: 'คัดสรรงานศิลปะแฮนด์เมดและคราฟต์ชิ้นเอกโดยช่างฝีมือไทย พร้อมส่งและบริการสั่งทำพิเศษเฉพาะคุณ',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1600&q=80'
  },
  {
    tag: 'LIMITED MADE-TO-ORDER',
    title: 'Craft Studio Atelier',
    desc: 'คัดสรรงานศิลปะแฮนด์เมดและคราฟต์ชิ้นเอกโดยช่างฝีมือไทย พร้อมส่งและบริการสั่งทำพิเศษเฉพาะคุณ',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1600&q=80'
  },
  {
    tag: 'ARTISAN SPOTLIGHT',
    title: 'Sustainable Local Crafts',
    desc: 'คัดสรรงานศิลปะแฮนด์เมดและคราฟต์ชิ้นเอกโดยช่างฝีมือไทย พร้อมส่งและบริการสั่งทำพิเศษเฉพาะคุณ',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1600&q=80'
  }
];

export const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'all',
    search: searchParams.get('search') || '',
    is_made_to_order: searchParams.get('is_made_to_order') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    sort: searchParams.get('sort') || 'newest'
  });

  // ระบบสไลด์เปลี่ยนอัตโนมัติทุกๆ 5 วินาที
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setFilters({
      category: searchParams.get('category') || 'all',
      search: searchParams.get('search') || '',
      is_made_to_order: searchParams.get('is_made_to_order') || '',
      min_price: searchParams.get('min_price') || '',
      max_price: searchParams.get('max_price') || '',
      sort: searchParams.get('sort') || 'newest'
    });
  }, [searchParams]);

  const fetchProductsList = async () => {
    setLoading(true);
    try {
      const res = await getProducts();
      const items = res.data || res || [];
      setProducts(items);
    } catch (err) {
      console.warn('API error:', err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsList();
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    let list = [...products];

    if (filters.is_made_to_order !== '') {
      const targetVal = Number(filters.is_made_to_order);
      list = list.filter((p) => Number(p.is_made_to_order) === targetVal);
    }

    if (filters.category && filters.category !== 'all') {
      const targetCatId = Number(filters.category);
      list = list.filter((p) => Number(p.category_id) === targetCatId);
    }

    if (filters.search) {
      const keyword = filters.search.toLowerCase().trim();
      list = list.filter((p) =>
        (p.title && p.title.toLowerCase().includes(keyword)) ||
        (p.description && p.description.toLowerCase().includes(keyword)) ||
        (p.shop_name && p.shop_name.toLowerCase().includes(keyword))
      );
    }

    if (filters.min_price !== '') {
      list = list.filter((p) => Number(p.price) >= Number(filters.min_price));
    }
    if (filters.max_price !== '') {
      list = list.filter((p) => Number(p.price) <= Number(filters.max_price));
    }

    if (filters.sort === 'price_asc') {
      return list.sort((a, b) => Number(a.price) - Number(b.price));
    }
    if (filters.sort === 'price_desc') {
      return list.sort((a, b) => Number(b.price) - Number(a.price));
    }
    return list.sort((a, b) => (b.id || 0) - (a.id || 0));
  }, [products, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev };

      if (key === 'category' && value === 'all') {
        newFilters.category = 'all';
      } else if (newFilters[key] === value) {
        newFilters[key] = key === 'category' ? 'all' : '';
      } else {
        newFilters[key] = value;
        if (key === 'is_made_to_order' && value !== '') {
          newFilters.category = 'all';
        }
        if (key === 'category' && value !== 'all') {
          newFilters.is_made_to_order = '';
        }
      }

      const params = {};
      if (newFilters.category && newFilters.category !== 'all') params.category = newFilters.category;
      if (newFilters.search) params.search = newFilters.search;
      if (newFilters.is_made_to_order !== '') params.is_made_to_order = newFilters.is_made_to_order;
      if (newFilters.min_price) params.min_price = newFilters.min_price;
      if (newFilters.max_price) params.max_price = newFilters.max_price;
      if (newFilters.sort && newFilters.sort !== 'newest') params.sort = newFilters.sort;

      setSearchParams(params, { replace: true });
      return newFilters;
    });
  };

  const handleResetFilters = () => {
    setFilters({
      category: 'all',
      search: '',
      is_made_to_order: '',
      min_price: '',
      max_price: '',
      sort: 'newest'
    });
    setSearchParams({}, { replace: true });
  };

  const currentSlideData = HERO_SLIDES[currentSlide];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 editorial-canvas">

      {/* 🌟 HERO SLIDER BANNER WITH OVERLAY */}
      <div className="relative rounded-3xl overflow-hidden shadow-sm border border-stone-200/80 min-h-[240px] flex items-center group transition-all duration-700">

        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105 group-hover:scale-100"
          style={{ backgroundImage: `url(${currentSlideData.image})` }}
        />

        {/* Dark Overlay เพื่อให้ตัวหนังสือสีขาวและทองอ่านง่ายชัดเจน */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/90 via-stone-900/75 to-stone-900/40 backdrop-blur-[1px]" />

        {/* Content Container */}
        <div className="relative z-10 w-full p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">

          {/* Left Text Block */}
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md shadow-xs">
              <Sparkles className="w-3 h-3 text-[#E76F51]" />
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-stone-900">
                {currentSlideData.tag}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight leading-tight drop-shadow-sm">
              {currentSlideData.title}
            </h1>

            <p className="text-xs sm:text-sm text-stone-200 font-normal leading-relaxed max-w-lg drop-shadow-xs">
              {currentSlideData.desc}
            </p>
          </div>

          {/* Right Controls (Sort Dropdown & Slide Arrows) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">

            {/* Slide Arrows */}
            <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md p-1 rounded-full border border-white/20">
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                title="สไลด์ก่อนหน้า"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                title="สไลด์ถัดไป"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Select Dropdown */}
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-full px-4 py-2.5 border border-stone-200 shadow-sm">
              <span className="text-xs font-mono font-bold uppercase text-stone-600 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#1B4332]" />
                เรียงตาม:
              </span>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="text-xs font-mono font-bold bg-transparent text-stone-800 focus:outline-none cursor-pointer"
              >
                <option value="newest">NEWEST ARRIVALS (ใหม่ล่าสุด)</option>
                <option value="price_asc">PRICE: LOW TO HIGH (ราคาต่ำ-สูง)</option>
                <option value="price_desc">PRICE: HIGH TO LOW (ราคาสูง-ต่ำ)</option>
              </select>
            </div>
          </div>

        </div>

        {/* Slide Indicator Dots Bottom */}
        <div className="absolute bottom-3 left-10 z-10 flex gap-1.5">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all ${currentSlide === idx ? 'w-6 bg-[#FFE6A7]' : 'w-2 bg-white/40'
                }`}
            />
          ))}
        </div>

      </div>

      {/* Main Grid: Sidebar Filter (Left) & Product Grid (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <aside className="lg:col-span-1 sticky top-28">
          <ProductFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </aside>

        <main className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="runway-card rounded-3xl h-96 animate-pulse bg-stone-100" />
              ))}
            </div>
          ) : filteredAndSortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="runway-card text-center py-20 rounded-3xl p-8 space-y-4 bg-white border border-stone-200">
              <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                <PackageOpen className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-display font-bold text-stone-900">
                ไม่พบผลงานคราฟต์ที่ตรงกับเงื่อนไขการค้นหา
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto font-normal">
                ลองรีเซ็ตตัวกรองหรือเปลี่ยนเงื่อนไขการค้นหาดูนะจ๊ะ
              </p>
              <button
                onClick={handleResetFilters}
                className="btn-runway-terracotta text-xs font-mono font-bold uppercase tracking-wider px-6 py-2.5 rounded-full shadow-xs"
              >
                RESET ALL FILTERS
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;