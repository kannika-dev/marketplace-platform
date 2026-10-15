import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import api from '../services/api';
import { Store, PackageOpen, ArrowLeft, Sparkles, MapPin, Phone, Mail } from 'lucide-react';

export const PublicShopView = () => {
    const { sellerId } = useParams();
    const [shopInfo, setShopInfo] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchShopData = async () => {
            setLoading(true);
            try {
                // ดึงข้อมูลร้านค้าและสินค้าของร้านนี้
                const [shopRes, prodRes] = await Promise.all([
                    api.get(`/shops/seller/${sellerId}`).catch(() => ({ data: null })),
                    api.get(`/products?seller_id=${sellerId}`).catch(() => ({ data: [] }))
                ]);

                setShopInfo(shopRes.data?.shop || shopRes.data || {
                    shop_name: 'Craft Artisan Studio',
                    bio: 'มุ่งมั่นสร้างสรรค์งานคราฟต์ด้วยความตั้งใจ เพื่อส่งต่อจิตวิญญาณแห่งงานศิลปืมือไทย'
                });

                const allProducts = prodRes.data?.data || prodRes.data || [];
                // กรองเฉพาะสินค้าที่เป็นของ sellerId นี้
                const filtered = allProducts.filter(p => String(p.seller_id) === String(sellerId));
                setProducts(filtered);
            } catch (err) {
                console.error('Failed to fetch public shop details:', err);
            } finally {
                setLoading(false);
            }
        };

        if (sellerId) {
            fetchShopData();
        }
    }, [sellerId]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 editorial-canvas">

            {/* Back Button */}
            <div>
                <Link
                    to="/products"
                    className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-stone-600 hover:text-[#1B4332] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    กลับสู่ Marketplace ทั้งหมด
                </Link>
            </div>

            {/* Shop Header Banner & Profile Card */}
            <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
                {/* Banner Background */}
                <div className="h-48 sm:h-64 bg-gradient-to-r from-[#1B4332] to-[#2d6a4f] relative overflow-hidden">
                    {shopInfo?.banner_url && (
                        <img
                            src={shopInfo.banner_url}
                            alt="Shop Banner"
                            className="w-full h-full object-cover opacity-80"
                        />
                    )}
                    <div className="absolute inset-0 bg-stone-900/20 backdrop-blur-[1px]" />
                </div>

                {/* Shop Details Container */}
                <div className="px-8 pb-8 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16">
                    <div className="flex items-end gap-5">
                        {/* Logo / Avatar */}
                        <div className="w-28 h-28 rounded-2xl bg-white border-4 border-white shadow-md overflow-hidden flex items-center justify-center bg-[#FAF9F5] shrink-0">
                            {shopInfo?.logo_url ? (
                                <img src={shopInfo.logo_url} alt={shopInfo.shop_name} className="w-full h-full object-cover" />
                            ) : (
                                <Store className="w-12 h-12 text-[#1B4332]" />
                            )}
                        </div>

                        {/* Shop Name & Bio */}
                        <div className="space-y-1 pb-1">
                            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E8F7F3] text-[#1B4332] text-[10px] font-mono font-bold uppercase tracking-wider">
                                <Sparkles className="w-3 h-3 text-[#E76F51]" />
                                VERIFIED ARTISAN SHOP
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-900">
                                {shopInfo?.shop_name || 'My Craft Studio'}
                            </h1>
                            <p className="text-xs sm:text-sm text-stone-500 font-normal max-w-xl">
                                {shopInfo?.bio || 'มุ่งมั่นสร้างสรรค์งานคราฟต์ด้วยความตั้งใจ เพื่อส่งต่อจิตวิญญาณแห่งงานศิลปะมือ'}
                            </p>
                        </div>
                    </div>

                    {/* Quick Stats / Contact Info */}
                    <div className="flex items-center gap-4 bg-[#FAF9F5] px-5 py-3 rounded-2xl border border-stone-200 shrink-0">
                        <div className="text-center">
                            <span className="block text-lg font-display font-bold text-[#1B4332]">{products.length}</span>
                            <span className="text-[10px] font-mono uppercase text-stone-500">ผลงานทั้งหมด</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section Title */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div>
                    <h2 className="text-xl font-display font-bold text-stone-900">ผลงานคราฟต์จากร้านนี้</h2>
                    <p className="text-xs text-stone-500">เลือกชมสินค้าแฮนด์เมดและงานสั่งทำพิเศษทั้งหมดโดยช่างฝีมือท่านนี้</p>
                </div>
            </div>

            {/* Products Grid (เฉพาะของร้านนี้) */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="runway-card rounded-3xl h-96 animate-pulse bg-stone-100" />
                    ))}
                </div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="runway-card text-center py-20 rounded-3xl p-8 space-y-4 bg-white border border-stone-200">
                    <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                        <PackageOpen className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-display font-bold text-stone-900">
                        ร้านค้านี้ยังไม่มีผลงานสินค้าแสดงในขณะนี้
                    </h3>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto font-normal">
                        โปรดติดตามผลงานคราฟต์ชิ้นใหม่ๆ จากช่างฝีมือคนนี้เร็วๆนี้นะคะ
                    </p>
                </div>
            )}

        </div>
    );
};

export default PublicShopView;