import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, Upload, CheckCircle2, Clock, Trash2, ArrowRight, Tag, Plus, Minus, ShieldCheck, Leaf, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';

export const CartOrdersTab = () => {
    // -----------------------------------------------------------------
    // State สลับแท็บย่อย: 'cart' (ตะกร้าสินค้า) หรือ 'orders' (ประวัติคำสั่งซื้อ)
    // -----------------------------------------------------------------
    const [activeSubTab, setActiveSubTab] = useState('cart');

    // Context ตะกร้าสินค้า
    const { cart, removeFromCart, clearCart, addToCart } = useAuth();
    const navigate = useNavigate();

    // State ส่วนคำนวณราคาในตะกร้า
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [couponApplied, setCouponApplied] = useState(false);

    // State ฝั่งประวัติคำสั่งซื้อ (Orders API)
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    const API_BASE = 'https://marketplace-platform-xh1q.onrender.com/api';

    // คำนวณราคายอดรวมตะกร้า
    const totalAmount = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const finalAmount = Math.max(0, totalAmount - discount);
    const maxLeadTime = cart.reduce((max, item) => Math.max(max, item.lead_time_days || (item.is_made_to_order ? 7 : 2)), 0);

    // ดึงประวัติคำสั่งซื้อจาก Backend
    const fetchOrders = async () => {
        try {
            setLoadingOrders(true);
            const craft_token = localStorage.getItem('craft_token') || sessionStorage.getItem('craft_token');
            const response = await axios.get(`${API_BASE}/orders/my-orders`, {
                headers: { Authorization: `Bearer ${craft_token}` }
            });
            if (response.data.success) {
                setOrders(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoadingOrders(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleUpdateQuantity = (item, delta) => {
        if (item.quantity + delta <= 0) {
            const itemIndex = cart.indexOf(item);
            removeFromCart(itemIndex);
        } else {
            addToCart(item, delta, item.selectedOptions || item.customization_notes);
        }
    };

    const handleApplyCoupon = (e) => {
        e.preventDefault();
        if (couponCode.trim().toUpperCase() === 'CRAFT10') {
            setDiscount(Math.round(totalAmount * 0.1));
            setCouponApplied(true);
        } else if (couponCode.trim().toUpperCase() === 'FIRSTBUY') {
            setDiscount(150);
            setCouponApplied(true);
        } else if (couponCode.trim()) {
            alert('โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุ (ลองใช้: CRAFT10 หรือ FIRSTBUY)');
        }
    };

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
                alert('✨ อัปโหลดสลิปสำเร็จ! รอแอดมินตรวจสอบการชำระเงินสักครู่นะคะ');
                fetchOrders();
            }
        } catch (err) {
            console.error('Error uploading slip:', err);
            alert('อัปโหลดสลิปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header + ปุ่มสลับแท็บย่อย */}
            <div className="border-b border-stone-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-display font-extrabold text-stone-900 flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-[#2A9D8F]" />
                        ตะกร้าและคำสั่งซื้อของฉัน (Cart & Orders)
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                        จัดการสินค้าในตะกร้า และตรวจสอบสถานะคำสั่งซื้อของคุณ
                    </p>
                </div>

                {/* สวิตช์เลือกแท็บย่อย */}
                <div className="flex items-center p-1 bg-stone-100 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveSubTab('cart')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSubTab === 'cart'
                                ? 'bg-white text-[#2A9D8F] shadow-sm'
                                : 'text-stone-500 hover:text-stone-800'
                            }`}
                    >
                        🛒 ตะกร้าสินค้า ({cart.reduce((t, i) => t + i.quantity, 0)})
                    </button>
                    <button
                        onClick={() => setActiveSubTab('orders')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSubTab === 'orders'
                                ? 'bg-white text-[#2A9D8F] shadow-sm'
                                : 'text-stone-500 hover:text-stone-800'
                            }`}
                    >
                        📦 คำสั่งซื้อของฉัน ({orders.length})
                    </button>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* TAB 1: ตะกร้าสินค้า (CART)                                                */}
            {/* ========================================================================= */}
            {activeSubTab === 'cart' && (
                <div>
                    {cart.length === 0 ? (
                        <div className="text-center py-16 space-y-4">
                            <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-[#2A9D8F] flex items-center justify-center mx-auto">
                                <ShoppingCart className="w-10 h-10 stroke-1" />
                            </div>
                            <h3 className="text-lg font-bold text-stone-800">ตะกร้าของคุณยังว่างเปล่า</h3>
                            <p className="text-xs text-stone-500">เลือกกดสั่งซื้อสินค้าจากหน้าหลัก หรือจากหน้ารายการโปรดได้เลยจ้า</p>
                            <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-3d-peach text-xs font-bold shadow-md">
                                <span>ไปเลือกชมสินค้า</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            {/* รายการสินค้าในตะกร้า */}
                            <div className="lg:col-span-8 space-y-4">
                                <div className="flex justify-between items-center text-xs text-stone-500 font-medium pb-1">
                                    <span>รายการสินค้าที่เลือกไว้ ({cart.length} รายการ)</span>
                                    <button onClick={clearCart} className="text-rose-500 hover:underline font-bold">ล้างตะกร้าทั้งหมด</button>
                                </div>

                                {cart.map((item, index) => {
                                    const customOptions = item.selectedOptions || item.customization_notes;
                                    return (
                                        <div key={index} className="clay-card p-4 rounded-2xl border border-stone-100 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <img src={item.image_url || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=300&q=80'} alt={item.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                                                <div className="space-y-1">
                                                    <h4 className="text-xs font-bold text-stone-900">{item.title}</h4>
                                                    <p className="text-[11px] text-[#2A9D8F]">฿{Number(item.price).toLocaleString()} / ชิ้น</p>
                                                    {customOptions && (
                                                        <span className="text-[10px] text-[#E76F51] bg-[#FFF0EB] px-2 py-0.5 rounded-md inline-block">
                                                            ✨ {typeof customOptions === 'string' ? customOptions : JSON.stringify(customOptions)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                                                <div className="flex items-center border border-stone-200 rounded-xl bg-white p-0.5">
                                                    <button onClick={() => handleUpdateQuantity(item, -1)} className="w-6 h-6 flex items-center justify-center text-stone-600 font-bold"><Minus className="w-3 h-3" /></button>
                                                    <span className="px-2 text-xs font-bold">{item.quantity}</span>
                                                    <button onClick={() => handleUpdateQuantity(item, 1)} className="w-6 h-6 flex items-center justify-center text-stone-600 font-bold"><Plus className="w-3 h-3" /></button>
                                                </div>

                                                <span className="text-sm font-extrabold text-[#E76F51]">฿{(Number(item.price) * item.quantity).toLocaleString()}</span>
                                                <button onClick={() => removeFromCart(index)} className="p-1.5 text-stone-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* สรุปคำสั่งซื้อ */}
                            <div className="lg:col-span-4 clay-card p-5 rounded-2xl border border-stone-100 bg-white space-y-4">
                                <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2">สรุปรายการสั่งซื้อ</h3>
                                <div className="space-y-2 text-xs text-stone-600">
                                    <div className="flex justify-between"><span>ยอดรวมสินค้า</span><span className="font-bold">฿{totalAmount.toLocaleString()}</span></div>
                                    <div className="flex justify-between text-[#2A9D8F]"><span>ค่าจัดส่ง</span><span className="font-bold">ฟรี</span></div>
                                    {discount > 0 && <div className="flex justify-between text-[#E76F51]"><span>ส่วนลด</span><span>-฿{discount.toLocaleString()}</span></div>}
                                </div>

                                <div className="border-t border-stone-100 pt-3 flex justify-between items-baseline">
                                    <span className="text-xs font-bold">ยอดชำระสุทธิ</span>
                                    <span className="text-xl font-extrabold text-[#E76F51]">฿{finalAmount.toLocaleString()}</span>
                                </div>

                                <button onClick={() => navigate('/checkout')} className="w-full py-3 rounded-xl btn-3d-peach text-xs font-bold flex items-center justify-center gap-2">
                                    <span>ชำระเงิน</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: ประวัติคำสั่งซื้อ (ORDERS)                                         */}
            {/* ========================================================================= */}
            {activeSubTab === 'orders' && (
                <div>
                    {loadingOrders ? (
                        <div className="text-center py-16 text-stone-400 text-xs">กำลังโหลดประวัติคำสั่งซื้อ...</div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-16 text-stone-400 space-y-3">
                            <Package className="w-12 h-12 mx-auto stroke-1" />
                            <p className="text-xs">ยังไม่มีรายการคำสั่งซื้อที่ชำระเงินในระบบ</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div key={order.id} className="clay-card p-5 rounded-2xl border border-stone-100 bg-white shadow-sm space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100 text-xs">
                                        <div>
                                            <span className="font-bold text-stone-900">คำสั่งซื้อ #{order.id}</span>
                                            <span className="text-stone-400 ml-2">({new Date(order.created_at).toLocaleString('th-TH')})</span>
                                        </div>
                                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold border bg-amber-50 text-amber-700 border-amber-200">
                                            {order.status}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        {order.items && order.items.map((item) => (
                                            <div key={item.id} className="flex justify-between items-center text-xs p-2 rounded-xl bg-stone-50">
                                                <span>{item.title || item.product_name}</span>
                                                <span className="font-bold">฿{Number(item.price).toLocaleString()} x {item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-center text-xs pt-2 border-t border-stone-100">
                                        <span className="text-stone-500">ยอดรวมสุทธิ: <strong className="text-[#2A9D8F]">฿{Number(order.total_amount).toLocaleString()}</strong></span>
                                        {order.status === 'unpaid' && (
                                            <label className="btn-3d-botanical px-3 py-1.5 rounded-xl text-xs font-bold text-white cursor-pointer flex items-center gap-1">
                                                <Upload className="w-3 h-3" />
                                                <span>แนบสลิป</span>
                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadSlip(order.id, e)} />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CartOrdersTab;