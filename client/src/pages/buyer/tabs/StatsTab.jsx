import React from 'react';
import { BarChart3, Heart, ShoppingBag, Award } from 'lucide-react';

export const StatsTab = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                    <h3 className="text-lg font-display font-bold text-stone-900">สถิติการใช้งาน (Analytics)</h3>
                    <p className="text-xs text-stone-500">สรุปสถิติการสะสมงานคราฟต์และการสนับสนุนช่างฝีมือชุมชน</p>
                </div>
                <BarChart3 className="w-5 h-5 text-indigo-600" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center">
                    <ShoppingBag className="w-6 h-6 text-[#2A9D8F] mx-auto mb-2" />
                    <span className="text-xs text-stone-500">คำสั่งซื้อสำเร็จ</span>
                    <strong className="block text-xl font-extrabold text-stone-800">0 รายการ</strong>
                </div>
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 text-center">
                    <Heart className="w-6 h-6 text-[#E76F51] mx-auto mb-2" />
                    <span className="text-xs text-stone-500">สินค้าใน Wishlist</span>
                    <strong className="block text-xl font-extrabold text-stone-800">0 ชิ้น</strong>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 text-center">
                    <Award className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                    <span className="text-xs text-stone-500">ระดับการสนับสนุน</span>
                    <strong className="block text-xl font-extrabold text-stone-800">Craft Beginner</strong>
                </div>
            </div>
        </div>
    );
};

export default StatsTab;