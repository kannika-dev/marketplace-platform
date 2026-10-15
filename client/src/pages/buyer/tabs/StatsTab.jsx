import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    Heart,
    ShoppingBag,
    Award,
    Sparkles,
    TrendingUp,
    PieChart,
    ShieldCheck,
    Users,
    CheckCircle2
} from 'lucide-react';
import { getMyOrders } from '../../../services/orderService';
import api from '../../../services/api';

export const StatsTab = () => {
    const [orders, setOrders] = useState([]);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('monthly'); // 'monthly' หรือ 'yearly'
    const [dataType, setDataType] = useState('count'); // 'count' หรือ 'amount'

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            try {
                setLoading(true);
                const orderRes = await getMyOrders();
                if (orderRes.success) {
                    setOrders(orderRes.data || []);
                }

                try {
                    const wishRes = await api.get('/wishlist');
                    if (wishRes.data?.success) {
                        setWishlistCount(wishRes.data.data.length || 0);
                    }
                } catch (e) {
                    const localWish = JSON.parse(localStorage.getItem('wishlist') || '[]');
                    setWishlistCount(localWish.length);
                }
            } catch (err) {
                console.error('Error fetching analytics data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalyticsData();
    }, []);

    // กรองเฉพาะออเดอร์ที่สำเร็จแล้ว (completed)
    const completedOrders = orders.filter(
        o => o.craft_status === 'completed' || o.status === 'completed'
    );

    const totalSpent = completedOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const totalCompletedCount = completedOrders.length;

    // นับจำนวนร้านค้า/ช่างฝีมือที่ไม่ซ้ำกันที่เคยอุดหนุน
    const uniqueSellers = new Set();
    completedOrders.forEach(o => {
        if (o.seller_id) uniqueSellers.add(o.seller_id);
        if (o.items) {
            o.items.forEach(it => { if (it.seller_id) uniqueSellers.add(it.seller_id); });
        }
    });
    const sellerCount = uniqueSellers.size || (completedOrders.length > 0 ? 1 : 0);

    // คำนวณระดับนักสะสม (Collector Rank)
    const getCollectorRank = (count) => {
        if (count >= 6) return { title: 'Master Collector', color: 'text-purple-700 bg-purple-50 border-purple-200' };
        if (count >= 3) return { title: 'Handmade Enthusiast', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
        return { title: 'Craft Beginner', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    };

    const currentRank = getCollectorRank(totalCompletedCount);

    // ประมวลผลหมวดหมู่ยอดนิยม (Mockup + Real Calculation logic)
    const categoryStats = [
        { name: 'งานเย็บปักถักร้อย', percent: 45, color: 'bg-emerald-500' },
        { name: 'เทียนหอม & สกินแคร์', percent: 35, color: 'bg-amber-500' },
        { name: 'เซรามิก & งานดิน', percent: 20, color: 'bg-rose-500' }
    ];

    // ข้อมูลกราฟรายเดือน
    const getMonthlyChartData = () => {
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const dataMap = Array(12).fill(0).map((_, i) => ({
            label: months[i],
            count: 0,
            amount: 0
        }));

        completedOrders.forEach(order => {
            const date = new Date(order.created_at);
            const monthIdx = date.getMonth();
            if (!isNaN(monthIdx) && dataMap[monthIdx]) {
                dataMap[monthIdx].count += (order.items?.length || 1);
                dataMap[monthIdx].amount += Number(order.total_amount || 0);
            }
        });

        return dataMap;
    };

    // ข้อมูลกราฟรายปี
    const getYearlyChartData = () => {
        const yearMap = {};
        completedOrders.forEach(order => {
            const year = new Date(order.created_at).getFullYear();
            if (!yearMap[year]) {
                yearMap[year] = { label: String(year), count: 0, amount: 0 };
            }
            yearMap[year].count += (order.items?.length || 1);
            yearMap[year].amount += Number(order.total_amount || 0);
        });

        const result = Object.values(yearMap);
        if (result.length === 0) {
            const currentYear = new Date().getFullYear();
            return [{ label: String(currentYear), count: 0, amount: 0 }];
        }
        return result;
    };

    const chartData = viewMode === 'monthly' ? getMonthlyChartData() : getYearlyChartData();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                    <h3 className="text-lg font-display font-bold text-stone-900">สถิติการใช้งาน &amp; เรื่องราวการสนับสนุนงานคราฟต์</h3>
                    <p className="text-xs text-stone-500">Collector Dashboard: สรุปผลงานและผลกระทบที่คุณสร้างร่วมกับช่างฝีมือ</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Collector Dashboard
                </span>
            </div>

            {/* Top Stat Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center space-y-1">
                    <ShoppingBag className="w-6 h-6 text-[#2A9D8F] mx-auto mb-1" />
                    <span className="text-xs text-stone-500">ออเดอร์สำเร็จ</span>
                    <strong className="block text-xl font-extrabold text-stone-800">
                        {loading ? '...' : `${totalCompletedCount} รายการ`}
                    </strong>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 text-center space-y-1">
                    <Heart className="w-6 h-6 text-[#E76F51] mx-auto mb-1" />
                    <span className="text-xs text-stone-500">สินค้าใน Wishlist</span>
                    <strong className="block text-xl font-extrabold text-stone-800">
                        {loading ? '...' : `${wishlistCount} ชิ้น`}
                    </strong>
                </div>

                <div className={`p-4 rounded-2xl border text-center space-y-1 ${currentRank.color}`}>
                    <Award className="w-6 h-6 mx-auto mb-1 text-amber-600" />
                    <span className="text-xs opacity-75">ระดับนักสะสม (Level)</span>
                    <strong className="block text-lg font-extrabold">{currentRank.title}</strong>
                </div>
            </div>

            {/* Middle Section: ยอดสนับสนุนรวม & หมวดหมู่ที่ชอบ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ยอดสนับสนุนรวม */}
                <div className="p-5 bg-stone-50 rounded-3xl border border-stone-200 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                        <span className="text-xs font-bold text-stone-500 block">💳 ยอดสนับสนุนรวม</span>
                        <div className="text-3xl font-extrabold text-stone-900">
                            ฿{totalSpent.toLocaleString()}
                        </div>
                    </div>
                    <div className="p-3 bg-white rounded-2xl border border-stone-200 flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                            <Users className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-stone-700">
                            กระจายรายได้สนับสนุนช่างฝีมือไปแล้ว <strong className="text-[#2A9D8F]">{sellerCount}</strong> ร้านค้า/ชุมชน
                        </span>
                    </div>
                </div>

                {/* หมวดหมู่ที่อุดหนุนบ่อยที่สุด */}
                <div className="p-5 bg-stone-50 rounded-3xl border border-stone-200 space-y-3">
                    <span className="text-xs font-bold text-stone-500 flex items-center gap-1.5">
                        <PieChart className="w-4 h-4 text-[#2A9D8F]" /> หมวดหมู่ที่อุดหนุนบ่อยที่สุด
                    </span>
                    <div className="space-y-2.5 pt-1">
                        {categoryStats.map((cat, idx) => (
                            <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-xs font-bold text-stone-700">
                                    <span className="flex items-center gap-1.5">
                                        <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                                        {cat.name}
                                    </span>
                                    <span>{cat.percent}%</span>
                                </div>
                                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                                    <div style={{ width: `${cat.percent}%` }} className={`h-full ${cat.color} rounded-full`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Interactive Graph Section: รายเดือน / รายปี */}
            <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h4 className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4 text-[#2A9D8F]" /> แนวโน้มช่วงเวลาและการสั่งซื้อผลงาน
                        </h4>
                        <p className="text-xs text-stone-400">สถิติความถี่ในการสะสมงานคราฟต์ตามช่วงเวลา</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="inline-flex p-1 bg-stone-100 rounded-xl text-xs font-bold">
                            <button
                                onClick={() => setDataType('count')}
                                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${dataType === 'count' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
                                    }`}
                            >
                                จำนวนชิ้น
                            </button>
                            <button
                                onClick={() => setDataType('amount')}
                                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${dataType === 'amount' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
                                    }`}
                            >
                                ยอดเงิน (฿)
                            </button>
                        </div>

                        <div className="inline-flex p-1 bg-stone-100 rounded-xl text-xs font-bold">
                            <button
                                onClick={() => setViewMode('monthly')}
                                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${viewMode === 'monthly' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
                                    }`}
                            >
                                รายเดือน
                            </button>
                            <button
                                onClick={() => setViewMode('yearly')}
                                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${viewMode === 'yearly' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
                                    }`}
                            >
                                รายปี
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bar Chart Display */}
                <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 pt-4 pb-2 items-end h-44 border-b border-stone-100 overflow-x-auto">
                    {chartData.map((item, index) => {
                        const val = dataType === 'count' ? item.count : item.amount;
                        const maxVal = Math.max(...chartData.map(d => dataType === 'count' ? d.count : d.amount)) || 1;
                        const maxHeight = 110;
                        const barHeight = Math.max(12, (val / maxVal) * maxHeight);

                        return (
                            <div key={index} className="flex flex-col items-center gap-2 h-full justify-end group min-w-[32px]">
                                <span className="text-[10px] font-bold text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {dataType === 'count' ? `${val} ชิ้น` : `฿${val.toLocaleString()}`}
                                </span>
                                <div
                                    style={{ height: `${barHeight}px` }}
                                    className="w-full max-w-[32px] bg-[#2A9D8F] hover:bg-[#21867a] rounded-t-xl transition-all shadow-sm"
                                />
                                <span className="text-[11px] font-bold text-stone-600 truncate">{item.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Impact & Badges Section */}
            <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200 space-y-4">
                <h4 className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" /> Impact &amp; Badges ปลดล็อกแล้ว
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className={`p-3.5 rounded-2xl border flex items-center gap-3 bg-white border-stone-200 ${totalCompletedCount >= 3 ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                        <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                            <Award className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-stone-800 block">🏅 Patron Badge</span>
                            <span className="text-[11px] text-stone-500">
                                {totalCompletedCount >= 3 ? 'ปลดล็อกแล้ว: สั่งซื้อสำเร็จครบ 3 ครั้ง' : 'สั่งซื้อสำเร็จครบ 3 ครั้ง (สะสมอยู่)'}
                            </span>
                        </div>
                    </div>

                    <div className={`p-3.5 rounded-2xl border flex items-center gap-3 bg-white border-stone-200 ${sellerCount >= 3 ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                        <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-stone-800 block">🤝 Community Helper</span>
                            <span className="text-[11px] text-stone-500">
                                {sellerCount >= 3 ? 'ปลดล็อกแล้ว: อุดหนุนช่างฝีมือครบ 3 ชุมชน' : 'อุดหนุนช่างฝีมือครบ 3 ชุมชน'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsTab;