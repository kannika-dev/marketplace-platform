import React from 'react';
import {
  ShoppingBag,
  Layers,
  Hammer,
  Sparkles,
  ShieldCheck,
  Truck,
  CheckCircle2
} from 'lucide-react';

const CRAFT_STEPS = [
  { key: 'order_placed', label: 'รับคำสั่งซื้อ', icon: ShoppingBag, desc: 'ยืนยันออเดอร์งานฝีมือ' },
  { key: 'material_prep', label: 'เตรียมวัตถุดิบ', icon: Layers, desc: 'คัดสรรเนื้อดิน/ไม้/หนังแท้' },
  { key: 'crafting', label: 'ลงมือประดิษฐ์', icon: Hammer, desc: 'ขึ้นรูปและสร้างสรรค์ผลงาน' },
  { key: 'customizing', label: 'แต่งแต้มพิเศษ', icon: Sparkles, desc: 'สลักชื่อหรือลงสีเคลือบ' },
  { key: 'quality_check', label: 'ตรวจความประณีต', icon: ShieldCheck, desc: 'QC ชิ้นงาน Handmade' },
  { key: 'shipped', label: 'จัดส่งแล้ว', icon: Truck, desc: 'ส่งตรงถึงบ้านคุณ' },
];

export const CraftTracker = ({ currentStatus = 'order_placed', timelineLogs = [] }) => {
  const currentIndex = CRAFT_STEPS.findIndex((s) => s.key === currentStatus);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="clay-card p-7 rounded-3xl space-y-7 border border-white/90">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-emerald-100/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase font-bold tracking-widest text-[#2A9D8F] bg-[#E8F7F3] px-2.5 py-0.5 rounded-full">
              Production Pipeline
            </span>
            <span className="text-xs text-stone-400 font-mono">Real-time Crafting</span>
          </div>
          <h3 className="text-xl font-display font-bold text-stone-900 mt-1">
            Crafting Journey — ติดตามเส้นทางผลงานชิ้นเอกของคุณ
          </h3>
        </div>

        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FFE8D6] to-[#FFF0EB] text-[#E76F51] border border-[#FFCBBF] px-4 py-1.5 rounded-full text-xs font-bold shadow-[0_4px_12px_rgba(231,111,81,0.15)]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>สถานะ: {CRAFT_STEPS[activeIndex]?.label || currentStatus}</span>
        </div>
      </div>

      {/* Visual 3D Stepper */}
      <div className="relative pt-2">
        
        {/* Progress connecting line */}
        <div className="hidden md:block absolute top-1/2 left-8 right-8 -translate-y-5 h-2 bg-[#E8F7F3] rounded-full z-0 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#2A9D8F] via-[#52B788] to-[#E76F51] transition-all duration-700 ease-out rounded-full shadow-[0_0_12px_rgba(42,157,143,0.5)]"
            style={{ width: `${(activeIndex / (CRAFT_STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {/* Stepper items */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 relative z-10">
          {CRAFT_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < activeIndex;
            const isCurrent = idx === activeIndex;
            const isFuture = idx > activeIndex;

            return (
              <div key={step.key} className="flex flex-col items-center text-center group">
                
                {/* Step 3D Circle */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isCurrent
                      ? 'btn-3d-peach text-white scale-110 shadow-[0_12px_24px_rgba(231,111,81,0.45)] ring-4 ring-[#FFE8D6]'
                      : isCompleted
                      ? 'btn-3d-botanical text-white shadow-[0_8px_16px_rgba(42,157,143,0.35)]'
                      : 'bg-white/90 text-stone-400 border border-emerald-100 shadow-sm'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-7 h-7 text-white stroke-[2.5]" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>

                {/* Step Info */}
                <span
                  className={`mt-3 text-xs font-bold ${
                    isCurrent ? 'text-[#E76F51]' : isCompleted ? 'text-[#2A9D8F]' : 'text-stone-400'
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-[10px] text-stone-500 hidden sm:block mt-0.5 leading-tight font-medium">
                  {step.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Craft Log Timeline */}
      {timelineLogs && timelineLogs.length > 0 && (
        <div className="mt-6 pt-5 border-t border-emerald-100/70">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2A9D8F]" />
            <span>บันทึกความคืบหน้าจากช่างฝีมือ (Artisan Activity Log)</span>
          </h4>
          <div className="space-y-2.5">
            {timelineLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3.5 text-xs bg-white/70 p-3.5 rounded-2xl border border-emerald-100 shadow-2xs"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#E76F51] mt-1 shrink-0 shadow-xs" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">{log.status_title || log.step}</span>
                    <span className="text-[11px] text-[#2A9D8F] font-semibold">
                      {new Date(log.created_at).toLocaleString('th-TH')}
                    </span>
                  </div>
                  {log.notes && <p className="text-stone-600 mt-1 font-normal">{log.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default CraftTracker;
