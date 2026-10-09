import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Trash2,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Leaf,
  Clock,
  ShieldCheck,
  Tag,
  Plus,
  Minus,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import Badge from '../components/common/Badge';

export const Cart = () => {
  const { cart, removeFromCart, clearCart, addToCart } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  const totalAmount = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const finalAmount = Math.max(0, totalAmount - discount);

  // Calculate max estimated crafting lead time among made-to-order items in cart
  const maxLeadTime = cart.reduce((max, item) => {
    const days = item.lead_time_days || (item.is_made_to_order ? 7 : 2);
    return Math.max(max, days);
  }, 0);

  const handleUpdateQuantity = (item, delta) => {
    if (item.quantity + delta <= 0) {
      const itemIndex = cart.indexOf(item);
      removeFromCart(itemIndex);
    } else {
      addToCart(item, delta, item.selectedOptions || item.customization_notes);
    }
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'CRAFT10') {
      setDiscount(Math.round(totalAmount * 0.1));
      setCouponApplied(true);
    } else if (couponCode.trim().toUpperCase() === 'FIRSTBUY') {
      setDiscount(150);
      setCouponApplied(true);
    } else if (couponCode.trim()) {
      alert('โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุ (ลองใช้: CRAFT10 หรือ FIRSTBUY)');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#E8F7F3] to-[#FFE8D6] text-[#2A9D8F] flex items-center justify-center mx-auto shadow-clay-card animate-float-slow border border-white">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-display font-extrabold text-stone-900">
            ตะกร้าผลงานคราฟต์ของคุณยังว่างเปล่า
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto font-normal">
            เลือกชมผลงานศิลปะทำมือสุดประณีตจากช่างฝีมือไทย พร้อมปรับแต่งชิ้นงานตามสไตล์ของคุณ
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-9 py-4 rounded-2xl btn-3d-peach text-sm font-bold shadow-xl"
        >
          <span>เลือกชมสินค้างานคราฟต์</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-emerald-100">
        <div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2A9D8F] hover:text-[#1B4332] mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>เลือกดูสินค้าเพิ่มเติม</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-stone-900 tracking-tight">
            ตะกร้าผลงานคราฟต์ของคุณ
          </h1>
          <span className="text-xs text-stone-500 font-medium">
            มีสินค้าทั้งหมด {cart.reduce((t, i) => t + i.quantity, 0)} ชิ้น ในตะกร้า
          </span>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-stone-400 hover:text-rose-500 transition-colors font-bold px-4 py-2 rounded-xl hover:bg-rose-50 w-fit"
        >
          ล้างตะกร้าทั้งหมด
        </button>
      </div>

      {/* Main Grid: Bento-Style Items List (Left) + Sticky Checkout Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT: Bento-Style Item Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item, index) => {
            const leadTime = item.lead_time_days || (item.is_made_to_order ? 7 : 2);
            const customOptions = item.selectedOptions || item.customization_notes || item.customization_details;

            return (
              <div
                key={index}
                className="clay-card p-5 sm:p-6 rounded-3xl border border-white shadow-clay-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden group"
              >
                {/* Left Thumbnail & Info */}
                <div className="flex items-start sm:items-center gap-4.5 w-full sm:w-auto">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-white shadow-2xs group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=300&q=80'}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    {Boolean(item.is_made_to_order) && (
                      <span className="absolute top-1 left-1 bg-[#E76F51] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                        Custom
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#2A9D8F] bg-[#E8F7F3] px-2 py-0.5 rounded-md">
                        {item.category || 'Handmade'}
                      </span>
                      <span className="text-xs text-stone-400 font-medium">
                        โดย {item.shop_name || 'Artisan Workshop'}
                      </span>
                    </div>

                    <Link to={`/products/${item.id}`} className="block group-hover:text-[#2A9D8F] transition-colors">
                      <h3 className="text-base font-display font-bold text-stone-900 line-clamp-1">
                        {item.title}
                      </h3>
                    </Link>

                    {/* Custom Inscription / Glaze Selection Details */}
                    {customOptions && Object.keys(customOptions).length > 0 && (
                      <div className="text-[11px] text-[#E76F51] bg-[#FFF0EB] border border-[#FFCBBF] px-3 py-1 rounded-xl inline-flex flex-wrap items-center gap-1.5 font-bold shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5 text-[#E76F51] shrink-0" />
                        <span>
                          {typeof customOptions === 'string'
                            ? customOptions
                            : Object.entries(customOptions)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(' | ')}
                        </span>
                      </div>
                    )}

                    {/* Estimated Crafting Time Tag */}
                    <div className="flex items-center gap-1.5 text-xs text-[#9E6E00] bg-[#FFF9EC] border border-[#FFE6A7] px-2.5 py-0.5 rounded-lg w-fit font-semibold">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>
                        {item.is_made_to_order
                          ? `ระยะเวลาสร้างสรรค์โดยประมาณ: ~${leadTime} วัน`
                          : `พร้อมส่งทันที (In Stock)`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Quantity Stepper, Price & Remove Button */}
                <div className="flex items-center justify-between w-full sm:w-auto sm:flex-col sm:items-end gap-3 sm:border-l sm:border-emerald-100/60 sm:pl-6">

                  {/* Price Breakdown */}
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-stone-400 font-semibold block leading-none">
                      ฿{Number(item.price).toLocaleString()} / ชิ้น
                    </span>
                    <span className="text-xl font-display font-extrabold text-[#E76F51]">
                      ฿{(Number(item.price) * item.quantity).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* 3D Quantity Stepper */}
                    <div className="flex items-center border border-emerald-200 rounded-2xl bg-white shadow-2xs p-0.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item, -1)}
                        className="w-7 h-7 rounded-xl hover:bg-emerald-50 flex items-center justify-center text-[#2A9D8F] font-bold transition-colors"
                        title="ลดจำนวน"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-display font-bold text-stone-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item, 1)}
                        className="w-7 h-7 rounded-xl hover:bg-emerald-50 flex items-center justify-center text-[#2A9D8F] font-bold transition-colors"
                        title="เพิ่มจำนวน"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Remove Action */}
                    <button
                      onClick={() => removeFromCart(index)}
                      className="p-2 text-stone-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors shadow-2xs"
                      title="ลบรายการนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}

          {/* Eco packaging banner note */}
          <div className="p-4 bg-gradient-to-r from-[#E8F7F3] to-[#D8F3DC] rounded-3xl border border-emerald-200/80 flex items-center gap-3 text-xs text-[#1B4332] font-semibold">
            <Leaf className="w-5 h-5 text-[#2A9D8F] shrink-0" />
            <span>
              ทุกคำสั่งซื้อบรรจุด้วยวัสดุกันกระแทก Eco-Cushion ย่อยสลายได้ตามธรรมชาติ 100%
            </span>
          </div>
        </div>

        {/* RIGHT: Sticky Checkout Summary Card (4 cols) */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="clay-card p-6 sm:p-7 rounded-3xl border border-white shadow-xl space-y-5 bg-white/95 backdrop-blur-md">

            <div className="border-b border-emerald-100 pb-3">
              <h2 className="text-xl font-display font-extrabold text-stone-900">
                สรุปคำสั่งซื้อ (Order Summary)
              </h2>
              <span className="text-[11px] text-stone-500 font-medium">
                ยอดสุทธิรวมภาษีและค่าจัดส่งคราฟต์
              </span>
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 text-xs text-stone-600 font-medium">
              <div className="flex justify-between">
                <span>ยอดรวมสินค้า</span>
                <span className="font-bold text-stone-900">฿{totalAmount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <span>ค่าจัดส่งบรรจุภัณฑ์คราฟต์</span>
                  <Leaf className="w-3.5 h-3.5 text-[#2A9D8F]" />
                </span>
                <span className="text-[#2A9D8F] font-bold">ฟรี (Free Eco-Care)</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-[#E76F51] font-bold bg-[#FFF0EB] px-2.5 py-1 rounded-xl">
                  <span>ส่วนลดคูปองพิเศษ</span>
                  <span>-฿{discount.toLocaleString()}</span>
                </div>
              )}

              {maxLeadTime > 0 && (
                <div className="flex justify-between text-amber-800 bg-[#FFF9EC] px-2.5 py-1.5 rounded-xl border border-[#FFE6A7] font-semibold">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> ระยะเวลาทำมือรวม:
                  </span>
                  <span>~{maxLeadTime} วันทำการ</span>
                </div>
              )}
            </div>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="pt-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="โค้ดส่วนลด (เช่น CRAFT10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-stone-50 border border-emerald-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F] font-mono uppercase"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-stone-800 hover:bg-stone-900 text-white rounded-2xl text-xs font-bold transition-colors shadow-xs"
                >
                  ใช้โค้ด
                </button>
              </div>
              {couponApplied && (
                <span className="text-[11px] text-[#2A9D8F] font-bold block mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ใช้งานโค้ดส่วนลดสำเร็จ!
                </span>
              )}
            </form>

            {/* Final Total */}
            <div className="border-t border-emerald-100 pt-4 flex justify-between items-baseline">
              <div>
                <span className="text-xs text-stone-400 font-semibold block">ยอดชำระสุทธิ</span>
                <span className="text-2xl sm:text-3xl font-display font-extrabold text-[#E76F51]">
                  ฿{finalAmount.toLocaleString()}
                </span>
              </div>
              <span className="text-[11px] text-stone-400 font-medium">บาท (THB)</span>
            </div>

            {/* Primary Terracotta Checkout Button */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 rounded-2xl btn-3d-peach text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl group"
            >
              <span>ไปที่ขั้นตอนการชำระเงิน</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Trust Assurance Guarantee */}
            <div className="pt-2 border-t border-emerald-50 space-y-2 text-[11px] text-stone-500 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#2A9D8F] shrink-0" />
                <span>การันตีรับเงินคืนหากสินค้าชำรุดจากการขนส่ง</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2A9D8F] shrink-0" />
                <span>งานคราฟต์แท้ 100% สลักชื่อตามสั่งตรงสเปก</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default Cart;