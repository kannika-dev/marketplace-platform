import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import axios from 'axios';
import {
  ShieldCheck,
  CreditCard,
  Sparkles,
  Copy,
  Check,
  QrCode,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Lock,
  Leaf,
  HeartHandshake,
  Store
} from 'lucide-react';

export const Checkout = () => {
  const { clearCart, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { cart: contextCart } = useAuth();
  const cartItems = location.state?.cartItems || contextCart;

  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [receiverName, setReceiverName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [addressNo, setAddressNo] = useState('');
  const [subdistrict, setSubdistrict] = useState('');
  const [district, setDistrict] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [note, setNote] = useState('');

  // เก็บข้อมูลร้านค้าแยกตาม seller_id
  const [shopsMap, setShopsMap] = useState({});
  const [paymentMethods, setPaymentMethods] = useState({}); // { [sellerId]: 'bank_transfer' | 'promptpay' | 'credit_card' }
  const [copiedStates, setCopiedStates] = useState({});

  useEffect(() => {
    if (user) {
      setReceiverName(user.name || user.full_name || '');
      setPhoneNumber(user.phone || user.tel || '');
      setAddressNo(user.address_no || user.address || '');
      setSubdistrict(user.subdistrict || '');
      setDistrict(user.district || '');
      setProvince(user.province || '');
      setPostalCode(user.zipcode || user.postal_code || '');
    }
  }, [user]);

  // จัดกลุ่มสินค้าตาม seller_id
  const groupedBySeller = cartItems.reduce((acc, item) => {
    const sId = item.seller_id || item.artisan_id || 1;
    if (!acc[sId]) {
      acc[sId] = {
        sellerName: item.store_name || item.artisan_name || `ร้านค้า #${sId}`,
        items: []
      };
    }
    acc[sId].items.push(item);
    return acc;
  }, {});

  // ดึงข้อมูลร้านค้าทั้งหมดที่อยู่ในตะกร้าจาก Backend
  useEffect(() => {
    const fetchAllShops = async () => {
      const sellerIds = Object.keys(groupedBySeller);
      const newShopsMap = {};
      const initialPayments = {};

      for (const sId of sellerIds) {
        try {
          const res = await axios.get(`/api/shops/seller/${sId}`);
          if (res.data && res.data.success) {
            newShopsMap[sId] = res.data.data;
          }
        } catch (err) {
          console.error(`Error fetching shop info for seller ${sId}:`, err);
          // Fallback ถ้าดึงไม่ได้
          newShopsMap[sId] = {
            bank_name: 'ธนาคารกรุงเทพ (BBL)',
            bank_account: '644-0-699665',
            account_name: 'กรรณิการ์ เหลือดี',
            promptpay_number: '0839353986',
            qr_code_url: ''
          };
        }
        initialPayments[sId] = 'bank_transfer';
      }

      setShopsMap(newShopsMap);
      setPaymentMethods(initialPayments);
    };

    if (cartItems.length > 0) {
      fetchAllShops();
    }
  }, [cartItems]);

  const handlePaymentMethodChange = (sellerId, method) => {
    setPaymentMethods(prev => ({ ...prev, [sellerId]: method }));
  };

  const copyBankNumber = (sellerId, accountNo) => {
    navigator.clipboard.writeText(accountNo);
    setCopiedStates(prev => ({ ...prev, [sellerId]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [sellerId]: false }));
    }, 2000);
  };

  // คำนวณยอดรวมทั้งหมดของตะกร้า
  const totalFullPrice = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  // คำนวณยอดภาพรวม
  let totalDueNow = 0;
  let totalRemaining = 0;
  let hasAnyDeposit = false;

  cartItems.forEach(item => {
    const itemTotal = Number(item.price) * item.quantity;
    if (item.chosen_payment_type === 'deposit') {
      totalDueNow += itemTotal / 2;
      totalRemaining += (itemTotal - itemTotal / 2);
      hasAnyDeposit = true;
    } else {
      totalDueNow += itemTotal;
    }
  });

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-3xl font-display font-bold text-stone-800">ไม่มีสินค้าในตะกร้า</h2>
        <Link to="/products" className="text-xs text-[#2A9D8F] font-bold hover:underline">
          กลับไปเลือกชมงานคราฟต์
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!addressNo.trim() || !receiverName.trim() || !phoneNumber.trim()) {
      setErrorMsg('กรุณากรอกชื่อผู้รับ เบอร์โทร และที่อยู่จัดส่งให้ครบถ้วน');
      setCurrentStep(1);
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const fullAddressPayload = `${receiverName} (โทร: ${phoneNumber})\nบ้านเลขที่/ซอย: ${addressNo}\nตำบล/แขวง: ${subdistrict} อ.เภอ/เขต: ${district}\nจ. ${province} รหัสไปรษณีย์ ${postalCode}`;

      // ส่งข้อมูลไปสร้างออเดอร์แยกตามร้านค้า (Backend ของเราจะจัดการแยก Order ให้เอง)
      const orderPayload = {
        shipping_address: fullAddressPayload,
        note: `[รูปแบบการชำระเงิน: ${hasAnyDeposit ? 'ผสมผสาน (มีรายการมัดจำ)' : 'ชำระเต็มจำนวน'}] ${note}`,
        payment_method: Object.values(paymentMethods)[0] || 'bank_transfer',
        items: cartItems.map((item) => ({
          product_id: item.id || item.product_id,
          quantity: Number(item.quantity) || 1,
          payment_type: item.chosen_payment_type || 'full',
          customization_notes: item.selectedOptions ? JSON.stringify(item.selectedOptions) : (item.customization_notes || null)
        }))
      };

      await createOrder(orderPayload);
      clearCart();
      alert(`✨ สร้างคำสั่งซื้อแยกตามร้านค้าสำเร็จ! กำลังพาท่านไปที่หน้าติดตามสินค้า (Craft Tracker)...`);
      navigate('/buyer-dashboard?tab=tracker');
    } catch (err) {
      console.error('Place order error:', err);
      setErrorMsg(err.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2A9D8F] hover:text-[#1B4332] mb-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>ย้อนกลับไปที่ตะกร้าสินค้า</span>
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-stone-900 tracking-tight">
            ขั้นตอนการสั่งทำและชำระเงิน
          </h1>
          <span className="bg-[#E8F7F3] text-[#2A9D8F] text-xs font-bold px-3 py-1 rounded-full border border-[#A2D9D2] flex items-center gap-1">
            <Lock className="w-3 h-3" /> Secure 256-Bit SSL
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 text-rose-700 text-xs rounded-2xl border border-rose-200 font-medium">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-5">
          {/* STEP 1: Address */}
          <div className={`clay-card rounded-3xl border transition-all overflow-hidden ${currentStep === 1 ? 'border-[#2A9D8F] ring-2 ring-[#2A9D8F]/20' : 'border-white'}`}>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="w-full p-5 sm:p-6 text-left flex items-center justify-between bg-white/60 hover:bg-white/95 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm ${addressNo ? 'btn-3d-botanical text-white' : 'bg-stone-100 text-stone-600'}`}>
                  1
                </div>
                <div>
                  <h3 className="text-base font-display font-bold text-stone-900">
                    ที่อยู่จัดส่งผลงาน (Shipping Information)
                  </h3>
                  <p className="text-xs text-stone-500 font-normal">
                    {addressNo ? `${receiverName} • ${addressNo}, ${province}` : 'ตรวจสอบหรือแก้ไขที่อยู่จัดส่ง'}
                  </p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-stone-400 transition-transform ${currentStep === 1 ? 'rotate-90 text-[#2A9D8F]' : ''}`} />
            </button>

            {currentStep === 1 && (
              <div className="p-6 sm:p-8 pt-2 border-t border-emerald-100/60 space-y-4 bg-white/40">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1.5">ชื่อ-นามสกุล ผู้รับ *</label>
                    <input
                      type="text"
                      required
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      className="w-full text-xs p-3.5 bg-white border border-emerald-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1.5">เบอร์โทรศัพท์ติดต่อ *</label>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full text-xs p-3.5 bg-white border border-emerald-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1.5">บ้านเลขที่ / ซอย / หมู่ *</label>
                  <input
                    type="text"
                    required
                    value={addressNo}
                    onChange={(e) => setAddressNo(e.target.value)}
                    className="w-full text-xs p-3.5 bg-white border border-emerald-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1.5">ตำบล / แขวง</label>
                    <input
                      type="text"
                      value={subdistrict}
                      onChange={(e) => setSubdistrict(e.target.value)}
                      className="w-full text-xs p-3.5 bg-white border border-emerald-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1.5">อำเภอ / เขต</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full text-xs p-3.5 bg-white border border-emerald-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1.5">จังหวัด</label>
                    <input
                      type="text"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full text-xs p-3.5 bg-white border border-emerald-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1.5">รหัสไปรษณีย์</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full text-xs p-3.5 bg-white border border-emerald-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1.5">ข้อความเพิ่มเติมถึงช่างฝีมือ (Artisan Note)</label>
                  <input
                    type="text"
                    placeholder="เช่น ห่อของขวัญ, สลักวันที่พิเศษ..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full text-xs p-3.5 bg-white border border-emerald-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F]"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!addressNo.trim() || !receiverName.trim() || !phoneNumber.trim()) {
                        alert('กรุณากรอกชื่อ เบอร์โทร และที่อยู่ให้ครบถ้วนก่อนดำเนินการต่อ');
                        return;
                      }
                      setCurrentStep(2);
                    }}
                    className="px-6 py-3 rounded-2xl btn-3d-botanical text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>ต่อไป: เลือกช่องทางชำระเงิน</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: Payment Method (แสดงแยกตามร้านค้า) */}
          <div className={`clay-card rounded-3xl border transition-all overflow-hidden ${currentStep === 2 ? 'border-[#2A9D8F] ring-2 ring-[#2A9D8F]/20' : 'border-white'}`}>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="w-full p-5 sm:p-6 text-left flex items-center justify-between bg-white/60 hover:bg-white/95 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm ${currentStep === 2 ? 'btn-3d-botanical text-white' : 'bg-stone-100 text-stone-600'}`}>
                  2
                </div>
                <div>
                  <h3 className="text-base font-display font-bold text-stone-900">
                    ช่องทางการชำระเงินแยกตามร้านค้า (Payment Method per Shop)
                  </h3>
                  <p className="text-xs text-stone-500 font-normal">
                    สินค้าในตะกร้ามาจาก {Object.keys(groupedBySeller).length} ร้านค้า • ชำระเงินแยกตามบัญชีของแต่ละร้าน
                  </p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-stone-400 transition-transform ${currentStep === 2 ? 'rotate-90 text-[#2A9D8F]' : ''}`} />
            </button>

            {currentStep === 2 && (
              <div className="p-6 sm:p-8 pt-2 border-t border-emerald-100/60 space-y-8 bg-white/40">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-[#1B4332] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#2A9D8F] shrink-0" />
                  <span>ระบบจะทำการแยกคำสั่งซื้อ (Split Order) ตามร้านค้าอัตโนมัติ กรุณาตรวจสอบช่องทางชำระเงินของแต่ละร้านด้านล่างนี้ค่ะ</span>
                </div>

                {/* วนลูปแสดงช่องทางการชำระเงินแยกตามแต่ละร้าน */}
                {Object.entries(groupedBySeller).map(([sellerId, group]) => {
                  const shop = shopsMap[sellerId] || {};
                  const currentMethod = paymentMethods[sellerId] || 'bank_transfer';

                  // คำนวณยอดเฉพาะของร้านนี้
                  const shopDueNow = group.items.reduce((sum, item) => {
                    const itemTotal = Number(item.price) * item.quantity;
                    return sum + (item.chosen_payment_type === 'deposit' ? itemTotal / 2 : itemTotal);
                  }, 0);

                  return (
                    <div key={sellerId} className="p-5 rounded-3xl bg-white border border-emerald-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 pb-3 border-b border-emerald-50">
                        <Store className="w-4 h-4 text-[#2A9D8F]" />
                        <h4 className="text-sm font-display font-bold text-stone-900">{group.sellerName}</h4>
                        <span className="ml-auto text-xs font-bold text-[#E76F51]">ยอดชำระร้านนี้: ฿{shopDueNow.toLocaleString()}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div
                          onClick={() => handlePaymentMethodChange(sellerId, 'bank_transfer')}
                          className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-2 ${currentMethod === 'bank_transfer' ? 'border-[#2A9D8F] bg-[#E8F7F3]' : 'border-emerald-100 bg-white'}`}
                        >
                          <div className="flex items-center justify-between">
                            <CreditCard className="w-4 h-4 text-[#2A9D8F]" />
                            {currentMethod === 'bank_transfer' && <CheckCircle2 className="w-4 h-4 text-[#2A9D8F]" />}
                          </div>
                          <span className="text-xs font-bold text-stone-900">โอนผ่านธนาคาร</span>
                        </div>

                        <div
                          onClick={() => handlePaymentMethodChange(sellerId, 'promptpay')}
                          className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-2 ${currentMethod === 'promptpay' ? 'border-[#2A9D8F] bg-[#E8F7F3]' : 'border-emerald-100 bg-white'}`}
                        >
                          <div className="flex items-center justify-between">
                            <QrCode className="w-4 h-4 text-[#2A9D8F]" />
                            {currentMethod === 'promptpay' && <CheckCircle2 className="w-4 h-4 text-[#2A9D8F]" />}
                          </div>
                          <span className="text-xs font-bold text-stone-900">พร้อมเพย์ QR Code</span>
                        </div>

                        <div
                          onClick={() => handlePaymentMethodChange(sellerId, 'credit_card')}
                          className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-2 ${currentMethod === 'credit_card' ? 'border-[#2A9D8F] bg-[#E8F7F3]' : 'border-emerald-100 bg-white'}`}
                        >
                          <div className="flex items-center justify-between">
                            <Lock className="w-4 h-4 text-[#2A9D8F]" />
                            {currentMethod === 'credit_card' && <CheckCircle2 className="w-4 h-4 text-[#2A9D8F]" />}
                          </div>
                          <span className="text-xs font-bold text-stone-900">บัตรเครดิต</span>
                        </div>
                      </div>

                      {/* รายละเอียดบัญชีธนาคารของร้านนี้ */}
                      {currentMethod === 'bank_transfer' && (
                        <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 text-xs space-y-2">
                          <p className="font-bold text-amber-900">บัญชีธนาคารของ {group.sellerName}</p>
                          <p className="text-stone-700 font-medium">{shop.bank_name || 'ไม่ระบุธนาคาร'}</p>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-base font-extrabold text-stone-900 bg-white px-3 py-1 rounded-xl border border-amber-200">
                              {shop.bank_account || '000-0-00000-0'}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyBankNumber(sellerId, shop.bank_account)}
                              className="px-3 py-1 bg-white text-stone-700 hover:text-[#2A9D8F] rounded-xl border border-amber-200 font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              {copiedStates[sellerId] ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedStates[sellerId] ? 'คัดลอกแล้ว' : 'คัดลอกเลขบัญชี'}</span>
                            </button>
                          </div>
                          <p className="text-stone-600">ชื่อบัญชี: {shop.account_name || '-'}</p>
                          <p className="text-[11px] text-[#E76F51] font-bold">
                            * ยอดโอนร้านนี้: ฿{shopDueNow.toLocaleString()}
                          </p>
                        </div>
                      )}

                      {/* รายละเอียดพร้อมเพย์และ QR Code ของร้านนี้ พร้อมกำกับยอดเงิน */}
                      {currentMethod === 'promptpay' && (
                        <div className="p-4 bg-white rounded-2xl border border-emerald-200 text-xs space-y-3 flex flex-col sm:flex-row items-center gap-4">
                          <div className="w-28 h-28 bg-[#E8F7F3] rounded-2xl border border-[#A2D9D2] flex items-center justify-center p-2 shrink-0">
                            {shop.qr_code_url ? (
                              <img src={shop.qr_code_url} alt="PromptPay QR" className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <QrCode className="w-16 h-16 text-[#2A9D8F]" />
                            )}
                          </div>
                          <div className="space-y-1 text-center sm:text-left">
                            <span className="text-[11px] font-bold text-[#2A9D8F] bg-[#E8F7F3] px-2 py-0.5 rounded-md">
                              พร้อมเพย์: {shop.promptpay_number || 'ไม่ระบุ'}
                            </span>
                            <h4 className="text-xs font-bold text-stone-900">สแกน QR เพื่อจ่ายยอดร้านนี้</h4>
                            <p className="text-sm font-extrabold text-[#E76F51]">฿{shopDueNow.toLocaleString()}</p>
                            <p className="text-[10px] text-stone-400">* กรุณาโอนให้ตรงกับยอดชำระของร้านนี้เท่านั้น</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-3 rounded-2xl btn-3d-botanical text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>ต่อไป: ตรวจสอบและยืนยัน</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: Review */}
          <div className={`clay-card rounded-3xl border transition-all overflow-hidden ${currentStep === 3 ? 'border-[#2A9D8F] ring-2 ring-[#2A9D8F]/20' : 'border-white'}`}>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="w-full p-5 sm:p-6 text-left flex items-center justify-between bg-white/60 hover:bg-white/95 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm ${currentStep === 3 ? 'btn-3d-peach text-white' : 'bg-stone-100 text-stone-600'}`}>
                  3
                </div>
                <div>
                  <h3 className="text-base font-display font-bold text-stone-900">
                    ตรวจสอบและยืนยันคำสั่งซื้อ (Review & Place Order)
                  </h3>
                  <p className="text-xs text-stone-500 font-normal">
                    ตรวจสอบความถูกต้องก่อนยืนยันคำสั่งซื้อ
                  </p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-stone-400 transition-transform ${currentStep === 3 ? 'rotate-90 text-[#2A9D8F]' : ''}`} />
            </button>

            {currentStep === 3 && (
              <div className="p-6 sm:p-8 pt-2 border-t border-emerald-100/60 space-y-4 bg-white/40">
                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs space-y-2 text-stone-700">
                  <div className="flex items-center gap-2 text-[#2A9D8F] font-bold">
                    <HeartHandshake className="w-4 h-4" />
                    <span>เงื่อนไขการแยกคำสั่งซื้อตามร้านค้า</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-stone-600">
                    ระบบจะสร้างออเดอร์แยกตามแต่ละร้านค้าให้โดยอัตโนมัติ คุณสามารถติดตามสถานะงานได้ในหน้า <strong>"Craft Tracker"</strong>
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={submitting}
                    className="w-full sm:w-auto px-10 py-4 btn-3d-peach text-sm font-bold rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{submitting ? 'กำลังสร้างออเดอร์แยกตามร้าน...' : 'ยืนยันและส่งคำสั่งซื้อทันที'}</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Invoice Preview */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="clay-card p-6 sm:p-7 rounded-3xl border border-white shadow-xl space-y-5 bg-white/95 backdrop-blur-md">
            <div className="border-b border-emerald-100 pb-3">
              <h3 className="text-lg font-display font-extrabold text-stone-900">
                สรุปรายการสินค้า ({cartItems.length} ชิ้น)
              </h3>
              <span className="text-[11px] text-stone-400 font-medium">Invoice Preview</span>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-emerald-50">
              {cartItems.map((item, idx) => (
                <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=150&q=80'}
                      alt={item.title}
                      className="w-12 h-12 rounded-xl object-cover bg-stone-100 shrink-0 border border-white"
                    />
                    <div>
                      <p className="font-display font-bold text-stone-900 line-clamp-1">{item.title}</p>
                      <span className="text-stone-400 text-[11px]">จำนวน: {item.quantity} • {item.chosen_payment_type === 'deposit' ? 'มัดจำ 50%' : 'จ่ายเต็ม'}</span>
                    </div>
                  </div>
                  <span className="font-display font-bold text-stone-800 shrink-0">
                    ฿{(Number(item.price) * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-emerald-100 pt-3.5 space-y-2 text-xs font-medium text-stone-600">
              <div className="flex justify-between">
                <span>ยอดรวมสินค้าทั้งหมด</span>
                <span className="font-bold text-stone-800">฿{totalFullPrice.toLocaleString()}</span>
              </div>

              {totalRemaining > 0 && (
                <div className="flex justify-between text-amber-600">
                  <span>ยอดค้างชำระงวดสองรวม</span>
                  <span className="font-bold">฿{totalRemaining.toLocaleString()}</span>
                </div>
              )}

              <div className="border-t border-emerald-100 pt-3 flex justify-between items-baseline">
                <div>
                  <span className="font-display font-bold text-stone-900 text-xs">ยอดที่ต้องชำระตอนนี้</span>
                  <span className="text-[10px] text-stone-400 block">(Due Now)</span>
                </div>
                <span className="text-[#E76F51] text-2xl font-display font-extrabold">
                  ฿{totalDueNow.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-[#E8F7F3] rounded-2xl border border-[#A2D9D2] flex items-center gap-2 text-[11px] text-[#1B4332] font-semibold">
              <Leaf className="w-4 h-4 text-[#2A9D8F] shrink-0" />
              <span>บรรจุด้วยกล่องรังผึ้งและ Eco-Cushion ปลดพลาสติก 100%</span>
            </div>

            <div className="text-[11px] text-stone-400 flex items-center justify-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#2A9D8F]" />
              <span>คุ้มครองคำสั่งซื้อโดย Craftiverse Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;