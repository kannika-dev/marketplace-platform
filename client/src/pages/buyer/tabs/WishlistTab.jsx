import React, { useState } from 'react';
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles } from 'lucide-react';

export const WishlistTab = () => {
    // จำลองข้อมูลรายการโปรด (Wishlist) ของงานคราฟต์
    const [wishlistItems, setWishlistItems] = useState([
        {
            id: 1,
            title: 'PANTN Aroma - เทียนหอมไขถั่วเหลืองธรรมชาติ',
            artisan: 'Artisan Workshop',
            price: 159,
            image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=400&q=80',
            category: 'เทียนหอม & สกินแคร์'
        },
        {
            id: 2,
            title: 'กระเป๋าผ้าฝ้ายทอมือลายโบราณสุรินทร์',
            artisan: 'กลุ่มทอผ้าพื้นถิ่น',
            price: 490,
            image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=400&q=80',
            category: 'เครื่องหนัง & Craft'
        }
    ]);

    const handleRemove = (id) => {
        setWishlistItems((prev) => prev.filter((item) => item.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                    <h3 className="text-lg font-display font-bold text-stone-900">รายการงานคราฟต์ที่ชื่นชอบ (Wishlist)</h3>
                    <p className="text-xs text-stone-500">รวบรวมชิ้นงานแฮนด์เมดและผลงานจากช่างฝีมือที่คุณกดหัวใจไว้</p>
                </div>
                <span className="px-3 py-1 bg-rose-50 text-[#E76F51] text-xs font-bold rounded-full border border-rose-200 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-current" /> {wishlistItems.length} รายการ
                </span>
            </div>

            {wishlistItems.length === 0 ? (
                <div className="p-12 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-3">
                    <Heart className="w-12 h-12 text-stone-300 mx-auto" />
                    <h4 className="text-sm font-bold text-stone-700">ยังไม่มีรายการโปรดในขณะนี้</h4>
                    <p className="text-xs text-stone-400 max-w-sm mx-auto">
                        คุณสามารถกดไอคอนรูปหัวใจบนสินค้าในหน้า Marketplace เพื่อบันทึกเก็บไว้ดูภายหลังได้เลยจ้า
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlistItems.map((item) => (
                        <div key={item.id} className="clay-card p-4 rounded-2xl border border-stone-200 bg-white/9ori flex gap-4 items-center relative group shadow-sm hover:shadow-md transition-all">
                            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-[#2A9D8F] rounded-full font-bold">
                                    {item.category}
                                </span>
                                <h4 className="text-xs font-bold text-stone-800 truncate mt-1">{item.title}</h4>
                                <p className="text-[11px] text-stone-400">โดย {item.artisan}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-sm font-extrabold text-[#E76F51]">฿{item.price}</span>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => alert(`เพิ่ม ${item.title} ลงในตะกร้าแล้วจ้า!`)}
                                            className="p-1.5 bg-[#1B4332] text-white rounded-lg hover:bg-[#2D6A4F] transition-colors"
                                            title="หยิบใส่ตะกร้า"
                                        >
                                            <ShoppingBag className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleRemove(item.id)}
                                            className="p-1.5 bg-stone-100 text-stone-500 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                            title="ลบออกจาก Wishlist"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistTab;