# 🌿 Craftiverse — แพลตฟอร์มตลาดงานคราฟต์ & สินค้า Handmade สไตล์ Minimalist

แพลตฟอร์มซื้อขายผลงานคราฟต์ งานทำมือ 100% สไตล์ Minimalist อบอุ่น (Warm & Earth Tone) พร้อมฟังก์ชัน **Crafting Journey** สำหรับติดตามขั้นตอนการผลิตงาน Made-to-Order ตั้งแต่เตรียมวัตถุดิบ ขึ้นรูป ตรวจสอบความประณีต จนถึงการจัดส่ง

---

## 📁 โครงสร้างโปรเจกต์ (Project Directory Structure)

```text
Market_platform/
├── client/                     # [Frontend] React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── assets/
│   │   │   └── main.css        # โทนสี Minimalist Earth-Tone & Typography
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx  # เมนูเปลี่ยนตาม Role (buyer, seller, admin)
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── Badge.jsx   # 100% Handcrafted, Made-to-Order, Lead time
│   │   │   ├── products/
│   │   │   │   ├── ProductCard.jsx
│   │   │   │   ├── ProductFilter.jsx
│   │   │   │   └── OptionSelector.jsx # ปรับแต่งชิ้นงาน (สีเคลือบ, สลักชื่อ)
│   │   │   └── orders/
│   │   │       └── CraftTracker.jsx   # Stepper ติดตามสายพานการผลิตงานคราฟต์
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Multi-role State & Cart management
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── seller/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── AddProduct.jsx   # กำหนด lead_time_days & Made-to-Order
│   │   │   │   └── ManageOrders.jsx # อัปเดตสถานะงานคราฟต์ทีละสเต็ป
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── ManageUsers.jsx
│   │   │       └── VerifyPayments.jsx # หน้าตรวจและอนุมัติสลิปโอนเงิน
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── productService.js
│   │   │   └── orderService.js
│   │   ├── App.jsx             # React Router + Protected Routes ตาม Role
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── services/                   # [Backend] Node.js + Express + TiDB Cloud (MySQL)
    ├── config/
    │   └── db.js               # เชื่อมต่อ TiDB Cloud ด้วย SSL Connection Pool
    ├── controllers/
    │   ├── authController.js   # สมัคร, เข้าสู่ระบบ, อัปเกรดเป็น Seller
    │   ├── productController.js
    │   ├── orderController.js  # สั่งซื้อ, แนบสลิป, ประวัติคำสั่งซื้อ
    │   ├── sellerController.js # ข้อมูลช่างฝีมือ, เพิ่มสินค้า, อัปเดต Craft status
    │   └── adminController.js  # สรุปภาพรวม, จัดการ Role, ตรวจสอบสลิป
    ├── middleware/
    │   ├── authMiddleware.js   # ตรวจสอบ JWT Token และ RBAC (buyer, seller, admin)
    │   └── uploadMiddleware.js # Multer อัปโหลดภาพสินค้าและสลิป
    ├── routes/
    │   ├── authRoutes.js
    │   ├── productRoutes.js
    │   ├── orderRoutes.js
    │   ├── sellerRoutes.js
    │   └── adminRoutes.js
    ├── utils/
    │   └── imageUploader.js
    ├── .env
    ├── index.js                # Express Server + Auto Database Schema Init
    └── package.json
```

---

## 🎨 จุดเด่นด้านการออกแบบ (Design & Architecture)

1. **Aesthetic Warm & Earth Tone**: โทนสีธรรมชาติด้วย Tailwind CSS เช่น `#FAF8F5` (Stone white), `#C15C3D` (Terracotta Clay), `#9E826C` (Warm Wood), ฟอนต์ Playfair Display และ Plus Jakarta Sans / Prompt
2. **Multi-Role Security System**:
   - `buyer`: ผู้ซื้อ (ค่าเริ่มต้นของทุกคน) สามารถเลือกซื้อสินค้า แนบสลิป และกดปุ่มอัปเกรดเป็น `seller`
   - `seller`: ช่างฝีมือ เข้าถึงแดชบอร์ดร้านค้า เพิ่มสินค้าพร้อมกำหนดระยะเวลาผลิต `lead_time_days` และอัปเดตสเต็ปงานคราฟต์
   - `admin`: ผู้ดูแลระบบ เข้าถึงหน้าตรวจและอนุมัติสลิปโอนเงิน และจัดการผู้ใช้ทั้งหมด
3. **Protected Routes**: ใน `client/src/App.jsx` มี Component `ProtectedRoute` ป้องกันการแอบเข้า URL `/seller/*` และ `/admin/*` โดยไม่มีสิทธิ์
4. **TiDB Cloud SSL Connection**: ใน `services/config/db.js` ใช้ `mysql2/promise` กำหนด `connectionLimit` และ TLS/SSL สำหรับ TiDB Cloud ปลอดภัยพร้อมใช้งานจริง
5. **Craft Journey Stepper**: แสดงเส้นทางการประดิษฐ์ผลงาน 6 สเต็ป (`order_placed` → `material_prep` → `crafting` → `customizing` → `quality_check` → `shipped`)

---

## 🚀 วิธีเริ่มต้นใช้งาน (Getting Started)

### 1. ฝั่ง Backend (`services/`)
```bash
cd services
npm install
# แก้ไขไฟล์ .env เพื่อใส่ข้อมูลเชื่อมต่อ TiDB Cloud ของคุณ
npm run dev
```

### 2. ฝั่ง Frontend (`client/`)
```bash
cd client
npm install
npm run dev
```
เปิดบราวเซอร์ที่ `http://localhost:5173`
