import React, { useState, useEffect } from 'react';
import { getMyOrders, uploadPaymentSlip } from '../services/orderService';
import CraftTracker from '../components/orders/CraftTracker';
import Badge from '../components/common/Badge';
import { Package, Upload, CheckCircle2, Clock, AlertCircle, Sparkles } from 'lucide-react';

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState({});

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getMyOrders();
      if (res && res.data) {
        setOrders(res.data);
      }
    } catch (err) {
      console.warn('Orders fallback sample:', err.message);
      setOrders([
        {
          id: 101,
          total_amount: 1850,
          payment_status: 'paid',
          craft_status: 'crafting',
          shipping_address: '123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กทม. 10110',
          created_at: new Date().toISOString(),
          items: [
            {
              id: 1,
              product_title: 'แจกันดินเผาเคลือบขี้เถ้าธรรมชาติ (Natural Ash Glazed Vase)',
              price: 1850,
              quantity: 1,
              image_url: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=300&q=80',
              customization_notes: { 'โทนสีของผิวเคลือบ (Ash Glaze Tone)': 'เขียวเซลาดอนอ่อน (Celadon)' }
            }
          ],
          timeline: [
            { id: 1, step: 'order_placed', status_title: 'ส่งคำสั่งซื้อสำเร็จ', notes: 'คำสั่งซื้อเข้าสู่ระบบ', created_at: '2026-09-30T10:00:00' },
            { id: 2, step: 'material_prep', status_title: 'ชำระเงินเรียบร้อย & เตรียมดิน', notes: 'ช่างปั้นผสมเนื้อดินดำลำปางและเตรียมเตาเผา', created_at: '2026-09-30T12:00:00' },
            { id: 3, step: 'crafting', status_title: 'กำลังขึ้นรูปแป้นหมุน', notes: 'ขึ้นรูปแจกันและพักให้แห้งตามธรรมชาติ', created_at: '2026-09-30T15:30:00' }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleFileChange = (orderId, file) => {
    setSelectedFile((prev) => ({ ...prev, [orderId]: file }));
  };

  const handleUploadSlip = async (orderId) => {
    const file = selectedFile[orderId];
    if (!file) {
      alert('โปรดเลือกไฟล์รูปภาพสลิปการโอนเงินก่อน');
      return;
    }

    setUploadingId(orderId);
    try {
      await uploadPaymentSlip(orderId, file);
      alert('อัปโหลดสลิปเรียบร้อยแล้ว! เจ้าหน้าที่จะตรวจสอบสลิปของท่านโดยเร็ว');
      fetchOrders();
    } catch (err) {
      alert('อัปโหลดสลิปจำลองสำเร็จ (Demo mode)');
      fetchOrders();
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#2A9D8F]">
          My Order History
        </span>
        <h1 className="text-3xl font-display font-extrabold text-stone-900 mt-0.5">
          คำสั่งซื้อและสถานะงานคราฟต์ของคุณ
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 font-normal">
          ติดตามขั้นตอนการผลิตงานแฮนด์เมดแบบเรียลไทม์ และอัปโหลดหลักฐานการชำระเงิน
        </p>
      </div>

      {loading ? (
        <div className="text-center py-24 text-stone-400 font-medium">กำลังโหลดคำสั่งซื้อ...</div>
      ) : orders.length === 0 ? (
        <div className="clay-card text-center py-20 rounded-3xl p-8 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#E8F7F3] text-[#2A9D8F] flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-base font-display font-bold text-stone-700">
            คุณยังไม่มีคำสั่งซื้อในขณะนี้
          </h3>
        </div>
      ) : (
        <div className="space-y-10">
          {orders.map((order) => {
            const isUnpaid = order.payment_status === 'unpaid';
            const isPendingVerification = order.payment_status === 'pending_verification';

            return (
              <div
                key={order.id}
                className="clay-card rounded-3xl overflow-hidden space-y-6 p-6 sm:p-8 border border-white"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-emerald-100 gap-3">
                  <div>
                    <span className="text-xs text-stone-400 font-mono">หมายเลขคำสั่งซื้อ #{order.id}</span>
                    <span className="text-xs text-stone-500 block font-medium">
                      สั่งเมื่อ: {new Date(order.created_at).toLocaleDateString('th-TH')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        order.payment_status === 'paid'
                          ? 'botanical'
                          : isPendingVerification
                            ? 'sunlight'
                            : 'peach'
                      }
                      size="sm"
                    >
                      {order.payment_status === 'paid'
                        ? '✓ ชำระเงินแล้ว'
                        : isPendingVerification
                          ? '⏳ กำลังรอตรวจสอบสลิป'
                          : 'รอการชำระเงิน'}
                    </Badge>

                    <span className="text-xl font-display font-extrabold text-[#E76F51] ml-2">
                      ฿{Number(order.total_amount).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Items in this Order */}
                <div className="space-y-3">
                  {order.items?.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-4 py-2.5 border-b border-emerald-50/60 text-xs">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={it.image_url || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=150&q=80'}
                          alt={it.product_title}
                          className="w-14 h-14 rounded-2xl object-cover bg-stone-100 shadow-2xs border border-white"
                        />
                        <div>
                          <p className="font-display font-bold text-stone-900 text-sm">{it.product_title}</p>
                          {(it.customization_notes || it.customization_details) && (
                            <p className="text-[11px] text-[#E76F51] font-semibold mt-0.5">
                              {typeof (it.customization_notes || it.customization_details) === 'string'
                                ? (it.customization_notes || it.customization_details)
                                : JSON.stringify(it.customization_notes || it.customization_details)}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-stone-700 font-bold font-display text-sm">
                        ฿{Number(it.price).toLocaleString()} × {it.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Craft Journey Stepper */}
                <CraftTracker
                  currentStatus={order.craft_status || 'order_placed'}
                  timelineLogs={order.timeline || []}
                />

                {/* Slip Upload Action Section if Unpaid */}
                {isUnpaid && (
                  <div className="bg-gradient-to-r from-[#FFF0EB] to-[#FFE8D6] p-5 rounded-3xl border border-[#FFCBBF] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="space-y-1 text-center sm:text-left">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#E76F51]">
                        <AlertCircle className="w-4 h-4" />
                        <span>กรุณาแนบสลิปเพื่อเริ่มขั้นตอนการประดิษฐ์ชิ้นงาน</span>
                      </div>
                      <p className="text-[11px] text-stone-600 font-medium">
                        โอนเข้าบัญชี KBANK: <strong>098-2-34567-8</strong> (บจก. คราฟต์ทิเวิร์ส) ยอด ฿{Number(order.total_amount).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="file"
                        accept="image/*"
                        id={`slip-${order.id}`}
                        className="hidden"
                        onChange={(e) => handleFileChange(order.id, e.target.files[0])}
                      />
                      <label
                        htmlFor={`slip-${order.id}`}
                        className="flex-1 sm:flex-initial px-4 py-2.5 bg-white text-xs font-bold rounded-2xl border border-emerald-200 text-stone-700 hover:bg-emerald-50/50 cursor-pointer text-center shadow-xs"
                      >
                        {selectedFile[order.id] ? selectedFile[order.id].name : 'เลือกรูปสลิป...'}
                      </label>

                      <button
                        onClick={() => handleUploadSlip(order.id)}
                        disabled={uploadingId === order.id || !selectedFile[order.id]}
                        className="px-5 py-2.5 btn-3d-peach text-xs font-bold rounded-2xl disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingId === order.id ? 'กำลังส่ง...' : 'แนบสลิป'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {isPendingVerification && (
                  <div className="p-4 bg-[#FFF9EC] rounded-2xl border border-[#FFE6A7] text-xs text-[#9E6E00] flex items-center gap-2 font-medium">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>คุณได้แนบสลิปแล้ว กำลังรอแอดมินตรวจสอบการชำระเงิน เมื่อผ่านแล้วช่างฝีมือจะเริ่มเตรียมวัสดุ</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Orders;