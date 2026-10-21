import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ImageUploadDropzone from '../../components/common/ImageUploadDropzone';
import {
  DollarSign, ShoppingBag, Package, Hammer,
  TrendingUp, Plus, CheckCircle, Store, Loader2, AlertCircle,
  MessageSquare, Send, Sparkles, ChevronRight, Image as ImageIcon,
  Calendar, Filter, ArrowUpRight, BarChart3, Clock, CheckCircle2,
  Eye, Search, Award, RefreshCw, X, ExternalLink, Layers, ArrowDownRight
} from 'lucide-react';

function Dashboard() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // 🌟 หมวดหมู่สถิติหลัก: 'revenue' (รายได้), 'orders' (ออเดอร์), 'products' (สินค้า), 'craft' (งานคราฟต์), 'reviews' (รีวิว)
  const [activeTab, setActiveTab] = useState('revenue');

  // 🌟 ตัวกรองช่วงเวลา: 'weekly' (รายสัปดาห์), 'monthly' (รายเดือน), 'yearly' (รายปี), 'all' (ทั้งหมด)
  const [timeframe, setTimeframe] = useState('monthly');

  // State เก็บข้อมูลจริงจาก API หลังบ้าน
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [shopInfo, setShopInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State สำหรับค้นหาและคัดกรองในตารางประวัติย่อย (History Tables)
  const [revenueSearch, setRevenueSearch] = useState('');
  const [revenuePaymentFilter, setRevenuePaymentFilter] = useState('all'); // 'all', 'full', 'deposit'

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all'); // 'all', 'crafting', 'completed', 'pending'

  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');

  // State สำหรับ Modal พรีวิวสลิปโอนเงิน (Slip Lightbox)
  const [previewSlip, setPreviewSlip] = useState(null);

  // State สำหรับจัดการ Modal แก้ไขสินค้า
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [updatingProduct, setUpdatingProduct] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(null);

  // Checkbox State สำหรับ Modal แก้ไขสินค้า
  const [editMadeToOrder, setEditMadeToOrder] = useState(false);
  const [editSupportsCust, setEditSupportsCust] = useState(false);
  const [editAllowDeposit, setEditAllowDeposit] = useState(false);

  // State สำหรับจัดการ Modal ตอบกลับรีวิว
  const [activeReviewModal, setActiveReviewModal] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // ฟังก์ชันดึงข้อมูลรวมของร้านค้าจาก Backend API
  const fetchDashboardData = async (isManualRefresh = false) => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [analyticsRes, productsRes, ordersRes, shopRes, reviewsRes] = await Promise.allSettled([
        api.get(`/shops/analytics/${currentUser.id}`),
        api.get(`/seller/products`),
        api.get(`/seller/orders`),
        api.get(`/shops/seller/${currentUser.id}`),
        api.get(`/seller/reviews`)
      ]);

      if (analyticsRes.status === 'fulfilled') {
        const body = analyticsRes.value?.data;
        setAnalytics(body?.data ?? body ?? null);
      }
      if (productsRes.status === 'fulfilled') {
        const body = productsRes.value?.data;
        setProducts(Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : []);
      }
      if (ordersRes.status === 'fulfilled') {
        const body = ordersRes.value?.data;
        setOrders(Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : []);
      }
      if (shopRes.status === 'fulfilled') {
        const body = shopRes.value?.data;
        const actualShop = body?.data ?? body ?? null;
        setShopInfo(actualShop);
      }
      if (reviewsRes.status === 'fulfilled') {
        const body = reviewsRes.value?.data;
        setReviews(Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser]);

  // ==========================================
  // 🌟 Logic กรองข้อมูลคำสั่งซื้อตามช่วงเวลา (Timeframe Filtering)
  // ==========================================
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders) || orders.length === 0) return [];
    if (timeframe === 'all') return orders;

    const now = new Date();

    return orders.filter(ord => {
      if (!ord.created_at) return true;
      const orderDate = new Date(ord.created_at);
      if (isNaN(orderDate.getTime())) return true;

      const diffMs = now.getTime() - orderDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (timeframe === 'weekly') {
        // ย้อนหลัง 7 วันล่าสุด
        return diffDays <= 7 && diffDays >= -1;
      }
      if (timeframe === 'monthly') {
        // ย้อนหลัง 30 วันล่าสุด
        return diffDays <= 30 && diffDays >= -1;
      }
      if (timeframe === 'yearly') {
        // ย้อนหลัง 365 วันล่าสุด
        return diffDays <= 365 && diffDays >= -1;
      }
      return true;
    });
  }, [orders, timeframe]);

  // คำอธิบายช่วงเวลาแบบเข้าใจง่าย
  const timeframeLabel = useMemo(() => {
    const now = new Date();
    const formatDate = (d) => d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

    if (timeframe === 'weekly') {
      const past = new Date(now);
      past.setDate(past.getDate() - 7);
      return `7 วันล่าสุด (${formatDate(past)} - ${formatDate(now)})`;
    }
    if (timeframe === 'monthly') {
      const past = new Date(now);
      past.setDate(past.getDate() - 30);
      return `30 วันล่าสุด (${formatDate(past)} - ${formatDate(now)})`;
    }
    if (timeframe === 'yearly') {
      const past = new Date(now);
      past.setFullYear(past.getFullYear() - 1);
      return `1 ปีล่าสุด (${formatDate(past)} - ${formatDate(now)})`;
    }
    return 'ข้อมูลประวัติทั้งหมดตลอดระยะเวลาเปิดร้าน';
  }, [timeframe]);

  // ==========================================
  // 💰 1. คำนวณสถิติหมวดหมู่รายได้ (Revenue Metrics)
  // ==========================================
  const revenueStats = useMemo(() => {
    const validOrders = filteredOrders.filter(o => o.status !== 'cancelled');

    const totalRevenue = validOrders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);
    const orderCount = validOrders.length;
    const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

    // รายได้ที่ได้รับชำระแล้ว (Paid / Completed)
    const paidRevenue = validOrders
      .filter(o => o.status === 'paid' || o.status === 'completed' || o.payment_status === 'paid')
      .reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);

    // ยอดมัดจำค้างจ่าย (Deposit Remaining)
    const depositPending = validOrders
      .filter(o => (o.payment_type === 'deposit' || Number(o.deposit_amount) > 0) && o.status !== 'completed')
      .reduce((acc, o) => acc + (Number(o.remaining_balance) || 0), 0);

    // คำสั่งซื้อที่สำเร็จสมบูรณ์
    const completedSales = validOrders.filter(o => o.status === 'completed' || o.craft_status === 'completed').length;

    return {
      totalRevenue,
      orderCount,
      avgOrderValue,
      paidRevenue,
      depositPending,
      completedSales
    };
  }, [filteredOrders]);

  // ==========================================
  // 📦 2. คำนวณสถิติหมวดหมู่ออเดอร์ (Orders Metrics)
  // ==========================================
  const orderStats = useMemo(() => {
    const total = filteredOrders.length;
    const completed = filteredOrders.filter(o => o.status === 'completed' || o.craft_status === 'completed' || o.craft_status === 'จัดส่งพัสดุเรียบร้อยแล้ว').length;
    const inCrafting = filteredOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled' && o.craft_status !== 'completed' && o.craft_status !== 'จัดส่งพัสดุเรียบร้อยแล้ว').length;
    const pendingPayment = filteredOrders.filter(o => o.status === 'pending' || o.payment_status === 'pending').length;
    const cancelled = filteredOrders.filter(o => o.status === 'cancelled').length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inCrafting,
      pendingPayment,
      cancelled,
      completionRate
    };
  }, [filteredOrders]);

  // ==========================================
  // 🛍️ 3. คำนวณสถิติหมวดหมู่สินค้า (Products Metrics)
  // ==========================================
  const productPerformance = useMemo(() => {
    // รวมยอดขายรายสินค้าจากรายการใน filteredOrders
    const salesMap = {};

    filteredOrders.forEach(ord => {
      if (ord.status !== 'cancelled' && Array.isArray(ord.items)) {
        ord.items.forEach(it => {
          const pid = it.product_id || it.id;
          if (!salesMap[pid]) {
            salesMap[pid] = { unitsSold: 0, revenue: 0 };
          }
          const qty = Number(it.quantity) || 1;
          const price = Number(it.price) || 0;
          salesMap[pid].unitsSold += qty;
          salesMap[pid].revenue += qty * price;
        });
      }
    });

    const list = products.map(p => {
      const pStats = salesMap[p.id] || { unitsSold: 0, revenue: 0 };
      const stock = Number(p.stock_quantity ?? p.stock ?? 0);
      const price = Number(p.price) || 0;
      return {
        ...p,
        unitsSold: pStats.unitsSold,
        revenueEarned: pStats.revenue,
        stockNum: stock,
        inventoryValue: stock * price,
        isMadeToOrder: Boolean(Number(p.is_made_to_order ?? 0))
      };
    });

    // เรียงลำดับตามยอดขาย
    list.sort((a, b) => b.unitsSold - a.unitsSold || b.revenueEarned - a.revenueEarned);

    return list;
  }, [products, filteredOrders]);

  const productStats = useMemo(() => {
    const totalListed = products.length;
    const totalUnitsSold = productPerformance.reduce((acc, p) => acc + p.unitsSold, 0);
    const totalInventoryValue = productPerformance.reduce((acc, p) => acc + p.inventoryValue, 0);
    const madeToOrderCount = productPerformance.filter(p => p.isMadeToOrder).length;
    const readyToShipCount = totalListed - madeToOrderCount;
    const lowStockCount = productPerformance.filter(p => !p.isMadeToOrder && p.stockNum <= 3).length;

    return {
      totalListed,
      totalUnitsSold,
      totalInventoryValue,
      madeToOrderCount,
      readyToShipCount,
      lowStockCount
    };
  }, [products, productPerformance]);

  // รายการหมวดหมู่สินค้าทั้งหมดสำหรับ Dropdown Filter
  const uniqueCategories = useMemo(() => {
    const cats = new Set();
    products.forEach(p => {
      const cat = p.category_name || p.category;
      if (cat) cats.add(cat);
    });
    return Array.from(cats);
  }, [products]);

  // ==========================================
  // 📊 คำนวณแท่งกราฟ Bar Chart Visualizations (Pure Tailwind CSS)
  // ==========================================
  const chartBars = useMemo(() => {
    const validOrders = filteredOrders.filter(o => o.status !== 'cancelled');

    if (timeframe === 'weekly') {
      // 7 วันย้อนหลัง
      const days = [];
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayStr = d.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric' });
        const dateKey = d.toISOString().split('T')[0];

        const dayOrders = validOrders.filter(o => {
          if (!o.created_at) return false;
          return o.created_at.startsWith(dateKey);
        });

        const rev = dayOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
        days.push({
          label: dayStr,
          revenue: rev,
          count: dayOrders.length
        });
      }
      return days;
    }

    if (timeframe === 'monthly') {
      // 4 สัปดาห์ย้อนหลัง
      const weeks = [
        { label: 'สัปดาห์ 1', revenue: 0, count: 0 },
        { label: 'สัปดาห์ 2', revenue: 0, count: 0 },
        { label: 'สัปดาห์ 3', revenue: 0, count: 0 },
        { label: 'สัปดาห์ 4', revenue: 0, count: 0 }
      ];

      const now = new Date();
      validOrders.forEach(o => {
        if (!o.created_at) return;
        const d = new Date(o.created_at);
        const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 7) {
          weeks[3].revenue += Number(o.total_amount) || 0;
          weeks[3].count += 1;
        } else if (diffDays <= 14) {
          weeks[2].revenue += Number(o.total_amount) || 0;
          weeks[2].count += 1;
        } else if (diffDays <= 21) {
          weeks[1].revenue += Number(o.total_amount) || 0;
          weeks[1].count += 1;
        } else if (diffDays <= 30) {
          weeks[0].revenue += Number(o.total_amount) || 0;
          weeks[0].count += 1;
        }
      });
      return weeks;
    }

    if (timeframe === 'yearly' || timeframe === 'all') {
      // 12 เดือนของปี
      const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      const months = monthNames.map(m => ({ label: m, revenue: 0, count: 0 }));

      validOrders.forEach(o => {
        if (!o.created_at) return;
        const d = new Date(o.created_at);
        const mIdx = d.getMonth();
        if (mIdx >= 0 && mIdx < 12) {
          months[mIdx].revenue += Number(o.total_amount) || 0;
          months[mIdx].count += 1;
        }
      });
      return months;
    }

    return [];
  }, [filteredOrders, timeframe]);

  const maxChartRevenue = useMemo(() => {
    const max = Math.max(...chartBars.map(b => b.revenue), 100);
    return max > 0 ? max : 100;
  }, [chartBars]);

  // ==========================================
  // 🔍 ตารางประวัติย่อย: ตัวกรองและการค้นหา (History Table Filtering)
  // ==========================================
  const filteredRevenueHistory = useMemo(() => {
    return filteredOrders.filter(ord => {
      // ตัวกรองค้นหา
      const searchMatch = !revenueSearch ||
        String(ord.id).includes(revenueSearch.trim()) ||
        (ord.buyer_name && ord.buyer_name.toLowerCase().includes(revenueSearch.toLowerCase())) ||
        (ord.buyer_email && ord.buyer_email.toLowerCase().includes(revenueSearch.toLowerCase()));

      // ตัวกรองรูปแบบการชำระ
      const isDeposit = ord.payment_type === 'deposit' || Number(ord.deposit_amount) > 0;
      let paymentMatch = true;
      if (revenuePaymentFilter === 'deposit') paymentMatch = isDeposit;
      if (revenuePaymentFilter === 'full') paymentMatch = !isDeposit;

      return searchMatch && paymentMatch;
    });
  }, [filteredOrders, revenueSearch, revenuePaymentFilter]);

  const filteredOrdersHistory = useMemo(() => {
    return filteredOrders.filter(ord => {
      const searchMatch = !orderSearch ||
        String(ord.id).includes(orderSearch.trim()) ||
        (ord.buyer_name && ord.buyer_name.toLowerCase().includes(orderSearch.toLowerCase())) ||
        (Array.isArray(ord.items) && ord.items.some(i => i.title?.toLowerCase().includes(orderSearch.toLowerCase())));

      let statusMatch = true;
      const isCompleted = ord.status === 'completed' || ord.craft_status === 'completed';
      const isCrafting = ord.status !== 'completed' && ord.status !== 'cancelled' && ord.craft_status !== 'completed';
      const isPending = ord.status === 'pending' || ord.payment_status === 'pending';

      if (orderStatusFilter === 'completed') statusMatch = isCompleted;
      if (orderStatusFilter === 'crafting') statusMatch = isCrafting;
      if (orderStatusFilter === 'pending') statusMatch = isPending;

      return searchMatch && statusMatch;
    });
  }, [filteredOrders, orderSearch, orderStatusFilter]);

  const filteredProductHistory = useMemo(() => {
    return productPerformance.filter(p => {
      const searchMatch = !productSearch ||
        p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(productSearch.toLowerCase()));

      const cat = p.category_name || p.category;
      let catMatch = true;
      if (productCategoryFilter !== 'all') {
        catMatch = cat === productCategoryFilter;
      }

      return searchMatch && catMatch;
    });
  }, [productPerformance, productSearch, productCategoryFilter]);

  // ==========================================
  // ⚙️ Handlers สำหรับจัดการ Modal แก้ไขสินค้า
  // ==========================================
  const handleOpenEditModal = (item) => {
    setSelectedProduct(item);
    setEditImageFile(null);
    setEditError(null);
    setEditSuccess(null);
    setEditMadeToOrder(Boolean(Number(item.is_made_to_order ?? 0)));
    setEditSupportsCust(Boolean(Number(item.supports_customization ?? 0)));
    setEditAllowDeposit(Boolean(Number(item.allow_deposit ?? 0)));
  };

  const handleUpdateProductSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setUpdatingProduct(true);
    setEditError(null);
    setEditSuccess(null);

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);

    formData.delete('image');
    if (editImageFile) {
      formData.append('image', editImageFile);
    }

    formData.set('is_made_to_order', editMadeToOrder ? '1' : '0');
    formData.set('supports_customization', editSupportsCust ? '1' : '0');
    formData.set('allow_deposit', editAllowDeposit ? '1' : '0');

    const stockVal = formData.get('stock_quantity') || '0';
    formData.set('stock_quantity', stockVal);
    formData.set('stock', stockVal);

    try {
      const res = await api.put(`/seller/products/${selectedProduct.id}`, formData);
      setEditSuccess(res.data?.message || 'อัปเดตสินค้าเรียบร้อยแล้ว!');
      await fetchDashboardData();

      setTimeout(() => {
        setSelectedProduct(null);
        setEditImageFile(null);
        setEditSuccess(null);
      }, 700);
    } catch (err) {
      console.error('Update product error:', err);
      const errMsg = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดในการอัปเดตสินค้า';
      setEditError(errMsg);
    } finally {
      setUpdatingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้ออกจากระบบ?')) return;
    try {
      const res = await api.delete(`/seller/products/${productId}`);
      alert(res.data?.message || 'ลบสินค้าเรียบร้อยแล้ว');
      setSelectedProduct(null);
      setEditImageFile(null);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบสินค้า');
    }
  };

  // ==========================================
  // 💬 Handlers สำหรับจัดการ Modal ตอบกลับรีวิว
  // ==========================================
  const handleSendReviewReply = async (e) => {
    e.preventDefault();
    if (!activeReviewModal || !replyMessage.trim()) return;

    setSendingReply(true);
    try {
      await api.put(`/seller/reviews/${activeReviewModal.id}/reply`, {
        reply_text: replyMessage.trim()
      });

      setReviews(prevReviews =>
        prevReviews.map(r =>
          r.id === activeReviewModal.id
            ? { ...r, reply_text: replyMessage.trim(), replied_at: new Date().toISOString() }
            : r
        )
      );

      setActiveReviewModal(prev => ({
        ...prev,
        reply_text: replyMessage.trim(),
        replied_at: new Date().toISOString()
      }));

      setReplyMessage('');
      alert('ตอบกลับรีวิวเรียบร้อยแล้วจ้า!');
      fetchDashboardData();
    } catch (err) {
      console.error('Reply review error:', err);
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการตอบกลับรีวิว');
    } finally {
      setSendingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-12 text-center text-stone-500 font-serif space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-800" />
        <span className="text-base text-stone-700 font-medium">กำลังเตรียมข้อมูลศูนย์วิเคราะห์สตูดิโอช่างฝีมือ...</span>
      </div>
    );
  }

  const activeCraftOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled' && o.craft_status !== 'completed');

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 text-stone-800 relative">

      {/* 🌿 ส่วนหัวโปรไฟล์สตูดิโอ (Studio Header) */}
      <div className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-xs">
        <div className="h-44 sm:h-52 w-full bg-stone-200 relative overflow-hidden">
          {shopInfo?.banner_url ? (
            <img src={shopInfo.banner_url} alt="Shop Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 flex items-center justify-center text-stone-300 text-sm">
              <span className="font-serif tracking-wide opacity-80">สตูดิโองานคราฟต์ Craftiverse</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="px-6 pb-6 pt-3 relative flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="flex items-end gap-4 -mt-14 sm:-mt-16">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white bg-stone-100 overflow-hidden shadow-lg flex-shrink-0 relative group">
              {shopInfo?.logo_url ? (
                <img src={shopInfo.logo_url} alt="Shop Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-50">
                  <Store className="w-10 h-10 text-emerald-800" />
                </div>
              )}
            </div>

            <div className="mb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                  {shopInfo?.shop_name || currentUser?.name || 'สตูดิโอช่างฝีมือของฉัน'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200/80">
                  Artisan Studio
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5 line-clamp-1 max-w-lg">
                {shopInfo?.bio || 'ร่วมสร้างสรรค์ผลงานทำมือสุดประณีตเพื่อผู้รับทุกคน'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              title="รีเฟรชข้อมูลล่าสุด"
              className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl transition-all cursor-pointer flex items-center justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-800' : ''}`} />
            </button>
            <button
              onClick={() => navigate('/seller/profile')}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-all cursor-pointer border border-stone-200/60"
            >
              แก้ไขโปรไฟล์ร้าน
            </button>
            <button
              onClick={() => navigate('/seller/add-product')}
              className="bg-emerald-800 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> ลงขายงานชิ้นใหม่
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 🧭 แถบควบคุมศูนย์วิเคราะห์ (Store Analytics Hub Control Bar) */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-800 text-white">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
                ศูนย์วิเคราะห์ข้อมูลร้านค้า (Store Analytics Dashboard)
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              ช่วงเวลาที่กำลังวิเคราะห์: <span className="font-semibold text-emerald-800">{timeframeLabel}</span>
            </p>
          </div>

          {/* 📅 ปุ่มกดเลือกช่วงเวลา 3 แบบ เพื่อกรองข้อมูล (Weekly / Monthly / Yearly) */}
          <div className="flex items-center gap-1.5 bg-stone-100/80 p-1 rounded-2xl border border-stone-200/80 self-start md:self-auto">
            <span className="text-[11px] font-bold text-stone-500 px-2 hidden sm:inline flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> ช่วงเวลา:
            </span>
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeframe === 'weekly'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              รายสัปดาห์ (Weekly)
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeframe === 'monthly'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              รายเดือน (Monthly)
            </button>
            <button
              onClick={() => setTimeframe('yearly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeframe === 'yearly'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              รายปี (Yearly)
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeframe === 'all'
                  ? 'bg-stone-800 text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200/60'
              }`}
              title="ดูข้อมูลตลอดเวลา"
            >
              ทั้งหมด
            </button>
          </div>
        </div>

        {/* 🌟 1. ตัวเลือกหมวดหมู่สถิติหลัก 3 หมวด (+ แท็บเสริมสตูดิโอ) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">

          {/* หมวดที่ 1: 💰 สถิติรายได้ (Revenue) */}
          <button
            onClick={() => setActiveTab('revenue')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
              activeTab === 'revenue'
                ? 'bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border-emerald-400 ring-2 ring-emerald-700 shadow-sm'
                : 'bg-white hover:bg-stone-50/80 border-stone-200'
            }`}
          >
            <div className="flex justify-between items-center mb-1.5">
              <span className={`text-xs font-bold ${activeTab === 'revenue' ? 'text-emerald-900' : 'text-stone-600'}`}>
                💰 สถิติรายได้
              </span>
              <div className={`p-1.5 rounded-xl ${activeTab === 'revenue' ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-800 group-hover:scale-105 transition-transform'}`}>
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <span className="text-xl sm:text-2xl font-extrabold text-stone-900 block tracking-tight">
              ฿{revenueStats.totalRevenue.toLocaleString()}
            </span>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-700 font-medium">
              <span>{revenueStats.completedSales} ออเดอร์ที่สำเร็จ</span>
            </div>
          </button>

          {/* หมวดที่ 2: 📦 สถิติออเดอร์ (Orders) */}
          <button
            onClick={() => setActiveTab('orders')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
              activeTab === 'orders'
                ? 'bg-gradient-to-br from-blue-50 via-sky-50/50 to-white border-blue-400 ring-2 ring-blue-700 shadow-sm'
                : 'bg-white hover:bg-stone-50/80 border-stone-200'
            }`}
          >
            <div className="flex justify-between items-center mb-1.5">
              <span className={`text-xs font-bold ${activeTab === 'orders' ? 'text-blue-900' : 'text-stone-600'}`}>
                📦 สถิติออเดอร์
              </span>
              <div className={`p-1.5 rounded-xl ${activeTab === 'orders' ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-700 group-hover:scale-105 transition-transform'}`}>
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <span className="text-xl sm:text-2xl font-extrabold text-stone-900 block tracking-tight">
              {orderStats.total} รายการ
            </span>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-blue-700 font-medium">
              <span>กำลังทำ {orderStats.inCrafting} | สำเร็จ {orderStats.completed}</span>
            </div>
          </button>

          {/* หมวดที่ 3: 🛍️ สถิติสินค้าที่วางขาย (Products) */}
          <button
            onClick={() => setActiveTab('products')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
              activeTab === 'products'
                ? 'bg-gradient-to-br from-amber-50 via-orange-50/40 to-white border-amber-400 ring-2 ring-amber-600 shadow-sm'
                : 'bg-white hover:bg-stone-50/80 border-stone-200'
            }`}
          >
            <div className="flex justify-between items-center mb-1.5">
              <span className={`text-xs font-bold ${activeTab === 'products' ? 'text-amber-900' : 'text-stone-600'}`}>
                🛍️ สถิติสินค้าที่วางขาย
              </span>
              <div className={`p-1.5 rounded-xl ${activeTab === 'products' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800 group-hover:scale-105 transition-transform'}`}>
                <Package className="w-4 h-4" />
              </div>
            </div>
            <span className="text-xl sm:text-2xl font-extrabold text-stone-900 block tracking-tight">
              {productStats.totalListed} ผลงาน
            </span>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-amber-700 font-medium">
              <span>ขายได้ {productStats.totalUnitsSold} ชิ้นในช่วงนี้</span>
            </div>
          </button>

          {/* แท็บเสริมสตูดิโอ: 🔨 งานคราฟต์ที่กำลังทำ */}
          <button
            onClick={() => setActiveTab('craft')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
              activeTab === 'craft'
                ? 'bg-gradient-to-br from-purple-50 via-stone-50 to-white border-purple-400 ring-2 ring-purple-600 shadow-sm'
                : 'bg-white hover:bg-stone-50/80 border-stone-200'
            }`}
          >
            <div className="flex justify-between items-center mb-1.5">
              <span className={`text-xs font-bold ${activeTab === 'craft' ? 'text-purple-900' : 'text-stone-600'}`}>
                🔨 ติดตามงานคราฟต์
              </span>
              <div className={`p-1.5 rounded-xl ${activeTab === 'craft' ? 'bg-purple-700 text-white' : 'bg-purple-100 text-purple-800 group-hover:scale-105 transition-transform'}`}>
                <Hammer className="w-4 h-4" />
              </div>
            </div>
            <span className="text-xl sm:text-2xl font-extrabold text-stone-900 block tracking-tight">
              {activeCraftOrders.length} ชิ้น
            </span>
            <span className="text-[11px] text-purple-700 font-medium block mt-1">
              งานฝีมือในสตูดิโอ
            </span>
          </button>

          {/* แท็บเสริมสตูดิโอ: 💬 รีวิวลูกค้า */}
          <button
            onClick={() => setActiveTab('reviews')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group col-span-2 sm:col-span-1 ${
              activeTab === 'reviews'
                ? 'bg-gradient-to-br from-rose-50 via-stone-50 to-white border-rose-300 ring-2 ring-rose-500 shadow-sm'
                : 'bg-white hover:bg-stone-50/80 border-stone-200'
            }`}
          >
            <div className="flex justify-between items-center mb-1.5">
              <span className={`text-xs font-bold ${activeTab === 'reviews' ? 'text-rose-900' : 'text-stone-600'}`}>
                💬 รีวิวและความเห็น
              </span>
              <div className={`p-1.5 rounded-xl ${activeTab === 'reviews' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-800 group-hover:scale-105 transition-transform'}`}>
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <span className="text-xl sm:text-2xl font-extrabold text-stone-900 block tracking-tight">
              {reviews.length} รีวิว
            </span>
            <span className="text-[11px] text-rose-700 font-medium block mt-1">
              คะแนนเฉลี่ย {analytics?.avgRating || '5.0'} ★
            </span>
          </button>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 📊 เนื้อหาหลักของแต่ละหมวดหมู่ (Category Content & History Table) */}
      {/* ========================================================= */}
      <div className="space-y-6">

        {/* ----------------------------------------------------- */}
        {/* 💰 หมวดที่ 1: สถิติรายได้ (Revenue Analytics) */}
        {/* ----------------------------------------------------- */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">

            {/* KPI Cards สรุปรายได้ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs text-stone-500 font-medium block">รายได้รวมในช่วงเวลา</span>
                  <span className="text-2xl font-bold text-emerald-900 mt-1 block">
                    ฿{revenueStats.totalRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span>จาก {revenueStats.orderCount} คำสั่งซื้อ</span>
                  <span className="font-semibold text-emerald-800">100% สุทธิ</span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs text-stone-500 font-medium block">ยอดซื้อเฉลี่ยต่อออเดอร์ (AOV)</span>
                  <span className="text-2xl font-bold text-stone-800 mt-1 block">
                    ฿{Math.round(revenueStats.avgOrderValue).toLocaleString()}
                  </span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span>Basket Size</span>
                  <span className="font-semibold text-stone-700">เฉลี่ย / ตะกร้า</span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs text-stone-500 font-medium block">รายได้ที่รับชำระเสร็จสิ้น</span>
                  <span className="text-2xl font-bold text-teal-800 mt-1 block">
                    ฿{revenueStats.paidRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span>โอนเงินผ่านระบบ</span>
                  <span className="font-semibold text-teal-800">ตรวจสอบแล้ว</span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs text-stone-500 font-medium block">ยอดมัดจำรอชำระงวดสอง</span>
                  <span className="text-2xl font-bold text-amber-700 mt-1 block">
                    ฿{revenueStats.depositPending.toLocaleString()}
                  </span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span>งานสั่งทำ 50%</span>
                  <span className="font-semibold text-amber-700">รอส่งมอบ</span>
                </div>
              </div>
            </div>

            {/* แผนภาพแนวโน้มรายได้ (Visual Revenue Trend Chart) */}
            <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-800" />
                    แผนภูมิวิเคราะห์แนวโน้มยอดขายตามช่วงเวลา ({timeframe === 'weekly' ? 'รายวัน' : timeframe === 'monthly' ? 'รายสัปดาห์' : 'รายเดือน'})
                  </h3>
                  <p className="text-xs text-stone-500">เปรียบเทียบสัดส่วนและยอดเงินที่เกิดขึ้นจริงในแต่ละช่วง</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
                  <span className="inline-block w-3 h-3 rounded-sm bg-emerald-800"></span> ยอดขาย (฿)
                </div>
              </div>

              {chartBars.length === 0 || chartBars.every(b => b.revenue === 0) ? (
                <div className="py-10 text-center text-stone-400 text-xs bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                  ยังไม่มีข้อมูลรายได้ที่บันทึกในช่วงเวลานี้ (ลองเลือกดู "รายเดือน" หรือ "รายปี" ได้ที่แถบด้านบน)
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="h-40 flex items-end gap-2 sm:gap-4 pt-4 px-2">
                    {chartBars.map((bar, idx) => {
                      const heightPercent = maxChartRevenue > 0 ? Math.max(6, Math.round((bar.revenue / maxChartRevenue) * 100)) : 6;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                          {/* Tooltip Hover */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-9 bg-stone-900 text-white text-[11px] px-2 py-1 rounded-md shadow-md pointer-events-none whitespace-nowrap z-10">
                            ฿{bar.revenue.toLocaleString()} ({bar.count} ออเดอร์)
                          </div>

                          <div className="w-full bg-stone-100 rounded-t-lg h-full flex flex-col justify-end p-0.5 overflow-hidden">
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className="w-full bg-gradient-to-t from-emerald-800 via-teal-700 to-emerald-600 rounded-t-md group-hover:brightness-110 transition-all duration-300"
                            />
                          </div>
                          <span className="text-[10px] sm:text-[11px] text-stone-500 font-mono truncate max-w-full text-center">
                            {bar.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 📋 ตารางแสดงผลประวัติรายได้ย่อย (Revenue History Table) */}
            <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-800" />
                    ประวัติรายการรับชำระเงินและธุรกรรมรายได้ (Revenue Transactions)
                  </h3>
                  <p className="text-xs text-stone-500">
                    แสดงรายการคำสั่งซื้อที่สร้างรายได้ พร้อมสลิปหลักฐานการโอน
                  </p>
                </div>

                {/* ตัวกรองและค้นหาตาราง */}
                <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                  <div className="relative flex-1 sm:w-48">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      placeholder="ค้นหารหัส/ชื่อผู้ซื้อ..."
                      value={revenueSearch}
                      onChange={(e) => setRevenueSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-800"
                    />
                  </div>

                  <select
                    value={revenuePaymentFilter}
                    onChange={(e) => setRevenuePaymentFilter(e.target.value)}
                    className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-700 outline-none cursor-pointer"
                  >
                    <option value="all">การชำระทุกแบบ</option>
                    <option value="full">ชำระเต็มจำนวน</option>
                    <option value="deposit">มัดจำ 50%</option>
                  </select>
                </div>
              </div>

              {filteredRevenueHistory.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <p className="text-stone-500 font-medium text-sm">ไม่พบรายการธุรกรรมรายได้ตามเงื่อนไขที่เลือก</p>
                  <p className="text-stone-400 text-xs">ลองปรับเปลี่ยนตัวกรองค้นหา หรือเลือกช่วงเวลาเป็น "รายเดือน" หรือ "รายปี"</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50/80 border-b border-stone-200/80 text-stone-600 font-bold">
                      <tr>
                        <th className="py-3 px-4">รหัสคำสั่งซื้อ</th>
                        <th className="py-3 px-4">วันที่ทำรายการ</th>
                        <th className="py-3 px-4">ลูกค้า</th>
                        <th className="py-3 px-4">รูปแบบการชำระ</th>
                        <th className="py-3 px-4">หลักฐานสลิป</th>
                        <th className="py-3 px-4 text-right">ยอดเงินสุทธิ</th>
                        <th className="py-3 px-4 text-center">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredRevenueHistory.map((ord) => {
                        const isDeposit = ord.payment_type === 'deposit' || Number(ord.deposit_amount) > 0;
                        const slipUrl = ord.final_payment_slip_url || ord.payment_slip_url;

                        return (
                          <tr key={ord.id} className="hover:bg-stone-50/60 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                              #{ord.id}
                            </td>
                            <td className="py-3.5 px-4 text-stone-500">
                              {ord.created_at ? new Date(ord.created_at).toLocaleDateString('th-TH', {
                                day: 'numeric',
                                month: 'short',
                                year: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : '-'}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-stone-800 block">{ord.buyer_name || 'ลูกค้าทั่วไป'}</span>
                              <span className="text-[10px] text-stone-400 truncate max-w-[140px] block">{ord.buyer_email || '-'}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              {isDeposit ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                  มัดจำ 50% (เหลือ ฿{Number(ord.remaining_balance || 0).toLocaleString()})
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  ชำระเต็มจำนวน
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              {slipUrl ? (
                                <button
                                  onClick={() => setPreviewSlip(slipUrl)}
                                  className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-bold underline cursor-pointer"
                                >
                                  <ImageIcon className="w-3.5 h-3.5" />
                                  <span>ดูสลิปโอนเงิน</span>
                                </button>
                              ) : (
                                <span className="text-stone-400 italic">ไม่มีสลิป</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right font-extrabold text-sm text-emerald-900">
                              ฿{Number(ord.total_amount || 0).toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                ord.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ord.status === 'paid'
                                  ? 'bg-teal-100 text-teal-800'
                                  : 'bg-stone-200 text-stone-700'
                              }`}>
                                {ord.status === 'completed' ? 'สำเร็จเรียบร้อย' : ord.status === 'paid' ? 'ชำระเงินแล้ว' : ord.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ----------------------------------------------------- */}
        {/* 📦 หมวดที่ 2: สถิติออเดอร์ (Orders Analytics) */}
        {/* ----------------------------------------------------- */}
        {activeTab === 'orders' && (
          <div className="space-y-6">

            {/* KPI Cards สรุปออเดอร์ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs text-stone-500 font-medium block">คำสั่งซื้อทั้งหมดในช่วงเวลา</span>
                  <span className="text-2xl font-bold text-blue-900 mt-1 block">
                    {orderStats.total} ออเดอร์
                  </span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span>จากลูกค้าสตูดิโอ</span>
                  <span className="font-semibold text-blue-800">100% Volume</span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs text-stone-500 font-medium block">กำลังผลิตในสตูดิโอ (In Craft)</span>
                  <span className="text-2xl font-bold text-purple-900 mt-1 block">
                    {orderStats.inCrafting} รายการ
                  </span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span>ช่างฝีมือกำลังดูแล</span>
                  <span className="font-semibold text-purple-800">Work in Progress</span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs text-stone-500 font-medium block">ส่งมอบสำเร็จแล้ว (Completed)</span>
                  <span className="text-2xl font-bold text-emerald-900 mt-1 block">
                    {orderStats.completed} รายการ
                  </span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span>ลูกค้าได้รับชิ้นงานแล้ว</span>
                  <span className="font-semibold text-emerald-800">Delivered</span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs text-stone-500 font-medium block">อัตราสำเร็จคำสั่งซื้อ (Fulfillment)</span>
                  <span className="text-2xl font-bold text-stone-900 mt-1 block">
                    {orderStats.completionRate}%
                  </span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span>ประสิทธิภาพสตูดิโอ</span>
                  <span className="font-semibold text-stone-700">On Target</span>
                </div>
              </div>
            </div>

            {/* แถบสัดส่วนสถานะงานช่างฝีมือ (Craft Stage Breakdown Bar) */}
            <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <Hammer className="w-4 h-4 text-purple-700" />
                    การกระจายตัวของขั้นตอนการผลิต (Craft Journey Distribution)
                  </h3>
                  <p className="text-xs text-stone-500">สัดส่วนออเดอร์ในกระบวนการช่างฝีมือแต่ละขั้นตอน</p>
                </div>
                <Link
                  to="/seller/orders"
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                >
                  <span>ไปหน้าจัดการสเต็ปงานคราฟต์</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {orderStats.total === 0 ? (
                <div className="py-6 text-center text-stone-400 text-xs bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                  ไม่มีคำสั่งซื้อในรอบเวลานี้
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <div className="h-4 w-full bg-stone-100 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${orderStats.total > 0 ? (orderStats.completed / orderStats.total) * 100 : 0}%` }}
                      className="bg-emerald-600 h-full transition-all duration-500"
                      title={`สำเร็จแล้ว: ${orderStats.completed}`}
                    />
                    <div
                      style={{ width: `${orderStats.total > 0 ? (orderStats.inCrafting / orderStats.total) * 100 : 0}%` }}
                      className="bg-purple-600 h-full transition-all duration-500"
                      title={`กำลังประดิษฐ์: ${orderStats.inCrafting}`}
                    />
                    <div
                      style={{ width: `${orderStats.total > 0 ? (orderStats.pendingPayment / orderStats.total) * 100 : 0}%` }}
                      className="bg-amber-500 h-full transition-all duration-500"
                      title={`รอชำระเงิน: ${orderStats.pendingPayment}`}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                    <span className="flex items-center gap-1.5 text-stone-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                      ส่งมอบสำเร็จ ({orderStats.completed})
                    </span>
                    <span className="flex items-center gap-1.5 text-stone-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span>
                      กำลังประดิษฐ์ในสตูดิโอ ({orderStats.inCrafting})
                    </span>
                    <span className="flex items-center gap-1.5 text-stone-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                      รอยืนยันชำระเงิน ({orderStats.pendingPayment})
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 📋 ตารางแสดงผลประวัติคำสั่งซื้อย่อย (Orders History Table) */}
            <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-blue-700" />
                    ประวัติและรายการคำสั่งซื้อตามช่วงเวลา (Orders History Table)
                  </h3>
                  <p className="text-xs text-stone-500">
                    ตรวจสอบรายละเอียดสถานะ รายการสินค้า และความคืบหน้างวดงาน
                  </p>
                </div>

                {/* ตัวกรองและค้นหาตาราง */}
                <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                  <div className="relative flex-1 sm:w-48">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      placeholder="ค้นหารหัส/ชื่อสินค้า..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-800"
                    />
                  </div>

                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-700 outline-none cursor-pointer"
                  >
                    <option value="all">สถานะคำสั่งซื้อทั้งหมด</option>
                    <option value="crafting">กำลังประดิษฐ์</option>
                    <option value="completed">เสร็จสมบูรณ์</option>
                    <option value="pending">รอชำระเงิน</option>
                  </select>
                </div>
              </div>

              {filteredOrdersHistory.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <p className="text-stone-500 font-medium text-sm">ไม่พบคำสั่งซื้อตามตัวกรองที่เลือก</p>
                  <p className="text-stone-400 text-xs">ลองล้างคำค้นหา หรือขยายช่วงเวลาเป็นรายเดือนหรือรายปี</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50/80 border-b border-stone-200/80 text-stone-600 font-bold">
                      <tr>
                        <th className="py-3 px-4">รหัสออเดอร์</th>
                        <th className="py-3 px-4">วันที่สั่งซื้อ</th>
                        <th className="py-3 px-4">ผู้สั่งซื้อ</th>
                        <th className="py-3 px-4">สินค้าคราฟต์</th>
                        <th className="py-3 px-4 text-right">ยอดรวม</th>
                        <th className="py-3 px-4">ขั้นตอนงานคราฟต์</th>
                        <th className="py-3 px-4 text-center">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredOrdersHistory.map((ord) => {
                        const items = Array.isArray(ord.items) ? ord.items : [];
                        const primaryItem = items[0];

                        return (
                          <tr key={ord.id} className="hover:bg-stone-50/60 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                              #{ord.id}
                            </td>
                            <td className="py-3.5 px-4 text-stone-500">
                              {ord.created_at ? new Date(ord.created_at).toLocaleDateString('th-TH', {
                                day: 'numeric',
                                month: 'short',
                                year: '2-digit'
                              }) : '-'}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-stone-800 block">{ord.buyer_name || 'ลูกค้าทั่วไป'}</span>
                              <span className="text-[10px] text-stone-400">{ord.shipping_address ? ord.shipping_address.substring(0, 24) + '...' : 'จัดส่งตามที่อยู่'}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                {primaryItem?.product_image ? (
                                  <img
                                    src={primaryItem.product_image}
                                    alt={primaryItem.product_title}
                                    className="w-8 h-8 rounded-lg object-cover border border-stone-200 flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400">
                                    <Package className="w-4 h-4" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <span className="font-medium text-stone-800 block truncate max-w-[160px]">
                                    {primaryItem?.product_title || `สินค้า #${ord.id}`}
                                  </span>
                                  {items.length > 1 && (
                                    <span className="text-[10px] text-stone-400 font-medium">
                                      + อีก {items.length - 1} ชิ้น
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-right font-extrabold text-sm text-stone-900">
                              ฿{Number(ord.total_amount || 0).toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                ord.status === 'completed' || ord.craft_status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : ord.craft_status
                                  ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                  : 'bg-stone-100 text-stone-700'
                              }`}>
                                <Hammer className="w-3 h-3 text-purple-700" />
                                <span>{ord.craft_status || ord.status || 'รอดำเนินการ'}</span>
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <Link
                                to="/seller/orders"
                                className="inline-flex items-center gap-1 px-3 py-1 bg-stone-100 hover:bg-emerald-100 hover:text-emerald-900 text-stone-700 text-xs font-bold rounded-lg transition-colors"
                              >
                                <span>ดู/อัปเดต</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ----------------------------------------------------- */}
        {/* 🛍️ หมวดที่ 3: สถิติสินค้าที่วางขาย (Products Analytics) */}
        {/* ----------------------------------------------------- */}
        {activeTab === 'products' && (
          <div className="space-y-6">

            {/* KPI Cards สรุปสินค้า */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs text-stone-500 font-medium block">ชิ้นงานที่ลงขายในสตูดิโอ</span>
                  <span className="text-2xl font-bold text-amber-900 mt-1 block">
                    {productStats.totalListed} รายการ
                  </span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span>พร้อมขาย & สั่งทำ</span>
                  <span className="font-semibold text-amber-800">Portfolio</span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs text-stone-500 font-medium block">จำนวนชิ้นที่ขายได้ (Units Sold)</span>
                  <span className="text-2xl font-bold text-emerald-900 mt-1 block">
                    {productStats.totalUnitsSold} ชิ้น
                  </span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span>ในช่วงเวลานี้</span>
                  <span className="font-semibold text-emerald-800">ยอดส่งมอบ</span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs text-stone-500 font-medium block">มูลค่าสต็อกคงเหลือรวม</span>
                  <span className="text-2xl font-bold text-stone-800 mt-1 block">
                    ฿{productStats.totalInventoryValue.toLocaleString()}
                  </span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span>ประเมินจากคลัง</span>
                  <span className="font-semibold text-stone-700">Inventory Value</span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs text-stone-500 font-medium block">งานสั่งทำ (Made-to-Order)</span>
                  <span className="text-2xl font-bold text-teal-900 mt-1 block">
                    {productStats.madeToOrderCount} ชิ้น
                  </span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span>พร้อมส่ง {productStats.readyToShipCount} ชิ้น</span>
                  <span className="font-semibold text-teal-800">Craft Ratio</span>
                </div>
              </div>
            </div>

            {/* ไฮไลต์สินค้าขายดี (Top Performing Products Podium) */}
            <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-600" />
                    ผลงานคราฟต์ยอดนิยม (Top Performing Artworks)
                  </h3>
                  <p className="text-xs text-stone-500">สินค้าที่มียอดสั่งซื้อสูงสุดและสร้างรายได้ให้สตูดิโอของคุณ</p>
                </div>
                <button
                  onClick={() => navigate('/seller/add-product')}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มผลงานชิ้นใหม่</span>
                </button>
              </div>

              {productPerformance.length === 0 ? (
                <div className="py-8 text-center text-stone-400 text-xs bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                  ยังไม่มีสินค้าที่ลงขายในสตูดิโอของคุณ
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {productPerformance.slice(0, 3).map((item, index) => (
                    <div
                      key={item.id}
                      onClick={() => handleOpenEditModal(item)}
                      className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-white hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex gap-3.5 items-center group relative overflow-hidden"
                    >
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold flex items-center justify-center">
                        #{index + 1}
                      </div>

                      <img
                        src={item.image_url || 'https://via.placeholder.com/80'}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-xl border border-stone-200 flex-shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="flex-1 min-w-0 pr-4">
                        <h4 className="font-bold text-xs text-stone-800 truncate group-hover:text-emerald-800">
                          {item.title}
                        </h4>
                        <p className="text-emerald-900 font-extrabold text-sm mt-0.5">
                          ฿{item.price}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500">
                          <span className="font-bold text-amber-800">ขายได้ {item.unitsSold} ชิ้น</span>
                          <span>•</span>
                          <span>คลัง: {item.stockNum}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 📋 ตารางแสดงผลสถิติสินค้าและประวัติยอดขายย่อย (Product Performance History Table) */}
            <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-700" />
                    ตารางวิเคราะห์ผลงานและสถิติยอดจำหน่ายสินค้า (Product Performance Table)
                  </h3>
                  <p className="text-xs text-stone-500">
                    คลิกแถวหรือปุ่มแก้ไขเพื่อปรับปรุงข้อมูล ราคา คลังสินค้า หรือรายละเอียดงานคราฟต์
                  </p>
                </div>

                {/* ตัวกรองและค้นหาตารางสินค้า */}
                <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                  <div className="relative flex-1 sm:w-48">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      placeholder="ค้นหาชื่อผลงาน..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-amber-600"
                    />
                  </div>

                  {uniqueCategories.length > 0 && (
                    <select
                      value={productCategoryFilter}
                      onChange={(e) => setProductCategoryFilter(e.target.value)}
                      className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-700 outline-none cursor-pointer"
                    >
                      <option value="all">ทุกหมวดหมู่งานคราฟต์</option>
                      {uniqueCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {filteredProductHistory.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <p className="text-stone-500 font-medium text-sm">ไม่พบผลงานสินค้าตามตัวกรองที่เลือก</p>
                  <p className="text-stone-400 text-xs">ลองค้นหาด้วยคำอื่น หรือคลิก "ลงขายงานชิ้นใหม่" เพื่อเริ่มต้น</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50/80 border-b border-stone-200/80 text-stone-600 font-bold">
                      <tr>
                        <th className="py-3 px-4">รูป & ชื่อผลงาน</th>
                        <th className="py-3 px-4">หมวดหมู่</th>
                        <th className="py-3 px-4 text-right">ราคาต่อชิ้น</th>
                        <th className="py-3 px-4 text-center">ขายได้ในช่วงนี้</th>
                        <th className="py-3 px-4 text-right">รายได้สะสม</th>
                        <th className="py-3 px-4 text-center">คงเหลือในคลัง</th>
                        <th className="py-3 px-4 text-center">รูปแบบสินค้า</th>
                        <th className="py-3 px-4 text-center">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredProductHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-stone-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image_url || 'https://via.placeholder.com/80'}
                                alt={item.title}
                                className="w-10 h-10 object-cover rounded-xl border border-stone-200 flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="font-bold text-stone-900 block truncate max-w-[180px]">
                                  {item.title}
                                </span>
                                <span className="text-[10px] text-stone-400">
                                  รหัสสินค้า #{item.id}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[11px] font-medium border border-stone-200/60">
                              {item.category_name || item.category || 'ทั่วไป'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-extrabold text-stone-900">
                            ฿{Number(item.price).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="font-extrabold text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                              {item.unitsSold} ชิ้น
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-extrabold text-emerald-900">
                            ฿{item.revenueEarned.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                              item.isMadeToOrder
                                ? 'bg-purple-50 text-purple-800'
                                : item.stockNum <= 2
                                ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                                : 'bg-stone-100 text-stone-700'
                            }`}>
                              {item.isMadeToOrder ? 'ผลิตตามสั่ง' : `${item.stockNum} ชิ้น`}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {item.isMadeToOrder ? (
                              <span className="text-[10px] text-purple-700 font-bold">Made-to-Order</span>
                            ) : (
                              <span className="text-[10px] text-stone-500 font-medium">พร้อมส่ง</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="px-3 py-1 bg-stone-100 hover:bg-emerald-800 hover:text-white text-stone-700 font-bold rounded-lg transition-colors cursor-pointer text-xs"
                            >
                              แก้ไข
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ----------------------------------------------------- */}
        {/* 🔨 แท็บเสริม: ติดตามงานคราฟต์ (Craft Tracker) */}
        {/* ----------------------------------------------------- */}
        {activeTab === 'craft' && (
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Hammer className="w-4 h-4 text-purple-700" />
                  ติดตามสถานะงานช่างฝีมือ (Artisan Craft Tracker)
                </h3>
                <p className="text-xs text-stone-500">ออเดอร์ที่อยู่ในขั้นตอนการผลิต การขึ้นรูป และเตรียมจัดส่ง</p>
              </div>
              <Link
                to="/seller/orders"
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
              >
                <span>ไปที่หน้าจัดการสเต็ปแบบละเอียด (Manage Orders)</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {activeCraftOrders.length === 0 ? (
                <div className="text-center py-12 bg-purple-50/20 rounded-2xl text-stone-400 text-xs border border-purple-100">
                  ไม่มีคำสั่งซื้อที่ค้างอยู่ในกระบวนการประดิษฐ์ในขณะนี้
                </div>
              ) : (
                activeCraftOrders.map((craftOrd) => (
                  <div key={craftOrd.id} className="p-4 rounded-2xl border border-purple-200/80 bg-purple-50/30 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <span className="font-bold text-sm text-purple-950 block">ออเดอร์งานคราฟต์ #{craftOrd.id}</span>
                      <span className="text-xs text-stone-500">ผู้สั่งซื้อ: {craftOrd.buyer_name || 'ลูกค้า'} | ยอดรวม ฿{Number(craftOrd.total_amount || 0).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-bold border border-purple-200">
                        สถานะปัจจุบัน: {craftOrd.craft_status || craftOrd.status}
                      </span>
                      <Link
                        to="/seller/orders"
                        className="p-1.5 hover:bg-purple-100 rounded-lg text-purple-800 transition-colors"
                        title="ไปที่หน้าอัปเดตสเต็ปแบบละเอียด"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------- */}
        {/* 💬 แท็บเสริม: รีวิวและความคิดเห็นลูกค้า (Customer Reviews) */}
        {/* ----------------------------------------------------- */}
        {activeTab === 'reviews' && (
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-rose-600" />
                  รีวิวและความคิดเห็นจากลูกค้า (Customer Reviews)
                </h3>
                <p className="text-xs text-stone-500">ความพึงพอใจและข้อเสนอแนะจากผู้รับผลงานช่างฝีมือ</p>
              </div>
              <span className="text-xs font-bold text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
                รวมทั้งหมด {reviews.length} รายการ
              </span>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-300 space-y-2">
                <MessageSquare className="w-8 h-8 text-stone-300 mx-auto" />
                <p className="text-stone-500 font-medium text-xs">ยังไม่มีรีวิวจากลูกค้าในขณะนี้</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => {
                  const hasReplied = Boolean(rev.reply_text);
                  return (
                    <div key={rev.id} className="p-4 border border-stone-200 rounded-2xl bg-stone-50/50 flex flex-col sm:flex-row gap-4 items-start justify-between">
                      <div className="flex gap-4 items-start">
                        <img
                          src={rev.product_image || 'https://via.placeholder.com/80'}
                          alt={rev.product_name}
                          className="w-14 h-14 object-cover rounded-xl border border-stone-200 flex-shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-sm text-stone-800">{rev.product_name}</h4>
                          <div className="flex items-center gap-1 my-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-sm ${i < rev.rating ? 'text-amber-400' : 'text-stone-300'}`}>★</span>
                            ))}
                            <span className="text-xs text-stone-500 ml-2">โดย {rev.customer_name || 'ลูกค้าผู้ซื้อ'}</span>
                          </div>
                          <p className="text-xs text-stone-600 mt-1">"{rev.comment || 'ไม่มีข้อความรีวิว'}"</p>

                          <div className="mt-2.5">
                            <button
                              onClick={() => {
                                setActiveReviewModal(rev);
                                setReplyMessage('');
                              }}
                              className="relative inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg text-xs font-bold text-stone-700 shadow-2xs transition-all cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-800" />
                              <span>ดูการสนทนา / ตอบกลับ</span>
                              {!hasReplied && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" title="ยังไม่ได้ตอบกลับ" />
                              )}
                              {hasReplied && (
                                <span className="ml-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded-md font-medium">ตอบแล้ว</span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-stone-400 self-end sm:self-start">
                        {rev.created_at ? new Date(rev.created_at).toLocaleDateString('th-TH') : '-'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* 🖼️ MODAL พรีวิวสลิปโอนเงิน (Slip Lightbox Modal) */}
      {/* ========================================================= */}
      {previewSlip && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center border-b pb-2.5">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-800" />
                <h3 className="text-sm font-bold text-stone-900">หลักฐานสลิปการโอนเงิน (Payment Slip)</h3>
              </div>
              <button
                onClick={() => setPreviewSlip(null)}
                className="text-stone-400 hover:text-stone-700 font-bold text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[65vh] overflow-auto rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-center p-2">
              <img
                src={previewSlip}
                alt="Payment Slip Evidence"
                className="max-h-[60vh] w-auto object-contain rounded-lg shadow-xs"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <a
                href={previewSlip}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-800 hover:underline flex items-center gap-1 font-bold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>เปิดดูรูปขนาดเต็มในแท็บใหม่</span>
              </a>
              <button
                onClick={() => setPreviewSlip(null)}
                className="px-4 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 💬 MODAL สนทนาตอบกลับรีวิว (Review Reply Modal) */}
      {/* ========================================================= */}
      {activeReviewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-800" />
                <h3 className="text-lg font-bold text-stone-900">สนทนากับลูกค้า (รีวิวสินค้า)</h3>
              </div>
              <button onClick={() => setActiveReviewModal(null)} className="text-stone-400 hover:text-stone-700 font-bold text-lg cursor-pointer">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[50vh]">
              <div className="flex gap-3 items-start bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {activeReviewModal.customer_name ? activeReviewModal.customer_name.charAt(0) : 'ล'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-stone-900">{activeReviewModal.customer_name || 'ลูกค้า'}</span>
                    <span className="text-[10px] text-stone-400">
                      {activeReviewModal.created_at ? new Date(activeReviewModal.created_at).toLocaleString('th-TH') : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-xs ${i < activeReviewModal.rating ? 'text-amber-400' : 'text-stone-300'}`}>★</span>
                    ))}
                  </div>
                  <p className="text-xs text-stone-700 bg-white p-2.5 rounded-lg border border-stone-200 shadow-2xs inline-block">
                    "{activeReviewModal.comment || 'ไม่มีข้อความรีวิว'}"
                  </p>
                </div>
              </div>

              {activeReviewModal.reply_text ? (
                <div className="flex gap-3 items-start bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200 flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    ร้าน
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-[10px] text-stone-400">
                        {activeReviewModal.replied_at ? new Date(activeReviewModal.replied_at).toLocaleString('th-TH') : 'เพิ่งตอบกลับ'}
                      </span>
                      <span className="font-bold text-xs text-emerald-900">สตูดิโอของคุณ (ร้านค้า)</span>
                    </div>
                    <p className="text-xs text-stone-700 bg-white p-2.5 rounded-lg border border-emerald-200 shadow-2xs inline-block text-left">
                      {activeReviewModal.reply_text}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 bg-stone-50 rounded-xl border border-dashed border-stone-200 text-stone-400 text-xs">
                  ยังไม่มีการตอบกลับจากร้านค้าในรีวิวนี้
                </div>
              )}
            </div>

            <form onSubmit={handleSendReviewReply} className="space-y-3 pt-3 border-t">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">พิมพ์ข้อความตอบกลับลูกค้า</label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="เขียนข้อความขอบคุณหรือชี้แจงลูกค้า..."
                  rows="3"
                  required
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-800 outline-none resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveReviewModal(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
                <button
                  type="submit"
                  disabled={sendingReply || !replyMessage.trim()}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {sendingReply ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{sendingReply ? 'กำลังส่ง...' : 'ส่งคำตอบกลับ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ✏️ MODAL แก้ไขสินค้า (Edit Product Modal) */}
      {/* ========================================================= */}
      {selectedProduct && (
        <div key={selectedProduct.id} className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-stone-900">แก้ไขรายละเอียดงานคราฟต์</h3>
              <button onClick={() => setSelectedProduct(null)} className="text-stone-400 hover:text-stone-700 font-bold text-lg cursor-pointer">✕</button>
            </div>

            {editError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            {editSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{editSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProductSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ชื่อผลงาน / สินค้า <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={selectedProduct.title}
                  required
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    ราคา (บาท) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="price"
                    defaultValue={selectedProduct.price}
                    required
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    จำนวนในคลัง (stock_quantity)
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="stock_quantity"
                    defaultValue={selectedProduct.stock_quantity ?? selectedProduct.stock ?? 0}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    ระยะเวลาประดิษฐ์ (วัน / lead_time_days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="lead_time_days"
                    defaultValue={selectedProduct.lead_time_days ?? 3}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    หมวดหมู่ผลงาน
                  </label>
                  <input
                    type="text"
                    name="category"
                    defaultValue={selectedProduct.category_name || selectedProduct.category || ''}
                    placeholder="เช่น เซรามิก, เครื่องหนัง"
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-800 outline-none"
                  />
                </div>
              </div>

              {/* Controlled Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={editMadeToOrder}
                    onChange={(e) => setEditMadeToOrder(e.target.checked)}
                    className="w-4 h-4 text-emerald-800 rounded focus:ring-emerald-800 cursor-pointer"
                  />
                  <span>สั่งทำตามออเดอร์ (Made-to-order)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={editSupportsCust}
                    onChange={(e) => setEditSupportsCust(e.target.checked)}
                    className="w-4 h-4 text-emerald-800 rounded focus:ring-emerald-800 cursor-pointer"
                  />
                  <span>รองรับการปรับแต่ง (Customization)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-800">
                  <input
                    type="checkbox"
                    checked={editAllowDeposit}
                    onChange={(e) => setEditAllowDeposit(e.target.checked)}
                    className="w-4 h-4 text-emerald-800 rounded focus:ring-emerald-800 cursor-pointer"
                  />
                  <span>อนุญาตให้มัดจำ 50%</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">รายละเอียด / เรื่องราวแรงบันดาลใจ</label>
                <textarea
                  name="description"
                  defaultValue={selectedProduct.description || ''}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-800 outline-none"
                ></textarea>
              </div>

              <ImageUploadDropzone
                label="รูปภาพผลงานสินค้า (แสดงภาพตัวอย่างเดิม / ลากวางเพื่อเปลี่ยนใหม่)"
                helperText="ลากรูปใหม่มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์ (หากไม่เปลี่ยนจะคงรูปเดิมไว้)"
                aspect="square"
                initialUrl={selectedProduct.image_url}
                onFileSelect={(file) => setEditImageFile(file)}
              />

              <div className="flex justify-between items-center pt-4 border-t">
                <button
                  type="button"
                  onClick={() => handleDeleteProduct(selectedProduct.id)}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  ลบสินค้านี้
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(null);
                      setEditImageFile(null);
                      setEditError(null);
                      setEditSuccess(null);
                    }}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={updatingProduct}
                    className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {updatingProduct && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{updatingProduct ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;