import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ImageUploadDropzone from '../../components/common/ImageUploadDropzone';
import {
  DollarSign, ShoppingBag, Package, Hammer,
  TrendingUp, Plus, CheckCircle, Clock, Store, Loader2, AlertCircle, MessageSquare, Send, Sparkles
} from 'lucide-react';

function Dashboard() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('revenue');
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]); // State สำหรับเก็บข้อมูลรีวิว
  const [shopInfo, setShopInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // State สำหรับจัดการ Modal แก้ไขสินค้า
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [updatingProduct, setUpdatingProduct] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(null);

  // State สำหรับจัดการ Modal สนทนาตอบกลับรีวิว
  const [activeReviewModal, setActiveReviewModal] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const fetchDashboardData = async () => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [analyticsRes, productsRes, ordersRes, shopRes, reviewsRes] = await Promise.allSettled([
        api.get(`/shops/analytics/${currentUser.id}`),
        api.get(`/seller/products`),
        api.get(`/orders/seller/${currentUser.id}`),
        api.get(`/shops/seller/${currentUser.id}`),
        api.get(`/seller/reviews`) // ดึงข้อมูลรีวิวของร้านค้า
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
        setShopInfo(body ?? null);
      }
      if (reviewsRes.status === 'fulfilled') {
        const body = reviewsRes.value?.data;
        setReviews(Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    fetchDashboardData();

    return () => clearTimeout(fallbackTimer);
  }, [currentUser]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      alert('อัปเดตสถานะเรียบร้อยแล้ว!');
      fetchDashboardData();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
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

    const isMadeToOrderInput = formElement.elements['is_made_to_order'];
    formData.set('is_made_to_order', isMadeToOrderInput && isMadeToOrderInput.checked ? '1' : '0');

    const supportsCustInput = formElement.elements['supports_customization'];
    formData.set('supports_customization', supportsCustInput && supportsCustInput.checked ? '1' : '0');

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

  // ฟังก์ชันส่งข้อความตอบกลับรีวิว
  const handleSendReviewReply = async (e) => {
    e.preventDefault();
    if (!activeReviewModal || !replyMessage.trim()) return;

    setSendingReply(true);
    try {
      await api.put(`/seller/reviews/${activeReviewModal.id}/reply`, {
        reply_text: replyMessage.trim()
      });

      // อัปเดตข้อมูลใน State ทันทีเพื่อให้แสดงผลสอดคล้องกัน
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
      <div className="p-12 text-center text-stone-500 font-serif">
        กำลังดึงข้อมูลสตูดิโอช่างฝีมือ...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 text-stone-800 relative">

      {/* 🌿 ส่วนหัวโปรไฟล์สตูดิโอ */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="h-48 w-full bg-stone-200 relative">
          {shopInfo?.banner_url ? (
            <img src={shopInfo.banner_url} alt="Shop Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-emerald-800 to-teal-900 flex items-center justify-center text-stone-300 text-sm">
              ยังไม่ได้ตั้งค่าภาพปกแบนเนอร์สตูดิโอ
            </div>
          )}
        </div>

        <div className="px-6 pb-6 pt-4 relative flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="flex items-end gap-4 -mt-12 sm:-mt-16">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white bg-stone-100 overflow-hidden shadow-md flex-shrink-0">
              {shopInfo?.logo_url ? (
                <img src={shopInfo.logo_url} alt="Shop Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-400">
                  <Store className="w-8 h-8" />
                </div>
              )}
            </div>

            <div className="mb-1">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                {shopInfo?.shop_name || currentUser?.name || 'สตูดิโอช่างฝีมือของฉัน'}
              </h1>
              <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                {shopInfo?.bio || 'ยังไม่ได้ระบุประวัติหรือเรื่องราวแรงบันดาลใจสตูดิโอ'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => navigate('/seller/profile')}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-all"
            >
              แก้ไขโปรไฟล์ร้าน
            </button>
            <button
              onClick={() => navigate('/seller/add-product')}
              className="bg-emerald-800 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" /> ลงขายงานชิ้นใหม่
            </button>
          </div>
        </div>
      </div>

      {/* การ์ดสถิติด้านบน (เพิ่มการ์ดรีวิว) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div
          onClick={() => setActiveTab('revenue')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${activeTab === 'revenue' ? 'ring-2 ring-emerald-800 bg-emerald-50/80 border-emerald-300 shadow-md' : 'bg-white hover:bg-stone-50 border-stone-200'}`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-stone-600">รายได้รวมจากการขาย</span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800"><DollarSign className="w-5 h-5" /></div>
          </div>
          <span className="text-2xl font-extrabold text-stone-900 block">฿{analytics?.totalRevenue ? analytics.totalRevenue.toLocaleString() : '0'}</span>
          <span className="text-[11px] text-emerald-700 font-medium">✓ คำสั่งซื้อที่ชำระเงินแล้ว</span>
        </div>

        <div
          onClick={() => setActiveTab('products')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${activeTab === 'products' ? 'ring-2 ring-amber-500 bg-amber-50/80 border-amber-300 shadow-md' : 'bg-white hover:bg-stone-50 border-stone-200'}`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-stone-600">ผลงานที่ลงขาย</span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800"><Package className="w-5 h-5" /></div>
          </div>
          <span className="text-2xl font-extrabold text-stone-900 block">{products.length} ชิ้น</span>
          <span className="text-[11px] text-amber-700 font-medium">ในสตูดิโอของคุณ</span>
        </div>

        <div
          onClick={() => setActiveTab('orders')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${activeTab === 'orders' ? 'ring-2 ring-blue-600 bg-blue-50/80 border-blue-300 shadow-md' : 'bg-white hover:bg-stone-50 border-stone-200'}`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-stone-600">คำสั่งซื้อทั้งหมด</span>
            <div className="p-2 rounded-xl bg-blue-100 text-blue-800"><ShoppingBag className="w-5 h-5" /></div>
          </div>
          <span className="text-2xl font-extrabold text-stone-900 block">{orders.length} ออเดอร์</span>
          <span className="text-[11px] text-blue-700 font-medium">ออเดอร์งานฝีมือ</span>
        </div>

        <div
          onClick={() => setActiveTab('craft')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${activeTab === 'craft' ? 'ring-2 ring-purple-600 bg-purple-50/80 border-purple-300 shadow-md' : 'bg-white hover:bg-stone-50 border-stone-200'}`}
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

        <div
          onClick={() => setActiveTab('reviews')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${activeTab === 'reviews' ? 'ring-2 ring-amber-600 bg-amber-50/80 border-amber-300 shadow-md' : 'bg-white hover:bg-stone-50 border-stone-200'}`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-stone-600">รีวิวและความคิดเห็น</span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800"><MessageSquare className="w-5 h-5" /></div>
          </div>
          <span className="text-2xl font-extrabold text-stone-900 block">{reviews.length} รีวิว</span>
          <span className="text-[11px] text-amber-700 font-medium">ฟีดแบ็กจากลูกค้า</span>
        </div>
      </div>

      {/* ส่วนเนื้อหา TAB */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">

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
              </div>
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-xs text-stone-500 font-medium block">ออเดอร์ที่สำเร็จแล้ว</span>
                <span className="text-xl font-bold text-stone-800">18 รายการ</span>
              </div>
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-xs text-stone-500 font-medium block">อัตราการซื้อซ้ำ</span>
                <span className="text-xl font-bold text-stone-800">24.5%</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB: รายการสินค้า (คลิกเพื่อแก้ไข) */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center gap-2 text-stone-900">
                <Package className="w-5 h-5 text-amber-600" /> รายการสินค้าคราฟต์ที่ลงขายไว้ (คลิกการ์ดเพื่อแก้ไข)
              </h3>
              <span className="text-xs text-stone-400">รวมทั้งหมด {products.length} รายการ</span>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-300 space-y-3">
                <Package className="w-12 h-12 text-stone-300 mx-auto" />
                <p className="text-stone-500 font-medium">ยังไม่มีรายการสินค้าที่คุณลงขายไว้ในขณะนี้</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedProduct(item);
                      setEditImageFile(null);
                      setEditError(null);
                      setEditSuccess(null);
                    }}
                    className="p-4 border border-stone-200 rounded-xl bg-stone-50/50 flex gap-4 items-center cursor-pointer hover:border-emerald-600 hover:shadow-md transition-all group"
                  >
                    <img src={item.image_url || 'https://via.placeholder.com/80'} alt={item.title} className="w-16 h-16 object-cover rounded-lg border border-stone-200" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-stone-800 truncate group-hover:text-emerald-800">{item.title}</h4>
                      <p className="text-emerald-800 font-extrabold text-sm">฿{item.price}</p>
                      <p className="text-xs text-stone-400">คลังคงเหลือ: {item.stock_quantity ?? item.stock ?? 0} ชิ้น</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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

        {activeTab === 'craft' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2 text-purple-950">
                <Hammer className="w-5 h-5 text-purple-700" /> ติดตามสถานะงานช่างฝีมือ
              </h3>
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
                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => handleUpdateOrderStatus(craftOrd.id, 'in_progress')}
                        className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-amber-600 transition-all"
                      >
                        <Clock className="w-3.5 h-3.5" /> เริ่มประดิษฐ์ชิ้นงาน
                      </button>
                      <button
                        onClick={() => handleUpdateOrderStatus(craftOrd.id, 'completed')}
                        className="px-3 py-1.5 bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-emerald-700 transition-all"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> ประดิษฐ์เสร็จสิ้น
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB: รีวิวและความคิดเห็นจากลูกค้า (พร้อมปุ่มเปิด Thread สนทนา และจุดแจ้งเตือนสีแดง) */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center gap-2 text-stone-900">
                <MessageSquare className="w-5 h-5 text-amber-600" /> รีวิวและความคิดเห็นจากลูกค้า
              </h3>
              <span className="text-xs text-stone-400">รวมทั้งหมด {reviews.length} รายการ</span>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-300 space-y-3">
                <MessageSquare className="w-12 h-12 text-stone-300 mx-auto" />
                <p className="text-stone-500 font-medium">ยังไม่มีรีวิวจากลูกค้าในขณะนี้</p>
                <p className="text-xs text-stone-400">เมื่อลูกค้าได้รับสินค้าและให้คะแนน จะแสดงผลที่นี่ทันที</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => {
                  const hasReplied = Boolean(rev.reply_text);
                  return (
                    <div key={rev.id} className="p-4 border border-stone-200 rounded-xl bg-stone-50/50 flex flex-col sm:flex-row gap-4 items-start justify-between">
                      <div className="flex gap-4 items-start">
                        <img
                          src={rev.product_image || 'https://via.placeholder.com/80'}
                          alt={rev.product_name}
                          className="w-16 h-16 object-cover rounded-lg border border-stone-200 flex-shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-sm text-stone-800">{rev.product_name}</h4>
                          <div className="flex items-center gap-1 my-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-sm ${i < rev.rating ? 'text-amber-400' : 'text-stone-300'}`}>★</span>
                            ))}
                            <span className="text-xs text-stone-500 ml-2">โดย {rev.customer_name || 'ลูกค้าผู้ซื้อ'}</span>
                          </div>
                          <p className="text-sm text-stone-600 mt-1">"{rev.comment || 'ไม่มีข้อความรีวิว'}"</p>

                          {/* ปุ่มเปิดกล่องสนทนา (พร้อมจุดแจ้งเตือนสีแดงถ้ายังไม่ตอบกลับ) */}
                          <div className="mt-3">
                            <button
                              onClick={() => {
                                setActiveReviewModal(rev);
                                setReplyMessage('');
                              }}
                              className="relative inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg text-xs font-bold text-stone-700 shadow-2xs transition-all"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-800" />
                              <span>ดูการสนทนา / ตอบกลับ</span>
                              {!hasReplied && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white animate-pulse" title="ยังไม่ได้ตอบกลับ" />
                              )}
                              {hasReplied && (
                                <span className="ml-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded-md font-medium">ตอบแล้ว</span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-stone-400 self-end sm:self-start">
                        {new Date(rev.created_at).toLocaleDateString('th-TH')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* --- MODAL สนทนาตอบกลับรีวิว (Thread Conversation Modal) --- */}
      {activeReviewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-800" />
                <h3 className="text-lg font-bold text-stone-900">สนทนากับลูกค้า (รีวิวสินค้า)</h3>
              </div>
              <button onClick={() => setActiveReviewModal(null)} className="text-stone-400 hover:text-stone-700 font-bold text-lg">✕</button>
            </div>

            {/* ส่วนแสดงประวัติการสนทนา (Thread Messages) */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[50vh]">
              {/* ข้อความฝั่งลูกค้า */}
              <div className="flex gap-3 items-start bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {activeReviewModal.customer_name ? activeReviewModal.customer_name.charAt(0) : 'ล'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-stone-900">{activeReviewModal.customer_name || 'ลูกค้า'}</span>
                    <span className="text-[10px] text-stone-400">{new Date(activeReviewModal.created_at).toLocaleString('th-TH')}</span>
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

              {/* ข้อความฝั่งร้านค้า (ถ้ามีการตอบกลับแล้ว) */}
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

            {/* ฟอร์มพิมพ์ข้อความตอบกลับใหม่ */}
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
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl"
                >
                  ปิดหน้าต่าง
                </button>
                <button
                  type="submit"
                  disabled={sendingReply || !replyMessage.trim()}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {sendingReply ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{sendingReply ? 'กำลังส่ง...' : 'ส่งคำตอบกลับ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL แก้ไขสินค้า --- */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-stone-900">แก้ไขรายละเอียดงานคราฟต์</h3>
              <button onClick={() => setSelectedProduct(null)} className="text-stone-400 hover:text-stone-700 font-bold text-lg">✕</button>
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

              {/* Checkboxes: Made-to-order & Supports customization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
                  <input
                    type="checkbox"
                    name="is_made_to_order"
                    defaultChecked={Boolean(selectedProduct.is_made_to_order)}
                    className="w-4 h-4 text-emerald-800 rounded focus:ring-emerald-800 cursor-pointer"
                  />
                  <span>สั่งทำตามออเดอร์ (Made-to-order)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
                  <input
                    type="checkbox"
                    name="supports_customization"
                    defaultChecked={Boolean(selectedProduct.supports_customization)}
                    className="w-4 h-4 text-emerald-800 rounded focus:ring-emerald-800 cursor-pointer"
                  />
                  <span>รองรับการปรับแต่ง (Customization)</span>
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
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-all"
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
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={updatingProduct}
                    className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
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