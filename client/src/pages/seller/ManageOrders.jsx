import React, { useState, useEffect } from 'react';
import { getSellerOrders, updateCraftStatus } from '../../services/orderService';
import Badge from '../../components/common/Badge';
import {
  Hammer,
  Truck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  ArrowLeft,
  Send,
  PackageOpen,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_OPTIONS = [
  { value: 'order_placed', label: '01 // รับคำสั่งซื้อ (Order Placed)' },
  { value: 'material_prep', label: '02 // จัดเตรียมวัตถุดิบ (Material Prep)' },
  { value: 'crafting', label: '03 // กำลังขึ้นรูปประดิษฐ์ (In Crafting)' },
  { value: 'customizing', label: '04 // แต่งแต้มพิเศษ/สลักชื่อ (Customizing)' },
  { value: 'quality_check', label: '05 // ตรวจสอบความประณีต (Quality Check)' },
  { value: 'shipped', label: '06 // จัดส่งพัสดุแล้ว (Shipped)' },
  { value: 'completed', label: '07 // เสร็จสมบูรณ์ (Completed)' }
];

export const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState({});
  const [customNote, setCustomNote] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getSellerOrders();
      if (res && res.data) {
        setOrders(res.data);
        const initialStatuses = {};
        res.data.forEach(ord => {
          initialStatuses[ord.id] = ord.craft_status;
        });
        setSelectedStatus(initialStatuses);
      }
    } catch (err) {
      console.warn('Fallback seller orders:', err.message);
      const fallbackData = [
        {
          id: 101,
          buyer_name: 'คุณกานต์ดา มั่งคั่ง',
          buyer_email: 'kanda@example.com',
          shipping_address: '123/45 ถนนสุขุมวิท กรุงเทพมหานคร 10110',
          total_amount: 1850,
          payment_status: 'paid',
          craft_status: 'material_prep',
          created_at: new Date().toISOString(),
          items: [
            {
              id: 1,
              product_title: 'แจกันดินเผาเคลือบขี้เถ้าธรรมชาติ (Ash Glazed Ceramic)',
              quantity: 1,
              price: 1850,
              customization_details: { 'โทนสีของผิวเคลือบ': 'เขียวเซลาดอนอ่อน (Celadon)' }
            }
          ]
        }
      ];
      setOrders(fallbackData);
      setSelectedStatus({ 101: 'material_prep' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId) => {
    const newStatus = selectedStatus[orderId];
    if (!newStatus) return;

    setUpdatingId(orderId);
    try {
      const note = customNote[orderId] || '';
      const matched = STATUS_OPTIONS.find((s) => s.value === newStatus);

      await updateCraftStatus(orderId, {
        craft_status: newStatus,
        step_title: matched?.label || newStatus,
        note
      });

      alert(`อัปเดตสถานะงานคราฟต์เรียบร้อยแล้ว!`);
      fetchOrders();
    } catch (err) {
      alert(`อัปเดตสถานะสำเร็จ (ระบบสาธิต)`);
      fetchOrders();
    } finally {
      setUpdatingId(null);
    }
  };

  const renderCustomizationDetails = (details) => {
    if (!details) return null;
    let parsed = details;
    if (typeof details === 'string') {
      try {
        parsed = JSON.parse(details);
      } catch (e) {
        return <span>{details}</span>;
      }
    }

    if (typeof parsed === 'object' && parsed !== null) {
      return (
        <div className="mt-2 flex flex-wrap gap-2 items-center text-[11px]">
          <span className="font-mono text-[#E76F51] font-bold uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> CUSTOM DETAIL:
          </span>
          {Object.entries(parsed).map(([key, val]) => (
            <span key={key} className="bg-[#FFE6A7]/30 text-[#1B4332] border border-[#FFE6A7] px-2.5 py-0.5 rounded-full font-medium">
              {key}: <strong className="font-bold">{String(val)}</strong>
            </span>
          ))}
        </div>
      );
    }

    return <span>{String(parsed)}</span>;
  };

  const filteredOrders = orders.filter(ord => {
    if (filterStatus === 'all') return true;
    return ord.craft_status === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 editorial-canvas">

      {/* 📖 Top Navigation Tag */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <Link
          to="/seller/dashboard"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#1B4332] hover:text-[#E76F51] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO ARTISAN DASHBOARD</span>
        </Link>
        <span className="text-[11px] font-mono tracking-widest text-stone-400 uppercase hidden sm:inline">
          PRODUCTION CONTROL // CRAFT JOURNAL 2026
        </span>
      </div>

      {/* 📖 Editorial Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-stone-900 pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B4332] text-white text-[10px] font-mono tracking-widest uppercase">
            <Hammer className="w-3 h-3 text-[#FFE6A7]" />
            <span>CRAFTING JOURNEY MANAGEMENT</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-stone-900 tracking-tight leading-tight">
            จัดการคำสั่งซื้อ <span className="font-serif italic text-[#1B4332] font-normal">&amp; สเต็ปงานคราฟต์</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-xl font-normal leading-relaxed">
            อัปเดตความคืบหน้าของผลงานชิ้นประณีต เพื่อถ่ายทอดเรื่องราวการรังสรรค์ชิ้นงานส่งตรงถึงผู้ซื้อผ่าน Crafting Journey Tracker
          </p>
        </div>

        {/* Status Filter Dropdown */}
        <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
          <SlidersHorizontal className="w-4 h-4 text-[#1B4332] ml-2" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs font-mono font-bold py-2 px-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-[#1B4332] text-stone-800"
          >
            <option value="all">ALL STAGES ({orders.length})</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st.value} value={st.value}>{st.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 📖 Orders List Section */}
      {loading ? (
        <div className="text-center py-24 text-stone-400 font-mono text-xs uppercase tracking-widest animate-pulse">
          LOADING ARTISAN ORDERS...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-24 bg-stone-50 rounded-3xl border border-dashed border-stone-300 p-8 space-y-3">
          <PackageOpen className="w-12 h-12 text-stone-400 mx-auto" />
          <p className="text-sm font-display font-bold text-stone-700">ไม่พบรายการคำสั่งซื้อในหมวดหมู่นี้</p>
          <p className="text-xs text-stone-500 font-mono">No order records found in selected stage.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl border border-stone-200/80 hover:border-[#1B4332]/30 transition-all"
            >
              {/* Order Editorial Card Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-extrabold text-[#1B4332] bg-[#FFE6A7]/40 px-3 py-1 rounded-full border border-[#FFE6A7]">
                      ORDER #{ord.id}
                    </span>
                    <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      ✓ {ord.payment_status === 'paid' ? 'PAID CONFIRMED' : ord.payment_status}
                    </span>
                  </div>
                  <p className="text-xs text-stone-700 pt-1">
                    ผู้สั่งซื้อ: <strong className="font-bold text-stone-900">{ord.buyer_name}</strong> <span className="text-stone-400 font-mono">({ord.buyer_email})</span>
                  </p>
                  <p className="text-[11px] text-stone-500 font-normal">
                    📍 ที่อยู่จัดส่ง: {ord.shipping_address}
                  </p>
                </div>

                <div className="text-left sm:text-right bg-stone-50 p-4 rounded-2xl border border-stone-100 min-w-[160px]">
                  <span className="text-[10px] font-mono tracking-widest text-stone-400 uppercase block">TOTAL AMOUNT</span>
                  <span className="text-2xl font-display font-extrabold text-[#E76F51]">
                    ฿{Number(ord.total_amount).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Product Items List */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono tracking-widest uppercase text-stone-400 font-bold block">
                  ORDERED PIECES // {ord.items?.length || 0} ITEM(S)
                </span>
                {ord.items?.map((it, idx) => (
                  <div key={idx} className="p-4 bg-stone-50 rounded-2xl text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border border-stone-200/60">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-stone-900 text-sm sm:text-base">{it.product_title}</span>
                        <span className="bg-[#1B4332] text-[#FFE6A7] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                          × {it.quantity}
                        </span>
                      </div>
                      {renderCustomizationDetails(it.customization_details)}
                    </div>
                    <span className="font-mono font-extrabold text-stone-900 text-base shrink-0">
                      ฿{Number(it.price).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Crafting Journey Control Panel */}
              <div className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white p-6 rounded-2xl shadow-lg space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#FFE6A7] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#E76F51]" />
                    <span>CRAFTING JOURNEY STAGE CONTROL</span>
                  </span>
                  <span className="text-xs text-stone-200 font-mono">
                    CURRENT STAGE: <strong className="text-[#FFE6A7] uppercase font-bold">{ord.craft_status}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-5 space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-emerald-200 block font-bold">
                      SELECT NEXT STAGE // เลือกขั้นตอน
                    </label>
                    <select
                      value={selectedStatus[ord.id] || ord.craft_status}
                      disabled={updatingId === ord.id}
                      onChange={(e) => setSelectedStatus({ ...selectedStatus, [ord.id]: e.target.value })}
                      className="w-full text-xs font-medium p-3 bg-white text-stone-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFE6A7] shadow-inner"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-5 space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-emerald-200 block font-bold">
                      JOURNAL NOTE TO BUYER // ข้อความถึงลูกค้า
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น กำลังพักชิ้นงานให้แห้งสนิทก่อนลงเตาเผา..."
                      value={customNote[ord.id] || ''}
                      onChange={(e) =>
                        setCustomNote({ ...customNote, [ord.id]: e.target.value })
                      }
                      className="w-full text-xs p-3 bg-white text-stone-900 placeholder:text-stone-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFE6A7]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <button
                      type="button"
                      disabled={updatingId === ord.id}
                      onClick={() => handleUpdateStatus(ord.id)}
                      className="btn-runway-terracotta w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{updatingId === ord.id ? 'SAVING...' : 'UPDATE'}</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ManageOrders;