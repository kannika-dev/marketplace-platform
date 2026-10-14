import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
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
  Percent,
  MapPin,
  Phone
} from 'lucide-react';

export const Checkout = () => {
  const { cart, clearCart, user } = useAuth();
  const navigate = useNavigate();

  // Accordion active step (1: Address, 2: Payment, 3: Review)
  const [currentStep, setCurrentStep] = useState(1);

  // Form states (กำหนดค่าเริ่มต้นเป็นค่าว่างก่อน เพื่อรอข้อมูลจาก user)
  const [receiverName, setReceiverName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [addressNo, setAddressNo] = useState('');
  const [subdistrict, setSubdistrict] = useState('');
  const [district, setDistrict] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [note, setNote] = useState('');

  // เมื่อข้อมูล user โหลดเสร็จ ดึงข้อมูลมาเติมใส่อัตโนมัติ (และผู้ใช้สามารถพิมพ์แก้ได้อิสระ)
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

  // Payment Type ('full' | 'deposit') & Method ('bank_transfer' | 'promptpay' | 'credit_card')
  const [paymentType, setPaymentType] = useState('full');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [copied, setCopied] = useState(false);

  // Card mock state
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const totalAmount = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const depositAmount = Math.round(totalAmount * 0.5);
  const payableNow = paymentType === 'deposit' ? depositAmount : totalAmount;

  const copyBankNumber = () => {
    navigator.clipboard.writeText('0982345678');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (cart.length === 0) {
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
      // ประกอบร่างที่อยู่แบบละเอียดส่งเข้า Backend
      const fullAddressPayload = `${receiverName} (โทร: ${phoneNumber})\nบ้านเลขที่/ซอย: ${addressNo}\nตำบล/แขวง: ${subdistrict} อ.เภอ/เขต: ${district}\nจ. ${province} รหัสไปรษณีย์ ${postalCode}`;

      const orderPayload = {
        shipping_address: fullAddressPayload,
        note: `[การชำระเงิน: ${paymentType === 'deposit' ? 'มัดจำ 50%' : 'ชำระเต็มจำนวน'}] ${note}`,
        payment_type: paymentType,
        payment_method: paymentMethod,
        deposit_amount: paymentType === 'deposit' ? depositAmount : totalAmount,
        remaining_balance: paymentType === 'deposit' ? (totalAmount - depositAmount) : 0,
        items: cart.map((item) => ({
          product_id: item.id || item.product_id,
          quantity: Number(item.quantity) || 1,
          customization_notes: item.selectedOptions ? JSON.stringify(item.selectedOptions) : (item.customization_notes || null)
        }))
      };

      await createOrder(orderPayload);
      clearCart();
      alert(`✨ สร้างคำสั่งซื้อสำเร็จ! (${paymentType === 'deposit' ? 'เลือกชำระมัดจำ 50%' : 'ชำระเต็มจำนวน'}) กำลังพาท่านไปที่หน้าติดตามสินค้า (Craft Tracker)...`);
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

      {/* Header */}
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

      {/* 2-Column Split: Form (Left) & Invoice Summary Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT COLUMN: Modern 3-Step Visual Accordion (8 cols) */}
        <div className="lg:col-span-8 space-y-5">

          {/* STEP 1: Shipping Address (Auto-filled & Editable) */}
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
                    ที่อยู่จัดส่งผลงาน (Shipping Information - Auto-filled)
                  </h3>
                  <p className="text-xs text-stone-500 font-normal">
                    {addressNo ? `${receiverName} • ${addressNo}, ${province}` : 'ดึงข้อมูลจากโปรไฟล์ของคุณอัตโนมัติ สามารถแก้ไขได้'}
                  </p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-stone-400 transition-transform ${currentStep === 1 ? 'rotate-90 text-[#2A9D8F]' : ''}`} />
            </button>

            {currentStep === 1 && (
              <div className="p-6 sm:p-8 pt-2 border-t border-emerald-100/60 space-y-4 bg-white/40">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-[#1B4332] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#2A9D8F] shrink-0" />
                  <span>ระบบดึงข้อมูลที่อยู่จากหน้าโปรไฟล์มาเป็นค่าเริ่มต้นให้แล้ว สามารถพิมพ์แก้ไขเฉพาะออเดอร์นี้ได้ทันทีค่ะ</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1.5">ชื่อ-นามสกุล ผู้รับ *</label>
                    <input
                      type="text"
                      required
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      className="w-full text-xs p-3.5 bg-white border border-emerald-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F] shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1.5">เบอร์โทรศัพท์ติดต่อ (phone) *</label>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full text-xs p-3.5 bg-white border border-emerald-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F] shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1.5">บ้านเลขที่ / ซอย / หมู่ (address_no) *</label>
                  <input
                    type="text"
                    required
                    value={addressNo}
                    onChange={(e) => setAddressNo(e.target.value)}
                    className="w-full text-xs p-3.5 bg-white border border-emerald-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F] shadow-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1.5">ตำบล / แขวง (subdistrict)</label>
                    <input
                      type="text"
                      value={subdistrict}
                      onChange={(e) => setSubdistrict(e.target.value)}
                      className="w-full text-xs p-3.5 bg-white border border-emerald-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F] shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1.5">อำเภอ / เขต (district)</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full text-xs p-3.5 bg-white border border-emerald-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F] shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1.5">จังหวัด (province)</label>
                    <input
                      type="text"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full text-xs p-3.5 bg-white border border-emerald-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F] shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1.5">รหัสไปรษณีย์ (zipcode)</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full text-xs p-3.5 bg-white border border-emerald-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F] shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1.5">
                    ข้อความเพิ่มเติมถึงช่างฝีมือ (Artisan Note)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น ห่อของขวัญ, สลักวันที่พิเศษ..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full text-xs p-3.5 bg-white border border-emerald-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F] shadow-xs"
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
                    <span>ต่อไป: เลือกวิธีชำระเงิน</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: Payment Type & Method */}
          <div className={`clay-card rounded-3xl border transition-all overflow-hidden ${currentStep === 2 ? 'border-[#2A9D8F] ring-2 ring-[#2A9D8F]/20' : 'border-white'}`}>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="w-full p-5 sm:p-6 text-left flex items-center justify-between bg-white/60 hover:bg-white/95 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm ${paymentMethod ? 'btn-3d-botanical text-white' : 'bg-stone-100 text-stone-600'}`}>
                  2
                </div>
                <div>
                  <h3 className="text-base font-display font-bold text-stone-900">
                    รูปแบบและช่องทางการชำระเงิน (Payment Options)
                  </h3>
                  <p className="text-xs text-stone-500 font-normal">
                    {paymentType === 'deposit' ? 'จ่ายมัดจำ 50%' : 'ชำระเต็มจำนวน'} • {paymentMethod === 'bank_transfer' ? 'โอนผ่านธนาคาร' : paymentMethod === 'promptpay' ? 'พร้อมเพย์' : 'บัตรเครดิต'}
                  </p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-stone-400 transition-transform ${currentStep === 2 ? 'rotate-90 text-[#2A9D8F]' : ''}`} />
            </button>

            {currentStep === 2 && (
              <div className="p-6 sm:p-8 pt-2 border-t border-emerald-100/60 space-y-6 bg-white/40">

                <div className="space-y-3">
                  <label className="text-xs font-bold text-stone-800 block">
                    เลือกรูปแบบการชำระเงินสำหรับงานแฮนด์เมด (Made-to-Order) *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setPaymentType('full')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${paymentType === 'full' ? 'border-[#2A9D8F] bg-[#E8F7F3] shadow-sm' : 'border-emerald-100 bg-white hover:border-[#2A9D8F]/40'}`}
                    >
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${paymentType === 'full' ? 'bg-[#2A9D8F] text-white' : 'bg-stone-100 text-stone-400'}`}>
                        <CreditCard className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-stone-900 block">ชำระเต็มจำนวน (Full Payment)</span>
                        <span className="text-[11px] text-stone-500 block mt-0.5">ชำระยอดรวมทั้งหมด ฿{totalAmount.toLocaleString()} จบในรอบเดียว</span>
                      </div>
                    </div>

                    <div
                      onClick={() => setPaymentType('deposit')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${paymentType === 'deposit' ? 'border-[#2A9D8F] bg-[#E8F7F3] shadow-sm' : 'border-emerald-100 bg-white hover:border-[#2A9D8F]/40'}`}
                    >
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${paymentType === 'deposit' ? 'bg-[#2A9D8F] text-white' : 'bg-stone-100 text-stone-400'}`}>
                        <Percent className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-stone-900 block">จ่ายมัดจำ 50% (Deposit)</span>
                        <span className="text-[11px] text-stone-500 block mt-0.5">จ่ายมัดจำก่อน ฿{depositAmount.toLocaleString()} (ส่วนที่เหลือจ่ายก่อนส่งมอบ)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-emerald-100" />

                <div className="space-y-3">
                  <label className="text-xs font-bold text-stone-800 block">เลือกช่องทางชำระเงิน *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div
                      onClick={() => setPaymentMethod('bank_transfer')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-2 ${paymentMethod === 'bank_transfer' ? 'border-[#2A9D8F] bg-[#E8F7F3] shadow-sm' : 'border-emerald-100 bg-white hover:border-[#2A9D8F]/50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-white text-[#2A9D8F] flex items-center justify-center font-bold shadow-2xs">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        {paymentMethod === 'bank_transfer' && <CheckCircle2 className="w-4 h-4 text-[#2A9D8F]" />}
                      </div>
                      <div>
                        <span className="text-xs font-display font-bold text-stone-900 block">โอนผ่านธนาคาร</span>
                        <span className="text-[10px] text-stone-500">KBANK / SCB / BBL</span>
                      </div>
                    </div>

                    <div
                      onClick={() => setPaymentMethod('promptpay')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-2 ${paymentMethod === 'promptpay' ? 'border-[#2A9D8F] bg-[#E8F7F3] shadow-sm' : 'border-emerald-100 bg-white hover:border-[#2A9D8F]/50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-white text-[#2A9D8F] flex items-center justify-center font-bold shadow-2xs">
                          <QrCode className="w-4 h-4" />
                        </div>
                        {paymentMethod === 'promptpay' && <CheckCircle2 className="w-4 h-4 text-[#2A9D8F]" />}
                      </div>
                      <div>
                        <span className="text-xs font-display font-bold text-stone-900 block">พร้อมเพย์ QR Code</span>
                        <span className="text-[10px] text-stone-500">สแกนจ่ายได้ทุกแอป</span>
                      </div>
                    </div>

                    <div
                      onClick={() => setPaymentMethod('credit_card')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-2 ${paymentMethod === 'credit_card' ? 'border-[#2A9D8F] bg-[#E8F7F3] shadow-sm' : 'border-emerald-100 bg-white hover:border-[#2A9D8F]/50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-white text-[#2A9D8F] flex items-center justify-center font-bold shadow-2xs">
                          <Lock className="w-4 h-4" />
                        </div>
                        {paymentMethod === 'credit_card' && <CheckCircle2 className="w-4 h-4 text-[#2A9D8F]" />}
                      </div>
                      <div>
                        <span className="text-xs font-display font-bold text-stone-900 block">บัตรเครดิต / เดบิต</span>
                        <span className="text-[10px] text-stone-500">Visa / Mastercard</span>
                      </div>
                    </div>
                  </div>
                </div>

                {paymentMethod === 'bank_transfer' && (
                  <div className="p-5 bg-gradient-to-r from-[#FFF9EC] to-[#FFE6A7]/40 rounded-2xl border border-[#FFE6A7] text-xs space-y-2.5">
                    <p className="font-bold text-[#9E6E00]">บัญชีธนาคารกลางสำหรับแพลตฟอร์ม Craftiverse</p>
                    <p className="text-stone-700 font-medium">ธนาคารกสิกรไทย (KBANK)</p>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-base font-extrabold text-stone-900 bg-white px-3 py-1.5 rounded-xl border border-amber-200 shadow-2xs">
                        098-2-34567-8
                      </span>
                      <button
                        type="button"
                        onClick={copyBankNumber}
                        className="px-3 py-1.5 bg-white text-stone-700 hover:text-[#2A9D8F] rounded-xl border border-amber-200 shadow-2xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกเลขบัญชี'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      * ยอดที่ต้องโอนตอนนี้: <strong className="text-[#E76F51]">฿{payableNow.toLocaleString()}</strong> ({paymentType === 'deposit' ? 'มัดจำ 50%' : 'ชำระเต็มจำนวน'})
                    </p>
                  </div>
                )}

                {paymentMethod === 'promptpay' && (
                  <div className="p-5 bg-white rounded-2xl border border-emerald-200 text-xs space-y-3 text-center sm:text-left flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-28 h-28 bg-[#E8F7F3] rounded-2xl border border-[#A2D9D2] flex items-center justify-center p-2 shrink-0">
                      <QrCode className="w-20 h-20 text-[#2A9D8F]" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#2A9D8F] bg-[#E8F7F3] px-2 py-0.5 rounded-md">
                        PromptPay Real-time
                      </span>
                      <h4 className="text-sm font-display font-bold text-stone-900">
                        สแกน QR Code เพื่อชำระยอด ฿{payableNow.toLocaleString()}
                      </h4>
                    </div>
                  </div>
                )}

                {paymentMethod === 'credit_card' && (
                  <div className="p-5 bg-white rounded-2xl border border-emerald-200 space-y-3">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">หมายเลขบัตรเครดิต</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full text-xs p-3 bg-stone-50 border border-emerald-200 rounded-xl font-mono focus:outline-none focus:border-[#2A9D8F]"
                      />
                    </div>
                  </div>
                )}

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

          {/* STEP 3: Review & Final Confirmation */}
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
                    ตรวจสอบความถูกต้องของรายการสั่งทำและเงื่อนไขการมัดจำ
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
                    <span>เงื่อนไขงาน Made-to-Order และการติดตามสินค้า</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-stone-600">
                    เมื่อกดยืนยันคำสั่งซื้อแล้ว ระบบจะนำคุณไปยังหน้า <strong>"ติดตามสินค้า (Craft Tracker)"</strong> ทันทีค่ะ
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={submitting}
                    className="w-full sm:w-auto px-10 py-4 btn-3d-peach text-sm font-bold rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{submitting ? 'กำลังส่งคำสั่งซื้อ...' : 'ยืนยันและส่งคำสั่งซื้อทันที'}</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Sticky Invoice Preview Card (4 cols) */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="clay-card p-6 sm:p-7 rounded-3xl border border-white shadow-xl space-y-5 bg-white/95 backdrop-blur-md">
            <div className="border-b border-emerald-100 pb-3">
              <h3 className="text-lg font-display font-extrabold text-stone-900">
                สรุปรายการสินค้า ({cart.length} ชิ้น)
              </h3>
              <span className="text-[11px] text-stone-400 font-medium">Invoice Preview</span>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-emerald-50">
              {cart.map((item, idx) => (
                <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=150&q=80'}
                      alt={item.title}
                      className="w-12 h-12 rounded-xl object-cover bg-stone-100 shrink-0 border border-white"
                    />
                    <div>
                      <p className="font-display font-bold text-stone-900 line-clamp-1">{item.title}</p>
                      <span className="text-stone-400 text-[11px]">จำนวน: {item.quantity} ชิ้น</span>
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
                <span className="font-bold text-stone-800">฿{totalAmount.toLocaleString()}</span>
              </div>

              {paymentType === 'deposit' && (
                <div className="flex justify-between text-[#2A9D8F] font-bold bg-[#E8F7F3] px-2.5 py-1.5 rounded-xl">
                  <span>มัดจำล่วงหน้า (50%)</span>
                  <span>฿{depositAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="border-t border-emerald-100 pt-3 flex justify-between items-baseline">
                <div>
                  <span className="font-display font-bold text-stone-900 text-xs">ยอดที่ต้องชำระตอนนี้</span>
                  <span className="text-[10px] text-stone-400 block">{paymentType === 'deposit' ? '(ยอดมัดจำงวดแรก)' : '(ชำระเต็มจำนวน)'}</span>
                </div>
                <span className="text-[#E76F51] text-2xl font-display font-extrabold">
                  ฿{payableNow.toLocaleString()}
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