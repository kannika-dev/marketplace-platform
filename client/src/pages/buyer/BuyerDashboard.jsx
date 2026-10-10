import React, { useState, useEffect } from 'react';
import {
    User,
    Heart,
    ShoppingCart,
    PackageCheck,
    History,
    BarChart3,
    Sparkles
} from 'lucide-react';

import ProfileTab from './tabs/ProfileTab';
import WishlistTab from './tabs/WishlistTab';
import CartOrdersTab from './tabs/CartOrdersTab';
import CraftTrackingTab from './tabs/CraftTrackingTab';
import HistoryTab from './tabs/HistoryTab';
import StatsTab from './tabs/StatsTab';

export const BuyerDashboard = () => {
    const BACKEND_URL = 'https://marketplace-platform-xh1q.onrender.com';
    const [activeTab, setActiveTab] = useState('profile');
    const [refreshKey, setRefreshKey] = useState(0);

    const [buyerProfile, setBuyerProfile] = useState({
        name: 'กำลังโหลด...',
        username: 'collector',
        email: '',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        role: 'buyer'
    });

    // ฟังก์ชันดึง Token และแกะ userId จาก JWT Token โดยตรง
    const getStoredToken = () => {
        return localStorage.getItem('craft_token') ||
            localStorage.getItem('token') ||
            localStorage.getItem('accessToken') ||
            localStorage.getItem('jwt') || '';
    };

    const getUserIdFromToken = () => {
        const token = getStoredToken();
        if (token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const decoded = JSON.parse(jsonPayload);
                return decoded.id || decoded.userId || decoded.sub;
            } catch (e) {
                console.error('Failed to parse JWT token:', e);
            }
        }
        return localStorage.getItem('userId') || localStorage.getItem('user_id') || localStorage.getItem('id');
    };

    const userId = getUserIdFromToken();

    const fetchDashboardProfile = async () => {
        if (!userId) return;
        try {
            const token = getStoredToken();
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${BACKEND_URL}/api/buyer/${userId}`, { headers });
            const result = await response.json();

            if (result.success && result.data) {
                setBuyerProfile({
                    name: result.data.name || 'ผู้ใช้งาน Craftiverse',
                    username: result.data.email ? result.data.email.split('@')[0] : 'collector',
                    email: result.data.email,
                    avatar: result.data.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                    role: result.data.role || 'buyer'
                });
            }
        } catch (err) {
            console.error('Failed to fetch sidebar profile:', err);
        }
    };

    useEffect(() => {
        fetchDashboardProfile();
    }, [userId, refreshKey]);

    const handleProfileUpdated = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* LEFT SIDEBAR */}
                <div className="lg:col-span-3 space-y-6 sticky top-24">
                    <div className="clay-card p-6 rounded-3xl border border-white text-center space-y-4 shadow-xl bg-white/95 backdrop-blur-md">
                        <div className="relative w-24 h-24 mx-auto">
                            <img
                                src={buyerProfile.avatar}
                                alt={buyerProfile.name}
                                className="w-full h-full rounded-full object-cover border-4 border-emerald-100 shadow-md"
                            />
                            <span className="absolute bottom-0 right-0 bg-[#2A9D8F] text-white p-1.5 rounded-full shadow-md text-xs">
                                <Sparkles className="w-3.5 h-3.5" />
                            </span>
                        </div>
                        <div>
                            <h2 className="text-base font-display font-extrabold text-stone-900">{buyerProfile.name}</h2>
                            <p className="text-xs text-stone-400 font-mono">@{buyerProfile.username}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-[#E8F7F3] text-[#2A9D8F] text-[11px] font-bold rounded-full border border-[#A2D9D2]">
                                {buyerProfile.role === 'admin' ? 'Administrator' : buyerProfile.role === 'seller' ? 'Seller' : 'Collector (Buyer)'}
                            </span>
                        </div>
                    </div>

                    <div className="clay-card p-3 rounded-3xl border border-white space-y-1.5 shadow-xl bg-white/95 backdrop-blur-md">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'profile' ? 'bg-[#1B4332] text-white shadow-md' : 'text-stone-600 hover:bg-emerald-50/60'
                                }`}
                        >
                            <User className="w-4 h-4" />
                            <span>โปรไฟล์ของฉัน (Profile)</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('wishlist')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'wishlist' ? 'bg-[#1B4332] text-white shadow-md' : 'text-stone-600 hover:bg-emerald-50/60'
                                }`}
                        >
                            <Heart className="w-4 h-4" />
                            <span>รายการโปรด (Wishlist)</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('cart-orders')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'cart-orders' ? 'bg-[#1B4332] text-white shadow-md' : 'text-stone-600 hover:bg-emerald-50/60'
                                }`}
                        >
                            <ShoppingCart className="w-4 h-4" />
                            <span>ตะกร้าและคำสั่งซื้อ</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('tracking')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'tracking' ? 'bg-[#1B4332] text-white shadow-md' : 'text-stone-600 hover:bg-emerald-50/60'
                                }`}
                        >
                            <PackageCheck className="w-4 h-4" />
                            <span>ติดตามสินค้า (Craft Tracker)</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-[#1B4332] text-white shadow-md' : 'text-stone-600 hover:bg-emerald-50/60'
                                }`}
                        >
                            <History className="w-4 h-4" />
                            <span>ประวัติและสลิปการจ่ายเงิน</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('stats')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'stats' ? 'bg-[#1B4332] text-white shadow-md' : 'text-stone-600 hover:bg-emerald-50/60'
                                }`}
                        >
                            <BarChart3 className="w-4 h-4" />
                            <span>สถิติการใช้งาน (Analytics)</span>
                        </button>
                    </div>
                </div>

                {/* RIGHT MAIN CONTENT */}
                <div className="lg:col-span-9">
                    <div className="clay-card p-6 sm:p-8 rounded-3xl border border-white shadow-xl min-h-[600px] bg-white/95 backdrop-blur-md">
                        {activeTab === 'profile' && <ProfileTab onProfileUpdated={handleProfileUpdated} />}
                        {activeTab === 'wishlist' && <WishlistTab />}
                        {activeTab === 'cart-orders' && <CartOrdersTab />}
                        {activeTab === 'tracking' && <CraftTrackingTab />}
                        {activeTab === 'history' && <HistoryTab />}
                        {activeTab === 'stats' && <StatsTab />}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BuyerDashboard;