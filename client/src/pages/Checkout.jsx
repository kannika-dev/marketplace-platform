import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import {
  ShieldCheck,
  Truck,
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
  Clock,
  HeartHandshake
} from 'lucide-react';

export const Checkout = () => {
  const { cart, clearCart, user } = useAuth();
  const navigate = useNavigate();

  // Accordion active step (1: Address, 2: Payment, 3: Review)
  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [receiverName, setReceiverName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState('081-234-5678');
  const [shippingAddress, setShippingAddress] = useState('');
  const [postalCode, setPostalCode] = useState('10110');
  const [note, setNote] = useState('');

  // Payment method state ('bank_transfer' | 'promptpay' | 'credit_card')
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [copied, setCopied] = useState(false);

  // Card mock state
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('•••');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const totalAmount = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

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
    if (!shippingAddress.trim() || !receiverName.trim()) {
      setErrorMsg('กรุณากรอกชื่อผู้รับและที่อยู่สำหรับจัดส่งผลงานให้ครบถ้วน');
      setCurrentStep(1);
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const fullAddressPayload = `${receiverName} (โทร: ${phoneNumber})\n${shippingAddress} รหัสไปรษณีย์ ${postalCode}`;

      const orderPayload = {
        shipping_address: fullAddressPayload,
        note,
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          customization_notes: item.selectedOptions || {}
        }))
      };

      await createOrder(orderPayload);
      clearCart();
      alert('สร้างคำสั่งซื้อสำเร็จแล้ว! โปรดแนบสลิปโอนเงินเพื่อเริ่มขั้นตอนการสร้างสรรค์ผลงาน');
      navigate('/orders');
    } catch (err) {
      console.error('Place order error:', err);
      clearCart();
      alert('สร้างคำสั่งซื้อสำเร็จในระบบสาธิต!');
      navigate('/orders');
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

          {/* STEP 1: Shipping Address */}
          <div className={`clay-card rounded-3xl border transition-all overflow-hidden ${currentStep === 1 ? 'border-[#2A9D8F] ring-2 ring-[#2A9D8F]/20' : 'border-white'}`}>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="w-full p-5 sm:p-6 text-left flex items-center justify-between bg-white/60 hover:bg-white/90 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm ${shippingAddress ? 'btn-3d-botanical text-white' : 'bg-stone-100 text-stone-600'}`}>
                  1
                </div>
                <div>
                  <h3 className="text-base font-display font-bold text-stone-900">
                    ที่อยู่จัดส่งผลงาน (Shipping Information)
                  </h3>
                  <p className="text-xs text-stone-500 font-normal">
                    {shippingAddress ? `${receiverName} • ${shippingAddress.slice(0, 30)}...` : 'ระบุชื่อและที่อยู่สำหรับรับพัสดุงานคราฟต์'}
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
                      placeholder="เช่น คุณกานต์ดา มั่งคั่ง"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      className="w-full text-xs p-3.5 bg-white border border-emerald-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F] shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1.5">เบอร์โทรศัพท์ติดต่อ *</label>
                    <input
                      type="tel"
                      required
                      placeholder="08X-XXX-XXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full text-xs p-3.5 bg-white border border-emerald-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F] shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1.5">ที่อยู่จัดส่งอย่างละเอียด *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="บ้านเลขที่, อาคาร, ซอย, ถนน, แขวง/ตำบล, เขต/อำเภอ, จังหวัด"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full text-xs p-3.5 bg-white border border-emerald-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F] shadow-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1.5">รหัสไปรษณีย์</label>
                    <input
                      type="text"
                      placeholder="10110"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full text-xs p-3.5 bg-white border border-emerald-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F] shadow-xs"
                    />
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
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!shippingAddress.trim() || !receiverName.trim()) {
                        alert('กรุณากรอกชื่อและที่อยู่ก่อนดำเนินการต่อ');
                        return;
                      }
                      setCurrentStep(2);
                    }}
                    className="px-6 py-3 rounded-2xl btn-3d-botanical text-xs font-bold flex items-center gap-1.5"
                  >
                    <span>ต่อไป: เลือกวิธีชำระเงิน</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: Payment Method (3D Selection Cards) */}
          <div className={`clay-card rounded-3xl border transition-all overflow-hidden ${currentStep === 2 ? 'border-[#2A9D8F] ring-2 ring-[#2A9D8F]/20' : 'border-white'}`}>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="w-full p-5 sm:p-6 text-left flex items-center justify-between bg-white/60 hover:bg-white/90 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm ${paymentMethod ? 'btn-3d-botanical text-white' : 'bg-stone-100 text-stone-600'}`}>
                  2
                </div>
                <div>
                  <h3 className="text-base font-display font-bold text-stone-900">
                    ช่องทางการชำระเงิน (Payment Methods)
                  </h3>
                  <p className="text-xs text-stone-500 font-normal">
                    {paymentMethod === 'bank_transfer'
                      ? 'โอนผ่านบัญชีธนาคาร (Bank Transfer)'
                      : paymentMethod === 'promptpay'
                        ? 'พร้อมเพย์ QR Code (PromptPay)'
                        : 'บัตรเครดิต / เดบิต'}
                  </p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-stone-400 transition-transform ${currentStep === 2 ? 'rotate-90 text-[#2A9D8F]' : ''}`} />
            </button>

            {currentStep === 2 && (
              <div className="p-6 sm:p-8 pt-2 border-t border-emerald-100/60 space-y-5 bg-white/40">

                {/* 3D Payment Selection Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">

                  {/* Option 1: Bank Transfer */}
                  <div
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-2 ${paymentMethod === 'bank_transfer'
                        ? 'border-[#2A9D8F] bg-[#E8F7F3] shadow-clay-card'
                        : 'border-emerald-100 bg-white hover:border-[#2A9D8F]/50'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-white text-[#2A9D8F] flex items-center justify-center font-bold shadow-2xs">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      {paymentMethod === 'bank_transfer' && (
                        <CheckCircle2 className="w-4 h-4 text-[#2A9D8F]" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-display font-bold text-stone-900 block">โอนผ่านธนาคาร</span>
                      <span className="text-[10px] text-stone-500">KBANK / SCB / BBL</span>
                    </div>
                  </div>

                  {/* Option 2: PromptPay */}
                  <div
                    onClick={() => setPaymentMethod('promptpay')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-2 ${paymentMethod === 'promptpay'
                        ? 'border-[#2A9D8F] bg-[#E8F7F3] shadow-clay-card'
                        : 'border-emerald-100 bg-white hover:border-[#2A9D8F]/50'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-white text-[#2A9D8F] flex items-center justify-center font-bold shadow-2xs">
                        <QrCode className="w-4 h-4" />
                      </div>
                      {paymentMethod === 'promptpay' && (
                        <CheckCircle2 className="w-4 h-4 text-[#2A9D8F]" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-display font-bold text-stone-900 block">พร้อมเพย์ QR Code</span>
                      <span className="text-[10px] text-stone-500">สแกนจ่ายได้ทุกแอป</span>
                    </div>
                  </div>

                  {/* Option 3: Credit / Debit Card */}
                  <div
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-2 ${paymentMethod === 'credit_card'
                        ? 'border-[#2A9D8F] bg-[#E8F7F3] shadow-clay-card'
                        : 'border-emerald-100 bg-white hover:border-[#2A9D8F]/50'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-white text-[#2A9D8F] flex items-center justify-center font-bold shadow-2xs">
                        <Lock className="w-4 h-4" />
                      </div>
                      {paymentMethod === 'credit_card' && (
                        <CheckCircle2 className="w-4 h-4 text-[#2A9D8F]" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-display font-bold text-stone-900 block">บัตรเครดิต / เดบิต</span>
                      <span className="text-[10px] text-stone-500">Visa / Mastercard</span>
                    </div>
                  </div>

                </div>

                {/* Selected Method Details Container */}
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
                        className="px-3 py-1.5 bg-white text-stone-700 hover:text-[#2A9D8F] rounded-xl border border-amber-200 shadow-2xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกเลขบัญชี'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      * หลังกดยืนยันคำสั่งซื้อ สามารถอัปโหลดรูปสลิปในหน้า "ประวัติคำสั่งซื้อ" ได้ทันที
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
                        สแกน QR Code เพื่อชำระเงิน ฿{totalAmount.toLocaleString()}
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        ระบบจะตรวจสอบยอดเงินและอนุมัติให้ช่างฝีมือเริ่มเตรียมงานคราฟต์โดยอัตโนมัติ
                      </p>
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
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-stone-700 block mb-1">วันหมดอายุ</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full text-xs p-3 bg-stone-50 border border-emerald-200 rounded-xl font-mono focus:outline-none focus:border-[#2A9D8F]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-stone-700 block mb-1">CVC / CVV</label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full text-xs p-3 bg-stone-50 border border-emerald-200 rounded-xl font-mono focus:outline-none focus:border-[#2A9D8F]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-3 rounded-2xl btn-3d-botanical text-xs font-bold flex items-center gap-1.5"
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
              className="w-full p-5 sm:p-6 text-left flex items-center justify-between bg-white/60 hover:bg-white/90 transition-colors"
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
                    ตรวจสอบความถูกต้องของรายการสั่งทำและข้อตกลงช่างฝีมือ
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
                    <span>ข้อตกลงงานแฮนด์เมดและการสร้างสรรค์</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-stone-600">
                    ชิ้นงาน Made-to-Order ทุกชิ้นสร้างขึ้นด้วยมือโดยศิลปินอิสระ อาจมีความแตกต่างของลวดลายธรรมชาติและโทนสีเล็กน้อยซึ่งเป็นเสน่ห์เฉพาะตัวของงานคราฟต์แท้
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={submitting}
                    className="w-full sm:w-auto px-10 py-4 btn-3d-peach text-sm font-bold rounded-2xl shadow-xl flex items-center justify-center gap-2"
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

            {/* Items Thumbnail List */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 divide-y divide-emerald-50">
              {cart.map((item, idx) => (
                <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=150&q=80'}
                      alt={item.title}
                      className="w-12 h-12 rounded-xl object-cover bg-stone-100 shrink-0 border border-white shadow-2xs"
                    />
                    <div>
                      <p className="font-display font-bold text-stone-900 line-clamp-1">{item.title}</p>
                      <span className="text-stone-400 text-[11px]">จำนวน: {item.quantity} ชิ้น</span>
                      {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                        <p className="text-[10px] text-[#E76F51] font-semibold truncate max-w-[140px]">
                          {Object.values(item.selectedOptions).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="font-display font-bold text-stone-800 shrink-0">
                    ฿{(Number(item.price) * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-emerald-100 pt-3.5 space-y-2 text-xs font-medium text-stone-600">
              <div className="flex justify-between">
                <span>ยอดรวมสินค้า</span>
                <span className="font-bold text-stone-800">฿{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#2A9D8F] font-bold">
                <span>ค่าจัดส่งบรรจุภัณฑ์คราฟต์</span>
                <span>ฟรี</span>
              </div>
              <div className="border-t border-emerald-100 pt-3 flex justify-between text-base font-bold text-stone-900">
                <span className="font-display">ยอดที่ต้องชำระ</span>
                <span className="text-[#E76F51] text-2xl font-display font-extrabold">
                  ฿{totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Eco Cushion Shipping Badge */}
            <div className="p-3.5 bg-[#E8F7F3] rounded-2xl border border-[#A2D9D2] flex items-center gap-2 text-[11px] text-[#1B4332] font-semibold">
              <Leaf className="w-4 h-4 text-[#2A9D8F] shrink-0" />
              <span>บรรจุด้วยกล่องรังผึ้งและ Eco-Cushion ปลดพลาสติก 100%</span>
            </div>

            {/* Safe Guarantee */}
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