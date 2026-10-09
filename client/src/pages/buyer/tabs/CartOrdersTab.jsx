import React, { useState } from 'react';
import { ShoppingCart, Package, Upload, CheckCircle2, Clock, Truck, AlertCircle, ArrowRight } from 'lucide-react';

export const CartOrdersTab = () => {
    // จำลองรายการคำสั่งซื้อที่ดึงมาจากตาราง orders, order_items และรองรับสถานะแฮนด์เมด
    const [orders, setOrders] = useState([
        {
            id: 1,
            total_amount: 890.00,
            payment_method: 'transfer', // 'transfer' หรือ 'cod'
            payment_status: 'unpaid', // unpaid, pending_verification, paid, pending_cod
            status: 'shop_approved', // pending_shop_review, shop_revising, shop_approved, crafting, shipping, delivered
            payment_slip_url: '',
            shipping_address: '123/45 หมู่บ้านคราฟต์วิลล์ ซอย 3 คลองเตย กรุงเทพมหานคร 10110',
            created_at: '2026-10-09 14:30',
            items: [
                { id: 101, product_name: 'เทียนหอมอโรมากลิ่นลาเวนเดอร์ (ไส้ไม้)', quantity: 2, price: 350.00, customization_notes: 'ขอป้ายชื่อข้อความ "Happy Birthday"' },
                { id: 102, product_name: 'สเปรย์ยูคาลิปตัสปรับอากาศ', quantity: 1, price: 190.00, customization_notes: '-' }
            ]
        },
        {
            id: 2,
            total_amount: 450.00,
            payment_method: 'cod',
            payment_status: 'pending_cod',
            status: 'pending_shop_review', // รอร้านค้าต้นสังกัดตรวจสอบคิวงานแฮนด์เมด
            payment_slip_url: null,
            shipping_address: '123/45 หมู่บ้านคราฟต์วิลล์ ซอย 3 คลองเตย กรุงเทพมหานคร 10110',
            created_at: '2026-10-09 16:00',
            items: [
                { id: 103, product_name: 'เทียนหอมดอกอัญชัน', quantity: 1, price: 450.00, customization_notes: 'กลิ่นธรรมชาติ ทำมือพิเศษ' }
            ]
        }
    ]);

    // ฟังก์ชันจำลองการอัปโหลดสลิป
    const handleUploadSlip = (orderId) => {
        setOrders(prev => prev.map(ord => {
            if (ord.id === orderId) {
                return {
                    ...ord,
                    payment_slip_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
                    payment_status: 'pending_verification'
                };
            }
            return ord;
        }));
        alert('✨ อัปโหลดสลิปสำเร็จ! รอแอดมินตรวจสอบการชำระเงินสักครู่นะคะ');
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

            {orders.length === 0 ? (
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
                                    <span className="text-stone-400 ml-2">({order.created_at})</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* แสดงสถานะการตรวจสอบของร้านค้า (Pre-Checkout Status) */}
                                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${order.status === 'shop_approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            order.status === 'shop_revising' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                'bg-amber-50 text-amber-700 border-amber-200'
                                        }`}>
                                        {order.status === 'shop_approved' ? '🟢 ร้านค้าอนุมัติแล้ว' :
                                            order.status === 'shop_revising' ? '🔴 ร้านค้าขอให้แก้ไขข้อมูล' : '⏳ รอร้านค้าตรวจสอบคิวงาน'}
                                    </span>

                                    {/* แสดงป้ายวิธีชำระเงิน */}
                                    <span className="px-3 py-1 rounded-full text-[11px] font-bold border bg-stone-50 text-stone-700 border-stone-200">
                                        {order.payment_method === 'cod' ? '📦 เก็บเงินปลายทาง (COD)' : '💳 โอนเงินผ่านธนาคาร'}
                                    </span>
                                </div>
                            </div>

                            {/* รายการสินค้าปลีกย่อยใน Order (ดึงมาจาก order_items) */}
                            <div className="space-y-3">
                                <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">รายการสินค้าแฮนด์เมดในบิลนี้ (`order_items`)</h4>
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-stone-50/70 border border-stone-100 text-xs">
                                        <div>
                                            <p className="font-bold text-stone-800">{item.product_name}</p>
                                            {item.customization_notes && item.customization_notes !== '-' && (
                                                <p className="text-[11px] text-[#2A9D8F] mt-0.5">✨ หมายเหตุสั่งทำ: {item.customization_notes}</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <span className="font-mono font-bold text-stone-900">฿{item.price.toLocaleString()}</span>
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
                                        ฿{order.total_amount.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* โซนปุ่มดำเนินการต่อตามสถานะ */}
                            {order.status === 'shop_approved' && order.payment_method === 'transfer' && order.payment_status === 'unpaid' && (
                                <div className="pt-4 border-t border-dashed border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-50/40 p-4 rounded-2xl">
                                    <div className="text-xs text-stone-600">
                                        <p className="font-bold text-stone-800">📌 ร้านค้าอนุมัติแล้ว! กรุณาโอนเงินและแนบสลิปการชำระเงิน</p>
                                        <p className="text-[11px] text-stone-500 mt-0.5">ธนาคารกสิกรไทย 123-4-56789-0 (Craftiverse Official)</p>
                                    </div>

                                    <button
                                        onClick={() => handleUploadSlip(order.id)}
                                        className="btn-3d-botanical px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-2 cursor-pointer"
                                    >
                                        <Upload className="w-3.5 h-3.5" />
                                        <span>อัปโหลดสลิปโอนเงิน</span>
                                    </button>
                                </div>
                            )}

                            {/* กรณีรอร้านค้าตรวจสอบ */}
                            {order.status === 'pending_shop_review' && (
                                <div className="pt-3 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
                                    <Clock className="w-4 h-4 shrink-0" />
                                    <span>คำสั่งซื้อกำลังรอให้ทางร้านต้นสังกัดตรวจสอบรายละเอียดและคิวงานแฮนด์เมดของคุณ</span>
                                </div>
                            )}

                            {/* แสดงรูปสลิปที่แนบแล้ว */}
                            {order.payment_slip_url && (
                                <div className="pt-2 flex items-center gap-3 text-xs text-stone-500">
                                    <CheckCircle2 className="w-4 h-4 text-[#2A9D8F]" />
                                    <span>แนบสลิปเรียบร้อยแล้ว (รอผู้ขายตรวจสอบความถูกต้อง)</span>
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