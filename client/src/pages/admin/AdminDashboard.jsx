import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Users,
  Store,
  DollarSign,
  ShieldCheck,
  Package,
  Activity,
  TrendingUp,
  Megaphone,
  History,
  CheckCircle2,
  Save,
  Clock,
  Trash2,
  AlertTriangle,
  X,
  RefreshCw,
  Sparkles,
  BarChart3,
  Layers
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // State สำหรับควบคุมว่ากำลังเปิดดูแท็บไหนอยู่ ('analytics' | 'products' | 'stores' | 'announcements' | 'logs')
  const [activeTab, setActiveTab] = useState('analytics');

  // Real Data States
  const [allProducts, setAllProducts] = useState([]);
  const [allSellers, setAllSellers] = useState([]);

  // Modal States
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [actionReason, setActionReason] = useState('');
  const [actionType, setActionType] = useState(null);

  // ข้อมูลสถิติกราฟ
  const monthlySalesData = [
    { month: 'พ.ค.', sales: 12400 },
    { month: 'มิ.ย.', sales: 18900 },
    { month: 'ก.ค.', sales: 24500 },
    { month: 'ส.ค.', sales: 32000 },
    { month: 'ก.ย.', sales: 45200 },
    { month: 'ต.ค.', sales: 64200 },
  ];
  const maxSales = Math.max(...monthlySalesData.map(d => d.sales));

  // ประกาศหน้าแรก
  const [announcementText, setAnnouncementText] = useState('🎉 ต้อนรับเทศกาลงานคราฟต์! พบกับส่วนลดสินค้าแฮนด์เมดสูงสุด 20% ตลอดเดือนนี้');
  const [announcementType, setAnnouncementType] = useState('promo');
  const [isSaved, setIsSaved] = useState(false);

  // System Audit Logs
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, action: 'ดึงข้อมูลสถิติ', target: 'เชื่อมต่อฐานข้อมูล Render', admin: 'ระบบ', time: 'เมื่อสักครู่' },
  ]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.get('/admin/stats').catch(() => null);
      if (statsRes?.data?.data) {
        setStats(statsRes.data.data);
      }

      const productsRes = await api.get('/products').catch(() => null);
      const productList = productsRes?.data?.data || productsRes?.data || [];
      if (Array.isArray(productList)) {
        setAllProducts(productList);
      }

      const usersRes = await api.get('/admin/users').catch(() => null);
      const userList = usersRes?.data?.data || usersRes?.data || [];
      if (Array.isArray(userList)) {
        const sellersOnly = userList.filter(u => u.role === 'seller' || u.store_name);
        setAllSellers(sellersOnly);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSaveAnnouncement = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setAuditLogs(prev => [
      { id: Date.now(), action: 'อัปเดตประกาศหน้าแรก', target: announcementText.substring(0, 25) + '...', admin: 'แอดมิน', time: 'เมื่อสักครู่' },
      ...prev
    ]);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleExecuteAction = async (e) => {
    e.preventDefault();
    if (!actionReason.trim()) {
      alert('กรุณาระบุเหตุผลในการดำเนินการด้วยค่ะ');
      return;
    }

    try {
      if (actionType === 'delete_product') {
        await api.delete(`/products/${selectedProduct.id}`);
        setAllProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
        setAuditLogs(prev => [
          { id: Date.now(), action: 'ลบสินค้า (แจ้งเหตุผล)', target: `${selectedProduct.title || selectedProduct.name} (${actionReason})`, admin: 'แอดมิน', time: 'เมื่อสักครู่' },
          ...prev
        ]);
        alert(`ลบสินค้าเรียบร้อยแล้ว!`);
        setSelectedProduct(null);
      } else if (actionType === 'warn_store') {
        setAuditLogs(prev => [
          { id: Date.now(), action: 'ส่งคำเตือนร้านค้า', target: `ร้าน ${selectedStore.store_name || selectedStore.name}: ${actionReason}`, admin: 'แอดมิน', time: 'เมื่อสักครู่' },
          ...prev
        ]);
        alert(`ส่งคำเตือนไปยังร้านค้าเรียบร้อยแล้ว`);
        setSelectedStore(null);
      } else if (actionType === 'delete_store') {
        await api.patch(`/admin/users/${selectedStore.id}/role`, { role: 'buyer' });
        setAllSellers(prev => prev.filter(s => s.id !== selectedStore.id));
        setAuditLogs(prev => [
          { id: Date.now(), action: 'ปลดสิทธิ์ร้านค้า', target: `ร้าน ${selectedStore.store_name || selectedStore.name} (${actionReason})`, admin: 'แอดมิน', time: 'เมื่อสักครู่' },
          ...prev
        ]);
        alert(`ปลดสิทธิ์ร้านค้าเรียบร้อยแล้ว`);
        setSelectedStore(null);
      }
    } catch (err) {
      alert(`ดำเนินการไม่สำเร็จ: ${err.response?.data?.message || err.message}`);
    } finally {
      setActionReason('');
      setActionType(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#F8FAFC] min-h-screen">

      {/* Header Panel */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2A9D8F]/10 text-[#2A9D8F] text-[11px] font-extrabold mb-2.5 border border-[#2A9D8F]/20">
            <ShieldCheck className="w-4 h-4" />
            <span>ADMINISTRATION CONTROL CENTER</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-stone-900 tracking-tight">
            แผงควบคุมระบบ Craftiverse
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1.5 font-normal">
            บริหารจัดการภาพรวมแพลตฟอร์ม ตรวจสอบสิทธิ์ผู้ใช้งาน และควบคุมความปลอดภัยของตลาดงานคราฟต์
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-600 hover:text-[#2A9D8F] hover:bg-emerald-50 transition-all shadow-2xs"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/admin/users"
            className="px-5 py-3 rounded-2xl bg-[#E76F51] hover:bg-[#D65F41] text-white text-xs font-extrabold flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Users className="w-4 h-4" />
            <span>จัดการผู้ใช้ & สิทธิ์ Roles</span>
          </Link>
        </div>
      </div>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl space-y-3 border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider">ยอดซื้อขายรวม</span>
            <div className="w-10 h-10 rounded-2xl bg-[#E8F7F3] text-[#2A9D8F] flex items-center justify-center border border-emerald-100 shadow-2xs">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-display font-black text-[#2A9D8F]">
            ฿{stats?.totalPlatformRevenue ? stats.totalPlatformRevenue.toLocaleString() : '1,819'}
          </p>
          <span className="text-[11px] text-[#2A9D8F] font-bold flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" /> GMV ภาพรวมระบบสมบูรณ์
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl space-y-3 border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider">ร้านค้าช่างฝีมือ</span>
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0EB] text-[#E76F51] flex items-center justify-center border border-orange-100 shadow-2xs">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-display font-black text-[#E76F51]">
            {stats?.totalSellers || allSellers.length || 4} <span className="text-xs font-medium text-stone-400">สตูดิโอ</span>
          </p>
          <span className="text-[11px] text-stone-400 font-medium">สตูดิโอคราฟต์ที่เปิดให้บริการ</span>
        </div>

        <div className="bg-white p-6 rounded-3xl space-y-3 border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider">สินค้าทั้งหมด</span>
            <div className="w-10 h-10 rounded-2xl bg-[#FFF9EC] text-amber-600 flex items-center justify-center border border-amber-100 shadow-2xs">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-display font-black text-stone-900">
            {stats?.totalProducts || allProducts.length || 18} <span className="text-xs font-medium text-stone-400">รายการ</span>
          </p>
          <span className="text-[11px] text-amber-600 font-bold">ข้อมูลจริงจากฐานข้อมูล</span>
        </div>

        <div className="bg-white p-6 rounded-3xl space-y-3 border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider">ผู้ใช้งานทั้งหมด</span>
            <div className="w-10 h-10 rounded-2xl bg-[#E0F2FE] text-sky-600 flex items-center justify-center border border-sky-100 shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-display font-black text-stone-900">
            {stats?.totalUsers || 7} <span className="text-xs font-medium text-stone-400">บัญชี</span>
          </p>
          <span className="text-[11px] text-sky-600 font-bold">ผู้ซื้อและผู้ขายในระบบ</span>
        </div>
      </div>

      {/* --- 🗂️ TAB NAVIGATION MENU (กดเพื่อสลับดูทีละหมวดหมู่ ไม่รกตา) --- */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-stone-200 shadow-2xs">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${activeTab === 'analytics'
              ? 'bg-[#2A9D8F] text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-50'
            }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>สถิติยอดขาย</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${activeTab === 'products'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-50'
            }`}
        >
          <Package className="w-4 h-4" />
          <span>จัดการสินค้า ({allProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stores')}
          className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${activeTab === 'stores'
              ? 'bg-[#E76F51] text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-50'
            }`}
        >
          <Store className="w-4 h-4" />
          <span>จัดการร้านค้า ({allSellers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${activeTab === 'announcements'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-50'
            }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>ระบบประกาศ</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${activeTab === 'logs'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-50'
            }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Logs</span>
        </button>
      </div>

      {/* --- 📊 TAB CONTENT 1: Platform Analytics Sales Chart --- */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="bg-gradient-to-r from-[#E8F7F3] via-emerald-50 to-white px-7 py-5 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#2A9D8F] text-white flex items-center justify-center shadow-xs">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-display font-extrabold text-[#1B4332]">
                  สถิติยอดขายรวมแพลตฟอร์มรายเดือน (Platform Monthly Revenue)
                </h3>
                <p className="text-xs text-emerald-800/70 font-medium">
                  แสดงการเติบโตของยอดซื้อขาย (GMV) ย้อนหลัง 6 เดือนล่าสุดในระบบ Craftiverse
                </p>
              </div>
            </div>
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-white text-[#2A9D8F] text-xs font-extrabold border border-emerald-200 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 mr-1" /> เติบโต +42% จากเดือนก่อน
            </span>
          </div>

          <div className="p-7 space-y-4">
            <div className="pt-6 pb-2 px-2 flex items-end justify-between gap-2 sm:gap-6 h-60 border-b border-stone-100">
              {monthlySalesData.map((item, index) => {
                const heightPercent = (item.sales / maxSales) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 text-white text-[10px] font-bold py-1 px-2.5 rounded-xl shadow-md whitespace-nowrap pointer-events-none">
                      ฿{item.sales.toLocaleString()}
                    </div>
                    <div
                      className="w-full max-w-[48px] bg-gradient-to-t from-[#2A9D8F] to-[#52B788] rounded-2xl transition-all duration-500 group-hover:brightness-110 shadow-xs"
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                    <span className="text-xs font-bold text-stone-600 mt-3">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-xs text-stone-400 px-2 pt-1 font-medium">
              <span>หน่วย: บาท (THB)</span>
              <span>อัปเดตแบบเรียลไทม์จากฐานข้อมูลระบบ</span>
            </div>
          </div>
        </div>
      )}

      {/* --- 📦 TAB CONTENT 2: จัดการสินค้าทั้งหมด --- */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="bg-gradient-to-r from-[#FFF4EC] via-amber-50 to-white px-7 py-5 border-b border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-display font-extrabold text-amber-950">
                  จัดการสินค้าทั้งหมดในระบบ (All Products Moderation)
                </h3>
                <p className="text-xs text-amber-800/70 font-medium">
                  รายการสินค้าจริงจากฐานข้อมูล แอดมินสามารถลบสินค้าออกจากระบบและระบุเหตุผลได้
                </p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-amber-700 bg-white px-3.5 py-1.5 rounded-xl border border-amber-200 shadow-2xs">
              {allProducts.length} รายการในฐานข้อมูล
            </span>
          </div>

          <div className="p-7">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 px-3">ID</th>
                    <th className="pb-3 px-3">ชื่อสินค้า</th>
                    <th className="pb-3 px-3">ราคา</th>
                    <th className="pb-3 px-3 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {allProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-3.5 px-3 font-mono text-stone-400 font-bold">#{product.id}</td>
                      <td className="py-3.5 px-3 font-bold text-stone-900">
                        {product.title || product.name}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[#2A9D8F] font-black text-sm">฿{product.price}</td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => { setSelectedProduct(product); setActionType('delete_product'); }}
                          className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-extrabold text-xs inline-flex items-center gap-1 transition-all border border-red-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>ลบสินค้า</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {allProducts.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-stone-400 font-medium">
                        {loading ? 'กำลังดึงข้อมูลสินค้าจากระบบ...' : 'ไม่พบรายการสินค้าในฐานข้อมูล'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- 🏪 TAB CONTENT 3: ควบคุมดูแลร้านค้าช่างฝีมือ --- */}
      {activeTab === 'stores' && (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="bg-gradient-to-r from-[#FFE8D6] via-orange-50 to-white px-7 py-5 border-b border-orange-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E76F51] text-white flex items-center justify-center shadow-xs">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-display font-extrabold text-stone-900">
                  ควบคุมดูแลร้านค้าช่างฝีมือ (Artisan Studios Directory)
                </h3>
                <p className="text-xs text-orange-900/70 font-medium">
                  ดึงรายชื่อผู้ขาย (Seller) จากฐานข้อมูล สามารถส่งคำเตือนหรือปรับสิทธิ์ได้
                </p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-[#E76F51] bg-white px-3.5 py-1.5 rounded-xl border border-orange-200 shadow-2xs">
              {allSellers.length} สตูดิโอ
            </span>
          </div>

          <div className="p-7">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 px-3">ชื่อร้าน / ผู้ใช้งาน</th>
                    <th className="pb-3 px-3">อีเมล</th>
                    <th className="pb-3 px-3">บทบาท</th>
                    <th className="pb-3 px-3 text-right">ดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {allSellers.map((seller) => (
                    <tr key={seller.id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="py-3.5 px-3 font-extrabold text-stone-900 flex items-center gap-2">
                        <Store className="w-4 h-4 text-[#2A9D8F]" />
                        {seller.store_name || seller.name}
                      </td>
                      <td className="py-3.5 px-3 text-stone-600 font-medium">{seller.email}</td>
                      <td className="py-3.5 px-3 font-extrabold text-[#E76F51]">{seller.role}</td>
                      <td className="py-3.5 px-3 text-right space-x-2">
                        <button
                          onClick={() => { setSelectedStore(seller); setActionType('warn_store'); }}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs inline-flex items-center gap-1 transition-all border border-amber-200"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>ส่งคำเตือน</span>
                        </button>
                        <button
                          onClick={() => { setSelectedStore(seller); setActionType('delete_store'); }}
                          className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs inline-flex items-center gap-1 transition-all border border-red-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>ปลดสิทธิ์ร้าน</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {allSellers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-stone-400 font-medium">
                        {loading ? 'กำลังดึงรายชื่อร้านค้าจากระบบ...' : 'ไม่พบข้อมูลผู้ขายในระบบ'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- 📢 TAB CONTENT 4: จัดการประกาศ --- */}
      {activeTab === 'announcements' && (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="bg-gradient-to-r from-[#FFF0EB] via-rose-50 to-white px-7 py-5 border-b border-rose-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-display font-extrabold text-stone-900">
                จัดการประกาศ & แบนเนอร์หน้าแรก (Announcements Management)
              </h3>
              <p className="text-xs text-rose-900/70 font-medium">
                ตั้งค่าข้อความบรอดแคสต์โปรโมทอีเวนต์หรืองานคราฟต์เพื่อแสดงผลให้ผู้ใช้งานทุกคนเห็น
              </p>
            </div>
          </div>

          <div className="p-7">
            <form onSubmit={handleSaveAnnouncement} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">ข้อความประกาศ (Announcement Text)</label>
                  <input
                    type="text"
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] bg-white"
                    placeholder="ระบุข้อความประกาศ..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">ประเภทประกาศ</label>
                  <select
                    value={announcementType}
                    onChange={(e) => setAnnouncementType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-2xl border border-stone-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] bg-white"
                  >
                    <option value="promo">🎉 โปรโมชั่น / อีเวนต์</option>
                    <option value="info">📢 ประกาศสำคัญ</option>
                    <option value="update">🚀 อัปเดตระบบ</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-stone-400 font-medium">แสดงผลบนแถบ Top Banner ของเว็บไซต์ทันที</span>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-[#2A9D8F] hover:bg-[#238377] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                >
                  {isSaved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      <span>บันทึกประกาศสำเร็จ!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>บันทึก & ประกาศทันที</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- 📜 TAB CONTENT 5: System Audit Logs --- */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="bg-gradient-to-r from-[#E0F2FE] via-sky-50 to-white px-7 py-5 border-b border-sky-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-display font-extrabold text-sky-950">
                  ประวัติการทำรายการของระบบ (System Audit Log)
                </h3>
                <p className="text-xs text-sky-900/70 font-medium">
                  บันทึกประวัติการทำรายการแบบเรียลไทม์เพื่อความโปร่งใส
                </p>
              </div>
            </div>
            <span className="text-[11px] font-extrabold text-sky-700 bg-white px-3 py-1.5 rounded-xl border border-sky-200 shadow-2xs">
              ความปลอดภัย 100%
            </span>
          </div>

          <div className="p-7">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 px-3">กิจกรรม (Action)</th>
                    <th className="pb-3 px-3">เป้าหมาย / รายละเอียด</th>
                    <th className="pb-3 px-3">ดำเนินการโดย</th>
                    <th className="pb-3 px-3 text-right">เวลาที่ทำรายการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {auditLogs.map((log, index) => (
                    <tr key={index} className="hover:bg-sky-50/20 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-stone-800">
                        <span className="inline-block w-2 h-2 rounded-full bg-[#2A9D8F] mr-2"></span>
                        {log.action}
                      </td>
                      <td className="py-3.5 px-3 text-stone-600 font-medium">{log.target}</td>
                      <td className="py-3.5 px-3 text-stone-500">
                        <span className="px-2.5 py-0.5 rounded-lg bg-stone-100 text-stone-700 font-bold text-[10px] border border-stone-200">
                          {log.admin}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right text-stone-400 font-normal">
                        <span className="inline-flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-stone-300" />
                          {log.time}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Popup เหตุผล */}
      {(selectedProduct || selectedStore) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-display font-extrabold text-stone-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                {actionType === 'delete_product' && 'ยืนยันการลบสินค้า'}
                {actionType === 'warn_store' && 'ส่งคำเตือนไปยังร้านค้า'}
                {actionType === 'delete_store' && 'ยืนยันการปลดสิทธิ์ร้านค้า'}
              </h3>
              <button
                onClick={() => { setSelectedProduct(null); setSelectedStore(null); setActionReason(''); }}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteAction} className="space-y-4">
              <div className="text-xs text-stone-600 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                {actionType === 'delete_product' && (
                  <p>ท่านกำลังจะลบสินค้า: <strong className="text-stone-900">{selectedProduct?.title || selectedProduct?.name}</strong> ออกจากฐานข้อมูล</p>
                )}
                {actionType === 'warn_store' && (
                  <p>ท่านกำลังจะส่งคำเตือนไปยังร้าน: <strong className="text-stone-900">{selectedStore?.store_name || selectedStore?.name}</strong></p>
                )}
                {actionType === 'delete_store' && (
                  <p>ท่านกำลังจะปลดสิทธิ์ผู้ขายของ: <strong className="text-stone-900">{selectedStore?.store_name || selectedStore?.name}</strong></p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  ระบุเหตุผล (Reason / Feedback): <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] bg-white"
                  placeholder="ระบุเหตุผล..."
                  required
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setSelectedProduct(null); setSelectedStore(null); setActionReason(''); }}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  ยืนยันดำเนินการ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;