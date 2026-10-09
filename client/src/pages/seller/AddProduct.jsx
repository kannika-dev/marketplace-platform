import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createProduct } from '../../services/productService';
import ImageUploadDropzone from '../../components/common/ImageUploadDropzone';
import {
  Sparkles,
  Clock,
  Plus,
  Trash2,
  Upload,
  ArrowLeft,
  CheckCircle2,
  Leaf,
  Loader2
} from 'lucide-react';

export const AddProduct = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categorySelect, setCategorySelect] = useState('เซรามิก & งานปั้น Craft');
  const [customCategory, setCustomCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('5');
  const [leadTimeDays, setLeadTimeDays] = useState('7');
  const [isMadeToOrder, setIsMadeToOrder] = useState(true);
  const [materials, setMaterials] = useState('');
  const [craftTechnique, setCraftTechnique] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const [options, setOptions] = useState([
    { title: 'โทนสีของผิวเคลือบ / วัสดุ', option_type: 'select', choicesText: 'สีธรรมชาติ, สีเขียวมะกอก, สีเทาดำ' },
    { title: 'ข้อความสลักชื่อเฉพาะบุคคล', option_type: 'text', choicesText: '' }
  ]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddOption = () => {
    setOptions([...options, { title: '', option_type: 'select', choicesText: '' }]);
  };

  const handleRemoveOption = (idx) => {
    setOptions(options.filter((_, i) => i !== idx));
  };

  const handleOptionChange = (idx, field, value) => {
    const updated = [...options];
    updated[idx][field] = value;
    setOptions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // กำหนดค่าหมวดหมู่ที่จะส่งจริง (ถ้าเลือก "อื่นๆ" ให้เอาจากช่องพิมพ์ระบุเอง)
    const finalCategory = categorySelect === 'other' ? customCategory.trim() : categorySelect;

    if (!title || !price || !finalCategory) {
      setErrorMsg('กรุณากรอกชื่อผลงาน ราคา และหมวดหมู่ให้ครบถ้วน');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', finalCategory);
      formData.append('price', Number(price));
      formData.append('stock_quantity', Number(stock) || 0);
      formData.append('stock', Number(stock) || 0);
      formData.append('lead_time_days', Number(leadTimeDays) || 0);
      formData.append('is_made_to_order', isMadeToOrder ? '1' : '0');

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const formattedOptions = options
        .filter((o) => o.title && o.title.trim() !== '')
        .map((o) => ({
          title: o.title.trim(),
          option_type: o.option_type,
          choices: o.choicesText
            ? o.choicesText.split(',').map((c) => c.trim()).filter(Boolean)
            : []
        }));

      formData.append('supports_customization', formattedOptions.length > 0 ? '1' : '0');
      formData.append('options', JSON.stringify(formattedOptions));

      const res = await createProduct(formData);
      alert(res?.message || 'ลงขายผลงานชิ้นเอกสำเร็จเรียบร้อยแล้ว!');
      navigate('/seller/dashboard');
    } catch (err) {
      console.error('Add product error:', err);
      const errMsg = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดในการลงขายสินค้า';
      setErrorMsg(errMsg);
      alert('เกิดข้อผิดพลาด: ' + errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      <div className="flex items-center justify-between">
        <Link
          to="/seller/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2A9D8F] hover:text-[#1B4332] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับแดชบอร์ดช่างฝีมือ</span>
        </Link>
      </div>

      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#2A9D8F]">
          New Artisan Listing
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-stone-900 mt-0.5">
          ลงขายผลงานคราฟต์ & งานทำมือ
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 font-normal">
          กำหนดระยะเวลาทำมือ (Lead Time), ตั้งค่า Made-to-Order และตัวเลือกปรับแต่งชิ้นงาน
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 text-rose-700 text-xs rounded-2xl border border-rose-200 font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Basic Info */}
        <div className="clay-card p-7 sm:p-9 rounded-3xl space-y-6 border border-white">
          <h2 className="text-sm font-display font-bold uppercase tracking-wider text-stone-900 border-b border-emerald-100 pb-3.5 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-[#2A9D8F]" />
            <span>ข้อมูลพื้นฐานชิ้นงาน</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-stone-700 block mb-1.5">ชื่อผลงานคราฟต์ *</label>
              <input
                type="text"
                required
                placeholder="เช่น ชามไม้สักทองกลึงมือลายเกรนธรรมชาติ"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs p-3.5 bg-white border border-emerald-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F] focus:ring-2 focus:ring-[#2A9D8F]/20 shadow-xs"
              />
            </div>

            {/* หมวดหมู่: มี Dropdown เลือก + ช่องกรอกเองเมื่อเลือก "อื่นๆ" */}
            <div className="sm:col-span-2 space-y-3">
              <label className="text-xs font-bold text-stone-700 block mb-1.5">หมวดหมู่งานคราฟต์ *</label>
              <select
                value={categorySelect}
                onChange={(e) => setCategorySelect(e.target.value)}
                className="w-full text-xs p-3.5 bg-white border border-emerald-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F] focus:ring-2 focus:ring-[#2A9D8F]/20 shadow-xs font-medium"
              >
                <option value="Handmade Goods">Handmade Goods</option>
                <option value="Craft Studio Items">Craft Studio Items</option>
                <option value="เซรามิก & งานปั้น Craft">เซรามิก & งานปั้น Craft</option>
                <option value="งานไม้ & Craft ทำมือ">งานไม้ & Craft ทำมือ</option>
                <option value="เครื่องหนัง Handmade">เครื่องหนัง Handmade</option>
                <option value="งานเย็บปักถักร้อย">งานเย็บปักถักร้อย</option>
                <option value="เครื่องประดับ Handmade">เครื่องประดับ Handmade</option>
                <option value="other">✏️ อื่นๆ (ระบุชื่อหมวดหมู่เอง)</option>
              </select>

              {/* แสดงช่องกรอกข้อความเฉพาะตอนที่เลือก "อื่นๆ" */}
              {categorySelect === 'other' && (
                <input
                  type="text"
                  required
                  placeholder="พิมพ์ชื่อหมวดหมู่ที่ต้องการ เช่น เทียนหอม & สกินแคร์"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full text-xs p-3.5 bg-white border border-emerald-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F] focus:ring-2 focus:ring-[#2A9D8F]/20 shadow-xs animate-fadeIn"
                />
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-stone-700 block mb-1.5">ราคาจำหน่าย (บาท) *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="1500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full text-xs p-3.5 bg-white border border-emerald-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F] focus:ring-2 focus:ring-[#2A9D8F]/20 shadow-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-stone-700 block mb-1.5">คำบรรยายผลงาน และ เรื่องราวเบื้องหลัง</label>
              <textarea
                rows={4}
                placeholder="เล่าแรงบันดาลใจ ความประณีต และที่มาของชิ้นงาน..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs p-3.5 bg-white border border-emerald-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F] focus:ring-2 focus:ring-[#2A9D8F]/20 shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Made-to-Order & Lead Time Configuration */}
        <div className="clay-card p-7 sm:p-9 rounded-3xl space-y-6 border border-white">
          <h2 className="text-sm font-display font-bold uppercase tracking-wider text-stone-900 border-b border-emerald-100 pb-3.5 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E76F51]" />
            <span>การตั้งค่าผลิตงานคราฟต์ (Lead Time & Made-to-Order)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">

            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FFF0EB] to-[#FFE8D6] border border-[#FFCBBF] flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-xs font-bold text-[#E76F51] block">เปิดรับผลิตแบบ Made-to-Order</span>
                <span className="text-[11px] text-stone-600 font-medium">
                  ชิ้นงานจะเริ่มสร้างหลังจากผู้ซื้อชำระเงิน
                </span>
              </div>
              <input
                type="checkbox"
                checked={isMadeToOrder}
                onChange={(e) => setIsMadeToOrder(e.target.checked)}
                className="w-5 h-5 accent-[#E76F51] rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#2A9D8F]" />
                <span>ระยะเวลาประดิษฐ์งานทำมือ (lead_time_days)</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(e.target.value)}
                  className="w-24 text-xs p-3 bg-white border border-emerald-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F] font-bold"
                />
                <span className="text-xs text-stone-500 font-medium">วัน (นับจากรับคำสั่งซื้อ)</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">วัสดุที่ใช้ (Materials)</label>
              <input
                type="text"
                placeholder="เช่น ไม้สักแท้, ดินดำธรรมชาติ, หนังวัวฟอกฝาด"
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                className="w-full text-xs p-3.5 bg-white border border-emerald-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">เทคนิคการประดิษฐ์ (Craft Technique)</label>
              <input
                type="text"
                placeholder="เช่น แป้นหมุนโบราณ, เตาเผาฟืน, ย้อมครามธรรมชาติ"
                value={craftTechnique}
                onChange={(e) => setCraftTechnique(e.target.value)}
                className="w-full text-xs p-3.5 bg-white border border-emerald-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F]"
              />
            </div>

          </div>
        </div>

        {/* Dynamic Customization Options */}
        <div className="clay-card p-7 sm:p-9 rounded-3xl space-y-4 border border-white">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-3.5">
            <div>
              <h2 className="text-sm font-display font-bold uppercase tracking-wider text-stone-900">
                ตัวเลือกปรับแต่งสำหรับผู้ซื้อ (Customization Options)
              </h2>
              <p className="text-[11px] text-stone-500 font-medium">
                เพิ่มตัวเลือกให้ลูกค้าเลือก เช่น โทนสีเคลือบ หรือ ข้อความสลักชื่อ
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddOption}
              className="text-xs font-bold text-[#2A9D8F] hover:text-[#1B4332] flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> เพิ่มตัวเลือก
            </button>
          </div>

          <div className="space-y-3">
            {options.map((opt, idx) => (
              <div key={idx} className="p-4 bg-[#F0F9F7]/70 rounded-2xl border border-emerald-100 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    placeholder="หัวข้อตัวเลือก เช่น สีเคลือบ, การสลักชื่อ"
                    value={opt.title}
                    onChange={(e) => handleOptionChange(idx, 'title', e.target.value)}
                    className="flex-1 text-xs p-2.5 bg-white border border-emerald-200 rounded-xl"
                  />
                  <select
                    value={opt.option_type}
                    onChange={(e) => handleOptionChange(idx, 'option_type', e.target.value)}
                    className="text-xs p-2.5 bg-white border border-emerald-200 rounded-xl font-medium"
                  >
                    <option value="select">ตัวเลือกแบบปุ่มกด (Choices)</option>
                    <option value="text">กรอกข้อความสลักชื่อ (Custom Text)</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    className="p-2 text-stone-400 hover:text-rose-500 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {opt.option_type === 'select' && (
                  <input
                    type="text"
                    placeholder="ใส่ตัวเลือก คั่นด้วยเครื่องหมายจุลภาค (,) เช่น แดง, น้ำตาล, เขียวมะกอก"
                    value={opt.choicesText}
                    onChange={(e) => handleOptionChange(idx, 'choicesText', e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-emerald-200 rounded-xl"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Image Upload */}
        <div className="clay-card p-7 sm:p-9 rounded-3xl space-y-4 border border-white">
          <h2 className="text-sm font-display font-bold uppercase tracking-wider text-stone-900 border-b border-emerald-100 pb-3.5">
            รูปภาพผลงานคราฟต์
          </h2>

          <ImageUploadDropzone
            label="อัปโหลดรูปภาพผลงาน (รองรับการลากวาง Drag & Drop และแสดงภาพตัวอย่างทันที)"
            helperText="ลากไฟล์รูปภาพมาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์จากในเครื่อง (JPEG, PNG, WebP สูงสุด 10MB)"
            aspect="square"
            onFileSelect={(file) => {
              setImageFile(file);
            }}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-9 py-4 btn-3d-peach text-xs font-bold rounded-2xl disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{loading ? 'กำลังบันทึกลงฐานข้อมูล...' : 'เผยแพร่ผลงานสู่มาร์เก็ตเพลส'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default AddProduct;