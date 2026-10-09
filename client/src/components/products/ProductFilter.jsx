import React from 'react';
import { Search, Filter, RotateCcw, Sparkles, Package, Heart, Hammer } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'ทั้งหมด (All)', emoji: '🎨' },
  { id: 'Ceramics', label: 'เซรามิก & งานปั้น Craft', emoji: '🍵' },
  { id: 'Woodcraft', label: 'งานไม้ & Craft ทำมือ', emoji: '🪵' },
  { id: 'Leather', label: 'เครื่องหนัง Handmade', emoji: '👜' },
  { id: 'Textiles', label: 'งานเย็บปักถักร้อย', emoji: '🧶' },
  { id: 'Jewelry', label: 'เครื่องประดับ Handmade', emoji: '💍' },
  { id: 'Candles', label: 'เทียนหอม & สกินแคร์', emoji: '🕯️' },
  { id: 'HomeDecor', label: 'ของแต่งบ้าน Handmade', emoji: '🏺' },
];

export const ProductFilter = ({ filters, onFilterChange, onReset }) => {
  return (
    <div className="runway-card p-6 rounded-3xl space-y-6 bg-white border border-stone-200/80">

      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-stone-200">
        <div className="flex items-center gap-2 text-stone-900 font-mono font-bold text-xs uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-[#E76F51]" />
          <span>กรองงาน Handmade &amp; Craft</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-stone-400 hover:text-[#E76F51] flex items-center gap-1 transition-colors font-mono uppercase"
        >
          <RotateCcw className="w-3 h-3" /> RESET
        </button>
      </div>

      {/* Search */}
      <div>
        <label className="text-[11px] font-mono font-bold text-stone-500 uppercase tracking-wider block mb-2">
          ค้นหางาน Handmade &amp; Craft
        </label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
          <input
            type="text"
            placeholder="ชื่องาน, วัสดุ, ช่างศิลป์..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#FAF9F5] border border-stone-200 rounded-full focus:outline-none focus:border-[#1B4332] shadow-xs transition-all"
          />
        </div>
      </div>

      {/* ── HANDMADE vs CRAFT STUDIO FILTER ── */}
      <div>
        <label className="text-[11px] font-mono font-bold text-stone-500 uppercase tracking-wider block mb-2.5">
          ประเภท: Handmade หรือ Craft
        </label>
        <div className="grid grid-cols-1 gap-2">
          {/* Handmade Goods filter */}
          <button
            onClick={() => onFilterChange('is_made_to_order', filters.is_made_to_order === 'false' ? '' : 'false')}
            className={`px-3.5 py-2.5 text-xs rounded-2xl border transition-all flex items-center gap-2.5 font-mono ${
              filters.is_made_to_order === 'false'
                ? 'border-[#1B4332] bg-[#E8F7F3] text-[#1B4332] font-bold'
                : 'border-stone-200 bg-white text-stone-600 hover:bg-[#FAF9F5]'
            }`}
          >
            <Heart className="w-3.5 h-3.5 shrink-0 text-[#1B4332]" />
            <div className="text-left">
              <span className="block font-bold text-[11px]">Handmade Goods</span>
              <span className="block text-[9px] font-normal opacity-70">ชิ้นเดียวในโลก • พร้อมส่ง</span>
            </div>
          </button>

          {/* Craft Studio Items filter */}
          <button
            onClick={() => onFilterChange('is_made_to_order', filters.is_made_to_order === 'true' ? '' : 'true')}
            className={`px-3.5 py-2.5 text-xs rounded-2xl border transition-all flex items-center gap-2.5 font-mono ${
              filters.is_made_to_order === 'true'
                ? 'border-[#E76F51] bg-[#FFF0EB] text-[#E76F51] font-bold'
                : 'border-stone-200 bg-white text-stone-600 hover:bg-[#FAF9F5]'
            }`}
          >
            <Hammer className="w-3.5 h-3.5 shrink-0 text-[#E76F51]" />
            <div className="text-left">
              <span className="block font-bold text-[11px]">Craft Studio Items</span>
              <span className="block text-[9px] font-normal opacity-70">Made-to-Order • สั่งทำพิเศษ</span>
            </div>
          </button>
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="text-[11px] font-mono font-bold text-stone-500 uppercase tracking-wider block mb-2.5">
          หมวดหมู่ Handmade &amp; Craft
        </label>
        <div className="flex flex-col gap-1.5">
          {CATEGORIES.map((cat) => {
            const active = filters.category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onFilterChange('category', cat.id)}
                className={`text-left text-xs px-3.5 py-2.5 rounded-2xl transition-all flex items-center justify-between font-medium ${
                  active
                    ? 'bg-[#1B4332] text-[#F4F9F4] font-bold shadow-md'
                    : 'text-stone-700 hover:bg-[#FAF9F5] hover:text-[#E76F51]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </span>
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFE6A7]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="text-[11px] font-mono font-bold text-stone-500 uppercase tracking-wider block mb-2">
          ช่วงราคา (THB)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="ต่ำสุด"
            value={filters.min_price || ''}
            onChange={(e) => onFilterChange('min_price', e.target.value)}
            className="w-1/2 px-3 py-2 text-xs bg-[#FAF9F5] border border-stone-200 rounded-xl focus:outline-none focus:border-[#1B4332]"
          />
          <span className="text-stone-300 text-xs font-mono">-</span>
          <input
            type="number"
            placeholder="สูงสุด"
            value={filters.max_price || ''}
            onChange={(e) => onFilterChange('max_price', e.target.value)}
            className="w-1/2 px-3 py-2 text-xs bg-[#FAF9F5] border border-stone-200 rounded-xl focus:outline-none focus:border-[#1B4332]"
          />
        </div>
      </div>

    </div>
  );
};

export default ProductFilter;
