import React, { useState, useEffect } from 'react';
import {
    History,
    Receipt,
    Eye,
    X,
    Image as ImageIcon,
    ExternalLink,
    CheckCircle2,
    Clock,
    AlertCircle,
    Package,
    ShoppingBag,
    Sparkles,
    Star
} from 'lucide-react';
import { getMyOrders } from '../../../services/orderService';

export const HistoryTab = ({ onNavigateToTracker, onOpenReviewModal }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unpaid' | 'in_progress' | 'completed'
    const [previewImage, setPreviewImage] = useState(null);

    const fetchOrdersHistory = async () => {
        try {
            setLoading(true);
            const res = await getMyOrders();
            if (res.success) {
                setOrders(res.data || []);
            }
        } catch (err) {
            console.error('Error fetching order history:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrdersHistory();
    }, []);

    // กรองออเดอร์ตาม Tab ที่เลือก
    const filteredOrders = orders.filter((order) => {
        const isCompleted = order.craft_status === 'completed' || order.status === 'completed';
        const isUnpaid = order.status === 'unpaid' || order.payment_status === 'unpaid';

        if (activeFilter === 'unpaid') return isUnpaid && !isCompleted;
        if (activeFilter === 'in_progress') return !isCompleted && !isUnpaid;
        if (activeFilter === 'completed') return isCompleted;
        return true;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                    <h3 className="text-lg font-display font-bold text-stone-900">ประวัติคำสั่งซื้อและสลิปการจ่ายเงิน</h3>
                    <p className="text-xs text-stone-500">ตรวจสอบรายการสั่งซื้อย้อนหลัง ตรวจดูหลักฐานการโอนเงิน และเขียนรีวิวงานแฮนด์เมด</p>
                </div>
                <Receipt className="w-5 h-5 text-[#2A9D8F]" />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
                {[
                    { key: 'all', label: 'ทั้งหมด' },
                    { key: 'unpaid', label: 'รอชำระเงิน' },
                    { key: 'in_progress', label: 'กำลังรังสรรค์ / ผลิต' },
                    { key: 'completed', label: 'เสร็จสมบูรณ์' }
                ].map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveFilter(tab.key)}
                        className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${activeFilter === tab.key
                                ? 'bg-[#2A9D8F] text-white shadow-xs'
                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content List */}
            {loading ? (
                <div className="text-center py-16 text-stone-400 text-xs">กำลังโหลดประวัติคำสั่งซื้อ...</div>
            ) : filteredOrders.length === 0 ? (
                <div className="p-8 rounded-3xl bg-stone-50 border border-stone-200 text-center space-y-3">
                    <History className="w-12 h-12 text-stone-300 mx-auto" />
                    <h4 className="text-sm font-bold text-stone-800">ยังไม่มีรายการประวัติคำสั่งซื้อในหมวดหมู่นี้</h4>
                    <p className="text-xs text-stone-500 max-w-md mx-auto">
                        สลิปโอนเงิน ใบเสร็จรับเงิน และประวัติการสั่งทำชิ้นงานคราฟต์ทั้งหมดของคุณจะถูกบันทึกไว้อย่างปลอดภัยที่นี่ค่ะ
                    </p>
                </div>
            ) : (
                <div className="space-y-5">
                    {filteredOrders.map((order) => {
                        const isCompleted = order.craft_status === 'completed' || order.status === 'completed';
                        const isDeposit = order.payment_type === 'deposit';
                        const depositAmount = order.deposit_amount || Math.round(Number(order.total_amount) * 0.5);
                        const remainingAmount = order.remaining_balance || (Number(order.total_amount) - depositAmount);

                        return (
                            <div key={order.id} className="p-6 rounded-3xl border border-stone-200 bg-white shadow-2xs space-y-4 hover:border-stone-300 transition-colors">
                                {/* Header คำสั่งซื้อ */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 text-xs">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-stone-900 text-sm">คำสั่งซื้อ #{order.id}</span>
                                        <span className="text-stone-400">({new Date(order.created_at).toLocaleDateString('th-TH')})</span>
                                        <span className="px-2.5 py-0.5 bg-stone-100 text-stone-600 text-[10px] font-bold rounded-full border border-stone-200">
                                            {isDeposit ? 'ชำระแบบมัดจำ 50%' : 'ชำระเต็มจำนวน'}
                                        </span>
                                    </div>

                                    {/* Badge แสดงสถานะย่อ */}
                                    <div>
                                        {isCompleted ? (
                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold rounded-full inline-flex items-center gap-1">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>คำสั่งซื้อเสร็จสมบูรณ์</span>
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold rounded-full inline-flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                                <span>สถานะ: {order.craft_status || 'กำลังดำเนินการ'}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* รายการสินค้าในออเดอร์ */}
                                <div className="space-y-3">
                                    {order.items && order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 text-xs">
                                            <img
                                                src={item.image_url || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=150&q=80'}
                                                alt={item.title}
                                                className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0 bg-stone-50"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h5 className="font-bold text-stone-900 truncate">{item.title}</h5>
                                                <p className="text-stone-400 text-[11px]">จำนวน: {item.quantity} ชิ้น</p>
                                            </div>
                                            <span className="font-bold text-stone-800 shrink-0">
                                                ฿{(Number(item.price) * item.quantity).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* สรุปยอดเงินและส่วนสลิปชำระเงิน */}
                                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 text-xs space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/60 pb-2">
                                        <div className="space-y-0.5">
                                            <span className="text-stone-500 block">ยอดรวมทั้งออเดอร์: <strong className="text-stone-900 font-extrabold text-sm">฿{Number(order.total_amount).toLocaleString()}</strong></span>
                                            {isDeposit && (
                                                <span className="text-[11px] text-stone-400 block">
                                                    (มัดจำงวดแรก: ฿{depositAmount.toLocaleString()} / งวดคงเหลือ: ฿{remainingAmount.toLocaleString()})
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* ปุ่มดูสลิปหลักฐานการโอนเงิน */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-stone-700 block shrink-0 text-[11px]">หลักฐานสลิป:</span>

                                        {/* สลิปงวดที่ 1 */}
                                        {order.payment_slip_url ? (
                                            <button
                                                type="button"
                                                onClick={() => setPreviewImage(order.payment_slip_url)}
                                                className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-xl text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                                            >
                                                <Eye className="w-3.5 h-3.5 text-[#2A9D8F]" />
                                                <span>{isDeposit ? 'สลิปมัดจำ (งวด 1)' : 'สลิปชำระเงิน'}</span>
                                            </button>
                                        ) : (
                                            <span className="text-[11px] text-stone-400 italic">ยังไม่มีสลิปงวดแรก</span>
                                        )}

                                        {/* สลิปงวดที่ 2 (เฉพาะแบบมัดจำ) */}
                                        {isDeposit && (
                                            order.final_payment_slip_url ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewImage(order.final_payment_slip_url)}
                                                    className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-xl text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                                                >
                                                    <Eye className="w-3.5 h-3.5 text-[#E76F51]" />
                                                    <span>สลิปยอดคงเหลือ (งวด 2)</span>
                                                </button>
                                            ) : (
                                                <span className="text-[11px] text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 font-medium">
                                                    (รอแนบสลิปงวดที่ 2 ในหน้า Tracker)
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between gap-3 pt-1">
                                    <span className="text-[11px] text-stone-400">
                                        ที่อยู่จัดส่ง: {order.shipping_address ? order.shipping_address.split('\n')[0] : '-'}
                                    </span>

                                    <div className="flex items-center gap-2">
                                        {/* ปุ่มลิงก์สลับไปยังหน้า Craft Tracker */}
                                        {!isCompleted && onNavigateToTracker && (
                                            <button
                                                type="button"
                                                onClick={() => onNavigateToTracker(order.id)}
                                                className="px-3.5 py-2 btn-3d-botanical text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                            >
                                                <Sparkles className="w-3.5 h-3.5" />
                                                <span>ไปที่หน้าติดตาม Craft Tracker</span>
                                            </button>
                                        )}

                                        {/* ปุ่มเขียนรีวิวสินค้า (เฉพาะออเดอร์ที่เสร็จแล้ว) */}
                                        {isCompleted && onOpenReviewModal && (
                                            <button
                                                type="button"
                                                onClick={() => onOpenReviewModal(order)}
                                                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                                            >
                                                <Star className="w-3.5 h-3.5 fill-white" />
                                                <span>เขียนรีวิวให้ช่างฝีมือ</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal สำหรับขยายดูสลิป */}
            {previewImage && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
                    <div className="relative max-w-lg w-full bg-white rounded-3xl p-4 shadow-2xl space-y-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                            <span className="text-xs font-bold text-stone-800 flex items-center gap-1">
                                <ImageIcon className="w-4 h-4 text-[#2A9D8F]" /> หลักฐานสลิปการโอนเงิน
                            </span>
                            <button onClick={() => setPreviewImage(null)} className="p-1 hover:bg-stone-100 rounded-full cursor-pointer">
                                <X className="w-5 h-5 text-stone-500" />
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

export default HistoryTab;