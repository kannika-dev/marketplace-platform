import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * ImageUploadDropzone Component
 *
 * Props:
 * - onFileSelect: (file: File | null) => void (ฟังก์ชัน callback เมื่อผู้ใช้เลือกหรือลบไฟล์)
 * - initialUrl: string (URL รูปภาพเดิมที่มีอยู่แล้ว เช่น จากฐานข้อมูล / Cloudinary)
 * - label: string (ข้อความหัวข้อ เช่น "รูปภาพสินค้า", "โลโก้ร้าน")
 * - helperText: string (คำอธิบายเพิ่มเติม เช่น "รองรับ JPEG, PNG, WebP ขนาดไม่เกิน 10MB")
 * - aspect: 'square' | 'video' | 'banner' | 'avatar' (รูปแบบสัดส่วนกล่องพรีวิว)
 * - maxSizeBytes: number (ขนาดไฟล์สูงสุด ค่าเริ่มต้น 10MB)
 * - className: string (คลาสเสริมเพิ่มเติม)
 */
export const ImageUploadDropzone = ({
  onFileSelect,
  initialUrl = '',
  label = 'รูปภาพ',
  helperText = 'ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์ (JPEG, PNG, WebP สูงสุด 10MB)',
  aspect = 'square',
  maxSizeBytes = 10 * 1024 * 1024,
  className = ''
}) => {
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  // กำหนด previewUrl จาก initialUrl เมื่อโหลดครั้งแรก หรือเมื่อ initialUrl เปลี่ยน
  useEffect(() => {
    if (initialUrl && !selectedFile) {
      setPreviewUrl(initialUrl);
    }
  }, [initialUrl]);

  // คืน memory ให้ browser เมื่อ previewUrl ที่สร้างจาก ObjectURL ไม่ได้ใช้แล้ว
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // ฟังก์ชันตรวจสอบและประมวลผลไฟล์ที่เลือก
  const processFile = (file) => {
    setErrorMessage('');

    if (!file) return;

    // ตรวจสอบว่าต้องเป็นรูปภาพเท่านั้น
    if (!file.type.startsWith('image/')) {
      setErrorMessage('กรุณาเลือกไฟล์ที่เป็นรูปภาพเท่านั้น (.jpg, .png, .webp, .jpeg)');
      return;
    }

    // ตรวจสอบขนาดไฟล์
    if (file.size > maxSizeBytes) {
      const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
      setErrorMessage(`ขนาดไฟล์ใหญ่เกินกำหนด (สูงสุดไม่เกิน ${maxMb}MB)`);
      return;
    }

    // สร้าง Object URL สำหรับแสดงพรีวิวภาพตัวอย่างทันที
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    const newPreview = URL.createObjectURL(file);
    setPreviewUrl(newPreview);
    setSelectedFile(file);

    // ส่งไฟล์กลับไปยัง Component แม่
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  // จัดการการเปลี่ยนไฟล์จาก input
  const handleInputChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  // จัดการ Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  // ล้างไฟล์ที่เลือกใหม่
  const handleClear = (e) => {
    e.stopPropagation();
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setSelectedFile(null);
    setErrorMessage('');

    // คืนค่าไปยัง initialUrl เดิม หรือค่าว่าง
    setPreviewUrl(initialUrl || '');

    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  // กำหนดสไตล์ Aspect Ratio
  const getAspectClasses = () => {
    switch (aspect) {
      case 'banner':
        return 'h-40 sm:h-48 w-full';
      case 'avatar':
        return 'w-28 h-28 sm:w-32 sm:h-32 rounded-full mx-auto';
      case 'video':
        return 'aspect-video w-full';
      case 'square':
      default:
        return 'w-36 h-36 sm:w-44 sm:h-44';
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-stone-700 block">
            {label}
          </label>
          {selectedFile && (
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> เลือกรูปใหม่แล้ว ({(selectedFile.size / 1024).toFixed(1)} KB)
            </span>
          )}
        </div>
      )}

      {/* Dropzone Container */}
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-5 text-center transition-all cursor-pointer select-none group
          ${
            isDragging
              ? 'border-emerald-600 bg-emerald-50/80 scale-[1.01] shadow-md ring-4 ring-emerald-100'
              : 'border-stone-200 hover:border-emerald-400 bg-stone-50/60 hover:bg-emerald-50/20'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
        />

        {previewUrl ? (
          <div className="flex flex-col items-center justify-center space-y-3">
            {/* กล่องแสดงตัวอย่างรูปภาพ */}
            <div
              className={`relative overflow-hidden border-2 border-white shadow-md bg-stone-100 ${getAspectClasses()} ${
                aspect === 'avatar' ? 'rounded-full' : 'rounded-2xl'
              }`}
            >
              <img
                src={previewUrl}
                alt="Image Preview"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* ปุ่มลบ/ยกเลิกรูปที่เลือกใหม่ */}
              <button
                type="button"
                onClick={handleClear}
                title="ล้างรูปภาพ / ยกเลิกรูปนี้"
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-rose-600 text-white rounded-full transition-colors backdrop-blur-xs shadow-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-0.5">
              <p className="text-xs font-bold text-stone-700 group-hover:text-emerald-700 transition-colors">
                คลิกหรือลากรูปใหม่มาวาง เพื่อเปลี่ยนรูป
              </p>
              <p className="text-[11px] text-stone-400">
                {selectedFile ? selectedFile.name : 'แสดงตัวอย่างรูปภาพที่ใช้งานอยู่ในปัจจุบัน'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 px-4 space-y-2.5">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${
                isDragging ? 'bg-emerald-600 text-white shadow-lg' : 'bg-emerald-100/70 text-emerald-800'
              }`}
            >
              {isDragging ? <UploadCloud className="w-7 h-7 animate-bounce" /> : <ImageIcon className="w-7 h-7" />}
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-stone-700">
                <span className="text-emerald-700 underline decoration-emerald-400 decoration-2 underline-offset-2">
                  คลิกเพื่ออัปโหลด
                </span>{' '}
                หรือลากไฟล์รูปภาพมาวางที่นี่
              </p>
              <p className="text-[11px] text-stone-400 font-medium">
                {helperText}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ข้อความแจ้งเตือนข้อผิดพลาด */}
      {errorMessage && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-xl border border-rose-100">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export default ImageUploadDropzone;
