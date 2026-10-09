import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Users,
  Store,
  DollarSign,
  FileCheck,
  ShieldCheck,
  ArrowRight,
  Package,
  Leaf
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.warn('Fallback admin stats:', err.message);
        setStats({
          totalUsers: 24,
          totalSellers: 6,
          totalProducts: 18,
          totalOrders: 32,
          pendingSlips: 3,
          totalPlatformRevenue: 64200
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-100">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#2A9D8F]">
            Administration Hub
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-stone-900 mt-0.5">
            แผงควบคุมระบบ Craftiverse Platform
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-normal">
            ภาพรวมความปลอดภัย ผู้ใช้งาน ร้านค้า และการอนุมัติสลิปการชำระเงิน
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/verify-payments"
            className="px-5 py-3 rounded-2xl btn-3d-peach text-xs font-bold flex items-center gap-1.5"
          >
            <FileCheck className="w-4 h-4" />
            <span>ตรวจสลิปโอนเงิน ({stats?.pendingSlips || 0})</span>
          </Link>
          <Link
            to="/admin/users"
            className="px-5 py-3 rounded-2xl bg-white border border-emerald-200 text-stone-800 hover:bg-[#F0F9F7] text-xs font-bold flex items-center gap-1.5 shadow-clay-sm transition-all"
          >
            <Users className="w-4 h-4 text-[#2A9D8F]" />
            <span>จัดการผู้ใช้ & Roles</span>
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <div className="clay-card p-7 rounded-3xl space-y-2 border border-white">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">ยอดซื้อขายรวมแพลตฟอร์ม</span>
            <div className="w-8 h-8 rounded-xl bg-[#E8F7F3] text-[#2A9D8F] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-display font-extrabold text-[#2A9D8F]">
            ฿{stats?.totalPlatformRevenue ? stats.totalPlatformRevenue.toLocaleString() : '0'}
          </p>
          <span className="text-[11px] text-[#2A9D8F] font-bold">✓ คำสั่งซื้อที่อนุมัติแล้ว</span>
        </div>

        <div className="clay-card p-7 rounded-3xl space-y-2 border border-white">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">สลิปที่รอตรวจสอบ</span>
            <div className="w-8 h-8 rounded-xl bg-[#FFF0EB] text-[#E76F51] flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-display font-extrabold text-[#E76F51]">{stats?.pendingSlips || 0}</p>
          <Link to="/admin/verify-payments" className="text-[11px] text-[#E76F51] hover:underline font-bold">
            คลิกเพื่อตรวจสอบและอนุมัติทันที →
          </Link>
        </div>

        <div className="clay-card p-7 rounded-3xl space-y-2 border border-white">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">ผู้ใช้งานทั้งหมดในระบบ</span>
            <div className="w-8 h-8 rounded-xl bg-[#FFF9EC] text-amber-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-display font-extrabold text-stone-900">{stats?.totalUsers || 0}</p>
          <span className="text-[11px] text-stone-500 font-medium">รวมถึง {stats?.totalSellers || 0} ช่างฝีมือ</span>
        </div>

      </div>

      {/* Quick Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="clay-card p-7 rounded-3xl flex flex-col justify-between space-y-4 border border-white">
          <div className="space-y-2.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FFE8D6] to-[#FFF0EB] text-[#E76F51] flex items-center justify-center shadow-xs">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-display font-bold text-stone-900">
              ศูนย์ตรวจสอบสลิปโอนเงิน (Payment Verification)
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed font-normal">
              ตรวจสอบรูปสลิปจากผู้ซื้อ ปรับสถานะเป็น Paid เพื่อปลดล็อกขั้นตอน Material Prep ให้ช่างฝีมือเริ่มงาน
            </p>
          </div>
          <Link
            to="/admin/verify-payments"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E76F51] hover:text-[#C1492E]"
          >
            <span>ไปที่หน้าตรวจสอบสลิป</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="clay-card p-7 rounded-3xl flex flex-col justify-between space-y-4 border border-white">
          <div className="space-y-2.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E8F7F3] to-[#D8F3DC] text-[#2A9D8F] flex items-center justify-center shadow-xs">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-display font-bold text-stone-900">
              จัดการผู้ใช้งาน & สิทธิ์ (User & Role Control)
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed font-normal">
              ตรวจสอบรายชื่อสมาชิกทั้งหมด ปรับแต่งระดับสิทธิ์ (buyer, seller, admin) ตามนโยบายความปลอดภัย
            </p>
          </div>
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2A9D8F] hover:text-[#1B4332]"
          >
            <span>ไปที่หน้าจัดการผู้ใช้</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
