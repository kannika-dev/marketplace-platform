import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Public & Buyer Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import SellerProfile from './pages/SellerProfile'; // 👈 เพิ่ม Import หน้าโปรไฟล์ร้านค้าฝั่งลูกค้าสำหรับทุกคนเข้าดู

// Seller Pages
import SellerDashboard from './pages/seller/Dashboard';
import AddProduct from './pages/seller/AddProduct';
import ManageOrders from './pages/seller/ManageOrders';
import ShopProfile from './pages/seller/ShopProfile'; // หน้าตั้งค่าร้านค้าของตัวผู้ขายเอง

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import VerifyPayments from './pages/admin/VerifyPayments';

/**
 * Protected Route Component
 * Restricts access based on user authentication status and authorized roles
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] text-stone-500 text-xs">
        กำลังตรวจสอบสิทธิ์การเข้าถึงระบบ...
      </div>
    );
  }

  // Not logged in -> Redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin has universal superuser access
  if (role === 'admin') {
    return children;
  }

  // Check if role is authorized
  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-2xl font-bold">
          !
        </div>
        <h2 className="text-xl font-serif font-bold text-stone-900">
          ปฏิเสธการเข้าถึง (403 Forbidden)
        </h2>
        <p className="text-xs text-stone-500 max-w-md">
          หน้านี้สงวนไว้สำหรับผู้ใช้ที่มีบทบาท {allowedRoles.join(', ')} เท่านั้น บัญชีของคุณปัจจุบันเป็น '{role}'
        </p>
      </div>
    );
  }

  return children;
};

export const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#FAF9F6] via-[#F4F9F4] to-[#FFF9F3] text-stone-800 antialiased selection:bg-[#FFE6A7] selection:text-[#2A9D8F]">
          <Navbar />

          <main className="flex-grow relative">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/product/:id" element={<ProductDetail />} /> {/* รองรับทั้ง /products/ และ /product/ */}
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* 🌟 Public Seller / Shop Profile (ทุกคนสามารถกดเข้ามาดูหน้าร้านค้านั้นๆ ได้) */}
              <Route path="/seller/:id" element={<SellerProfile />} />

              {/* Protected Buyer Routes */}
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute allowedRoles={['buyer', 'seller', 'admin']}>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute allowedRoles={['buyer', 'seller', 'admin']}>
                    <Orders />
                  </ProtectedRoute>
                }
              />

              {/* Protected Seller Routes (/seller/dashboard, etc.) */}
              <Route
                path="/seller/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['seller']}>
                    <SellerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seller/add-product"
                element={
                  <ProtectedRoute allowedRoles={['seller']}>
                    <AddProduct />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seller/orders"
                element={
                  <ProtectedRoute allowedRoles={['seller']}>
                    <ManageOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seller/profile"
                element={
                  <ProtectedRoute allowedRoles={['seller']}>
                    <ShopProfile />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Routes (/admin/*) */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/verify-payments"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <VerifyPayments />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;