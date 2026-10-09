import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import OptionSelector from '../components/products/OptionSelector';
import Badge from '../components/common/Badge';
import ProductReviews from '../components/ProductReviews';
import {
  Sparkles,
  Clock,
  ShieldCheck,
  ShoppingBag,
  ArrowLeft,
  Store,
  Layers,
  CheckCircle2,
  Share2,
  Heart,
  Award
} from 'lucide-react';

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, user: currentUser } = useAuth();

  const [product, setProduct] = useState(null);
  const [shopInfo, setShopInfo] = useState(null); // เพิ่ม state สำหรับเก็บข้อมูลร้านค้าจริง
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [addedMessage, setAddedMessage] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await getProductById(id);
        let productData = null;
        if (res && res.data) {
          productData = res.data;
        } else {
          productData = {
            id: Number(id),
            title: 'แจกันดินเผาเคลือบขี้เถ้าธรรมชาติ (Ash Glazed Ceramic Vase)',
            description: 'แจกันดินเผาขึ้นรูปด้วยแป้นหมุนโบราณ เผาด้วยเตาฟืนอุณหภูมิสูง 1,280 องศาเซลเซียส ผิวสัมผัสมีความดิบด้านตามธรรมชาติของขี้เถ้าไม้เบญจพรรณ ชิ้นงานแต่ละชิ้นมีริ้วรอยและความเงาเฉพาะตัวไม่ซ้ำกัน เหมาะสำหรับการจัดดอกไม้สไตล์ Ikebana หรือวางประดับห้องสไตล์มินิมอลโมเดิร์น',
            category: 'Ceramics',
            price: 1850,
            lead_time_days: 7,
            is_made_to_order: 1,
            materials: 'ดินดำลำปาง, เถ้าไม้สน, เถ้าแกลบข้าวธรรมชาติ',
            craft_technique: 'แป้นหมุนมือ (Wheel Throwing), เตาฟืน Wood-fired kiln',
            shop_id: 1,
            seller_id: 30001,
            shop_name: 'เตาเผาดอยสะเก็ด',
            shop_bio: 'กลุ่มช่างปั้นดินร่วมสมัยที่สืบทอดภูมิปัญญาเครื่องปั้นดินเผาผสานดีไซน์สมัยใหม่',
            image_url: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1000&q=80',
            custom_options: [
              {
                id: 1,
                title: 'โทนสีของผิวเคลือบ (Ash Glaze Tone)',
                option_type: 'select',
                choices: ['เขียวเซลาดอนอ่อน (Celadon)', 'เทาถ่านหิน (Charcoal Grey)', 'น้ำตาลดินลูกรัง (Earth Brown)']
              },
              {
                id: 2,
                title: 'ข้อความสลักก้นแจกัน (Laser / Hand Inscription)',
                option_type: 'text',
                choices: []
              }
            ]
          };
        }
        setProduct(productData);

        // ดึงข้อมูลร้านค้าจริงจาก seller_id หรือ shop_id
        const targetSellerId = productData?.seller_id || productData?.shop_id;
        if (targetSellerId) {
          try {
            const shopRes = await fetch(`http://localhost:5000/api/shops/seller/${targetSellerId}`);
            const shopData = await shopRes.json();
            if (shopData.success && shopData.shop) {
              setShopInfo(shopData.shop);
            } else if (shopData.shop_name || shopData.store_name) {
              setShopInfo(shopData);
            }
          } catch (shopErr) {
            console.warn('Could not fetch dynamic shop info, using product default:', shopErr);
          }
        }

      } catch (err) {
        console.warn('Using fallback item:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleOptionChange = (key, value) => {
    setSelectedOptions((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, selectedOptions);
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 2500);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center font-mono text-xs text-stone-400">
        LOADING RUNWAY LOOKBOOK PIECE...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-display font-bold text-stone-800">ไม่พบชิ้นงานนี้ในสารบบรันเวย์</h2>
        <Link to="/products" className="text-xs font-mono font-bold text-[#E76F51] hover:underline uppercase">
          RETURN TO RUNWAY CATALOGUE
        </Link>
      </div>
    );
  }

  const sellerId = product?.seller_id || product?.shop_id || product?.user_id || 1;

  // ใช้ข้อมูลจาก shopInfo ถ้ามี ถ้าไม่มีค่อย fallback ไปใช้ข้อมูลใน product
  const displayShopName = shopInfo?.shop_name || shopInfo?.store_name || product.shop_name || product.store_name || product.artisan_name || 'Artisan Workshop';
  const displayShopBio = shopInfo?.bio || shopInfo?.shop_bio || product.shop_bio || 'มุ่งมั่นสร้างสรรค์งานคราฟต์ด้วยความตั้งใจ เพื่อส่งต่อจิตวิญญาณแห่งงานศิลปะทำมือ';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 editorial-canvas">

      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-stone-700 hover:text-[#E76F51] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO RUNWAY LOOKBOOK</span>
        </Link>

        <span className="text-[11px] font-mono text-stone-400 uppercase">
          CATALOGUE NO. #{product.id} // AUTUMN 2026
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

        {/* Left: Runway Photography Spread (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-stone-100 group">
            <img
              src={product.image_url || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80'}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />

            <div className="absolute top-5 left-5 flex flex-col gap-2 z-10">
              <span className="bg-black/80 backdrop-blur-md text-white text-[10px] font-mono font-bold tracking-widest px-3 py-1 rounded-md border border-white/20 uppercase">
                LOOK #0{product.id} • RUNWAY SELECTION
              </span>
              {Boolean(product.is_made_to_order) && (
                <Badge variant="terracotta" size="sm">
                  Made-to-Order Bespoke
                </Badge>
              )}
            </div>

            {product.lead_time_days > 0 && (
              <div className="absolute top-5 right-5 z-10 bg-[#FFF9EC]/95 backdrop-blur-md text-[#9E6E00] border border-[#FFE6A7] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>ระยะเวลาประดิษฐ์ {product.lead_time_days} วัน</span>
              </div>
            )}
          </div>

          {/* Artisan Atelier Spotlight Card */}
          <Link
            to={`/seller/${sellerId}`}
            className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs hover:border-[#1B4332] hover:shadow-md cursor-pointer transition-all flex items-start gap-4 group block"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#1B4332] text-[#FFE6A7] flex items-center justify-center shrink-0 font-display font-bold text-xl shadow-md group-hover:scale-105 transition-transform overflow-hidden">
              {shopInfo?.logo_url ? (
                <img src={shopInfo.logo_url} alt={displayShopName} className="w-full h-full object-cover" />
              ) : (
                <Store className="w-6 h-6" />
              )}
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1B4332]">
                  RUNWAY MASTER ATELIER
                </span>
                <span className="text-[11px] font-bold text-[#E76F51] opacity-0 group-hover:opacity-100 transition-opacity">
                  เยี่ยมชมร้านค้า →
                </span>
              </div>
              <h4 className="text-base font-display font-bold text-stone-900 group-hover:text-[#1B4332] transition-colors">
                {displayShopName}
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed font-normal line-clamp-2">
                {displayShopBio}
              </p>
            </div>
          </Link>
        </div>

        {/* Right: Editorial Typography, Custom Options & Purchase (6 cols) */}
        <div className="lg:col-span-6 space-y-7 text-left">

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#E76F51]">
              {product.category} • 100% ARTISANAL MADE-TO-ORDER
            </span>
            <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-stone-900 tracking-tight leading-tight">
              {product.title}
            </h1>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-display font-extrabold text-[#E76F51]">
                ฿{Number(product.price).toLocaleString()}
              </span>
              <span className="text-xs font-mono text-stone-400 uppercase">/ BESPOKE PIECE</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
            {product.description}
          </p>

          {/* Material & Craft Technique Highlights */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-white p-5 rounded-2xl border border-stone-200">
            <div>
              <span className="text-stone-400 block font-mono text-[10px] uppercase font-bold">MATERIAL SPECS</span>
              <span className="font-bold text-stone-900">{product.materials || 'คัดสรรวัสดุธรรมชาติ 100%'}</span>
            </div>
            <div>
              <span className="text-stone-400 block font-mono text-[10px] uppercase font-bold">CRAFT TECHNIQUE</span>
              <span className="font-bold text-stone-900">{product.craft_technique || 'งานมือดั้งเดิม (Handmade)'}</span>
            </div>
          </div>

          {/* Customization Options */}
          {product.custom_options && product.custom_options.length > 0 && (
            <OptionSelector
              options={product.custom_options}
              selectedOptions={selectedOptions}
              onChange={handleOptionChange}
            />
          )}

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 pt-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700">QUANTITY:</span>
            <div className="flex items-center border border-stone-300 rounded-full bg-white p-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-700 font-bold"
              >
                -
              </button>
              <span className="px-4 text-xs font-display font-bold text-stone-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-700 font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row gap-3.5">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-4 px-6 rounded-full bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>เพิ่มลงในตะกร้า</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="flex-1 py-4 px-6 rounded-full btn-runway-terracotta text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                <span>สั่งทำชิ้นงานทันที</span>
              </button>
            </div>

            {addedMessage && (
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#1B4332] bg-[#E8F7F3] py-2.5 rounded-full border border-[#A2D9D2] animate-bounce">
                <CheckCircle2 className="w-4 h-4 text-[#2A9D8F]" />
                <span>เพิ่มผลงานชิ้นเอกลงในตะกร้าเรียบร้อยแล้ว!</span>
              </div>
            )}
          </div>

          {/* Runway Guarantee */}
          <div className="pt-4 border-t border-stone-200 flex items-center gap-2 text-[11px] text-stone-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#1B4332]" />
            <span>รับประกันงานทำมือแท้ 100% ตรงตามสูจิบัตร ตรวจสอบกระบวนการทำได้ทุกขั้นตอน</span>
          </div>

        </div>

      </div>

      {/* Product Reviews */}
      <ProductReviews productId={product.id} currentUser={currentUser} />

    </div>
  );
};

export default ProductDetail;