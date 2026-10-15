import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import ProductFilter from '../components/products/ProductFilter';
import { getProducts } from '../services/productService';
import { PackageOpen, Sparkles, SlidersHorizontal, ArrowLeft } from 'lucide-react';

export const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'all',
    search: searchParams.get('search') || '',
    is_made_to_order: searchParams.get('is_made_to_order') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    sort: searchParams.get('sort') || 'newest'
  });

  // Sync state filters with URL query parameters
  useEffect(() => {
    const params = {};
    if (filters.category && filters.category !== 'all') params.category = filters.category;
    if (filters.search) params.search = filters.search;
    if (filters.is_made_to_order) params.is_made_to_order = filters.is_made_to_order;
    if (filters.min_price) params.min_price = filters.min_price;
    if (filters.max_price) params.max_price = filters.max_price;
    if (filters.sort && filters.sort !== 'newest') params.sort = filters.sort;

    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const fetchProductsList = async () => {
    setLoading(true);
    try {
      // ดึงสินค้าทั้งหมดจาก API มาก่อน เพื่อให้มั่นใจว่าข้อมูลไม่หาย
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

  // ระบบกรองและเรียงลำดับสินค้าฝั่งหน้าเว็บ (Client-side Filtering & Sorting) เพื่อความแม่นยำ 100% ทุกปุ่มทุกเมนู
  const filteredAndSortedProducts = useMemo(() => {
    let list = [...products];

    // 1. กรองตามหมวดหมู่ (Category)
    if (filters.category && filters.category !== 'all') {
      list = list.filter((p) => {
        const catStr = String(p.category_id || p.category || '');
        return catStr.toLowerCase().includes(filters.category.toLowerCase());
      });
    }

    // 2. กรองตามประเภท Handmade (0) หรือ Craft Studio / Made-to-order (1)
    if (filters.is_made_to_order !== '') {
      const targetVal = String(filters.is_made_to_order) === 'true' || String(filters.is_made_to_order) === '1' ? 1 : 0;
      list = list.filter((p) => Number(p.is_made_to_order) === targetVal);
    }

    // 3. กรองตามคำค้นหา (Search)
    if (filters.search) {
      const keyword = filters.search.toLowerCase();
      list = list.filter((p) =>
        (p.title && p.title.toLowerCase().includes(keyword)) ||
        (p.description && p.description.toLowerCase().includes(keyword))
      );
    }

    // 4. กรองตามช่วงราคา (Price Range)
    if (filters.min_price !== '') {
      list = list.filter((p) => Number(p.price) >= Number(filters.min_price));
    }
    if (filters.max_price !== '') {
      list = list.filter((p) => Number(p.price) <= Number(filters.max_price));
    }

    // 5. จัดเรียงสินค้า (Sorting)
    if (filters.sort === 'price_asc') {
      return list.sort((a, b) => Number(a.price) - Number(b.price));
    }
    if (filters.sort === 'price_desc') {
      return list.sort((a, b) => Number(b.price) - Number(a.price));
    }
    return list.sort((a, b) => (b.id || 0) - (a.id || 0));
  }, [products, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
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
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 editorial-canvas">

      {/* Editorial Lookbook Banner Header */}
      <div className="border-t-2 border-b-2 border-stone-900 py-8 px-6 bg-white rounded-3xl flex flex-col md:flex-row md:items-end justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <span className="text-[11px] font-mono tracking-widest uppercase font-bold text-[#E76F51]">
            ISSUE 01 // HANDMADE &amp; CRAFT MARKETPLACE CATALOGUE
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-stone-900 tracking-tight leading-tight">
            Handmade &amp; Craft Lookbook
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-normal max-w-xl">
            ค้นพบงาน <strong className="text-[#E76F51]">Handmade</strong> ชิ้นเดียวในโลก และงาน <strong className="text-[#1B4332]">Craft</strong> ระดับมาสเตอร์พีซ
            สร้างขึ้นด้วยมือ 100% พร้อมบริการสั่งทำ Made-to-Order
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-mono font-bold uppercase text-stone-600 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#1B4332]" />
            เรียงตาม:
          </span>
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="text-xs font-mono font-bold bg-[#FAF9F5] border border-stone-300 rounded-full px-4 py-2.5 text-stone-800 focus:outline-none focus:border-[#1B4332] shadow-xs cursor-pointer hover:bg-stone-100 transition-colors"
          >
            <option value="newest">NEWEST ARRIVALS (ใหม่ล่าสุด)</option>
            <option value="price_asc">PRICE: LOW TO HIGH (ราคาต่ำ-สูง)</option>
            <option value="price_desc">PRICE: HIGH TO LOW (ราคาสูง-ต่ำ)</option>
          </select>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

        {/* Left Sidebar Filter */}
        <aside className="lg:col-span-1 sticky top-28">
          <ProductFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </aside>

        {/* Right Lookbook Runway Grid */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="runway-card rounded-3xl h-96 animate-pulse bg-stone-100" />
              ))}
            </div>
          ) : filteredAndSortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {filteredAndSortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="runway-card text-center py-20 rounded-3xl p-8 space-y-4 bg-white">
              <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                <PackageOpen className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-display font-bold text-stone-900">
                ไม่พบผลงานคราฟต์ที่ตรงกับเงื่อนไขการค้นหา
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto font-normal">
                ลองปรับตัวกรองหมวดหมู่ ช่วงราคา หรือคำค้นหาใหม่อีกครั้ง
              </p>
              <button
                onClick={handleResetFilters}
                className="btn-runway-terracotta text-xs font-mono font-bold uppercase tracking-wider px-6 py-2.5 rounded-full"
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