import React, { useState, useEffect } from 'react';
import { PackageCheck, Clock, MapPin, Sparkles, MessageSquare, Edit3, Upload, CheckCircle2, Truck } from 'lucide-react';
import { getMyOrders, uploadPaymentSlip } from '../../../services/orderService';

// อัปเดตสเต็ปแรกให้ครอบคลุมคำว่า "รับคำสั่งซื้อ/รอชำระเงิน" ตามที่เตงต้องการ
const STAGE_LABELS = {
    'order_placed': '01 // รับคำสั่งซื้อ/รอชำระเงิน (Order Placed)',
    'material_prep': '02 // จัดเตรียมวัตถุดิบ (Material Prep)',
    'crafting': '03 // กำลังขึ้นรูปประดิษฐ์ (In Crafting)',
    'customizing': '04 // แต่งแต้มพิเศษ/สลักชื่อ (Customizing)',
    'quality_check': '05 // ตรวจสอบความประณีต (Quality Check)',
    'shipped': '06 // จัดส่งพัสดุแล้ว (Shipped)',
    'completed': '07 // เสร็จสมบูรณ์ (Completed)'
};

export const CraftTrackingTab = () => {
    const [trackingOrders, setTrackingOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTrackingData = async () => {
        try {
            setLoading(true);
            const res = await getMyOrders();
            if (res.success) {
                setTrackingOrders(res.data);
            }
        } catch (err) {
            console.error('Error fetching tracking orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrackingData();
    }, []);

    const handleUploadSlip = async (orderId, event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const res = await uploadPaymentSlip(orderId, file);
            if (res.success) {
                alert('✨ อัปโหลดสลิปเรียบร้อย! ระบบกำลังส่งข้อมูลให้ช่างฝีมือตรวจสอบ');
                fetchTrackingData();
            }
        } catch (err) {
            console.error('Upload slip error:', err);
            alert('อัปโหลดสลิปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                    <h3 className="text-lg font-display font-bold text-stone-900">ติดตามสถานะงานคราฟต์ (Craft Tracker)</h3>
                    <p className="text-xs text-stone-500">ติดตามขั้นตอนการรังสรรค์ผลงาน Handmade ของคุณแบบเรียลไทม์</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Live Tracking
                </span>
            </div>

            {loading ? (
                <div className="text-center py-16 text-stone-400 text-xs">กำลังโหลดข้อมูลติดตามสินค้า...</div>
            ) : trackingOrders.length === 0 ? (
                <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-3">
                    <PackageCheck className="w-12 h-12 text-[#2A9D8F] mx-auto animate-bounce" />
                    <h4 className="text-sm font-bold text-stone-800">ยังไม่มีคำสั่งซื้อที่อยู่ระหว่างการผลิต</h4>
                    <p className="text-xs text-stone-500 max-w-md mx-auto">
                        เมื่อคุณสั่งซื้อสินค้างานคราฟต์ประเภท Made-to-Order สถานะการคัดสรรวัตถุดิบและขึ้นรูปชิ้นงานจากช่างฝีมือจะแสดงขึ้นที่นี่
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {trackingOrders.map((order) => {
                        const rawStage = order.craft_status || order.status || 'order_placed';
                        const displayStageText = STAGE_LABELS[rawStage] || rawStage;
                        const isApproved = order.status !== 'unpaid' || (order.craft_status && order.craft_status !== 'unpaid');
                        const isDeposit = order.payment_type === 'deposit';

                        return (
                            <div key={order.id} className="clay-card p-6 rounded-3xl border border-stone-200 bg-white shadow-sm space-y-6">
                                {/* Header */}
                                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100 text-xs">
                                    <div>
                                        <span className="font-bold text-stone-900 text-sm">คำสั่งซื้อ #{order.id}</span>
                                        <span className="text-stone-400 ml-2">({new Date(order.created_at).toLocaleDateString('th-TH')})</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {isApproved ? (
                                            <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold rounded-full flex items-center gap-1.5 shadow-sm">
                                                🟢 ติดตามสถานะคำสั่งซื้อ: <span className="underline">{displayStageText}</span>
                                            </span>
                                        ) : (
                                            <span className="px-3.5 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold rounded-full flex items-center gap-1.5 shadow-sm">
                                                🔴 ยังไม่ได้รับการอนุมัติ (ติดต่อร้านค้า)
                                            </span>
                                        )}
                                        <span className="px-3 py-1 bg-[#E8F7F3] text-[#2A9D8F] border border-[#A2D9D2] text-[11px] font-bold rounded-full">
                                            {isDeposit ? 'ชำระแบบมัดจำ 50%' : 'ชำระเต็มจำนวน'}
                                        </span>
                                    </div>
                                </div>

                                {/* Reply */}
                                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-xs space-y-1">
                                    <span className="font-bold text-[#1B4332] flex items-center gap-1.5">
                                        <MessageSquare className="w-3.5 h-3.5 text-[#2A9D8F]" /> การตอบกลับจากร้านค้า / ช่างฝีมือ:
                                    </span>
                                    <p className="text-stone-600 pl-5">
                                        {order.seller_reply || (isApproved ? 'ร้านค้ารับทราบคำสั่งซื้อและเริ่มจัดเตรียมคิวงานเรียบร้อยครับ' : 'อยู่ระหว่างรอผู้ขายตรวจสอบคิวงาน Made-to-Order สักครู่นะคะ')}
                                    </p>
                                </div>

                                {/* Address & Payment */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 text-xs space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-stone-800 flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5 text-[#2A9D8F]" /> ที่อยู่จัดส่งและข้อมูลลูกค้า:
                                            </span>
                                        </div>
                                        <p className="text-stone-500 whitespace-pre-line leading-relaxed">{order.shipping_address}</p>
                                    </div>

                                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 text-xs space-y-2 flex flex-col justify-between">
                                        <div>
                                            <span className="font-bold text-stone-800 block mb-1">สถานะการชำระเงิน:</span>
                                            <div className="flex justify-between text-stone-600">
                                                <span>ยอดรวมทั้งหมด:</span>
                                                <span className="font-bold">฿{Number(order.total_amount).toLocaleString()}</span>
                                            </div>
                                            {isDeposit && (
                                                <div className="flex justify-between text-[#2A9D8F] font-bold">
                                                    <span>ยอดมัดจำ (50%):</span>
                                                    <span>฿{Number(order.deposit_amount).toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>

                                        {order.status === 'unpaid' && (
                                            <div className="pt-2">
                                                <label className="w-full py-2 px-4 btn-3d-peach text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm">
                                                    <Upload className="w-3.5 h-3.5" />
                                                    <span>แนบสลิปชำระเงิน ({isDeposit ? 'มัดจำ 50%' : 'ยอดเต็ม'})</span>
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadSlip(order.id, e)} />
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="space-y-3 pt-2">
                                    <h4 className="text-xs font-extrabold text-stone-800 flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-[#2A9D8F]" /> ไทม์ไลน์ความคืบหน้างานแฮนด์เมด (Craft Progress)
                                    </h4>

                                    <div className="space-y-2">
                                        {order.timeline && order.timeline.length > 0 ? (
                                            order.timeline.map((log, index) => {
                                                const formattedStatusTitle = STAGE_LABELS[log.status_title] || STAGE_LABELS[log.step] || log.status_title;

                                                return (
                                                    <div key={index} className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-start gap-3 text-xs">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-[#2A9D8F] mt-1.5 shrink-0 shadow-sm" />
                                                        <div className="space-y-0.5">
                                                            <span className="font-bold text-stone-900 block">{formattedStatusTitle}</span>
                                                            <p className="text-stone-600 font-normal">{log.notes}</p>
                                                            <span className="text-[10px] text-stone-400 font-mono">{new Date(log.created_at).toLocaleString('th-TH')}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-xs text-stone-400 italic">ยังไม่มีอัปเดตไทม์ไลน์จากช่างฝีมือ</p>
                                        )}
                                    </div>
                                </div>

                                {/* Action */}
                                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                                    <span className="text-[11px] text-stone-400">เมื่อได้รับสินค้าและตรวจสอบความเรียบร้อยแล้ว สามารถกดปุ่มยืนยันได้เลยค่ะ</span>
                                    <button
                                        onClick={() => alert('✨ ยืนยันการรับสินค้าสำเร็จ!')}
                                        className="btn-3d-peach px-6 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> ยืนยันได้รับสินค้าเรียบร้อย
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CraftTrackingTab;