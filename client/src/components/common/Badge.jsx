import React from 'react';

export const Badge = ({ children, variant = 'emerald', size = 'sm', className = '' }) => {
  const variantStyles = {
    emerald: 'bg-[#1B4332] text-[#F4F9F4] border-[#2D6A4F] shadow-xs',
    terracotta: 'bg-[#FFF0EB] text-[#E76F51] border-[#FFCBBF] shadow-xs',
    gold: 'bg-[#FFF9EC] text-[#9E6E00] border-[#FFE6A7] shadow-xs',
    runway: 'bg-black text-white border-stone-800 tracking-wider font-mono',
    ivory: 'bg-white/90 text-stone-800 border-stone-200 shadow-xs',
    // Aliases for compatibility
    botanical: 'bg-[#E8F7F3] text-[#2A9D8F] border-[#A2D9D2]',
    peach: 'bg-[#FFF0EB] text-[#E76F51] border-[#FFCBBF]',
    sunlight: 'bg-[#FFF9EC] text-[#9E6E00] border-[#FFE6A7]',
    dark: 'bg-[#1B4332] text-white border-[#2D6A4F]',
    craft: 'bg-[#FFF9EC] text-[#8C6D4F] border-[#E8DCB8]',
    clay: 'bg-[#FFF0EB] text-[#E76F51] border-[#FFCBBF]',
    sage: 'bg-[#E8F7F3] text-[#2A9D8F] border-[#A2D9D2]',
    amber: 'bg-[#FFF9EC] text-[#B58500] border-[#FFE6A7]'
  };

  const sizeStyles = {
    xs: 'text-[10px] px-2.5 py-0.5 font-bold tracking-wider uppercase',
    sm: 'text-xs px-3 py-1 font-bold tracking-wide uppercase',
    md: 'text-sm px-3.5 py-1.5 font-extrabold tracking-wide uppercase'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-all duration-300 ${variantStyles[variant] || variantStyles.emerald} ${sizeStyles[size] || sizeStyles.sm} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
