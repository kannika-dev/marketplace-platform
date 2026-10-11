import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, Upload, CheckCircle2, Clock, Truck, AlertCircle } from 'lucide-react';
import axios from 'axios';

export const CartOrdersTab = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE = 'https://marketplace-platform-xh1q.onrender.com/api';

    // ฟังก์ชันดึงรายการคำสั่งซื้อจาก Backend บน Render
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const craft_token = localStorage.getItem('craft_token') || sessionStorage.getItem('craft_token');

            const response = await axios.get(`${API_BASE}/orders/my-orders`, {
                headers: { Authorization: `Bearer ${craft_token}` }
            });

            if (response.data.success) {
                setOrders(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้ในขณะนี้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // ฟังก์ชันอัปโหลดสลิปจริงไปยัง Backend
    const handleUploadSlip = async (orderId, event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const craft_token = localStorage.getItem('craft_token') || sessionStorage.getItem('craft_token');
            const formData = new FormData();
            formData.append('slip', file);

            const response = await axios.post(`${API_BASE}/orders/${orderId}/upload-slip`, formData, {
                headers: {
                    Authorization: `Bearer ${craft_token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                alert('✨ อัปโหลดสลิปสำเร็จ! รอแอดมินตรวจสอบการชำระเงินสักครู่นะคะ');
                fetchOrders(); // รีเฟรชข้อมูลคำสั่งซื้อใหม่
            }
        } catch (err) {
            console.error('Error uploading slip:', err);
            alert('อัปโหลดสลิปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
        }
    };

    return (
        <div className="space-y-6">
            <div className="border-b border-stone-100 pb-4">
                <h2 className="text-xl font-display font-extrabold text-stone-900 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-[#2A9D8F]" />
                    ตะกร้าและคำสั่งซื้อของฉัน (Cart & Orders)
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                    ตรวจสอบรายการคำสั่งซื้อแฮนด์เมด สถานะการตรวจสอบจากร้านค้า และช่องทางการชำระเงิน
                </p>
            </div>

            {loading ? (
                <div className="text-center py-16 text-stone-400 text-xs">กำลังโหลดข้อมูลคำสั่งซื้อ...</div>
            ) : orders.length === 0 ? (
                <div className="text-center py-16 text-stone-400 space-y-3">
                    <Package className="w-12 h-12 mx-auto stroke-1" />
                    <p className="text-xs">ยังไม่มีรายการคำสั่งซื้อในระบบ</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="clay-card p-6 rounded-3xl border border-stone-100 bg-white shadow-sm space-y-4">

                            {/* Header ของแต่ละ Order */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100 text-xs">
                                <div>
                                    <span className="font-extrabold text-stone-900 text-sm">คำสั่งซื้อ #{order.id}</span>
                                    <span className="text-stone-400 ml-2">({new Date(order.created_at).toLocaleString('th-TH')})</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* แสดงสถานะ Order */}
                                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${order.status === 'shop_approved' || order.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            order.status === 'shop_revising' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                'bg-amber-50 text-amber-700 border-amber-200'
                                        }`}>
                                        {order.status === 'shop_approved' ? '🟢 ร้านค้าอนุมัติแล้ว' :
                                            order.status === 'shop_revising' ? '🔴 ร้านค้าขอให้แก้ไขข้อมูล' :
                                                order.status === 'unpaid' ? '⏳ รอชำระเงิน' :
                                                    order.status === 'pending_verification' ? '🔍 รอตรวจสอบสลิป' : order.status}
                                    </span>

                                    {/* ป้ายวิธีชำระเงิน */}
                                    <span className="px-3 py-1 rounded-full text-[11px] font-bold border bg-stone-50 text-stone-700 border-stone-200">
                                        {order.payment_method === 'cod' ? '📦 เก็บเงินปลายทาง (COD)' : '💳 โอนเงินผ่านธนาคาร'}
                                    </span>
                                </div>
                            </div>

                            {/* รายการสินค้าปลีกย่อยใน Order */}
                            <div className="space-y-3">
                                <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">รายการสินค้าแฮนด์เมดในบิลนี้</h4>
                                {order.items && order.items.map((item) => (
                                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-stone-50/70 border border-stone-100 text-xs">
                                        <div>
                                            <p className="font-bold text-stone-800">{item.title || item.product_name}</p>
                                            {item.customization_notes && item.customization_notes !== '-' && (
                                                <p className="text-[11px] text-[#2A9D8F] mt-0.5">✨ หมายเหตุสั่งทำ: {item.customization_notes}</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <span className="font-mono font-bold text-stone-900">฿{Number(item.price).toLocaleString()}</span>
                                            <span className="text-stone-400 text-[11px] ml-2">x{item.quantity}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ที่อยู่จัดส่งและยอดรวม */}
                            <div className="pt-2 border-t border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                                <div className="text-stone-500 max-w-md">
                                    <span className="font-bold text-stone-700">ที่อยู่จัดส่ง: </span>
                                    <span>{order.shipping_address}</span>
                                </div>

                                <div className="text-right">
                                    <span className="text-stone-400">ยอดรวมสุทธิ: </span>
                                    <span className="text-lg font-display font-extrabold text-[#2A9D8F] ml-1">
                                        ฿{Number(order.total_amount).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* โซนอัปโหลดสลิป (เฉพาะกรณีโอนเงินและยังไม่จ่าย) */}
                            {order.status === 'unpaid' && (
                                <div className="pt-4 border-t border-dashed border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-50/40 p-4 rounded-2xl">
                                    <div className="text-xs text-stone-600">
                                        <p className="font-bold text-stone-800">📌 กรุณาโอนเงินและแนบสลิปการชำระเงิน</p>
                                        <p className="text-[11px] text-stone-500 mt-0.5">ธนาคารกสิกรไทย 123-4-56789-0 (Craftiverse Official)</p>
                                    </div>

                                    <label className="btn-3d-botanical px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-2 cursor-pointer">
                                        <Upload className="w-3.5 h-3.5" />
                                        <span>อัปโหลดสลิปโอนเงิน</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleUploadSlip(order.id, e)}
                                        />
                                    </label>
                                </div>
                            )}

                            {/* แสดงสลิปที่แนบแล้ว */}
                            {order.payment_slip_url && (
                                <div className="pt-2 flex items-center gap-3 text-xs text-stone-500">
                                    <CheckCircle2 className="w-4 h-4 text-[#2A9D8F]" />
                                    <span>แนบสลิปเรียบร้อยแล้ว (รอผู้ขาย/แอดมินตรวจสอบความถูกต้อง)</span>
                                </div>
                            )}

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CartOrdersTab;