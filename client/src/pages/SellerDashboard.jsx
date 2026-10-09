import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    DollarSign, ShoppingBag, Package, Hammer,
    TrendingUp, Plus, CheckCircle, Clock
} from 'lucide-react';

function SellerDashboard({ currentUser }) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('revenue'); // 'revenue', 'products', 'orders', 'craft'
    const [analytics, setAnalytics] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // ดึงข้อมูลทั้งหมดของร้านค้า
    const fetchDashboardData = async () => {
        if (!currentUser?.id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const [analyticsRes, productsRes, ordersRes] = await Promise.allSettled([
                api.get(`/shops/analytics/${currentUser.id}`),
                // ✅ ใช้ /seller/products ซึ่งอ่าน seller_id จาก JWT (req.user.id) — ปลอดภัย 100%
                api.get(`/seller/products`),
                api.get(`/orders/seller/${currentUser.id}`)
            ]);

            // ✅ axios ห่อ body ใน .data, backend ห่อ array ใน .data → ต้อง .data.data
            if (analyticsRes.status === 'fulfilled') {
                setAnalytics(analyticsRes.value?.data?.data ?? analyticsRes.value?.data ?? null);
            }
            if (productsRes.status === 'fulfilled') {
                const body = productsRes.value?.data;
                setProducts(Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : []);
            }
            if (ordersRes.status === 'fulfilled') {
                const body = ordersRes.value?.data;
                setOrders(Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : []);
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [currentUser]);

    // ฟังก์ชันสลับสถานะคำสั่งซื้อ (สำหรับงาน Craft)
    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            alert('อัปเดตสถานะเรียบร้อยแล้ว!');
            fetchDashboardData();
        } catch (err) {
            alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
        }
    };

    if (loading) return <div className="p-12 text-center text-stone-500 font-serif">กำลังดึงข้อมูลสตูดิโอช่างฝีมือ...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8 text-stone-800">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-stone-200 pb-4">
                <div>
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block">Artisan Studio Portal</span>
                    <h2 className="text-3xl font-serif font-bold text-stone-900">แดชบอร์ดช่างฝีมือ & สตูดิโอ</h2>
                    <p className="text-sm text-stone-500">ภาพรวมงานฝีมือ สถิติยอดขาย และคำสั่งซื้อที่อยู่ระหว่างขึ้นรูปประดิษฐ์</p>
                </div>
                <button
                    onClick={() => navigate('/seller/add-product')}
                    className="bg-emerald-800 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                    <Plus className="w-4 h-4" /> ลงขายงานคราฟต์ชิ้นใหม่
                </button>
            </div>

            {/* 4 Cards ด้านบน (กดเลือกเพื่อสลับ Tab ด้านล่างได้) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: รายได้ */}
                <div
                    onClick={() => setActiveTab('revenue')}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${activeTab === 'revenue' ? 'ring-2 ring-emerald-800 bg-emerald-50/80 border-emerald-300 shadow-md' : 'bg-white hover:bg-stone-50 border-stone-200'
                        }`}
                >
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-stone-600">รายได้รวมจากการขาย</span>
                        <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800"><DollarSign className="w-5 h-5" /></div>
                    </div>
                    <span className="text-2xl font-extrabold text-stone-900 block">฿{analytics?.totalRevenue ? analytics.totalRevenue.toLocaleString() : '0'}</span>
                    <span className="text-[11px] text-emerald-700 font-medium">✓ คำสั่งซื้อที่ชำระเงินแล้ว</span>
                </div>

                {/* Card 2: ผลงานที่ลงขาย */}
                <div
                    onClick={() => setActiveTab('products')}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${activeTab === 'products' ? 'ring-2 ring-amber-500 bg-amber-50/80 border-amber-300 shadow-md' : 'bg-white hover:bg-stone-50 border-stone-200'
                        }`}
                >
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-stone-600">ผลงานที่ลงขาย</span>
                        <div className="p-2 rounded-xl bg-amber-100 text-amber-800"><Package className="w-5 h-5" /></div>
                    </div>
                    <span className="text-2xl font-extrabold text-stone-900 block">{products.length} ชิ้น</span>
                    <span className="text-[11px] text-amber-700 font-medium">ในสตูดิโอของคุณ</span>
                </div>

                {/* Card 3: คำสั่งซื้อทั้งหมด */}
                <div
                    onClick={() => setActiveTab('orders')}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${activeTab === 'orders' ? 'ring-2 ring-blue-600 bg-blue-50/80 border-blue-300 shadow-md' : 'bg-white hover:bg-stone-50 border-stone-200'
                        }`}
                >
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-stone-600">คำสั่งซื้อทั้งหมด</span>
                        <div className="p-2 rounded-xl bg-blue-100 text-blue-800"><ShoppingBag className="w-5 h-5" /></div>
                    </div>
                    <span className="text-2xl font-extrabold text-stone-900 block">{orders.length} ออเดอร์</span>
                    <span className="text-[11px] text-blue-700 font-medium">ออเดอร์งานฝีมือ</span>
                </div>

                {/* Card 4: ชิ้นงานที่ประดิษฐ์อยู่ */}
                <div
                    onClick={() => setActiveTab('craft')}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${activeTab === 'craft' ? 'ring-2 ring-purple-600 bg-purple-50/80 border-purple-300 shadow-md' : 'bg-white hover:bg-stone-50 border-stone-200'
                        }`}
                >
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-stone-600">ชิ้นงานที่กำลังประดิษฐ์</span>
                        <div className="p-2 rounded-xl bg-purple-100 text-purple-800"><Hammer className="w-5 h-5" /></div>
                    </div>
                    <span className="text-2xl font-extrabold text-stone-900 block">
                        {orders.filter(o => o.status === 'in_progress' || o.status === 'pending').length} ชิ้น
                    </span>
                    <span className="text-[11px] text-purple-700 font-medium">ชิ้นงาน Handcrafted</span>
                </div>
            </div>

            {/* ----------------- ส่วนแสดงรายละเอียดตาม TAB ที่กดเลือก ----------------- */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">

                {/* TAB 1: สถิติมิติรายได้ */}
                {activeTab === 'revenue' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-100 pb-4">
                            <div>
                                <h3 className="text-lg font-bold flex items-center gap-2 text-stone-900">
                                    <TrendingUp className="w-5 h-5 text-emerald-800" /> สถิติยอดขายและรายได้ร้านค้า
                                </h3>
                                <p className="text-xs text-stone-500">วิเคราะห์แนวโน้มยอดขายและมิติคำสั่งซื้อสำหรับสตูดิโอช่างฝีมือ</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                                <span className="text-xs text-stone-500 font-medium block">ยอดขายเฉลี่ย / ตะกร้า</span>
                                <span className="text-xl font-bold text-stone-800">฿350.00</span>
                                <span className="text-[11px] text-emerald-700 font-semibold block mt-1">↑ +12% จากเดือนที่แล้ว</span>
                            </div>
                            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                                <span className="text-xs text-stone-500 font-medium block">ออเดอร์ที่สำเร็จแล้ว</span>
                                <span className="text-xl font-bold text-stone-800">18 รายการ</span>
                                <span className="text-[11px] text-emerald-700 font-semibold block mt-1">✓ ชำระเงินครบถ้วน</span>
                            </div>
                            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                                <span className="text-xs text-stone-500 font-medium block">อัตราการซื้อซ้ำ (Repeat Customer)</span>
                                <span className="text-xl font-bold text-stone-800">24.5%</span>
                                <span className="text-[11px] text-amber-700 font-semibold block mt-1">★ ลูกค้าประจำสตูดิโอ</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: รายการสินค้าในสตูดิโอ */}
                {activeTab === 'products' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-stone-900">
                                <Package className="w-5 h-5 text-amber-600" /> รายการสินค้าคราฟต์ที่ลงขายไว้
                            </h3>
                            <span className="text-xs text-stone-400">รวมทั้งหมด {products.length} รายการ</span>
                        </div>

                        {products.length === 0 ? (
                            <div className="text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-300 space-y-3">
                                <Package className="w-12 h-12 text-stone-300 mx-auto" />
                                <p className="text-stone-500 font-medium">ยังไม่มีรายการสินค้าที่คุณลงขายไว้ในขณะนี้</p>
                                <button
                                    onClick={() => navigate('/seller/add-product')}
                                    className="text-xs bg-emerald-800 text-white px-4 py-2 rounded-xl font-bold hover:bg-emerald-700 cursor-pointer"
                                >
                                    + เริ่มลงขายสินค้าชิ้นแรก
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {products.map((item) => (
                                    <div key={item.id} className="p-4 border border-stone-200 rounded-xl bg-stone-50/50 flex gap-4 items-center">
                                        <img src={item.image_url || 'https://via.placeholder.com/80'} alt={item.name} className="w-16 h-16 object-cover rounded-lg border border-stone-200" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm text-stone-800 truncate">{item.title || item.name}</h4>
                                            <p className="text-emerald-800 font-extrabold text-sm">฿{item.price}</p>
                                            <p className="text-xs text-stone-400">คลังคงเหลือ: {item.stock || 0} ชิ้น</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: รายการคำสั่งซื้อทั้งหมด */}
                {activeTab === 'orders' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-stone-900">
                            <ShoppingBag className="w-5 h-5 text-blue-600" /> คำสั่งซื้อทั้งหมดจากลูกค้า
                        </h3>

                        {orders.length === 0 ? (
                            <div className="text-center py-10 bg-stone-50 rounded-xl text-stone-400 text-sm border border-stone-200">
                                ยังไม่มีคำสั่งซื้อเข้ามาในขณะนี้
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {orders.map((ord) => (
                                    <div key={ord.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex justify-between items-center">
                                        <div>
                                            <span className="font-bold text-sm block text-stone-900">คำสั่งซื้อ #{ord.id}</span>
                                            <span className="text-xs text-stone-500">ลูกค้า: {ord.buyer_name || 'ผู้ซื้อทั่วไป'} | ยอดรวม: ฿{ord.total_amount}</span>
                                        </div>
                                        <div>
                                            <span className={`text-xs px-3 py-1 rounded-full font-bold ${ord.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                                ord.status === 'in_progress' ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-700'
                                                }`}>
                                                {ord.status === 'completed' ? 'ทำเสร็จ/จัดส่งแล้ว' : ord.status === 'in_progress' ? 'กำลังประดิษฐ์' : 'รอดำเนินการ'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 4: ติดตามกระบวนการประดิษฐ์ (Craft Tracking) */}
                {activeTab === 'craft' && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-bold flex items-center gap-2 text-purple-950">
                                <Hammer className="w-5 h-5 text-purple-700" /> ติดตามสถานะงานช่างฝีมือ (Active Craft Orders)
                            </h3>
                            <p className="text-xs text-stone-500">จัดการอัปเดตขั้นตอนการประดิษฐ์เพื่อให้ผู้ซื้อติดตามความคืบหน้าได้แบบ Real-time</p>
                        </div>

                        <div className="space-y-4">
                            {orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length === 0 ? (
                                <div className="text-center py-10 bg-purple-50/20 rounded-xl text-stone-400 text-sm border border-purple-100">
                                    ไม่มีคำสั่งซื้อที่ค้างอยู่ในกระบวนการประดิษฐ์
                                </div>
                            ) : (
                                orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').map((craftOrd) => (
                                    <div key={craftOrd.id} className="p-5 rounded-2xl border border-purple-200 bg-purple-50/30 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-sm text-purple-950">ออเดอร์งานคราฟต์ #{craftOrd.id}</span>
                                            <span className="text-xs bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full font-bold">กำลังดำเนินการ</span>
                                        </div>
                                        <p className="text-xs text-stone-600">รายการ: {craftOrd.product_name || 'งานสั่งทำพิเศษ (Handmade Custom)'}</p>

                                        {/* ปุ่มเปลี่ยนสถานะด่วน */}
                                        <div className="pt-2 flex gap-2">
                                            <button
                                                onClick={() => handleUpdateOrderStatus(craftOrd.id, 'in_progress')}
                                                className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-amber-600 transition-all cursor-pointer"
                                            >
                                                <Clock className="w-3.5 h-3.5" /> เริ่มประดิษฐ์ชิ้นงาน
                                            </button>
                                            <button
                                                onClick={() => handleUpdateOrderStatus(craftOrd.id, 'completed')}
                                                className="px-3 py-1.5 bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-emerald-700 transition-all cursor-pointer"
                                            >
                                                <CheckCircle className="w-3.5 h-3.5" /> ประดิษฐ์เสร็จสิ้น / พร้อมส่ง
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default SellerDashboard;