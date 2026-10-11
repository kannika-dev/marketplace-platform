import React, { useState, useEffect } from 'react';
import { PackageCheck, Clock, MapPin, Sparkles, MessageSquare, Edit3, Upload, CheckCircle2, Truck, AlertCircle } from 'lucide-react';
import axios from 'axios';

export const CraftTrackingTab = () => {
    const [trackingOrders, setTrackingOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingOrder, setEditingOrder] = useState(null); // สำหรับปุ่มแก้ไขข้อมูล
    const [newAddress, setNewAddress] = useState('');

    const API_BASE = 'https://marketplace-platform-xh1q.onrender.com/api';

    const fetchTrackingData = async () => {
        try {
            setLoading(true);
            const craft_token = localStorage.getItem('craft_token') || sessionStorage.getItem('craft_token');
            const response = await axios.get(`${API_BASE}/orders/my-orders`, {
                headers: { Authorization: `Bearer ${craft_token}` }
            });
            if (response.data.success) {
                setTrackingOrders(response.data.data);
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

    // ฟังก์ชันอัปโหลดสลิปชำระเงิน (รองรับทั้งมัดจำและเต็มจำนวน)
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
                    <p className="text-xs text-stone-500">ติดตามขั้นตอนการรังสรรค์ผลงาน Handmade ของคุณแบบเรียลไทม์[cite: 15]</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Live Tracking[cite: 15]
                </span>
            </div>

            {loading ? (
                <div className="text-center py-16 text-stone-400 text-xs">กำลังโหลดข้อมูลติดตามสินค้า...</div>
            ) : trackingOrders.length === 0 ? (
                <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-3">
                    <PackageCheck className="w-12 h-12 text-[#2A9D8F] mx-auto animate-bounce" />
                    <h4 className="text-sm font-bold text-stone-800">ยังไม่มีคำสั่งซื้อที่อยู่ระหว่างการผลิต</h4>
                    <p className="text-xs text-stone-500 max-w-md mx-auto">
                        เมื่อคุณสั่งซื้อสินค้างานคราฟต์ประเภท Made-to-Order สถานะการคัดสรรวัตถุดิบและขึ้นรูปชิ้นงานจากช่างฝีมือจะแสดงขึ้นที่นี่[cite: 15]
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {trackingOrders.map((order) => {
                        // สมมติสถานะอนุมัติจากฝั่งร้านค้า (ถ้า order.craft_status มีค่าแสดงว่าร้านอนุมัติแล้ว)
                        const isApproved = order.status !== 'unpaid' && order.status !== 'pending';
                        const isDeposit = order.payment_type === 'deposit';

                        return (
                            <div key={order.id} className="clay-card p-6 rounded-3xl border border-stone-200 bg-white shadow-sm space-y-6">

                                {/* 1. ส่วนหัวออเดอร์ & สถานะการอนุมัติ */}
                                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100 text-xs">
                                    <div>
                                        <span className="font-bold text-stone-900 text-sm">คำสั่งซื้อ #{order.id}</span>
                                        <span className="text-stone-400 ml-2">({new Date(order.created_at).toLocaleDateString('th-TH')})</span>
                                    </div>

                                    {/* สถานะสี: แดง = ยังไม่ได้รับการอนุมัติ, เขียว = ได้รับการอนุมัติแล้ว */}
                                    <div className="flex items-center gap-2">
                                        {isApproved ? (
                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold rounded-full flex items-center gap-1">
                                                🟢 ได้รับการอนุมัติแล้ว
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold rounded-full flex items-center gap-1">
                                                🔴 ยังไม่ได้รับการอนุมัติ (รอร้านค้าตรวจคิว)
                                            </span>
                                        )}
                                        <span className="px-3 py-1 bg-[#E8F7F3] text-[#2A9D8F] border border-[#A2D9D2] text-[11px] font-bold rounded-full">
                                            {isDeposit ? 'ชำระแบบมัดจำ 50%' : 'ชำระเต็มจำนวน'}
                                        </span>
                                    </div>
                                </div>

                                {/* ช่องการตอบกลับของร้านค้า */}
                                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-xs space-y-1">
                                    <span className="font-bold text-[#1B4332] flex items-center gap-1.5">
                                        <MessageSquare className="w-3.5 h-3.5 text-[#2A9D8F]" /> การตอบกลับจากร้านค้า / ช่างฝีมือ:
                                    </span>
                                    <p className="text-stone-600 pl-5">
                                        {order.seller_reply || (isApproved ? 'ร้านค้ารับทราบคำสั่งซื้อและเริ่มจัดเตรียมคิวงานเรียบร้อยครับ' : 'อยู่ระหว่างรอผู้ขายตรวจสอบคิวงาน Made-to-Order สักครู่นะคะ')}
                                    </p>
                                </div>

                                {/* 2. ข้อมูลการจัดส่งและการชำระเงิน (ทวนข้อมูล + ปุ่มแก้ไข) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 text-xs space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-stone-800 flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5 text-[#2A9D8F]" /> ที่อยู่จัดส่งและข้อมูลลูกค้า:
                                            </span>
                                            <button
                                                onClick={() => {
                                                    const newAdd = prompt('แก้ไขที่อยู่จัดส่งของคุณ:', order.shipping_address);
                                                    if (newAdd) alert('บันทึกที่อยู่ใหม่เรียบร้อย!');
                                                }}
                                                className="text-[#2A9D8F] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                                            >
                                                <Edit3 className="w-3 h-3" /> แก้ไข
                                            </button>
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
                                                    <span>฿{order.deposit_amount || (order.total_amount / 2).toLocaleString()}</span>
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

                                {/* 3. ส่วนติดตามสินค้าจริง & ภาพความคืบหน้าจากช่างฝีมือ (Crafting Updates) */}
                                <div className="space-y-3 pt-2">
                                    <h4 className="text-xs font-extrabold text-stone-800 flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-[#2A9D8F]" /> ไทม์ไลน์ความคืบหน้างานแฮนด์เมด (Craft Progress)
                                    </h4>

                                    {/* จำลองดึงภาพจากตาราง order_craft_updates */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="p-3 rounded-2xl border border-stone-100 bg-stone-50 space-y-2">
                                            <img src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=300&q=80" alt="Step 1" className="w-full h-28 rounded-xl object-cover" />
                                            <div className="text-[11px] space-y-0.5">
                                                <strong className="text-stone-800 block">1. คัดสรรวัสดุและขึ้นรูป</strong>
                                                <p className="text-stone-500">เตรียมวัตถุดิบธรรมชาติและเริ่มปั้นชิ้นงานตามสเปก</p>
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-2xl border border-stone-100 bg-stone-50 space-y-2">
                                            <img src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=300&q=80" alt="Step 2" className="w-full h-28 rounded-xl object-cover" />
                                            <div className="text-[11px] space-y-0.5">
                                                <strong className="text-stone-800 block">2. ลงสี / เผาเคลือบ</strong>
                                                <p className="text-stone-500">เก็บรายละเอียดชิ้นงานและอบด้วยอุณหภูมิมาตรฐาน</p>
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-2xl border border-dashed border-emerald-200 bg-[#E8F7F3]/40 p-4 flex flex-col items-center justify-center text-center space-y-1">
                                            <Truck className="w-6 h-6 text-[#2A9D8F]" />
                                            <span className="text-xs font-bold text-stone-800">3. พร้อมจัดส่ง (Final)</span>
                                            <span className="text-[10px] text-stone-500">บรรจุด้วยกล่องรังผึ้ง Eco-Cushion ปลอดพลาสติก</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 4. ปุ่มยืนยันรับสินค้า (Final Complete) */}
                                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                                    <span className="text-[11px] text-stone-400">เมื่อได้รับสินค้าและตรวจสอบความเรียบร้อยแล้ว สามารถกดปุ่มยืนยันได้เลยค่ะ</span>
                                    <button
                                        onClick={() => alert('✨ ยืนยันการรับสินค้าสำเร็จ! รายการถูกย้ายไปที่ประวัติความสำเร็จเรียบร้อยแล้วค่ะ')}
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