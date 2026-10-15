import React from 'react';
import { Search, Filter, RotateCcw, Heart, Hammer } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'ทั้งหมด (All)', emoji: '🎨' },
  { id: '3', label: 'เซรามิก & งานปั้น Craft', emoji: '🍵' },
  { id: '4', label: 'งานไม้ & Craft ทำมือ', emoji: '🪵' },
  { id: '5', label: 'เครื่องหนัง Handmade', emoji: '👜' },
  { id: '6', label: 'งานเย็บปักถักร้อย', emoji: '🧶' },
  { id: '7', label: 'เครื่องประดับ Handmade', emoji: '💍' },
  { id: '8', label: 'เทียนหอม & สกินแคร์', emoji: '🕯️' },
  { id: '9', label: 'ของแต่งบ้าน Handmade', emoji: '🏺' },
];

export const ProductFilter = ({ filters, onFilterChange, onReset }) => {
  return (
    <div className="runway-card p-6 rounded-3xl space-y-6 bg-white border border-stone-200/80 shadow-xs">
      {/* Header & Reset */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div className="flex items-center gap-2 text-stone-900 font-mono font-bold text-xs uppercase tracking-wider">
          <Filter className="w-4 h-4 text-[#E76F51]" />
          <span>ตัวกรองสินค้าทั้งหมด</span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-stone-400 hover:text-[#E76F51] flex items-center gap-1 transition-colors font-mono uppercase"
        >
          <RotateCcw className="w-3 h-3" /> ล้างตัวกรอง
        </button>
      </div>

      {/* Search Input */}
      <div>
        <label className="text-[11px] font-mono font-bold text-stone-500 uppercase tracking-wider block mb-2">
          ค้นหาผลงานคราฟต์
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

      {/* Production Type (Handmade vs Craft) */}
      <div>
        <label className="text-[11px] font-mono font-bold text-stone-500 uppercase tracking-wider block mb-2.5">
          รูปแบบการผลิต
        </label>
        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => onFilterChange('is_made_to_order', '0')}
            className={`px-3.5 py-2.5 text-xs rounded-2xl border transition-all flex items-center gap-2.5 font-mono ${String(filters.is_made_to_order) === '0'
                ? 'border-[#1B4332] bg-[#E8F7F3] text-[#1B4332] font-bold shadow-sm'
                : 'border-stone-200 bg-white text-stone-600 hover:bg-[#FAF9F5]'
              }`}
          >
            <Heart className="w-3.5 h-3.5 shrink-0 text-[#1B4332]" />
            <div className="text-left">
              <span className="block font-bold text-[11px]">Handmade Goods</span>
              <span className="block text-[9px] font-normal opacity-70">ชิ้นเดียวในโลก • พร้อมส่ง</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('is_made_to_order', '1')}
            className={`px-3.5 py-2.5 text-xs rounded-2xl border transition-all flex items-center gap-2.5 font-mono ${String(filters.is_made_to_order) === '1'
                ? 'border-[#E76F51] bg-[#FFF0EB] text-[#E76F51] font-bold shadow-sm'
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
          หมวดหมู่สินค้า
        </label>
        <div className="flex flex-col gap-1.5">
          {CATEGORIES.map((cat) => {
            const active = String(filters.category) === String(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onFilterChange('category', cat.id)}
                className={`text-left text-xs px-3.5 py-2.5 rounded-2xl transition-all flex items-center justify-between font-medium ${active
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