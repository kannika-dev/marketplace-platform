import React, { useState, useEffect } from 'react';
import {
    PackageCheck,
    Clock,
    MapPin,
    Sparkles,
    MessageSquare,
    Upload,
    CheckCircle2,
    Eye,
    X,
    Image as ImageIcon,
    CheckCircle,
    AlertTriangle,
    RefreshCw,
    AlertCircle,
    Send,
    Store,
    Bell
} from 'lucide-react';
import { getMyOrders, uploadPaymentSlip, uploadFinalPaymentSlip } from '../../../services/orderService';
import api from '../../../services/api';

export const CraftTrackingTab = () => {
    const [trackingOrders, setTrackingOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewImage, setPreviewImage] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    // State สำหรับเปิด-ปิดฟอร์มขออัปเดต / แจ้งปัญหา แบบ Inline ในการ์ด
    const [activeUpdateOrderId, setActiveUpdateOrderId] = useState(null);
    const [buyerNoteText, setBuyerNoteText] = useState('');

    const [activeIssueOrderId, setActiveIssueOrderId] = useState(null);
    const [issueText, setIssueText] = useState('');

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
                <div className="mt-1.5 flex flex-wrap gap-1.5 items-center text-[11px]">
                    <span className="font-mono text-[#E76F51] font-bold uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> CUSTOM:
                    </span>
                    {Object.entries(parsed).map(([key, val]) => (
                        <span
                            key={key}
                            className="bg-[#FFE6A7]/30 text-[#1B4332] border border-[#FFE6A7] px-2 py-0.5 rounded-full font-medium text-[10px]"
                        >
                            {key}: <strong className="font-bold">{String(val)}</strong>
                        </span>
                    ))}
                </div>
            );
        }

        return <span>{String(parsed)}</span>;
    };

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

    // ฟังก์ชันอัปโหลดสลิปงวดแรก
    const handleUploadSlip = async (orderId, event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const res = await uploadPaymentSlip(orderId, file);
            if (res.success) {
                alert('✨ อัปโหลดสลิปใหม่สำเร็จ! ระบบส่งหลักฐานให้ช่างฝีมือตรวจสอบอีกครั้ง');
                fetchTrackingData();
            }
        } catch (err) {
            console.error('Upload slip error:', err);
            alert('อัปโหลดสลิปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
        }
    };

    // ฟังก์ชันอัปโหลดสลิปงวดที่ 2
    const handleUploadFinalSlip = async (orderId, event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const res = await uploadFinalPaymentSlip(orderId, file);
            if (res.success) {
                alert('✨ อัปโหลดสลิปชำระยอดคงเหลือสำเร็จ! กำลังรอผู้ขายตรวจสอบ');
                fetchTrackingData();
            }
        } catch (err) {
            console.error('Upload final slip error:', err);
            alert('อัปโหลดสลิปงวดที่ 2 ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
        }
    };

    // ฟังก์ชันผู้ซื้อกด "ยืนยันได้รับสินค้าและเสร็จสิ้น"
    const handleConfirmReceived = async (orderId) => {
        if (!window.confirm('คุณได้รับสินค้าถูกต้องและสมบูรณ์แล้วใช่หรือไม่?')) return;

        setUpdatingId(orderId);
        try {
            const res = await api.patch(`/orders/${orderId}/confirm-received`);

            if (res.data?.success || res.status === 200) {
                alert('✨ ขอบคุณสำหรับการยืนยัน! คำสั่งซื้อของคุณเสร็จสมบูรณ์เรียบร้อยแล้ว');
                fetchTrackingData();
            }
        } catch (err) {
            console.error('Confirm received error:', err);
            alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการยืนยันรับสินค้า กรุณาลองใหม่อีกครั้ง');
        } finally {
            setUpdatingId(null);
        }
    };

    // 🔔 ฟังก์ชันผู้ซื้อส่งคำร้องขออัปเดตความคืบหน้าสินค้า
    const handleSendUpdateRequest = async (orderId, sellerId) => {
        setUpdatingId(orderId);
        try {
            await api.post(`/orders/${orderId}/request-update`, {
                seller_id: sellerId,
                buyer_note: buyerNoteText.trim() || 'ผู้ซื้อขอติดตามอัปเดตความคืบหน้าของสินค้าชิ้นนี้ค่ะ'
            });

            alert('✨ ส่งคำร้องขออัปเดตความคืบหน้าไปยังช่างฝีมือเรียบร้อยแล้ว!');
            setActiveUpdateOrderId(null);
            setBuyerNoteText('');
            fetchTrackingData();
        } catch (err) {
            console.error('Request update error:', err);
            alert('เกิดข้อผิดพลาดในการส่งคำร้องขอ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setUpdatingId(null);
        }
    };

    // ฟังก์ชันผู้ซื้อยิงแจ้งปัญหาเข้าบันทึก Log
    const handleReportIssue = async (orderId) => {
        if (!issueText || !issueText.trim()) {
            alert('กรุณาระบุรายละเอียดปัญหาที่พบ');
            return;
        }

        setUpdatingId(orderId);
        try {
            const formData = new FormData();
            formData.append('craft_status', 'issue');
            formData.append('step_title', '⚠️ ผู้ซื้อแจ้งปัญหาเกี่ยวกับสินค้า');
            formData.append('note', `รายละเอียดปัญหาจากผู้ซื้อ: ${issueText.trim()}`);

            await api.patch(`/orders/${orderId}/craft-status`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert('✨ ส่งรายงานปัญหาถึงช่างฝีมือเรียบร้อยแล้ว');
            setActiveIssueOrderId(null);
            setIssueText('');
            fetchTrackingData();
        } catch (err) {
            console.error('Report issue error:', err);
            try {
                await api.patch(`/seller/orders/${orderId}/craft-status`, {
                    craft_status: 'issue',
                    step_title: '⚠️ ผู้ซื้อแจ้งปัญหาเกี่ยวกับสินค้า',
                    note: `รายละเอียดปัญหาจากผู้ซื้อ: ${issueText.trim()}`
                });
                alert('✨ ส่งรายงานปัญหาถึงช่างฝีมือเรียบร้อยแล้ว');
                setActiveIssueOrderId(null);
                setIssueText('');
                fetchTrackingData();
            } catch (e) {
                alert('เกิดข้อผิดพลาดในการส่งข้อมูลปัญหา กรุณาลองใหม่อีกครั้ง');
            }
        } finally {
            setUpdatingId(null);
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
                <div className="text-center py-16 text-stone-400 text-xs">กำลังโหลดข้อมูล...</div>
            ) : trackingOrders.length === 0 ? (
                <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-3">
                    <PackageCheck className="w-12 h-12 text-[#2A9D8F] mx-auto animate-bounce" />
                    <h4 className="text-sm font-bold text-stone-800">ยังไม่มีคำสั่งซื้อที่อยู่ระหว่างการผลิต</h4>
                </div>
            ) : (
                <div className="space-y-6">
                    {trackingOrders.map((order) => {
                        const timeline = order.timeline || [];
                        const latestLog = timeline.length > 0 ? timeline[timeline.length - 1] : null;
                        const latestTimelineNote = latestLog?.notes;
                        const latestTitle = latestLog?.status_title || order.craft_status || 'กำลังรังสรรค์ผลงาน';

                        const isCompleted = order.craft_status === 'completed' || order.status === 'completed';
                        const isSlipRejected = order.payment_status === 'rejected' || (latestTimelineNote && latestTimelineNote.includes('สลิปไม่ถูกต้อง'));

                        const isPaymentVerified = !isSlipRejected && (
                            order.payment_status === 'paid' ||
                            order.status === 'paid' ||
                            isCompleted ||
                            (order.craft_status && order.craft_status !== 'order_placed' && order.craft_status !== 'pending_approval' && order.craft_status !== 'pending_verification' && order.craft_status !== 'pending' && order.craft_status !== 'awaiting_deposit')
                        );

                        const hasUploadedSlip = Boolean(order.payment_slip_url);
                        const isDeposit = order.payment_type === 'deposit';

                        const isAwaitingFinalPayment = order.craft_status === 'awaiting_final_payment';
                        const hasUploadedFinalSlip = Boolean(order.final_payment_slip_url);
                        const isFinalPaymentVerified = isCompleted || order.craft_status === 'ready_to_ship';

                        const remainingAmount = order.remaining_balance || (Number(order.total_amount) - Number(order.deposit_amount || Math.round(order.total_amount * 0.5)));

                        const isUpdateFormOpen = activeUpdateOrderId === order.id;
                        const isIssueFormOpen = activeIssueOrderId === order.id;

                        return (
                            <div key={order.id} className="clay-card p-6 rounded-3xl border border-stone-200 bg-white shadow-sm space-y-6">
                                {/* Header คำสั่งซื้อ */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100 text-xs">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-stone-900 text-sm">คำสั่งซื้อ #{order.id}</span>
                                            <span className="text-stone-400">({new Date(order.created_at).toLocaleDateString('th-TH')})</span>
                                        </div>

                                        <div className="flex items-center gap-1.5 text-[#2A9D8F] font-bold">
                                            <Store className="w-3.5 h-3.5" />
                                            <span>ร้านค้า: {order.shop_name || 'ร้านค้าแฮนด์เมด'}</span>
                                        </div>

                                        <div className="pt-1 flex items-center gap-2 flex-wrap">
                                            {isCompleted ? (
                                                <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-bold rounded-full inline-flex items-center gap-1.5">
                                                    🎉 เสร็จสมบูรณ์: ผู้ซื้อได้รับสินค้าแล้ว
                                                </span>
                                            ) : isSlipRejected ? (
                                                <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold rounded-full inline-flex items-center gap-1.5">
                                                    🔴 สลิปไม่ถูกต้อง - กรุณาแนบสลิปใหม่
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-[#E8F7F3] text-[#1B4332] border border-[#A2D9D2] text-[11px] font-bold rounded-full inline-flex items-center gap-1.5">
                                                    <Sparkles className="w-3 h-3 text-[#E76F51]" />
                                                    <span>ความคืบหน้าล่าสุด: <strong>{latestTitle}</strong></span>
                                                </span>
                                            )}

                                            {/* 🔔 ปุ่มขออัปเดตความคืบหน้าสินค้า (เปิด-ปิดฟอร์มภายในตัวการ์ด) */}
                                            {!isCompleted && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveIssueOrderId(null);
                                                        setActiveUpdateOrderId(isUpdateFormOpen ? null : order.id);
                                                    }}
                                                    className={`px-3 py-1 border text-[11px] font-bold rounded-full inline-flex items-center gap-1 transition-all cursor-pointer shadow-2xs ${isUpdateFormOpen
                                                            ? 'bg-amber-500 text-white border-amber-600'
                                                            : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                                                        }`}
                                                >
                                                    <Bell className="w-3 h-3 text-amber-600 animate-bounce" />
                                                    <span>{isUpdateFormOpen ? '✕ ปิดช่องสะกิด' : '🔔 ขออัปเดตสินค้า'}</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0 flex-wrap pt-2 sm:pt-0">
                                        {!isCompleted && isPaymentVerified && (
                                            <>
                                                <button
                                                    type="button"
                                                    disabled={updatingId === order.id}
                                                    onClick={() => handleConfirmReceived(order.id)}
                                                    className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                                                >
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                                                    <span>ได้รับสินค้าแล้ว &amp; เสร็จสิ้น</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveUpdateOrderId(null);
                                                        setActiveIssueOrderId(isIssueFormOpen ? null : order.id);
                                                    }}
                                                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                                                >
                                                    <AlertCircle className="w-4 h-4 text-rose-600" />
                                                    <span>แจ้งปัญหา</span>
                                                </button>
                                            </>
                                        )}

                                        <span className="px-3 py-1 bg-stone-100 text-stone-600 border border-stone-200 text-[11px] font-bold rounded-full">
                                            {isDeposit ? 'ชำระแบบมัดจำ 50%' : 'ชำระเต็มจำนวน'}
                                        </span>
                                    </div>
                                </div>

                                {/* 📌 1. ฟอร์มขออัปเดตสินค้า แทรกอยู่ในกรอบการ์ด */}
                                {isUpdateFormOpen && (
                                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-3 shadow-inner">
                                        <div className="flex items-center justify-between border-b border-amber-200 pb-2 text-xs">
                                            <span className="font-bold text-amber-900 flex items-center gap-1.5">
                                                <Bell className="w-4 h-4 text-amber-600" /> ส่งข้อความสะกิดช่างฝีมือ (คำสั่งซื้อ #{order.id})
                                            </span>
                                            <button onClick={() => setActiveUpdateOrderId(null)} className="text-amber-700 font-bold hover:text-amber-900">✕ ปิด</button>
                                        </div>
                                        <p className="text-[11px] text-amber-800">
                                            พิมพ์ข้อความฝากถึงร้านค้าเพื่อขออัปเดตภาพถ่ายหรือสเต็ปงานคราฟต์ล่าสุดค่ะ
                                        </p>
                                        <textarea
                                            rows={2}
                                            placeholder="เช่น อยากสอบถามว่างานปั้นชิ้นนี้ดำเนินการถึงไหนแล้วคะ..."
                                            value={buyerNoteText}
                                            onChange={(e) => setBuyerNoteText(e.target.value)}
                                            className="w-full text-xs p-3 bg-white border border-amber-200 rounded-xl focus:outline-none focus:border-amber-500 text-stone-800"
                                        />
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setActiveUpdateOrderId(null)}
                                                className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold rounded-xl"
                                            >
                                                ยกเลิก
                                            </button>
                                            <button
                                                type="button"
                                                disabled={updatingId === order.id}
                                                onClick={() => handleSendUpdateRequest(order.id, order.seller_id)}
                                                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1 disabled:opacity-50"
                                            >
                                                <Send className="w-3.5 h-3.5" />
                                                <span>{updatingId === order.id ? 'กำลังส่ง...' : 'ยืนยันส่งคำร้อง'}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* 📌 2. ฟอร์มแจ้งปัญหา แทรกอยู่ในกรอบการ์ด */}
                                {isIssueFormOpen && (
                                    <div className="p-4 bg-rose-50 rounded-2xl border border-rose-300 space-y-3 shadow-inner">
                                        <div className="flex items-center justify-between border-b border-rose-200 pb-2 text-xs">
                                            <span className="font-bold text-rose-900 flex items-center gap-1.5">
                                                <AlertCircle className="w-4 h-4 text-rose-600" /> แจ้งปัญหาเกี่ยวกับคำสั่งซื้อ #{order.id}
                                            </span>
                                            <button onClick={() => setActiveIssueOrderId(null)} className="text-rose-700 font-bold hover:text-rose-900">✕ ปิด</button>
                                        </div>
                                        <textarea
                                            rows={3}
                                            placeholder="ระบุรายละเอียดปัญหาที่พบ เช่น ได้รับสินค้าชำรุด หรือไม่ตรงตามแบบ..."
                                            value={issueText}
                                            onChange={(e) => setIssueText(e.target.value)}
                                            className="w-full text-xs p-3 bg-white border border-rose-200 rounded-xl focus:outline-none focus:border-rose-500 text-stone-800"
                                        />
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setActiveIssueOrderId(null)}
                                                className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold rounded-xl"
                                            >
                                                ยกเลิก
                                            </button>
                                            <button
                                                type="button"
                                                disabled={updatingId === order.id}
                                                onClick={() => handleReportIssue(order.id)}
                                                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1 disabled:opacity-50"
                                            >
                                                <Send className="w-3.5 h-3.5" />
                                                <span>{updatingId === order.id ? 'กำลังส่ง...' : 'ส่งแจ้งปัญหา'}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* รายการสินค้าในออเดอร์นี้ */}
                                <div className="space-y-2">
                                    <span className="text-xs font-bold text-stone-700 block">
                                        รายการสินค้าในคำสั่งซื้อนี้ ({order.items?.length || 0} ชิ้น):
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {order.items?.map((item, idx) => {
                                            const itemTitle = item.product_title || item.title || 'สินค้าแฮนด์เมด';
                                            const itemImg = item.product_image || item.image_url;

                                            return (
                                                <div key={idx} className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-start gap-3 text-xs">
                                                    {itemImg ? (
                                                        <div
                                                            onClick={() => setPreviewImage(itemImg)}
                                                            className="relative w-14 h-14 rounded-xl overflow-hidden border border-stone-200 shrink-0 bg-white cursor-pointer group shadow-2xs"
                                                        >
                                                            <img
                                                                src={itemImg}
                                                                alt={itemTitle}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                            />
                                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                                <Eye className="w-3.5 h-3.5" />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="w-14 h-14 rounded-xl bg-stone-200 flex items-center justify-center text-stone-400 text-[10px] font-mono shrink-0">
                                                            NO PIC
                                                        </div>
                                                    )}

                                                    <div className="min-w-0 flex-1 space-y-0.5">
                                                        <p className="font-bold text-stone-900 truncate text-sm">{itemTitle}</p>
                                                        <p className="text-stone-500 text-[11px]">
                                                            จำนวน: <strong className="text-stone-800">{item.quantity}</strong> • ฿{Number(item.price).toLocaleString()}
                                                        </p>
                                                        {renderCustomizationDetails(item.customization_details || item.customization_notes)}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* บันทึกข้อความจากช่างฝีมือ */}
                                <div className={`p-4 rounded-2xl border text-xs space-y-1 ${isSlipRejected ? 'bg-rose-50/70 border-rose-200' : 'bg-emerald-50/60 border-emerald-100'}`}>
                                    <span className={`font-bold flex items-center gap-1.5 ${isSlipRejected ? 'text-rose-800' : 'text-[#1B4332]'}`}>
                                        <MessageSquare className="w-3.5 h-3.5 text-[#2A9D8F]" /> บันทึกข้อความจากช่างฝีมือ:
                                    </span>
                                    <p className={`pl-5 font-medium ${isSlipRejected ? 'text-rose-700 font-bold' : 'text-stone-600'}`}>
                                        {latestTimelineNote || order.seller_reply || (
                                            isPaymentVerified
                                                ? 'ร้านค้าตรวจสอบสลิปเรียบร้อย กำลังรังสรรค์ผลงานครับ'
                                                : 'ร้านค้าได้รับคำสั่งซื้อแล้ว อยู่ระหว่างรอตรวจสอบหลักฐานการชำระเงิน'
                                        )}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 text-xs space-y-2">
                                        <span className="font-bold text-stone-800 flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-[#2A9D8F]" /> ที่อยู่จัดส่ง:
                                        </span>
                                        <p className="text-stone-500 whitespace-pre-line">{order.shipping_address}</p>
                                    </div>

                                    {/* สถานะชำระเงิน & หลักฐาน */}
                                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 text-xs space-y-3 flex flex-col justify-between">
                                        <div className="space-y-1.5">
                                            <span className="font-bold text-stone-800 block">สถานะการชำระเงิน &amp; หลักฐาน:</span>
                                            <div className="flex justify-between text-stone-600">
                                                <span>ยอดรวมทั้งหมด:</span>
                                                <span className="font-bold text-stone-900">฿{Number(order.total_amount).toLocaleString()}</span>
                                            </div>
                                            {isDeposit && (
                                                <div className="flex justify-between text-stone-500 text-[11px]">
                                                    <span>มัดจำงวดแรก (50%):</span>
                                                    <span>฿{Number(order.deposit_amount || Math.round(order.total_amount * 0.5)).toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>

                                        {isSlipRejected ? (
                                            <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
                                                        <AlertTriangle className="w-4 h-4 text-rose-600" /> สลิปเดิมไม่ถูกต้อง
                                                    </span>
                                                    {order.payment_slip_url && (
                                                        <button type="button" onClick={() => setPreviewImage(order.payment_slip_url)} className="text-[10px] text-stone-500 underline hover:text-stone-800">
                                                            ดูสลิปเดิม
                                                        </button>
                                                    )}
                                                </div>
                                                <label className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors">
                                                    <RefreshCw className="w-3.5 h-3.5" />
                                                    <span>คลิกเพื่ออัปโหลดสลิปใบใหม่</span>
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadSlip(order.id, e)} />
                                                </label>
                                            </div>
                                        ) : isDeposit && isAwaitingFinalPayment ? (
                                            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-2.5">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-bold text-amber-900">✨ ผลงานเสร็จแล้ว! ชำระยอดคงเหลือ:</span>
                                                    <span className="text-sm font-extrabold text-[#E76F51]">฿{remainingAmount.toLocaleString()}</span>
                                                </div>

                                                {hasUploadedFinalSlip && !isFinalPaymentVerified ? (
                                                    <div className="p-2.5 bg-white rounded-xl border border-stone-200 flex items-center justify-between">
                                                        <span className="text-[11px] font-bold text-amber-800">🟡 แนบสลิปงวดที่ 2 แล้ว (รอร้านตรวจสอบ)</span>
                                                        <button type="button" onClick={() => setPreviewImage(order.final_payment_slip_url)} className="p-1 bg-stone-100 rounded-lg cursor-pointer">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : isFinalPaymentVerified ? (
                                                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between gap-3">
                                                        <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                                                            <CheckCircle className="w-4 h-4 text-emerald-600" /> สลิปงวดที่ 2 ถูกต้องแล้ว
                                                        </span>
                                                        {order.final_payment_slip_url && (
                                                            <button type="button" onClick={() => setPreviewImage(order.final_payment_slip_url)} className="p-1.5 bg-white text-stone-600 rounded-lg cursor-pointer border border-stone-200">
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <label className="w-full py-2.5 px-4 btn-3d-peach text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm">
                                                        <Upload className="w-4 h-4" />
                                                        <span>แนบสลิปชำระยอดคงเหลือ ฿{remainingAmount.toLocaleString()}</span>
                                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadFinalSlip(order.id, e)} />
                                                    </label>
                                                )}
                                            </div>
                                        ) : hasUploadedSlip ? (
                                            <div className="p-2.5 bg-white rounded-xl border border-stone-200 flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2.5 overflow-hidden">
                                                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-stone-200 shrink-0 bg-stone-100">
                                                        <img src={order.payment_slip_url} alt="สลิป" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="truncate">
                                                        <span className="text-[11px] font-bold text-stone-800 block">หลักฐานสลิปโอนเงิน</span>
                                                        <span className="text-[10px] text-emerald-700 font-medium">
                                                            {isPaymentVerified ? '✓ ตรวจสอบเรียบร้อย' : '🟡 รอร้านค้าตรวจสอบ'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewImage(order.payment_slip_url)}
                                                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5 text-[#2A9D8F]" />
                                                    <span>ดูสลิป</span>
                                                </button>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="space-y-3 pt-2">
                                    <h4 className="text-xs font-extrabold text-stone-800 flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-[#2A9D8F]" /> เรื่องราวความคืบหน้างานแฮนด์เมด (Artisan Journal Timeline)
                                    </h4>
                                    <div className="space-y-2.5">
                                        {timeline && timeline.length > 0 ? (
                                            timeline.map((log, index) => (
                                                <div key={index} className="p-3.5 bg-stone-50 rounded-2xl border border-stone-100 space-y-2 text-xs">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-[#E76F51] mt-1.5 shrink-0" />
                                                        <div className="space-y-0.5 flex-1">
                                                            <span className="font-bold text-stone-900 block text-sm font-display text-[#1B4332]">
                                                                {log.status_title || log.step}
                                                            </span>
                                                            {log.notes && (
                                                                <p className="text-stone-700 font-medium leading-relaxed pt-0.5">
                                                                    {log.notes}
                                                                </p>
                                                            )}
                                                            <span className="text-[10px] text-stone-400 font-mono block pt-1">
                                                                {new Date(log.created_at).toLocaleString('th-TH')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {log.image_url && (
                                                        <div className="pl-5 pt-2">
                                                            <div onClick={() => setPreviewImage(log.image_url)} className="relative w-32 h-32 rounded-2xl overflow-hidden border border-stone-200 cursor-pointer group shadow-sm bg-white">
                                                                <img src={log.image_url} alt="ความคืบหน้างานคราฟต์" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                                                                    🔍 ขยายดูรูป
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-stone-400 italic">ยังไม่มีบันทึกอัปเดตจากช่างฝีมือ</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal ขยายรูป */}
            {previewImage && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
                    <div className="relative max-w-lg w-full bg-white rounded-3xl p-4 shadow-2xl space-y-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                            <span className="text-xs font-bold text-stone-800 flex items-center gap-1"><ImageIcon className="w-4 h-4 text-[#2A9D8F]" /> ตัวอย่างรูปภาพ / หลักฐาน</span>
                            <button onClick={() => setPreviewImage(null)} className="p-1 hover:bg-stone-100 rounded-full"><X className="w-5 h-5" /></button>
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

export default CraftTrackingTab;