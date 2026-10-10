import React from 'react';
import { PackageCheck, Clock, MapPin, Sparkles } from 'lucide-react';

export const CraftTrackingTab = () => {
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

            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-3">
                <PackageCheck className="w-12 h-12 text-[#2A9D8F] mx-auto animate-bounce" />
                <h4 className="text-sm font-bold text-stone-800">ยังไม่มีคำสั่งซื้อที่อยู่ระหว่างการผลิต</h4>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                    เมื่อคุณสั่งซื้อสินค้างานคราฟต์ประเภท Made-to-Order สถานะการคัดสรรวัตถุดิบและขึ้นรูปชิ้นงานจากช่างฝีมือจะแสดงขึ้นที่นี่
                </p>
            </div>
        </div>
    );
};

export default CraftTrackingTab;