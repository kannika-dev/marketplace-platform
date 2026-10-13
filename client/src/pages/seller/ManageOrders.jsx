import React, { useState, useEffect } from 'react';
import api from '../../services/api';
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
  ChevronRight,
  Eye,
  Upload,
  X,
  Image as ImageIcon,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_OPTIONS = [
  { value: 'pending_approval', label: '00 // รอร้านค้าอนุมัติคิวงาน (Pending Approval)' },
  { value: 'order_placed', label: '01 // รับคำสั่งซื้อ/รอชำระเงิน (Order Placed)' },
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
  const [updateImageFile, setUpdateImageFile] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');
  const [previewImage, setPreviewImage] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/seller/orders');
      if (res && res.data) {
        const orderList = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setOrders(orderList);
        const initialStatuses = {};
        orderList.forEach((ord) => {
          initialStatuses[ord.id] = ord.craft_status || ord.status;
        });
        setSelectedStatus(initialStatuses);
      }
    } catch (err) {
      console.warn('Fallback seller orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ฟังก์ชันอัปเดตสเต็ปงานคราฟต์ & แนบรูปภาพความคืบหน้า (แก้ไข Payload ให้ปลอดภัย ไม่ติด Error 500)
  const handleUpdateStatus = async (orderId) => {
    const newStatus = selectedStatus[orderId];
    if (!newStatus) return;

    setUpdatingId(orderId);
    try {
      const note = customNote[orderId] || '';
      const matched = STATUS_OPTIONS.find((s) => s.value === newStatus);
      const imageFile = updateImageFile[orderId];

      if (imageFile) {
        const formData = new FormData();
        formData.append('craft_status', newStatus);
        formData.append('step_title', matched?.label || newStatus);
        formData.append('note', note);
        formData.append('image', imageFile);

        await api.patch(`/seller/orders/${orderId}/craft-status`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.patch(`/seller/orders/${orderId}/craft-status`, {
          craft_status: newStatus,
          step_title: matched?.label || newStatus,
          note: note
        });
      }

      alert('✨ อัปเดตสถานะงานคราฟต์สำเร็จ! ส่งข้อมูลและรูปภาพถึงผู้ซื้อเรียบร้อยแล้ว');
      setUpdateImageFile({ ...updateImageFile, [orderId]: null });
      setCustomNote({ ...customNote, [orderId]: '' });
      fetchOrders();
    } catch (err) {
      console.error('Update craft status error:', err);
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setUpdatingId(null);
    }
  };

  // ฟังก์ชันอนุมัติคำสั่งซื้อ (ปลดล็อกให้ลูกค้าแนบสลิป)
  const handleApproveOrder = async (orderId) => {
    if (!window.confirm('คุณต้องการอนุมัติคำสั่งซื้อนี้ เพื่อเปิดให้ลูกค้าแนบสลิปชำระเงินใช่หรือไม่?')) return;

    setUpdatingId(orderId);
    try {
      await api.patch(`/seller/orders/${orderId}/craft-status`, {
        craft_status: 'order_placed',
        step_title: '01 // รับคำสั่งซื้อ/รอชำระเงิน (Order Placed)',
        note: 'ร้านค้าอนุมัติคำสั่งซื้อเรียบร้อยแล้ว กรุณาโอนเงินและแนบสลิปชำระเงิน'
      });
      alert('✨ อนุมัติคำสั่งซื้อสำเร็จ! ปลดล็อกช่องแนบสลิปให้ฝั่งผู้ซื้อแล้วจ้า');
      fetchOrders();
    } catch (err) {
      console.error('Approve order error:', err);
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการอนุมัติคำสั่งซื้อ');
    } finally {
      setUpdatingId(null);
    }
  };

  // ฟังก์ชันกด "ยืนยันสลิปถูกต้อง"
  const handleApprovePayment = async (orderId) => {
    if (!window.confirm('คุณต้องการยืนยันว่าสลิปการชำระเงินถูกต้องและอนุมัติยอดเงินใช่หรือไม่?')) return;

    setUpdatingId(orderId);
    try {
      await api.patch(`/seller/orders/${orderId}/craft-status`, {
        craft_status: 'material_prep',
        step_title: '02 // จัดเตรียมวัตถุดิบ (Material Prep)',
        note: 'ร้านค้าตรวจสอบสลิปโอนเงินถูกต้องเรียบร้อยแล้ว เริ่มจัดเตรียมวัตถุดิบ'
      });
      alert('✨ ยืนยันสลิปถูกต้องและอนุมัติยอดเงินเรียบร้อยแล้ว!');
      fetchOrders();
    } catch (err) {
      console.error('Approve payment error:', err);
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการอนุมัติสลิป');
    } finally {
      setUpdatingId(null);
    }
  };

  // ฟังก์ชันกรณีสลิปไม่ถูกต้อง / ขอหลักฐานใหม่
  const handleRejectSlip = async (orderId) => {
    const reason = prompt('กรุณาระบุเหตุผลที่สลิปไม่ถูกต้อง (เช่น ยอดเงินไม่ตรง, รูปสลิปเบลอ/ไม่ชัดเจน):');
    if (!reason) return;

    setUpdatingId(orderId);
    try {
      await api.patch(`/seller/orders/${orderId}/craft-status`, {
        craft_status: 'order_placed',
        step_title: '01 // สลิปไม่ถูกต้อง (Invalid Slip)',
        note: `❌ สลิปไม่ถูกต้อง: ${reason} กรุณาตรวจสอบและแนบสลิปใหม่อีกครั้ง`
      });
      alert('✨ ส่งแจ้งเตือนสลิปไม่ถูกต้องไปยังผู้ซื้อเรียบร้อยแล้ว');
      fetchOrders();
    } catch (err) {
      console.error('Reject slip error:', err);
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
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
            <span
              key={key}
              className="bg-[#FFE6A7]/30 text-[#1B4332] border border-[#FFE6A7] px-2.5 py-0.5 rounded-full font-medium"
            >
              {key}: <strong className="font-bold">{String(val)}</strong>
            </span>
          ))}
        </div>
      );
    }

    return <span>{String(parsed)}</span>;
  };

  const filteredOrders = orders.filter((ord) => {
    if (filterStatus === 'all') return true;
    return (ord.craft_status || ord.status) === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 editorial-canvas">

      {/* 📖 Navigation Header */}
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
            ตรวจสอบสลิปโอนเงิน อัปเดตความคืบหน้า และถ่ายทอดเรื่องราวการรังสรรค์ชิ้นงานส่งตรงถึงผู้ซื้อผ่าน Crafting Journey Tracker
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
          <SlidersHorizontal className="w-4 h-4 text-[#1B4332] ml-2" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs font-mono font-bold py-2 px-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-[#1B4332] text-stone-800"
          >
            <option value="all">ALL STAGES ({orders.length})</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 📖 List Section */}
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
          {filteredOrders.map((ord) => {
            const isPendingApproval = ord.status === 'pending_approval' || !ord.status || ord.craft_status === 'pending_approval';
            const isPaymentVerified = ord.payment_status === 'paid' || ord.status === 'paid' || ord.status === 'completed' || (ord.craft_status && ord.craft_status !== 'order_placed' && ord.craft_status !== 'pending_approval');
            const isSlipRejected = ord.payment_status === 'rejected';

            return (
              <div
                key={ord.id}
                className="bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl border border-stone-200/80 hover:border-[#1B4332]/30 transition-all"
              >
                {/* Header Card Status Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-sm font-extrabold text-[#1B4332] bg-[#FFE6A7]/40 px-3 py-1 rounded-full border border-[#FFE6A7]">
                        ORDER #{ord.id}
                      </span>
                      <span className="text-[10px] font-mono tracking-wider uppercase px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold border border-emerald-200">
                        🛠️ STAGE: {ord.craft_status || ord.status}
                      </span>
                      {isPendingApproval ? (
                        <span className="text-[10px] font-mono tracking-wider uppercase px-3 py-1 rounded-full font-bold border bg-amber-50 text-amber-800 border-amber-200">
                          🟡 รอร้านค้าอนุมัติคิวงาน
                        </span>
                      ) : isPaymentVerified ? (
                        <span className="text-[10px] font-mono tracking-wider uppercase px-3 py-1 rounded-full font-bold border bg-emerald-50 text-emerald-800 border-emerald-200 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> ชำระเงินแล้ว
                        </span>
                      ) : isSlipRejected ? (
                        <span className="text-[10px] font-mono tracking-wider uppercase px-3 py-1 rounded-full font-bold border bg-rose-50 text-rose-700 border-rose-200 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600" /> สลิปไม่ถูกต้อง
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono tracking-wider uppercase px-3 py-1 rounded-full font-bold border bg-amber-50 text-amber-800 border-amber-200">
                          ⏳ รอตรวจสอบการชำระเงิน
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-700 pt-1">
                      ผู้สั่งซื้อ: <strong className="font-bold text-stone-900">{ord.buyer_name || 'ลูกค้า'}</strong> <span className="text-stone-400 font-mono">({ord.buyer_email || '-'})</span>
                    </p>
                    <p className="text-[11px] text-stone-500 font-normal">
                      📍 ที่อยู่จัดส่ง: {ord.shipping_address}
                    </p>
                  </div>

                  <div className="text-left sm:text-right bg-stone-50 p-4 rounded-2xl border border-stone-100 min-w-[180px] flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-stone-400 uppercase block">TOTAL AMOUNT</span>
                      <span className="text-2xl font-display font-extrabold text-[#E76F51]">
                        ฿{Number(ord.total_amount).toLocaleString()}
                      </span>
                    </div>
                    {ord.payment_type === 'deposit' && (
                      <span className="text-[10px] text-[#2A9D8F] font-bold pt-1">
                        มัดจำ 50%: ฿{Number(ord.deposit_amount).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* 📄 Payment Slip & Order Review Zone */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {ord.payment_slip_url ? (
                      <div
                        onClick={() => setPreviewImage(ord.payment_slip_url)}
                        className="relative w-16 h-16 rounded-xl overflow-hidden border border-stone-300 shrink-0 cursor-pointer group shadow-sm bg-white"
                      >
                        <img src={ord.payment_slip_url} alt="สลิปโอนเงิน" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye className="w-4 h-4" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-stone-200 flex items-center justify-center text-stone-400 text-[10px] font-mono shrink-0">
                        ไม่มีสลิป
                      </div>
                    )}
                    <div className="space-y-1">
                      <span className="font-bold text-xs text-stone-900 block flex items-center gap-1.5">
                        📄 หลักฐานการโอนเงิน &amp; การจัดการออเดอร์
                      </span>
                      <p className="text-[11px] text-stone-500">
                        {isPendingApproval
                          ? 'ออเดอร์ใหม่รอดำเนินการ: กดปุ่มอนุมัติรับคำสั่งซื้อเพื่อให้ลูกค้าแนบสลิป'
                          : ord.payment_slip_url
                            ? (isPaymentVerified
                              ? '✅ ตรวจสอบสลิปและอนุมัติยอดเงินเรียบร้อยแล้ว'
                              : isSlipRejected
                                ? '❌ สลิปถูกตีกลับ เนื่องจากไม่ถูกต้อง'
                                : 'ลูกค้าแนบสลิปมาแล้ว ตรวจสอบความถูกต้องและกดยืนยันได้เลย')
                            : 'อนุมัติออเดอร์แล้ว รอให้ลูกค้าโอนเงินและแนบสลิป'}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons Zone */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {isPendingApproval && (
                      <button
                        type="button"
                        disabled={updatingId === ord.id}
                        onClick={() => handleApproveOrder(ord.id)}
                        className="px-4 py-2.5 bg-[#2A9D8F] hover:bg-[#21867a] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{updatingId === ord.id ? 'กำลังอนุมัติ...' : '✅ อนุมัติรับคำสั่งซื้อ'}</span>
                      </button>
                    )}

                    {!isPendingApproval && ord.payment_slip_url && !isPaymentVerified && (
                      <>
                        <button
                          type="button"
                          disabled={updatingId === ord.id}
                          onClick={() => handleApprovePayment(ord.id)}
                          className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{updatingId === ord.id ? 'กำลังตรวจสอบ...' : '✅ ยืนยันสลิปถูกต้อง'}</span>
                        </button>
                        <button
                          type="button"
                          disabled={updatingId === ord.id}
                          onClick={() => handleRejectSlip(ord.id)}
                          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          <span>❌ สลิปไม่ถูกต้อง</span>
                        </button>
                      </>
                    )}

                    {isPaymentVerified && (
                      <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-emerald-600" /> สลิปถูกต้องแล้ว
                      </span>
                    )}
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-stone-400 font-bold block">
                    ORDERED PIECES // {ord.items?.length || 0} ITEM(S)
                  </span>
                  {ord.items?.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-stone-50 rounded-2xl text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border border-stone-200/60"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-stone-900 text-sm sm:text-base">
                            {it.product_title || it.title}
                          </span>
                          <span className="bg-[#1B4332] text-[#FFE6A7] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                            × {it.quantity}
                          </span>
                        </div>
                        {renderCustomizationDetails(it.customization_details || it.customization_notes)}
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
                      CURRENT STAGE: <strong className="text-[#FFE6A7] uppercase font-bold">{ord.craft_status || ord.status}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-4 space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-emerald-200 block font-bold">
                        SELECT NEXT STAGE // เลือกขั้นตอน
                      </label>
                      <select
                        value={selectedStatus[ord.id] || ord.craft_status || ord.status}
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

                    <div className="md:col-span-4 space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-emerald-200 block font-bold">
                        JOURNAL NOTE // ข้อความถึงลูกค้า (ไม่บังคับ)
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น กำลังพักชิ้นงานให้แห้งสนิทก่อนลงเตาเผา..."
                        value={customNote[ord.id] || ''}
                        onChange={(e) => setCustomNote({ ...customNote, [ord.id]: e.target.value })}
                        className="w-full text-xs p-3 bg-white text-stone-900 placeholder:text-stone-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFE6A7]"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-emerald-200 block font-bold">
                        ATTACH PHOTO // แนบรูปงาน (ไม่บังคับ)
                      </label>
                      <label className="w-full py-3 px-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer truncate">
                        <Upload className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          {updateImageFile[ord.id] ? updateImageFile[ord.id].name : 'เลือกรูปภาพ'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => setUpdateImageFile({ ...updateImageFile, [ord.id]: e.target.files[0] })}
                        />
                      </label>
                    </div>

                    <div className="md:col-span-2">
                      <button
                        type="button"
                        disabled={updatingId === ord.id}
                        onClick={() => handleUpdateStatus(ord.id)}
                        className="btn-runway-terracotta w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{updatingId === ord.id ? 'SAVING...' : 'UPDATE'}</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* MODAL LIGHTBOX */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-3xl p-4 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1">
                <ImageIcon className="w-4 h-4 text-[#2A9D8F]" /> ตรวจสอบสลิป / รูปภาพ
              </span>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden max-h-[70vh] flex items-center justify-center bg-stone-900">
              <img src={previewImage} alt="ขยายใหญ่" className="max-h-[68vh] w-auto object-contain" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageOrders;