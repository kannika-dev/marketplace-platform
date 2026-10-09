import React from 'react';
import { PenTool, Check, Sparkles } from 'lucide-react';

export const OptionSelector = ({ options = [], selectedOptions = {}, onChange }) => {
  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div className="space-y-5 bg-[#F0F9F7]/70 p-5 sm:p-6 rounded-3xl border border-emerald-200/80 shadow-xs">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B4332]">
        <div className="w-6 h-6 rounded-lg bg-[#2A9D8F] text-white flex items-center justify-center">
          <PenTool className="w-3.5 h-3.5" />
        </div>
        <span>ตัวเลือกปรับแต่งชิ้นงานคราฟต์ (Artisan Customization)</span>
      </div>

      {options.map((option, index) => {
        const optionKey = option.title || `option_${index}`;
        const isSelected = selectedOptions[optionKey];

        return (
          <div key={option.id || index} className="space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-stone-800">{option.title}</span>
              {isSelected && (
                <span className="text-[#E76F51] font-bold text-[11px] bg-white px-2.5 py-0.5 rounded-full border border-[#FFCBBF] shadow-2xs">
                  เลือก: {isSelected}
                </span>
              )}
            </div>

            {/* Custom text inscription */}
            {option.option_type === 'text' ? (
              <input
                type="text"
                placeholder="ระบุข้อความหรือชื่อที่ต้องการสลักลงบนชิ้นงาน..."
                value={selectedOptions[optionKey] || ''}
                onChange={(e) => onChange(optionKey, e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-emerald-200 rounded-2xl focus:outline-none focus:border-[#2A9D8F] focus:ring-2 focus:ring-[#2A9D8F]/20 shadow-xs"
                maxLength={50}
              />
            ) : (
              /* 3D Option Buttons */
              <div className="flex flex-wrap gap-2.5">
                {Array.isArray(option.choices) &&
                  option.choices.map((choice, cIndex) => {
                    const active = isSelected === choice;
                    return (
                      <button
                        key={cIndex}
                        type="button"
                        onClick={() => onChange(optionKey, choice)}
                        className={`text-xs px-3.5 py-2 rounded-2xl border flex items-center gap-1.5 transition-all font-semibold ${
                          active
                            ? 'btn-3d-botanical border-transparent shadow-[0_6px_16px_rgba(42,157,143,0.35)]'
                            : 'bg-white text-stone-700 border-emerald-100 hover:border-[#2A9D8F] hover:bg-[#F0F9F7]'
                        }`}
                      >
                        {active && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        <span>{choice}</span>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OptionSelector;
