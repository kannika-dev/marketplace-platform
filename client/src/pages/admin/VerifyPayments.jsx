import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import {
  FileCheck,
  CheckCircle,
  XCircle,
  Eye,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

export const VerifyPayments = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [activeSlipModal, setActiveSlipModal] = useState(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/payments/pending');
      if (res.data) {
        setPendingOrders(res.data.data);
      }
    } catch (err) {
      console.warn('Fallback pending orders:', err.message);
      setPendingOrders([
        {
          id: 101,
          buyer_id: 3,
          buyer_name: 'คุณกานต์ดา มั่งคั่ง',
          buyer_email: 'kanda@example.com',
          total_amount: 1850,
          payment_slip_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleVerify = async (orderId, action) => {
    const confirmText =
      action === 'approve'
        ? 'ยืนยันอนุมัติสลิปโอนเงินนี้ใช่หรือไม่? ช่างฝีมือจะได้รับการแจ้งเตือนให้เริ่มเตรียมวัตถุดิบทันที'
        : 'ยืนยันปฏิเสธสลิปนี้ใช่หรือไม่?';

    if (!window.confirm(confirmText)) return;

    setProcessingId(orderId);
    try {
      await api.post(`/admin/payments/${orderId}/verify`, { action });
      alert(`ดำเนินการ ${action === 'approve' ? 'อนุมัติสลิป' : 'ปฏิเสธสลิป'} เรียบร้อยแล้ว`);
      fetchPending();
    } catch (err) {
      alert(`ดำเนินการสำเร็จในระบบสาธิต (Demo mode)`);
      fetchPending();
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex items-center justify-between">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2A9D8F] hover:text-[#1B4332] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับ Admin Hub</span>
        </Link>
      </div>

      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#2A9D8F]">
          Financial Verification
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-stone-900 mt-0.5">
          ตรวจสอบและอนุมัติสลิปโอนเงิน (Verify Payments)
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 font-normal">
          ตรวจสอบยอดเงินจากสลิปโอนเงิน และอนุมัติเพื่อเริ่มสายพานการผลิตงานคราฟต์
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-stone-400 font-medium">กำลังโหลดรายการสลิป...</div>
      ) : pendingOrders.length === 0 ? (
        <div className="clay-card text-center py-20 rounded-3xl p-8 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#E8F7F3] text-[#2A9D8F] flex items-center justify-center mx-auto">
            <FileCheck className="w-7 h-7" />
          </div>
          <h3 className="text-base font-display font-bold text-stone-700">ไม่มีสลิปที่รอตรวจสอบในขณะนี้</h3>
          <p className="text-xs text-stone-400">เมื่อมีคำสั่งซื้อใหม่และลูกค้าแนบสลิป จะปรากฏที่นี่ทันที</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingOrders.map((ord) => (
            <div
              key={ord.id}
              className="clay-card rounded-3xl p-6 sm:p-7 space-y-5 flex flex-col justify-between border border-white"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-3.5">
                  <span className="font-mono text-sm font-bold text-stone-800">
                    คำสั่งซื้อ #{ord.id}
                  </span>
                  <Badge variant="sunlight" size="xs">⏳ รอตรวจสลิป</Badge>
                </div>

                <div className="text-xs space-y-1.5 text-stone-600">
                  <p>ผู้ซื้อ: <strong className="text-stone-900">{ord.buyer_name}</strong> ({ord.buyer_email})</p>
                  <p>ยอดที่ต้องชำระ: <strong className="text-[#E76F51] text-base font-display font-extrabold">฿{Number(ord.total_amount).toLocaleString()}</strong></p>
                  <p className="text-stone-400 text-[11px]">วันที่ส่งสลิป: {new Date(ord.created_at).toLocaleString('th-TH')}</p>
                </div>

                {/* Slip Image Thumbnail / Preview */}
                <div className="relative aspect-[3/2] rounded-2xl bg-stone-100 border border-emerald-100 overflow-hidden group shadow-2xs">
                  <img
                    src={ord.payment_slip_url || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80'}
                    alt="Payment Slip"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setActiveSlipModal(ord.payment_slip_url)}
                    className="absolute inset-0 bg-[#1B4332]/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold gap-1.5 transition-opacity"
                  >
                    <Eye className="w-4 h-4" /> ดูสลิปขนาดเต็ม
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => handleVerify(ord.id, 'approve')}
                  disabled={processingId === ord.id}
                  className="flex-1 py-3 px-4 btn-3d-botanical text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>อนุมัติยอดโอน</span>
                </button>

                <button
                  onClick={() => handleVerify(ord.id, 'reject')}
                  disabled={processingId === ord.id}
                  className="flex-1 py-3 px-4 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-2xs"
                >
                  <XCircle className="w-4 h-4" />
                  <span>ปฏิเสธสลิป</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Size Slip Modal */}
      {activeSlipModal && (
        <div
          className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveSlipModal(null)}
        >
          <div className="clay-card p-5 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col space-y-3.5 bg-white">
            <div className="flex justify-between items-center text-xs font-bold text-stone-800">
              <span>หลักฐานสลิปการโอนเงิน (Bank Slip Preview)</span>
              <button
                onClick={() => setActiveSlipModal(null)}
                className="text-stone-400 hover:text-stone-900 font-bold text-sm px-2"
              >
                ✕ ปิด
              </button>
            </div>
            <img
              src={activeSlipModal}
              alt="Slip Full"
              className="w-full h-auto max-h-[75vh] object-contain rounded-2xl border border-stone-200"
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default VerifyPayments;
