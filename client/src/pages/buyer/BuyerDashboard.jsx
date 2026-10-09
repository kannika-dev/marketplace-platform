import React, { useState, useEffect } from 'react';
import {
    User,
    Heart,
    ShoppingCart,
    PackageCheck,
    History,
    BarChart3,
    Sparkles,
    Phone
} from 'lucide-react';

// นำเข้าคอมโพเนนต์แท็บย่อยต่างๆ จากโฟลเดอร์ tabs
import ProfileTab from './tabs/ProfileTab';
import WishlistTab from './tabs/WishlistTab';
import CartOrdersTab from './tabs/CartOrdersTab';
import CraftTrackingTab from './tabs/CraftTrackingTab';
import HistoryTab from './tabs/HistoryTab';
import StatsTab from './tabs/StatsTab';

export const BuyerDashboard = () => {
    // ตั้งค่าเริ่มต้นหน้าแท็บเป็น 'profile' ตามที่เตงต้องการจ้า
    const [activeTab, setActiveTab] = useState('profile');

    // ตัวอย่างโครงสร้าง state ข้อมูลผู้ใช้ (ชื่อฟิลด์ตรงกับตาราง users ในฐานข้อมูลเป๊ะๆ)
    const [buyerProfile, setBuyerProfile] = useState({
        name: 'กานต์ดา มั่งคั่ง',
        username: 'kan_collector',
        email: 'kanda.craft@gmail.com',
        phone: '081-234-5678', // ตรงกับฟิลด์ phone ในฐานข้อมูล
        address_no: '123/45',  // ตรงกับฟิลด์ address_no ในฐานข้อมูล
        subdistrict: 'คลองเตย', // ตรงกับฟิลด์ subdistrict ในฐานข้อมูล
        district: 'คลองเตย',    // ตรงกับฟิลด์ district ในฐานข้อมูล
        province: 'กรุงเทพมหานคร', // ตรงกับฟิลด์ province ในฐานข้อมูล
        zipcode: '10110',      // ตรงกับฟิลด์ zipcode ในฐานข้อมูล
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        role: 'buyer'          // ตรงกับฟิลด์ role ในฐานข้อมูล
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            {/* 2-Column Layout: Sidebar (ซ้าย) & Main Content (ขวา) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* ================= LEFT SIDEBAR (เมนูด้านซ้าย) ================= */}
                <div className="lg:col-span-3 space-y-6 sticky top-24">

                    {/* Card แสดงรูปโปรไฟล์และข้อมูลย่อ */}
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
                            <p className="text-xs text-stone-400 font-mono">@{buyerProfile.username || buyerProfile.email}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-[#E8F7F3] text-[#2A9D8F] text-[11px] font-bold rounded-full border border-[#A2D9D2]">
                                {buyerProfile.role === 'buyer' ? 'Collector (Buyer)' : buyerProfile.role}
                            </span>
                        </div>

                        <div className="pt-2 border-t border-emerald-50 text-left text-xs space-y-1.5 text-stone-600">
                            <div className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-[#2A9D8F]" />
                                <span className="font-semibold">{buyerProfile.phone || 'ยังไม่ได้ระบุเบอร์โทร'}</span>
                            </div>
                        </div>
                    </div>

                    {/* ปุ่มเมนูนำทางเลือกแท็บต่างๆ (ตั้งค่าเริ่มต้นเปิดที่ Profile) */}
                    <div className="clay-card p-3 rounded-3xl border border-white space-y-1.5 shadow-xl bg-white/95 backdrop-blur-md">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'profile'
                                    ? 'btn-3d-botanical text-white shadow-md'
                                    : 'text-stone-600 hover:bg-emerald-50/60'
                                }`}
                        >
                            <User className="w-4 h-4" />
                            <span>โปรไฟล์ของฉัน (Profile)</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('wishlist')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'wishlist'
                                    ? 'btn-3d-botanical text-white shadow-md'
                                    : 'text-stone-600 hover:bg-emerald-50/60'
                                }`}
                        >
                            <Heart className="w-4 h-4" />
                            <span>รายการโปรด (Wishlist)</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('cart-orders')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'cart-orders'
                                    ? 'btn-3d-botanical text-white shadow-md'
                                    : 'text-stone-600 hover:bg-emerald-50/60'
                                }`}
                        >
                            <ShoppingCart className="w-4 h-4" />
                            <span>ตะกร้าและคำสั่งซื้อ</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('tracking')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'tracking'
                                    ? 'btn-3d-botanical text-white shadow-md'
                                    : 'text-stone-600 hover:bg-emerald-50/60'
                                }`}
                        >
                            <PackageCheck className="w-4 h-4" />
                            <span>ติดตามสินค้า (Craft Tracker)</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('history')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'history'
                                    ? 'btn-3d-botanical text-white shadow-md'
                                    : 'text-stone-600 hover:bg-emerald-50/60'
                                }`}
                        >
                            <History className="w-4 h-4" />
                            <span>ประวัติและสลิปการจ่ายเงิน</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('stats')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'stats'
                                    ? 'btn-3d-botanical text-white shadow-md'
                                    : 'text-stone-600 hover:bg-emerald-50/60'
                                }`}
                        >
                            <BarChart3 className="w-4 h-4" />
                            <span>สถิติการใช้งาน (Analytics)</span>
                        </button>
                    </div>

                </div>


                {/* ================= RIGHT MAIN CONTENT AREA (พื้นที่แสดงผลแท็บด้านขวา) ================= */}
                <div className="lg:col-span-9">
                    <div className="clay-card p-6 sm:p-8 rounded-3xl border border-white shadow-xl min-h-[600px] bg-white/95 backdrop-blur-md">

                        {activeTab === 'profile' && <ProfileTab />}
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