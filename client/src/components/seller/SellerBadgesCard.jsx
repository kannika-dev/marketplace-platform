import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Award, Sparkles, TrendingUp, ShieldCheck, Crown,
  Lock, CheckCircle2, Zap, Star, ChevronDown, ChevronUp,
  Info, Trophy, Flame
} from 'lucide-react';

// แผนที่ไอคอนตามชื่อในฐานข้อมูล
const ICON_MAP = {
  Award: Award,
  Sparkles: Sparkles,
  TrendingUp: TrendingUp,
  ShieldCheck: ShieldCheck,
  Crown: Crown,
  Trophy: Trophy,
  Star: Star,
  Flame: Flame
};

/**
 * 🏅 SellerBadgesCard: คอมโพเนนต์แสดงผลเหรียญรางวัลและระดับเลเวลผู้ขาย (Badges & Tiers Display)
 * โทนสีธรรมชาติ: Stone / Emerald / Amber สไตล์สตูดิโอช่างฝีมือ Craftiverse
 */
export const SellerBadgesCard = ({ initialStats = null }) => {
  const [badgeData, setBadgeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTierInfo, setShowTierInfo] = useState(false);

  const fetchBadges = async () => {
    try {
      const res = await api.get('/seller/badges');
      if (res.data?.success && res.data?.data) {
        setBadgeData(res.data.data);
      }
    } catch (err) {
      console.warn('Could not fetch badges from /seller/badges:', err.message);
      // Fallback: ใช้ initialStats คำนวณเบื้องต้นหาก API มีปัญหา
      if (initialStats) {
        const totalOrders = Number(initialStats.totalOrders || 0);
        const totalRevenue = Number(initialStats.totalRevenue || 0);
        const exp = (totalOrders * 100) + Math.floor(totalRevenue / 50);

        let lvl = 1;
        let title = 'ช่างฝีมือฝึกหัด (Apprentice)';
        let minExp = 0;
        let nextExp = 500;
        if (exp >= 4000) {
          lvl = 4;
          title = 'ปรมาจารย์แห่งงานคราฟต์ (Grandmaster)';
          minExp = 4000;
          nextExp = 10000;
        } else if (exp >= 1500) {
          lvl = 3;
          title = 'ช่างศิลป์ชั้นสูง (Master Artisan)';
          minExp = 1500;
          nextExp = 4000;
        } else if (exp >= 500) {
          lvl = 2;
          title = 'ช่างฝีมือผู้ชำนาญ (Skilled Craftsman)';
          minExp = 500;
          nextExp = 1500;
        }

        const expInLvl = Math.max(0, exp - minExp);
        const needed = Math.max(1, nextExp - minExp);
        const progress = Math.min(100, Math.round((expInLvl / needed) * 100));

        setBadgeData({
          level: {
            current_level: lvl,
            title,
            exp_points: exp,
            min_exp: minExp,
            next_level_exp: nextExp,
            progress_percent: progress
          },
          stats: { totalOrders, totalRevenue },
          badges: [
            {
              id: 1,
              name: 'ก้าวแรกช่างฝีมือ (First Sale)',
              description: 'มีคำสั่งซื้อที่เสร็จสมบูรณ์รายการแรก',
              criteria_type: 'orders',
              criteria_value: 1,
              icon: 'Award',
              is_unlocked: totalOrders >= 1
            },
            {
              id: 2,
              name: 'ยอดนิยมประจำชุมชน (Rising Artisan)',
              description: 'ส่งมอบผลงานสำเร็จครบ 5 คำสั่งซื้อ',
              criteria_type: 'orders',
              criteria_value: 5,
              icon: 'Sparkles',
              is_unlocked: totalOrders >= 5
            },
            {
              id: 3,
              name: 'ยอดขายก้าวหน้า (Craft Milestone)',
              description: 'สร้างรายได้สะสมทะลุ ฿3,000',
              criteria_type: 'revenue',
              criteria_value: 3000,
              icon: 'TrendingUp',
              is_unlocked: totalRevenue >= 3000
            },
            {
              id: 4,
              name: 'ช่างศิลป์ชั้นครู (Master Artisan)',
              description: 'ส่งมอบผลงานสำเร็จครบ 15 คำสั่งซื้อ',
              criteria_type: 'orders',
              criteria_value: 15,
              icon: 'ShieldCheck',
              is_unlocked: totalOrders >= 15
            },
            {
              id: 5,
              name: 'ยอดขายหมื่นแรก (Top Studio)',
              description: 'สร้างรายได้สะสมทะลุ ฿10,000',
              criteria_type: 'revenue',
              criteria_value: 10000,
              icon: 'Crown',
              is_unlocked: totalRevenue >= 10000
            }
          ]
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  if (loading && !badgeData) {
    return (
      <div className="p-5 bg-white rounded-3xl border border-stone-200/80 animate-pulse text-xs text-stone-400 text-center">
        กำลังโหลดเหรียญรางวัลและระดับช่างฝีมือ...
      </div>
    );
  }

  if (!badgeData) return null;

  const { level, stats, badges = [] } = badgeData;
  const unlockedBadges = badges.filter(b => b.is_unlocked);
  const lockedBadges = badges.filter(b => !b.is_unlocked);
  const unlockedCount = unlockedBadges.length;
  const totalBadgesCount = badges.length;

  return (
    <div className="bg-gradient-to-br from-[#FAF9F5] via-white to-[#F4F8F4] rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-5 relative overflow-hidden">

      {/* ลายเส้น Texture พื้นหลังสไตล์คราฟต์ */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-100/40 via-emerald-100/20 to-transparent rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

      {/* ========================================================= */}
      {/* 🌟 1. ส่วนหัว: แสดงระดับเลเวลช่างฝีมือ (Artisan Tier) & แถบ EXP */}
      {/* ========================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">

        {/* ตราเลเวล และชื่อตำแหน่ง */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-gradient-to-br from-stone-900 to-stone-800 rounded-[14px] flex flex-col items-center justify-center text-center p-1">
                <Crown className="w-5 h-5 text-amber-400 mb-0.5 drop-shadow" />
                <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider">
                  LV.{level.current_level}
                </span>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-800 text-white rounded-full shadow-xs ring-2 ring-white">
              <Sparkles className="w-3 h-3 text-amber-300" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300/80 inline-flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-600" /> Tier {level.current_level}
              </span>
              <button
                onClick={() => setShowTierInfo(!showTierInfo)}
                className="text-[11px] text-stone-500 hover:text-emerald-800 inline-flex items-center gap-1 underline cursor-pointer"
              >
                <Info className="w-3 h-3" /> เกณฑ์ระดับช่างฝีมือ
              </button>
            </div>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900 mt-1">
              {level.title}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              ปลดล็อกแล้ว <span className="font-bold text-emerald-800">{unlockedCount}</span> จาก {totalBadgesCount} เหรียญเกียรติยศ
            </p>
          </div>
        </div>

        {/* แถบหลอดค่าประสบการณ์ EXP Progress */}
        <div className="w-full lg:max-w-md bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-stone-700 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> ค่าประสบการณ์ช่างฝีมือ (EXP)
            </span>
            <span className="font-mono font-bold text-emerald-800">
              {level.exp_points.toLocaleString()} / {level.next_level_exp.toLocaleString()} EXP
            </span>
          </div>

          {/* แถบหลอดความคืบหน้า */}
          <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200/60 flex items-center">
            <div
              style={{ width: `${level.progress_percent}%` }}
              className="h-full bg-gradient-to-r from-emerald-700 via-teal-600 to-amber-500 rounded-full transition-all duration-700 shadow-xs"
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-stone-500">
            <span>ความคืบหน้าระดับ {level.progress_percent}%</span>
            <span>
              {level.next_level_exp > level.exp_points
                ? `อีก ${(level.next_level_exp - level.exp_points).toLocaleString()} EXP สู่ระดับถัดไป`
                : 'ระดับสูงสุดแล้ว'}
            </span>
          </div>
        </div>

      </div>

      {/* ข้อมูลคำอธิบายระบบ Tiers เมื่อคลิกเปิด */}
      {showTierInfo && (
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-2 relative animate-fadeIn">
          <div className="flex justify-between items-center font-bold text-stone-800">
            <span className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-600" /> ระบบเลเวลและคะแนนสะสมสตูดิโอ (Artisan Progression System)
            </span>
            <button onClick={() => setShowTierInfo(false)} className="text-stone-400 hover:text-stone-700">✕</button>
          </div>
          <p className="text-stone-600 leading-relaxed">
            ระบบสะสมค่าประสบการณ์สำหรับสตูดิโอช่างฝีมือ: <strong>ทุก 1 ออเดอร์สำเร็จรับ +100 EXP</strong> และ <strong>ทุกๆ ยอดขาย ฿50 รับ +1 EXP</strong> ยิ่งระดับสูง ยิ่งเพิ่มความน่าเชื่อถือให้กับผลงานของคุณในสายตาลูกค้า!
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[10px]">
            <div className="p-2 bg-white rounded-xl border border-stone-200">
              <span className="font-bold text-stone-800 block">Tier 1: ฝึกหัด</span>
              <span className="text-stone-400">0 - 499 EXP</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-stone-200">
              <span className="font-bold text-emerald-800 block">Tier 2: ชำนาญ</span>
              <span className="text-stone-400">500 - 1,499 EXP</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-stone-200">
              <span className="font-bold text-amber-700 block">Tier 3: ชั้นสูง</span>
              <span className="text-stone-400">1,500 - 3,999 EXP</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-stone-200">
              <span className="font-bold text-purple-800 block">Tier 4: ปรมาจารย์</span>
              <span className="text-stone-400">4,000+ EXP</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🏅 2. รายการเหรียญรางวัล (Badges Grid: Unlocked & Locked) */}
      {/* ========================================================= */}
      <div className="space-y-3 pt-1">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-600" /> ทำเนียบเหรียญเกียรติยศช่างฝีมือ (Artisan Badges)
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>{isExpanded ? 'ย่อเหรียญ' : 'ดูเหรียญทั้งหมด'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* แถวเหรียญรางวัล */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {badges.slice(0, isExpanded ? badges.length : 3).map((badge) => {
            const IconComp = ICON_MAP[badge.icon] || Award;
            const isUnlocked = Boolean(badge.is_unlocked);

            // คำนวณความคืบหน้าที่ยังขาดอยู่สำหรับเหรียญที่ยังล็อค
            let progressText = '';
            let progressPercent = 0;
            const currentOrders = stats?.totalOrders || 0;
            const currentRev = stats?.totalRevenue || 0;

            if (!isUnlocked) {
              const targetVal = Number(badge.criteria_value || badge.min_revenue || badge.min_orders || 0);
              const isRev = badge.criteria_type === 'revenue' || badge.min_revenue > 0;

              if (isRev) {
                const diff = Math.max(0, targetVal - currentRev);
                progressPercent = Math.min(100, Math.round((currentRev / targetVal) * 100));
                progressText = `เป้าหมาย ฿${targetVal.toLocaleString()} (ขาดอีก ฿${diff.toLocaleString()})`;
              } else {
                const diff = Math.max(0, targetVal - currentOrders);
                progressPercent = Math.min(100, Math.round((currentOrders / targetVal) * 100));
                progressText = `เป้าหมาย ${targetVal} ออเดอร์ (ขาดอีก ${diff} ออเดอร์)`;
              }
            }

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-amber-50/70 via-white to-emerald-50/40 border-amber-300/80 shadow-xs ring-1 ring-amber-200/50 hover:shadow-md'
                    : 'bg-stone-50/70 border-dashed border-stone-300/80 opacity-80 hover:opacity-100 hover:bg-stone-50'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    {/* ไอคอนเหรียญ */}
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 relative ${
                        isUnlocked
                          ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-xs ring-4 ring-amber-100'
                          : 'bg-stone-200 text-stone-400 ring-2 ring-stone-100'
                      }`}
                    >
                      <IconComp className="w-5 h-5 drop-shadow-2xs" />
                      {!isUnlocked && (
                        <div className="absolute -top-1 -right-1 p-0.5 bg-stone-700 text-white rounded-full">
                          <Lock className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    {/* ป้ายสถานะ ปลดล็อกแล้ว / ยังล็อค */}
                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200/80">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" /> ปลดล็อกแล้ว
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-200/80 text-stone-600">
                        <Lock className="w-2.5 h-2.5" /> ยังไม่ปลดล็อก
                      </span>
                    )}
                  </div>

                  <h4 className={`font-bold text-xs ${isUnlocked ? 'text-stone-900 font-serif' : 'text-stone-700'}`}>
                    {badge.name}
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                    {badge.description}
                  </p>
                </div>

                {/* ส่วนล่าง: เงื่อนไขหรือวันที่ปลดล็อก */}
                <div className="mt-3 pt-2.5 border-t border-stone-200/60">
                  {isUnlocked ? (
                    <span className="text-[10px] font-medium text-emerald-800 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      {badge.awarded_at
                        ? `ได้รับเมื่อ ${new Date(badge.awarded_at).toLocaleDateString('th-TH')}`
                        : 'ได้รับเรียบร้อยแล้ว'}
                    </span>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                        <span className="truncate max-w-[170px]">{progressText}</span>
                        <span className="font-bold text-stone-700">{progressPercent}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${progressPercent}%` }}
                          className="h-full bg-stone-400 rounded-full"
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default SellerBadgesCard;
