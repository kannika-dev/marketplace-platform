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
  AlertTriangle
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

  // 1. อนุมัติรับคำสั่งซื้อ (ปลดล็อกปุ่มแนบสลิปงวดแรกให้ผู้ซื้อ)
  const handleApproveOrder = async (orderId) => {
    if (!window.confirm('คุณต้องการอนุมัติคำสั่งซื้อนี้ เพื่อเปิดให้ลูกค้าแนบสลิปชำระเงินใช่หรือไม่?')) return;

    setUpdatingId(orderId);
    try {
      const formData = new FormData();
      formData.append('craft_status', 'awaiting_deposit');
      formData.append('step_title', 'รับคำสั่งซื้อเรียบร้อยแล้ว');
      formData.append('note', 'ร้านค้าอนุมัติคำสั่งซื้อเรียบร้อยแล้ว กรุณาโอนเงินและแนบสลิปชำระเงินค่ะ');

      await api.patch(`/seller/orders/${orderId}/craft-status`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('✨ อนุมัติคำสั่งซื้อสำเร็จ! ปลดล็อกช่องแนบสลิปให้ผู้ซื้อเรียบร้อยแล้ว');
      fetchOrders();
    } catch (err) {
      console.error('Approve order error:', err);
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการอนุมัติคำสั่งซื้อ');
    } finally {
      setUpdatingId(null);
    }
  };

  // 2. ยืนยันสลิปถูกต้อง (งวดแรก)
  const handleApprovePayment = async (orderId) => {
    if (!window.confirm('คุณต้องการยืนยันว่าสลิปการชำระเงินถูกต้องใช่หรือไม่?')) return;

    setUpdatingId(orderId);
    try {
      const formData = new FormData();
      formData.append('craft_status', 'in_progress');
      formData.append('step_title', 'ตรวจสอบสลิปมัดจำเรียบร้อย');
      formData.append('note', 'ร้านค้าตรวจสอบสลิปโอนเงินถูกต้องเรียบร้อยแล้ว เริ่มดำเนินงานคราฟต์พิถีพิถัน');

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
      formData.append('step_title', '✨ ผลงานเสร็จเรียบร้อยแล้ว - รอชำระเงินครั้งที่ 2');
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

  // 4. ยืนยันสลิปรอบที่ 2 ถูกต้อง (จ่ายครบ 100% พร้อมส่งมอบ)
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

  // 6. บันทึกเรื่องราว Artisan Journal
  const handleSaveJournalUpdate = async (orderId, titleText, noteText) => {
    if (!titleText || titleText.trim() === '') {
      alert('กรุณาระบุหัวข้อหรือสถานะความคืบหน้า');
      return;
    }

    setUpdatingId(orderId);
    try {
      const imageFile = updateImageFile[orderId];

      const formData = new FormData();
      formData.append('craft_status', 'in_progress');
      formData.append('step_title', String(titleText));
      formData.append('note', String(noteText));

      if (imageFile) {
        formData.append('image', imageFile);
      }

      await api.patch(`/seller/orders/${orderId}/craft-status`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert(`✨ บันทึกเรื่องราว "${titleText}" เรียบร้อยแล้ว!`);

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
            จัดการคำสั่งซื้อ <span className="font-serif italic text-[#1B4332] font-normal">&amp; บันทึกเรื่องราวงานคราฟต์</span>
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
            <option value="order_placed">รออนุมัติคำสั่งซื้อ</option>
            <option value="awaiting_deposit">รอชำระมัดจำ</option>
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

            const isPendingApproval = currentCraftStatus === 'order_placed' || ord.status === 'pending' || ord.status === 'pending_approval';
            const hasUploadedSlip = Boolean(ord.payment_slip_url);

            const isAwaitingFinalPayment = currentCraftStatus === 'awaiting_final_payment';
            const isFinalPaymentVerification = currentCraftStatus === 'final_payment_verification';
            const isCompleted = currentCraftStatus === 'completed';

            const depositAmt = Number(ord.deposit_amount || Math.round(ord.total_amount * 0.5));
            const remainingAmt = Number(ord.remaining_balance || (ord.total_amount - depositAmt));

            return (
              <div
                key={ord.id}
                className="bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl border border-stone-200/80 hover:border-[#1B4332]/30 transition-all"
              >
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

                {/* แผงควบคุมการอนุมัติและสลิป */}
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
                        {hasUploadedSlip ? 'มีสลิป' : 'รอสลิป'}
                      </div>
                    )}
                    <div>
                      <span className="font-bold text-xs text-stone-900 block">หลักฐานการโอนเงิน &amp; ปุ่มดำเนินการ</span>
                      <span className="text-[11px] text-stone-500">
                        {isPendingApproval
                          ? 'คำสั่งซื้อใหม่ รอคุณกดอนุมัติเพื่อเปิดรับชำระเงิน'
                          : isFinalPaymentVerification
                            ? '🎉 ลูกค้าแนบสลิปงวดสุดท้ายแล้ว กรุณาตรวจสอบ'
                            : hasUploadedSlip
                              ? 'ลูกค้าแนบสลิปแล้ว กรุณาตรวจสอบยอดเงิน'
                              : 'รอผู้ซื้อโอนเงินและแนบสลิป'}
                      </span>
                    </div>
                  </div>

                  {/* 🔘 ปุ่มควบคุมฝั่งผู้ขาย */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {/* 1. ปุ่มอนุมัติรับคำสั่งซื้อ */}
                    {isPendingApproval && (
                      <button
                        type="button"
                        disabled={updatingId === ord.id}
                        onClick={() => handleApproveOrder(ord.id)}
                        className="px-4 py-2.5 bg-[#2A9D8F] hover:bg-[#21867a] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>✅ อนุมัติรับคำสั่งซื้อ</span>
                      </button>
                    )}

                    {/* 2. ปุ่มตรวจสลิปงวดแรก */}
                    {hasUploadedSlip && currentCraftStatus === 'awaiting_deposit' && (
                      <>
                        <button
                          type="button"
                          disabled={updatingId === ord.id}
                          onClick={() => handleApprovePayment(ord.id)}
                          className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                        >
                          ✅ ยืนยันสลิปมัดจำถูกต้อง
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

                    {/* 3. ปุ่มกดเรียกเก็บเงินงวดที่ 2 (สำหรับงานมัดจำที่ทำเสร็จแล้ว) */}
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

                    {/* 4. ปุ่มตรวจสลิปงวดที่ 2 (งวดสุดท้าย) */}
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

                {/* รายการสินค้า */}
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
                        <span className="font-display font-bold text-stone-900 text-sm sm:text-base">
                          {it.product_title || it.title} × {it.quantity}
                        </span>
                        {renderCustomizationDetails(it.customization_details || it.customization_notes)}
                      </div>
                      <span className="font-mono font-extrabold text-stone-900 text-base shrink-0">
                        ฿{Number(it.price).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* 🎨 Artisan Journal Control Panel */}
                <div className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white p-6 rounded-2xl shadow-lg space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#FFE6A7] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#E76F51]" />
                      <span>ARTISAN JOURNAL // บันทึกความคืบหน้าส่งตรงถึงลูกค้า</span>
                    </span>
                  </div>

                  {isCompleted ? (
                    <div className="bg-white/10 p-4 rounded-xl text-center">
                      <p className="text-sm font-bold text-[#FFE6A7]">คำสั่งซื้อนี้เสร็จสมบูรณ์เรียบร้อยแล้ว</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* 1. หัวข้อสถานะ/กำลังทำอะไรอยู่ */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-emerald-200 block font-bold">
                          1. หัวข้อสถานะ / กำลังทำอะไรอยู่ (พิมพ์เองได้อิสระ)
                        </label>
                        <input
                          type="text"
                          placeholder="เช่น กำลังตากดินให้แห้ง, ลงสีเคลือบเงารอบแรก, สลักชื่อไม้..."
                          value={customTitle[ord.id] || ''}
                          onChange={(e) => setCustomTitle({ ...customTitle, [ord.id]: e.target.value })}
                          className="w-full text-xs p-3 bg-white text-stone-900 rounded-xl focus:outline-none font-bold"
                        />

                        {/* Quick Tags กดเลือกคำไวๆ */}
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

                      {/* 2. ข้อความถึงลูกค้าเพิ่มเติม */}
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

                      {/* 3. แนบรูปถ่ายจากโต๊ะทำงานจริง */}
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
                            {updatingId === ord.id
                              ? 'กำลังบันทึกเรื่องราว...'
                              : '✨ บันทึกและส่งเรื่องราวความคืบหน้าถึงลูกค้า'}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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