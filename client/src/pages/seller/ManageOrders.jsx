import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Hammer,
  ArrowLeft,
  Send,
  PackageOpen,
  SlidersHorizontal,
  Eye,
  Upload,
  X,
  Sparkles,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Tag,
  Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Quick Tags สำหรับกดเลือกข้อความด่วน
const QUICK_STATUS_TAGS = [
  'รับคำสั่งซื้อแล้ว',
  'เตรียมวัตถุดิบเรียบร้อย',
  'กำลังขึ้นรูปชิ้นงาน',
  'ลงสี / แต่งแต้มรายละเอียด',
  'สลักชื่อ / Customizing',
  'ตรวจสอบความประณีต (QC)',
  'ชิ้นงานเสร็จเรียบร้อยแล้ว',
  'จัดส่งพัสดุเรียบร้อยแล้ว'
];

export const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // State สำหรับเก็บข้อความที่ผู้ขายพิมพ์แบบอิสระ
  const [customTitle, setCustomTitle] = useState({});
  const [customNote, setCustomNote] = useState({});
  const [updateImageFile, setUpdateImageFile] = useState({});
  // State สำหรับเลือกสินค้าชิ้นย่อยเพื่ออัปเดตสเต็ปงานคราฟต์
  const [selectedProductItem, setSelectedProductItem] = useState({});

  const [filterStatus, setFilterStatus] = useState('all');
  const [previewImage, setPreviewImage] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/seller/orders');
      if (res && res.data) {
        const orderList = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setOrders(orderList);
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

  // 1. อนุมัติรับคำสั่งซื้อ
  const handleApproveOrder = async (orderId) => {
    if (!window.confirm('คุณต้องการอนุมัติรับคำสั่งซื้อนี้ใช่หรือไม่?')) return;

    setUpdatingId(orderId);
    try {
      const formData = new FormData();
      formData.append('craft_status', 'awaiting_deposit');
      formData.append('step_title', 'รับคำสั่งซื้อเรียบร้อยแล้ว');
      formData.append('note', 'ร้านค้าอนุมัติคำสั่งซื้อเรียบร้อยแล้ว กรุณาตรวจสอบการชำระเงินค่ะ');

      await api.patch(`/seller/orders/${orderId}/craft-status`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('✨ ออนุมัติคำสั่งซื้อสำเร็จ!');
      fetchOrders();
    } catch (err) {
      console.error('Approve order error:', err);
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการอนุมัติคำสั่งซื้อ');
    } finally {
      setUpdatingId(null);
    }
  };

  // 2. ยืนยันสลิปถูกต้อง (งวดแรก / จ่ายเต็ม)
  const handleApprovePayment = async (orderId) => {
    if (!window.confirm('คุณต้องการยืนยันว่าสลิปการชำระเงินถูกต้องใช่หรือไม่?')) return;

    setUpdatingId(orderId);
    try {
      const formData = new FormData();
      formData.append('craft_status', 'in_progress');
      formData.append('step_title', 'ตรวจสอบสลิปชำระเงินเรียบร้อย');
      formData.append('note', 'ร้านค้าตรวจสอบหลักฐานการโอนเงินถูกต้องเรียบร้อยแล้ว เริ่มดำเนินงานคราฟต์พิถีพิถัน');

      await api.patch(`/seller/orders/${orderId}/craft-status`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('✨ ยืนยันสลิปถูกต้องแล้ว! เริ่มเข้าสู่ขั้นตอนการผลิต');
      fetchOrders();
    } catch (err) {
      console.error('Approve payment error:', err);
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการอนุมัติสลิป');
    } finally {
      setUpdatingId(null);
    }
  };

  // 3. ปุ่มกดเรียกเก็บเงินงวดที่ 2 (ยอดคงเหลือ 50%)
  const handleRequestFinalPayment = async (orderId, remainingAmount) => {
    if (!window.confirm(`คุณต้องการแจ้งผู้ซื้อชำระเงินงวดที่ 2 (ยอดคงเหลือ ฿${remainingAmount.toLocaleString()}) ใช่หรือไม่?`)) return;

    setUpdatingId(orderId);
    try {
      const formData = new FormData();
      formData.append('craft_status', 'awaiting_final_payment');
      formData.append('step_title', '✨ ผลงานเสร็จเรียบร้อยแล้ว - รอชำระยอดคงเหลือ');
      formData.append('note', `ชิ้นงานของคุณประดิษฐ์เสร็จสมบูรณ์แล้ว กรุณาชำระยอดคงเหลือ ฿${remainingAmount.toLocaleString()} และแนบสลิปรอบสองเพื่อเตรียมการจัดส่งค่ะ`);

      await api.patch(`/seller/orders/${orderId}/craft-status`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('✨ ส่งแจ้งเตือนชำระเงินงวดที่ 2 ถึงผู้ซื้อเรียบร้อยแล้ว!');
      fetchOrders();
    } catch (err) {
      console.error('Request final payment error:', err);
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งแจ้งเตือน');
    } finally {
      setUpdatingId(null);
    }
  };

  // 4. ยืนยันสลิปรอบที่ 2 ถูกต้อง (จ่ายครบ 100% พร้อมจัดส่ง)
  const handleApproveFinalPayment = async (orderId) => {
    if (!window.confirm('คุณต้องการยืนยันว่าสลิปการชำระเงินงวดสุดท้ายถูกต้องใช่หรือไม่?')) return;

    setUpdatingId(orderId);
    try {
      const formData = new FormData();
      formData.append('craft_status', 'ready_to_ship');
      formData.append('step_title', '🎉 ชำระเงินครบถ้วนแล้ว - เตรียมจัดส่ง');
      formData.append('note', 'ร้านค้าตรวจสอบสลิปงวดสุดท้ายเรียบร้อย ชำระเงินครบถ้วนแล้ว กำลังแพ็กสินค้าเพื่อจัดส่งค่ะ');

      await api.patch(`/seller/orders/${orderId}/craft-status`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('✨ ยืนยันชำระเงินครบถ้วน! ออเดอร์พร้อมสำหรับการจัดส่งแล้ว');
      fetchOrders();
    } catch (err) {
      console.error('Approve final payment error:', err);
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการอนุมัติสลิป');
    } finally {
      setUpdatingId(null);
    }
  };

  // 5. ปฏิเสธสลิป (สลิปไม่ถูกต้อง)
  const handleRejectSlip = async (orderId) => {
    const reason = prompt('กรุณาระบุเหตุผลที่สลิปไม่ถูกต้อง:');
    if (!reason) return;

    setUpdatingId(orderId);
    try {
      const formData = new FormData();
      formData.append('craft_status', 'slip_rejected');
      formData.append('step_title', 'สลิปไม่ถูกต้อง');
      formData.append('note', `❌ สลิปไม่ถูกต้อง: ${reason} กรุณาตรวจสอบและแนบสลิปใหม่อีกครั้ง`);

      await api.patch(`/seller/orders/${orderId}/craft-status`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
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

  // 6. บันทึกเรื่องราว Artisan Journal (พร้อมเคลียร์คำร้องขออัปเดตของผู้ซื้ออัตโนมัติ)
  const handleSaveJournalUpdate = async (orderId, titleText, noteText) => {
    if (!titleText || titleText.trim() === '') {
      alert('กรุณาระบุหัวข้อหรือสถานะความคืบหน้า');
      return;
    }

    setUpdatingId(orderId);
    try {
      const imageFile = updateImageFile[orderId];
      const chosenItem = selectedProductItem[orderId];
      let finalTitle = String(titleText).trim();

      if (chosenItem && chosenItem !== 'all') {
        if (!finalTitle.includes(chosenItem)) {
          finalTitle = `[${chosenItem}] ${finalTitle}`;
        }
      }

      const formData = new FormData();
      formData.append('craft_status', 'in_progress');
      formData.append('step_title', finalTitle);
      formData.append('note', String(noteText || ''));

      if (imageFile) {
        formData.append('image', imageFile);
      }

      // 1. บันทึกสเต็ปงานคราฟต์
      await api.patch(`/seller/orders/${orderId}/craft-status`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // 2. 🔔 เคลียร์คำร้องขออัปเดตของผู้ซื้ออัตโนมัติ (ให้ Badge หายไป)
      try {
        await api.patch(`/orders/${orderId}/resolve-update`);
      } catch (resolveErr) {
        console.warn('Resolve update notice:', resolveErr);
      }

      alert(`✨ บันทึกเรื่องราว "${finalTitle}" และเคลียร์คำร้องขอของลูกค้าเรียบร้อยแล้ว!`);

      setUpdateImageFile({ ...updateImageFile, [orderId]: null });
      setCustomTitle({ ...customTitle, [orderId]: '' });
      setCustomNote({ ...customNote, [orderId]: '' });

      fetchOrders();
    } catch (err) {
      console.error('Update craft status error:', err);
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
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
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <Link
          to="/seller/dashboard"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#1B4332] hover:text-[#E76F51] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO ARTISAN DASHBOARD</span>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-stone-900 pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B4332] text-white text-[10px] font-mono tracking-widest uppercase">
            <Hammer className="w-3 h-3 text-[#FFE6A7]" />
            <span>ARTISAN JOURNAL &amp; PRODUCTION CONTROL</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-stone-900 tracking-tight leading-tight">
            จัดการคำสั่งซื้อ <span className="font-serif italic text-[#1B4332] font-normal">&amp; ตรวจสอบสลิปโอนเงิน</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
          <SlidersHorizontal className="w-4 h-4 text-[#1B4332] ml-2" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs font-mono font-bold py-2 px-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-[#1B4332] text-stone-800"
          >
            <option value="all">ALL ORDERS ({orders.length})</option>
            <option value="order_placed">รอดำเนินการ</option>
            <option value="awaiting_deposit">รอชำระเงิน/แนบสลิป</option>
            <option value="in_progress">กำลังผลิตงานคราฟต์</option>
            <option value="awaiting_final_payment">รอชำระเงินงวดที่ 2</option>
            <option value="ready_to_ship">พร้อมจัดส่ง</option>
            <option value="completed">เสร็จสมบูรณ์</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-24 text-stone-400 font-mono text-xs uppercase tracking-widest animate-pulse">
          LOADING ARTISAN ORDERS...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-24 bg-stone-50 rounded-3xl border border-dashed border-stone-300 p-8 space-y-3">
          <PackageOpen className="w-12 h-12 text-stone-400 mx-auto" />
          <p className="text-sm font-display font-bold text-stone-700">ไม่พบรายการคำสั่งซื้อในสถานะนี้</p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredOrders.map((ord) => {
            const currentCraftStatus = ord.craft_status || 'order_placed';
            const isDeposit = ord.payment_type === 'deposit';

            const hasUploadedSlip = Boolean(ord.payment_slip_url);
            const hasUploadedFinalSlip = Boolean(ord.final_payment_slip_url);

            const isAwaitingFinalPayment = currentCraftStatus === 'awaiting_final_payment';
            const isFinalPaymentVerification = hasUploadedFinalSlip && currentCraftStatus !== 'ready_to_ship' && currentCraftStatus !== 'completed';
            const isCompleted = currentCraftStatus === 'completed';

            const depositAmt = Number(ord.deposit_amount || Math.round(ord.total_amount * 0.5));
            const remainingAmt = Number(ord.remaining_balance || (ord.total_amount - depositAmt));

            return (
              <div
                key={ord.id}
                className="bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl border border-stone-200/80 hover:border-[#1B4332]/30 transition-all"
              >
                {/* 🔔 1. แบดจ์แจ้งเตือนด่วน พร้อมแสดงข้อความที่ผู้ซื้อพิมพ์ฝากไว้ */}
                {ord.has_pending_update_request === 1 && (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 animate-pulse shadow-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 text-xs font-bold">
                        <Bell className="w-5 h-5 text-amber-600 shrink-0 animate-bounce" />
                        <span>🔔 ผู้ซื้อส่งคำร้องขอให้ช่วยอัปเดตความคืบหน้าสินค้าชิ้นนี้ (โปรดอัปเดตสเต็ปงานด้านล่าง)</span>
                      </div>
                      {ord.update_buyer_note && (
                        <p className="pl-7 text-xs text-amber-800 font-medium italic">
                          💬 ข้อความจากผู้ซื้อ: "{ord.update_buyer_note}"
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] font-mono bg-amber-200 text-amber-900 px-2.5 py-1 rounded-full font-extrabold uppercase shrink-0 self-start sm:self-center">
                      URGENT REQUEST
                    </span>
                  </div>
                )}

                {/* Header คำสั่งซื้อ */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-sm font-extrabold text-[#1B4332] bg-[#FFE6A7]/40 px-3 py-1 rounded-full border border-[#FFE6A7]">
                        ORDER #{ord.id}
                      </span>
                      <span className="text-[10px] font-mono tracking-wider uppercase px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold border border-emerald-200">
                        STATUS: {currentCraftStatus}
                      </span>
                      <span className="text-[10px] font-mono tracking-wider uppercase px-3 py-1 rounded-full bg-stone-100 text-stone-700 font-bold border border-stone-200">
                        {isDeposit ? 'ชำระแบบมัดจำ 50%' : 'ชำระเต็มจำนวน'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-700 pt-1">
                      ผู้สั่งซื้อ: <strong className="font-bold text-stone-900">{ord.buyer_name || 'ลูกค้า'}</strong>
                    </p>
                  </div>

                  <div className="text-left sm:text-right bg-stone-50 p-4 rounded-2xl border border-stone-100 min-w-[180px]">
                    <span className="text-[10px] font-mono tracking-widest text-stone-400 uppercase block">TOTAL AMOUNT</span>
                    <span className="text-2xl font-display font-extrabold text-[#E76F51]">
                      ฿{Number(ord.total_amount).toLocaleString()}
                    </span>
                    {isDeposit && (
                      <div className="text-[10px] text-stone-500 pt-0.5">
                        <span>มัดจำ: ฿{depositAmt.toLocaleString()}</span> | <span className="font-bold text-[#E76F51]">คงเหลือ: ฿{remainingAmt.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 📌 แผงตรวจสอบสลิปโอนเงิน */}
                <div className="space-y-4">
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {ord.payment_slip_url ? (
                        <div
                          onClick={() => setPreviewImage(ord.payment_slip_url)}
                          className="relative w-16 h-16 rounded-xl overflow-hidden border border-stone-300 shrink-0 cursor-pointer group shadow-sm bg-white"
                        >
                          <img src={ord.payment_slip_url} alt="สลิปงวดแรก" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-stone-200 flex items-center justify-center text-stone-400 text-[10px] font-mono shrink-0">
                          รอสลิป
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-xs text-stone-900 block">หลักฐานสลิปการชำระเงิน (งวดแรก / เต็มจำนวน)</span>
                        <span className="text-[11px] text-stone-500">
                          {hasUploadedSlip ? '✨ ลูกค้าแนบสลิปมาแล้ว กรุณาตรวจสอบความถูกต้อง' : 'ยังไม่มีการแนบสลิปจากผู้ซื้อ'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {hasUploadedSlip && currentCraftStatus !== 'in_progress' && currentCraftStatus !== 'ready_to_ship' && currentCraftStatus !== 'completed' && (
                        <>
                          <button
                            type="button"
                            disabled={updatingId === ord.id}
                            onClick={() => handleApprovePayment(ord.id)}
                            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                          >
                            ✅ ยืนยันสลิปถูกต้อง
                          </button>
                          <button
                            type="button"
                            disabled={updatingId === ord.id}
                            onClick={() => handleRejectSlip(ord.id)}
                            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                          >
                            ❌ สลิปไม่ถูกต้อง
                          </button>
                        </>
                      )}

                      {isDeposit && (currentCraftStatus === 'in_progress' || currentCraftStatus === 'production_finished') && (
                        <button
                          type="button"
                          disabled={updatingId === ord.id}
                          onClick={() => handleRequestFinalPayment(ord.id, remainingAmt)}
                          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>🔔 แจ้งชำระเงินงวดที่ 2 (฿{remainingAmt.toLocaleString()})</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {isDeposit && (isAwaitingFinalPayment || hasUploadedFinalSlip || currentCraftStatus === 'ready_to_ship' || isCompleted) && (
                    <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {ord.final_payment_slip_url ? (
                          <div
                            onClick={() => setPreviewImage(ord.final_payment_slip_url)}
                            className="relative w-16 h-16 rounded-xl overflow-hidden border border-amber-300 shrink-0 cursor-pointer group shadow-sm bg-white"
                          >
                            <img src={ord.final_payment_slip_url} alt="สลิปงวดที่ 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Eye className="w-4 h-4" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-amber-200/60 flex items-center justify-center text-amber-700 text-[10px] font-mono shrink-0">
                            รอสลิปงวด 2
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-xs text-amber-900 block">หลักฐานสลิปยอดคงเหลือ (งวดที่ 2) - ฿{remainingAmt.toLocaleString()}</span>
                          <span className="text-[11px] text-amber-700">
                            {hasUploadedFinalSlip ? '🎉 ลูกค้าแนบสลิปงวดที่ 2 แล้ว กรุณาตรวจสอบ' : 'ส่งแจ้งเตือนให้ลูกค้าชำระเงินงวดที่ 2 แล้ว รอหลักฐานโอนเงิน'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {isFinalPaymentVerification && (
                          <>
                            <button
                              type="button"
                              disabled={updatingId === ord.id}
                              onClick={() => handleApproveFinalPayment(ord.id)}
                              className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                            >
                              ✅ ยืนยันสลิปรอบ 2 ถูกต้อง (พร้อมจัดส่ง)
                            </button>
                            <button
                              type="button"
                              disabled={updatingId === ord.id}
                              onClick={() => handleRejectSlip(ord.id)}
                              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                            >
                              ❌ สลิปไม่ถูกต้อง
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* รายการสินค้าแยกชิ้นย่อย 1:1 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-stone-400 font-bold block">
                      ORDERED PIECES // {ord.items?.length || 0} ITEM(S)
                    </span>
                    <span className="text-[11px] text-stone-500 font-medium">รายการสินค้าที่ลูกค้าสั่งทำในออเดอร์นี้</span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {ord.items?.map((it, idx) => {
                      const itemTitle = it.product_title || it.title || 'สินค้าแฮนด์เมด';
                      const itemImg = it.product_image || it.image_url;
                      const isSelectedForUpdate = selectedProductItem[ord.id] === itemTitle;

                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-2xl text-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border transition-all ${isSelectedForUpdate
                            ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-300'
                            : 'bg-stone-50 border-stone-200/80 hover:border-stone-300'
                            }`}
                        >
                          <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                            {itemImg ? (
                              <div
                                onClick={() => setPreviewImage(itemImg)}
                                className="relative w-16 h-16 rounded-xl overflow-hidden border border-stone-200 shrink-0 bg-white cursor-pointer group shadow-xs"
                              >
                                <img src={itemImg} alt={itemTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                  <Eye className="w-4 h-4" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-xl bg-stone-200 flex items-center justify-center text-stone-400 text-[10px] font-mono shrink-0">
                                NO PIC
                              </div>
                            )}

                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-display font-bold text-stone-900 text-sm sm:text-base">{itemTitle}</span>
                                {it.is_made_to_order ? (
                                  <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                    งานสั่งทำ (Made-to-Order)
                                  </span>
                                ) : (
                                  <span className="bg-stone-100 text-stone-600 border border-stone-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                    สินค้าสำเร็จรูป
                                  </span>
                                )}
                              </div>

                              <p className="text-stone-500 text-[11px]">
                                จำนวน: <strong className="font-bold text-stone-800">{it.quantity} ชิ้น</strong> • ราคาชิ้นละ ฿{Number(it.price).toLocaleString()}
                              </p>

                              {renderCustomizationDetails(it.customization_details || it.customization_notes)}
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-200">
                            <div className="text-right">
                              <span className="text-[10px] font-mono text-stone-400 uppercase block">SUBTOTAL</span>
                              <span className="font-mono font-extrabold text-stone-900 text-base">
                                ฿{(Number(it.price) * (Number(it.quantity) || 1)).toLocaleString()}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedProductItem(prev => ({
                                  ...prev,
                                  [ord.id]: prev[ord.id] === itemTitle ? 'all' : itemTitle
                                }));
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${isSelectedForUpdate
                                ? 'bg-emerald-800 text-white shadow-xs'
                                : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-300'
                                }`}
                            >
                              <Sparkles className="w-3.5 h-3.5 text-[#E76F51]" />
                              <span>{isSelectedForUpdate ? '✓ เลือกชิ้นนี้อยู่' : 'เลือกอัปเดตชิ้นนี้'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 🎨 Artisan Journal Control Panel */}
                <div className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white p-6 rounded-2xl shadow-lg space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#FFE6A7] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#E76F51]" />
                      <span>ARTISAN JOURNAL // บันทึกความคืบหน้าส่งตรงถึงลูกค้า</span>
                    </span>
                    <span className="text-[11px] text-emerald-200 font-mono">
                      {selectedProductItem[ord.id] && selectedProductItem[ord.id] !== 'all'
                        ? `🎯 กำลังอัปเดต: ${selectedProductItem[ord.id]}`
                        : '📦 อัปเดต: ทุกสินค้าในคำสั่งซื้อนี้'}
                    </span>
                  </div>

                  {isCompleted ? (
                    <div className="bg-white/10 p-4 rounded-xl text-center">
                      <p className="text-sm font-bold text-[#FFE6A7]">คำสั่งซื้อนี้เสร็จสมบูรณ์เรียบร้อยแล้ว</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {ord.items && ord.items.length > 1 && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-emerald-200 block font-bold flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-[#FFE6A7]" />
                            <span>เลือกชิ้นงานที่ต้องการอัปเดตสถานะ (Item Selector):</span>
                          </label>
                          <select
                            value={selectedProductItem[ord.id] || 'all'}
                            onChange={(e) => setSelectedProductItem({ ...selectedProductItem, [ord.id]: e.target.value })}
                            className="w-full text-xs p-2.5 bg-white text-stone-900 rounded-xl focus:outline-none font-bold"
                          >
                            <option value="all">📦 อัปเดตสินค้าทุกชิ้นในคำสั่งซื้อนี้ (All Items)</option>
                            {ord.items.map((it, itemIdx) => {
                              const title = it.product_title || it.title || `สินค้า #${itemIdx + 1}`;
                              return (
                                <option key={itemIdx} value={title}>
                                  🎨 เฉพาะชิ้นงาน: {title} (จำนวน {it.quantity} ชิ้น)
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-emerald-200 block font-bold">
                          1. หัวข้อสถานะ / กำลังทำอะไรอยู่ (พิมพ์เองได้อิสระ)
                        </label>
                        <input
                          type="text"
                          placeholder={
                            selectedProductItem[ord.id] && selectedProductItem[ord.id] !== 'all'
                              ? `เช่น [${selectedProductItem[ord.id]}] กำลังลงสีเคลือบเงา...`
                              : "เช่น กำลังตากดินให้แห้ง, ลงสีเคลือบเงารอบแรก, สลักชื่อไม้..."
                          }
                          value={customTitle[ord.id] || ''}
                          onChange={(e) => setCustomTitle({ ...customTitle, [ord.id]: e.target.value })}
                          className="w-full text-xs p-3 bg-white text-stone-900 rounded-xl focus:outline-none font-bold"
                        />

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="text-[10px] text-emerald-200/80 font-mono py-0.5">คีย์เวิร์ดด่วน:</span>
                          {QUICK_STATUS_TAGS.map((tag, tagIdx) => (
                            <button
                              key={tagIdx}
                              type="button"
                              onClick={() => setCustomTitle({ ...customTitle, [ord.id]: tag })}
                              className="text-[10px] bg-white/10 hover:bg-white/20 text-emerald-100 px-2.5 py-0.5 rounded-full border border-white/15 transition-all cursor-pointer"
                            >
                              + {tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-emerald-200 block font-bold">
                          2. ข้อความถึงลูกค้าเพิ่มเติม (ไม่บังคับ)
                        </label>
                        <input
                          type="text"
                          placeholder="เช่น วันนี้สภาพอากาศชื้นหน่อย อาจจะใช้เวลาเพิ่มขึ้นเล็กน้อย..."
                          value={customNote[ord.id] || ''}
                          onChange={(e) => setCustomNote({ ...customNote, [ord.id]: e.target.value })}
                          className="w-full text-xs p-3 bg-white text-stone-900 rounded-xl focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-emerald-200 block font-bold">
                          3. แนบรูปถ่ายความคืบหน้า (ไม่บังคับ)
                        </label>
                        <label className="w-full py-3 px-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer">
                          <Upload className="w-4 h-4 shrink-0" />
                          <span className="truncate">
                            {updateImageFile[ord.id] ? updateImageFile[ord.id].name : 'เลือกรูปถ่ายจากโต๊ะทำงาน'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => setUpdateImageFile({ ...updateImageFile, [ord.id]: e.target.files[0] })}
                          />
                        </label>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          disabled={updatingId === ord.id}
                          onClick={() => {
                            const titleText = customTitle[ord.id]?.trim() || 'อัปเดตความคืบหน้างานคราฟต์';
                            const noteText = customNote[ord.id]?.trim() || '';
                            handleSaveJournalUpdate(ord.id, titleText, noteText);
                          }}
                          className="w-full py-3.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xl bg-gradient-to-r from-[#E76F51] to-[#f4a261] hover:from-[#d95d3f] hover:to-[#e76f51] text-white flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Send className="w-4 h-4 shrink-0" />
                          <span>
                            {updatingId === ord.id ? 'กำลังบันทึกเรื่องราว...' : '✨ บันทึก ส่งเรื่องราว & เคลียร์คำร้องขอ'}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 📌 Timeline ประวัติความคืบหน้างานคราฟต์ */}
                {ord.timeline && ord.timeline.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-stone-400 font-bold block flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#1B4332]" />
                      <span>CRAFT PROGRESS TIMELINE // ประวัติความคืบหน้า ({ord.timeline.length} รายการ)</span>
                    </span>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {ord.timeline.map((log, logIdx) => (
                        <div key={logIdx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#2A9D8F] mt-1.5 shrink-0" />
                          <div className="flex-1 space-y-0.5">
                            <span className="font-bold text-stone-900 block">{log.status_title || log.step}</span>
                            {log.notes && <p className="text-stone-600 font-medium">{log.notes}</p>}
                            <span className="text-[10px] text-stone-400 font-mono block">
                              {new Date(log.created_at).toLocaleString('th-TH')}
                            </span>
                          </div>
                          {log.image_url && (
                            <div
                              onClick={() => setPreviewImage(log.image_url)}
                              className="relative w-12 h-12 rounded-lg overflow-hidden border border-stone-200 shrink-0 cursor-pointer shadow-2xs group"
                            >
                              <img src={log.image_url} alt="สเต็ปงาน" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal ขยายรูปสลิป */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-lg w-full bg-white rounded-3xl p-4 shadow-2xl space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-bold text-stone-800">ตรวจสอบสลิป / รูปภาพ</span>
              <button onClick={() => setPreviewImage(null)} className="text-stone-400 hover:text-stone-700">
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