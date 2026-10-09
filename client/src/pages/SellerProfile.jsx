import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';
import {
    Store,
    MapPin,
    Phone,
    Mail,
    ArrowLeft,
    ShoppingBag,
    Clock
} from 'lucide-react';

export const SellerProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useAuth();

    const [seller, setSeller] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addedMessageId, setAddedMessageId] = useState(null);

    useEffect(() => {
        const fetchSellerAndProducts = async () => {
            setLoading(true);
            try {
                // ดึงข้อมูลร้านค้าตาม Route ที่ถูกต้องใน shopRoutes.js
                const shopRes = await fetch(`http://localhost:5000/api/shops/seller/${id}`);
                const shopData = await shopRes.json();

                if (shopData.success && shopData.shop) {
                    setSeller(shopData.shop);
                } else if (shopData.shop_name || shopData.store_name) {
                    setSeller(shopData);
                }

                // ดึงรายการสินค้าทั้งหมดเพื่อกรองเอาของ seller คนนี้
                const prodRes = await fetch(`http://localhost:5000/api/products`);
                const prodData = await prodRes.json();

                const allProducts = Array.isArray(prodData) ? prodData : (prodData.products || prodData.data || []);
                const sellerProducts = allProducts.filter(p => String(p.seller_id) === String(id));
                setProducts(sellerProducts);

            } catch (err) {
                console.error('Failed to fetch seller profile and products:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchSellerAndProducts();
        }
    }, [id]);

    const handleQuickAddToCart = (product, e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product, 1, {});
        setAddedMessageId(product.id);
        setTimeout(() => setAddedMessageId(null), 2000);
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-24 text-center font-mono text-xs text-stone-400">
                กำลังโหลดข้อมูลร้านค้า...
            </div>
        );
    }

    if (!seller) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
                <h2 className="text-2xl font-display font-bold text-stone-800">ไม่พบร้านค้านี้ในระบบ</h2>
                <Link to="/products" className="text-xs font-mono font-bold text-[#E76F51] hover:underline uppercase">
                    กลับสู่หน้าสินค้า
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 pb-20">

            {/* Cover Image Banner */}
            <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-stone-200">
                <img
                    src={seller.banner_url || seller.cover_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1600&q=80'}
                    alt={seller.shop_name || seller.store_name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                <div className="absolute top-6 left-6 z-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 hover:bg-white text-stone-900 text-xs font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-md transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>ย้อนกลับ</span>
                    </button>
                </div>
            </div>

            {/* Profile Header Card */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-white shadow-lg bg-[#1B4332] shrink-0">
                            <img
                                src={seller.logo_url || seller.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                                alt={seller.shop_name || seller.store_name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-[#E8F7F3] text-[#1B4332]">
                                    VERIFIED ARTISAN ATELIER
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-900">
                                {seller.shop_name || seller.store_name || 'ร้านค้าแฮนด์เมด'}
                            </h1>
                            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
                                {seller.bio || seller.shop_bio || 'ยินดีต้อนรับสู่ร้านค้างานคราฟต์แฮนด์เมด'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs space-y-2 w-full md:w-auto shrink-0">
                        {seller.address && (
                            <div className="flex items-center gap-2 text-stone-700">
                                <MapPin className="w-4 h-4 text-[#E76F51]" />
                                <span>{seller.address}</span>
                            </div>
                        )}
                        {seller.phone && (
                            <div className="flex items-center gap-2 text-stone-700">
                                <Phone className="w-4 h-4 text-[#1B4332]" />
                                <span>{seller.phone}</span>
                            </div>
                        )}
                        {seller.email && (
                            <div className="flex items-center gap-2 text-stone-700">
                                <Mail className="w-4 h-4 text-[#1B4332]" />
                                <span>{seller.email}</span>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Main Content: Products Showcase */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-10">

                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                        <h3 className="text-lg font-display font-extrabold text-stone-900">
                            ผลงานคราฟต์ทั้งหมดจากร้านนี้ ({products.length} รายการ)
                        </h3>
                        <span className="text-xs font-mono text-stone-400 uppercase">
                            ATELIER SHOWCASE
                        </span>
                    </div>

                    {products.length === 0 ? (
                        <div className="text-center py-12 text-stone-400 text-sm">
                            ร้านนี้ยังไม่มีสินค้าในระบบ
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <Link
                                    key={product.id}
                                    to={`/product/${product.id}`}
                                    className="group bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-xl hover:border-[#1B4332] transition-all duration-300 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                                            <img
                                                src={product.image_url}
                                                alt={product.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                            />
                                            <div className="absolute top-3 left-3">
                                                <span className="bg-black/70 backdrop-blur-md text-white text-[9px] font-mono font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                                                    {product.category}
                                                </span>
                                            </div>
                                            {Boolean(product.is_made_to_order) && (
                                                <div className="absolute top-3 right-3">
                                                    <Badge variant="terracotta" size="sm">Made-to-Order</Badge>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-5 space-y-2">
                                            <h4 className="text-sm font-display font-bold text-stone-900 group-hover:text-[#1B4332] transition-colors line-clamp-2">
                                                {product.title}
                                            </h4>
                                            <div className="flex items-baseline gap-2 pt-1">
                                                <span className="text-base font-display font-extrabold text-[#E76F51]">
                                                    ฿{Number(product.price).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-5 pb-5 pt-2 border-t border-stone-100 flex items-center justify-between">
                                        <span className="text-[11px] font-mono text-stone-400 flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" /> ระยะเวลา {product.lead_time_days || 3} วัน
                                        </span>

                                        <button
                                            type="button"
                                            onClick={(e) => handleQuickAddToCart(product, e)}
                                            className="px-4 py-2 rounded-full bg-[#1B4332] text-white hover:bg-[#133023] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
                                        >
                                            <ShoppingBag className="w-3.5 h-3.5" />
                                            <span>{addedMessageId === product.id ? 'เพิ่มแล้ว!' : 'ใส่ตะกร้า'}</span>
                                        </button>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
};

export default SellerProfile;