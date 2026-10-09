import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import { Users, Shield, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      if (res.data) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.warn('Fallback users list:', err.message);
      setUsers([
        { id: 1, name: 'แอดมินระบบ Craftiverse', email: 'admin@craftiverse.com', role: 'admin', created_at: '2026-09-01' },
        { id: 2, name: 'เตาเผาดอยสะเก็ด (ช่างปั้น)', email: 'seller@craftiverse.com', role: 'seller', shop_name: 'เตาเผาดอยสะเก็ด', created_at: '2026-09-10' },
        { id: 3, name: 'สมศรี นักสะสมงานคราฟต์', email: 'buyer@craftiverse.com', role: 'buyer', created_at: '2026-09-15' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      alert(`อัปเดตสิทธิ์เป็น ${newRole} สำเร็จแล้ว!`);
      fetchUsers();
    } catch (err) {
      alert(`อัปเดตสิทธิ์เป็น ${newRole} ในระบบสาธิต (Demo mode)`);
      fetchUsers();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex items-center justify-between">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2A9D8F] hover:text-[#1B4332] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับ Admin Hub</span>
        </Link>
      </div>

      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#2A9D8F]">
          User Management
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-stone-900 mt-0.5">
          จัดการผู้ใช้งานและสิทธิ์ (Role Assignment)
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 font-normal">
          ควบคุมบทบาท Multi-role: Buyer (ผู้ซื้อ), Seller (ช่างฝีมือ), Admin (ผู้ดูแลระบบ)
        </p>
      </div>

      <div className="clay-card rounded-3xl overflow-hidden border border-white">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-400 font-medium">กำลังโหลดรายชื่อผู้ใช้...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#E8F7F3]/70 border-b border-emerald-100 text-[#1B4332] uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">ชื่อผู้ใช้งาน</th>
                  <th className="py-4 px-6">อีเมล</th>
                  <th className="py-4 px-6">บทบาทปัจจุบัน</th>
                  <th className="py-4 px-6">ปรับเปลี่ยนสิทธิ์</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F0F9F7]/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-stone-400 font-bold">#{u.id}</td>
                    <td className="py-4 px-6 font-display font-bold text-stone-900 text-sm">
                      {u.name}
                      {u.shop_name && (
                        <span className="block text-[11px] text-[#2A9D8F] font-normal font-sans">
                          ร้าน: {u.shop_name}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-stone-600 font-medium">{u.email}</td>
                    <td className="py-4 px-6">
                      <Badge
                        variant={u.role === 'admin' ? 'dark' : u.role === 'seller' ? 'peach' : 'botanical'}
                        size="xs"
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={u.role}
                        disabled={updatingId === u.id}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="text-xs bg-white border border-emerald-200 rounded-xl px-3 py-1.5 text-stone-700 focus:outline-none focus:border-[#2A9D8F] font-semibold shadow-2xs"
                      >
                        <option value="buyer">buyer</option>
                        <option value="seller">seller</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default ManageUsers;
