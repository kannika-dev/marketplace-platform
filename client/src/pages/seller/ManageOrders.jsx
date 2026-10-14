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
  Image as ImageIcon,
  CheckCircle,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_ORDER = [
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

  const getNextStageInfo = (currentCraftStatus) => {
    const statusStr = String(currentCraftStatus || 'order_placed').trim().toLowerCase();
    const currentIndex = STATUS_ORDER.findIndex(s => s.value.toLowerCase() === statusStr);

    if (currentIndex !== -1 && currentIndex < STATUS_ORDER.length - 1) {
      return STATUS_ORDER[currentIndex + 1];
    }
    if (statusStr === 'completed') {
      return STATUS_ORDER[STATUS_ORDER.length - 1];
    }
    return STATUS_ORDER[2];
  };

  const handleAdvanceNextStage = async (orderId, targetNextStage) => {
    const stageToSend = targetNextStage || STATUS_ORDER[2];

    if (!stageToSend || !stageToSend.value) {
      alert('กรุณาระบุขั้นตอนงานคราฟต์ให้ถูกต้อง');
      return;
    }

    setUpdatingId(orderId);
    try {
      const note = customNote[orderId] || '';
      const imageFile = updateImageFile[orderId];

      const formData = new FormData();
      formData.append('craft_status', String(stageToSend.value));
      formData.append('step_title', String(stageToSend.label));
      formData.append('note', String(note));

      // แนบไฟล์รูปภาพไปพร้อมกับ FormData
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await api.patch(`/seller/orders/${orderId}/craft-status`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert(`✨ อัปเดตไปยังขั้นตอน "${stageToSend.label}" เรียบร้อยแล้ว!`);
      setUpdateImageFile({ ...updateImageFile, [orderId]: null });
      setCustomNote({ ...customNote, [orderId]: '' });
      fetchOrders();
    } catch (err) {
      console.error('Advance stage error:', err);
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleApproveOrder = async (orderId) => {
    if (!window.confirm('คุณต้องการอนุมัติคำสั่งซื้อนี้ เพื่อเปิดให้ลูกค้าแนบสลิปชำระเงินใช่หรือไม่?')) return;

    setUpdatingId(orderId);
    try {
      const formData = new FormData();
      formData.append('craft_status', 'order_placed');
      formData.append('step_title', '01 // รับคำสั่งซื้อ/รอชำระเงิน (Order Placed)');
      formData.append('note', 'ร้านค้าอนุมัติคำสั่งซื้อเรียบร้อยแล้ว กรุณาโอนเงินและแนบสลิปชำระเงิน');

      await api.patch(`/seller/orders/${orderId}/craft-status`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('✨ อนุมัติคำสั่งซื้อสำเร็จ!');
      fetchOrders();
    } catch (err) {
      console.error('Approve order error:', err);
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการอนุมัติคำสั่งซื้อ');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleApprovePayment = async (orderId) => {
    if (!window.confirm('คุณต้องการยืนยันว่าสลิปการชำระเงินถูกต้องใช่หรือไม่?')) return;

    setUpdatingId(orderId);
    try {
      const formData = new FormData();
      formData.append('craft_status', 'material_prep');
      formData.append('step_title', '02 // จัดเตรียมวัตถุดิบ (Material Prep)');
      formData.append('note', 'ร้านค้าตรวจสอบสลิปโอนเงินถูกต้องเรียบร้อยแล้ว เริ่มจัดเตรียมวัตถุดิบ');

      await api.patch(`/seller/orders/${orderId}/craft-status`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('✨ ยืนยันสลิปถูกต้องแล้ว!');
      fetchOrders();
    } catch (err) {
      console.error('Approve payment error:', err);
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการอนุมัติสลิป');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRejectSlip = async (orderId) => {
    const reason = prompt('กรุณาระบุเหตุผลที่สลิปไม่ถูกต้อง:');
    if (!reason) return;

    setUpdatingId(orderId);
    try {
      const formData = new FormData();
      formData.append('craft_status', 'order_placed');
      formData.append('step_title', '01 // สลิปไม่ถูกต้อง (Invalid Slip)');
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
            <span>CRAFTING JOURNEY MANAGEMENT</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-stone-900 tracking-tight leading-tight">
            จัดการคำสั่งซื้อ <span className="font-serif italic text-[#1B4332] font-normal">&amp; สเต็ปงานคราฟต์</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
          <SlidersHorizontal className="w-4 h-4 text-[#1B4332] ml-2" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs font-mono font-bold py-2 px-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-[#1B4332] text-stone-800"
          >
            <option value="all">ALL STAGES ({orders.length})</option>
            {STATUS_ORDER.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
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
          <p className="text-sm font-display font-bold text-stone-700">ไม่พบรายการคำสั่งซื้อในหมวดหมู่นี้</p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredOrders.map((ord) => {
            const isPendingApproval = ord.status === 'pending_approval' || !ord.status || ord.craft_status === 'pending_approval';
            const isPaymentVerified = ord.payment_status === 'paid' || ord.status === 'paid' || ord.status === 'completed' || (ord.craft_status && ord.craft_status !== 'order_placed' && ord.craft_status !== 'pending_approval');
            const isSlipRejected = ord.payment_status === 'rejected';

            const currentCraftStatus = ord.craft_status || 'order_placed';
            const nextStage = getNextStageInfo(currentCraftStatus);
            const isCompleted = currentCraftStatus === 'completed';

            return (
              <div
                key={ord.id}
                className="bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl border border-stone-200/80 hover:border-[#1B4332]/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-sm font-extrabold text-[#1B4332] bg-[#FFE6A7]/40 px-3 py-1 rounded-full border border-[#FFE6A7]">
                        ORDER #{ord.id}
                      </span>
                      <span className="text-[10px] font-mono tracking-wider uppercase px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold border border-emerald-200">
                        🛠️ STAGE: {currentCraftStatus}
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
                  </div>
                </div>

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
                    <span className="font-bold text-xs text-stone-900">หลักฐานการโอนเงิน &amp; การจัดการออเดอร์</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {isPendingApproval && (
                      <button
                        type="button"
                        disabled={updatingId === ord.id}
                        onClick={() => handleApproveOrder(ord.id)}
                        className="px-4 py-2.5 bg-[#2A9D8F] hover:bg-[#21867a] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                      >
                        ✅ อนุมัติรับคำสั่งซื้อ
                      </button>
                    )}

                    {!isPendingApproval && ord.payment_slip_url && !isPaymentVerified && (
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
                  </div>
                </div>

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

                <div className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white p-6 rounded-2xl shadow-lg space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#FFE6A7] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#E76F51]" />
                      <span>CRAFTING JOURNEY STAGE CONTROL</span>
                    </span>
                    <span className="text-xs text-stone-200 font-mono">
                      CURRENT STAGE: <strong className="text-[#FFE6A7] uppercase font-bold">{currentCraftStatus}</strong>
                    </span>
                  </div>

                  {isCompleted ? (
                    <div className="bg-white/10 p-4 rounded-xl text-center space-y-1">
                      <p className="text-sm font-bold text-[#FFE6A7]">คำสั่งซื้อนี้เสร็จสมบูรณ์เรียบร้อยแล้ว</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-8 space-y-1.5">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-emerald-200 block font-bold">
                            JOURNAL NOTE // ข้อความถึงลูกค้า (ไม่บังคับ)
                          </label>
                          <input
                            type="text"
                            placeholder="เช่น กำลังตากชิ้นงานให้แห้งสนิท..."
                            value={customNote[ord.id] || ''}
                            onChange={(e) => setCustomNote({ ...customNote, [ord.id]: e.target.value })}
                            className="w-full text-xs p-3 bg-white text-stone-900 rounded-xl focus:outline-none"
                          />
                        </div>

                        <div className="md:col-span-4 space-y-1.5">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-emerald-200 block font-bold">
                            ATTACH PHOTO // แนบรูปงาน (ไม่บังคับ)
                          </label>
                          <label className="w-full py-3 px-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer truncate">
                            <Upload className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">
                              {updateImageFile[ord.id] ? updateImageFile[ord.id].name : 'เลือกรูปภาพความคืบหน้า'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => setUpdateImageFile({ ...updateImageFile, [ord.id]: e.target.files[0] })}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          disabled={updatingId === ord.id}
                          onClick={() => handleAdvanceNextStage(ord.id, nextStage)}
                          className="w-full py-3.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xl bg-gradient-to-r from-[#E76F51] to-[#f4a261] text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Send className="w-4 h-4 shrink-0" />
                          <span>
                            {updatingId === ord.id
                              ? 'กำลังบันทึกสเต็ปถัดไป...'
                              : `ดำเนินการขั้นตอนถัดไป ➔ [ ${nextStage.label} ]`}
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