import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Sparkles, Heart, ArrowUpRight, Hammer } from 'lucide-react';
import Badge from '../common/Badge';

export const ProductCard = ({ product }) => {
  const {
    id,
    title,
    price,
    category,
    image_url,
    shop_name,
    artisan_name,
    is_made_to_order,
    lead_time_days
  } = product;

  const displayImage = image_url || `https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80`;

  // Determine item type: HANDMADE (unique one-off) vs CRAFT (made-to-order studio)
  const isMadeToOrder = Boolean(is_made_to_order);

  return (
    <div className="runway-card rounded-3xl overflow-hidden flex flex-col group relative bg-white border border-stone-200/80">

      {/* Product Photography Frame */}
      <div className="relative aspect-[3/4] bg-[#FAF9F5] overflow-hidden">
        <img
          src={displayImage}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* ── HANDMADE vs CRAFT BADGE (Top Left) ── */}
        <div className="absolute top-3.5 left-3.5 z-10 flex flex-col gap-1.5 items-start">
          {isMadeToOrder ? (
            <span className="inline-flex items-center gap-1 bg-[#E76F51] text-white text-[9px] font-mono font-extrabold tracking-widest px-2.5 py-1 rounded-md shadow-md uppercase">
              <Hammer className="w-2.5 h-2.5" />
              CRAFT • MADE-TO-ORDER
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-[#1B4332] text-[#FFE6A7] text-[9px] font-mono font-extrabold tracking-widest px-2.5 py-1 rounded-md shadow-md uppercase">
              <Heart className="w-2.5 h-2.5" />
              HANDMADE • ชิ้นเดียวในโลก
            </span>
          )}
        </div>

        {/* Lead time / Stock Badge (Top Right) */}
        <div className="absolute top-3.5 right-3.5 z-10">
          {lead_time_days > 0 ? (
            <span className="bg-[#FFF9EC]/90 backdrop-blur-md text-[#9E6E00] border border-[#FFE6A7] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
              <Clock className="w-3 h-3 text-amber-600" /> {lead_time_days}d Lead
            </span>
          ) : (
            <span className="bg-[#1B4332]/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              In Stock
            </span>
          )}
        </div>

        {/* Floating Wishlist Heart */}
        <button
          className="absolute bottom-3.5 right-3.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-stone-700 hover:text-rose-500 flex items-center justify-center transition-all shadow-md hover:scale-110 z-10"
          title="บันทึก Handmade & Craft ที่ชื่นชอบ"
        >
          <Heart className="w-4 h-4 hover:fill-rose-500" />
        </button>
      </div>

      {/* Editorial Details */}
      <div className="p-5 flex flex-col flex-grow justify-between space-y-3 bg-white">
        <div>
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5 font-mono">
            <span className="text-[11px] font-bold text-[#1B4332] uppercase tracking-wider">
              {category || 'Handmade Craft'}
            </span>
            <span className="truncate max-w-[130px] text-stone-400 font-sans font-medium">
              By {shop_name || artisan_name || 'Craft Artisan'}
            </span>
          </div>

          <Link to={`/products/${id}`} className="block group-hover:text-[#E76F51] transition-colors">
            <h3 className="text-base font-display font-bold text-stone-900 line-clamp-1 leading-snug tracking-tight">
              {title}
            </h3>
          </Link>
        </div>

        {/* Price & View Button */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-stone-400 block leading-none">
              {isMadeToOrder ? 'CRAFT PRICE' : 'HANDMADE PRICE'}
            </span>
            <span className="text-xl font-display font-extrabold text-stone-900 group-hover:text-[#E76F51] transition-colors">
              ฿{Number(price).toLocaleString()}
            </span>
          </div>

          <Link
            to={`/products/${id}`}
            className="w-9 h-9 rounded-full bg-[#FAF9F5] group-hover:bg-[#E76F51] text-stone-700 group-hover:text-white border border-stone-200 group-hover:border-transparent flex items-center justify-center shadow-xs transition-all"
            title="ดูรายละเอียดงาน Handmade & Craft"
          >
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          </Link>
        </div>
      </div>

    </div>
  );
};

export default ProductCard;
