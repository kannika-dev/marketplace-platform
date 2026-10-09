import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

import pool, { testConnection } from './config/db.js';
import { upload, getSecureCloudinaryUrl } from './middleware/uploadMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import shopRoutes from './routes/shopRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// อนุญาต Domain สำหรับ CORS
const allowedOrigins = [
  'https://marketplace-handmade-craft.netlify.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

if (process.env.CLIENT_URL) {
  const urls = process.env.CLIENT_URL.split(',').map(url => url.trim());
  urls.forEach(url => {
    if (url && !allowedOrigins.includes(url)) {
      allowedOrigins.push(url);
    }
  });
}

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked request from origin: ${origin}`);
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files (legacy compatibility)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Upload Endpoint via Cloudinary (คืนค่า HTTPS URL 100% ป้องกันรูปหายหลัง Refresh)
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'ไม่พบไฟล์รูปภาพ' });
  }
  const fileUrl = getSecureCloudinaryUrl(req.file);
  res.json({ success: true, url: fileUrl });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Craftiverse Platform API'
  });
});

// Database schema auto-initializer for TiDB Cloud / MySQL
const initDatabaseSchema = async () => {
  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      console.warn('⚠️  Skipping schema init as database is not reachable yet.');
      return;
    }

    // Create categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE
      ) ENGINE=InnoDB;
    `);

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NULL,
        password VARCHAR(255) NULL,
        role ENUM('buyer', 'seller', 'admin') DEFAULT 'buyer',
        store_name VARCHAR(150) NULL,
        bank_account VARCHAR(50) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Create shops table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shops (
          id INT AUTO_INCREMENT PRIMARY KEY,
          seller_id VARCHAR(50) NOT NULL,
          shop_name VARCHAR(255) NOT NULL,
          bio TEXT,
          logo_url TEXT,
          banner_url TEXT,
          phone VARCHAR(50),
          line_id VARCHAR(100),
          address TEXT,
          bank_name VARCHAR(100),
          bank_account VARCHAR(50),
          account_name VARCHAR(255),
          promptpay_number VARCHAR(50),
          qr_code_url TEXT,
          accept_credit_card BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_shop_seller (seller_id)
      ) ENGINE=InnoDB;
    `);

    // Create products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        seller_id INT NOT NULL,
        category_id INT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        stock_quantity INT DEFAULT 0,
        image_url TEXT NULL,
        supports_customization TINYINT(1) DEFAULT 0,
        is_made_to_order TINYINT(1) DEFAULT 0,
        lead_time_days INT DEFAULT 3,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_seller (seller_id),
        INDEX idx_category_id (category_id)
      ) ENGINE=InnoDB;
    `);

    // Migration helper for products table columns if table existed prior
    try {
      const [existingCols] = await pool.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'products' AND TABLE_SCHEMA = DATABASE()`
      );
      const colNames = existingCols.map(c => c.COLUMN_NAME);

      if (!colNames.includes('stock_quantity')) {
        await pool.query('ALTER TABLE products ADD COLUMN stock_quantity INT DEFAULT 0 AFTER price');
        if (colNames.includes('stock')) {
          await pool.query('UPDATE products SET stock_quantity = stock WHERE stock_quantity = 0');
        }
      }
      if (!colNames.includes('category_id')) {
        await pool.query('ALTER TABLE products ADD COLUMN category_id INT NULL AFTER seller_id');
      }
      if (!colNames.includes('supports_customization')) {
        await pool.query('ALTER TABLE products ADD COLUMN supports_customization TINYINT(1) DEFAULT 0 AFTER image_url');
      }
      if (!colNames.includes('is_made_to_order')) {
        await pool.query('ALTER TABLE products ADD COLUMN is_made_to_order TINYINT(1) DEFAULT 0 AFTER supports_customization');
      }
      if (!colNames.includes('lead_time_days')) {
        await pool.query('ALTER TABLE products ADD COLUMN lead_time_days INT DEFAULT 3 AFTER is_made_to_order');
      }
    } catch (migErr) {
      console.warn('Column migration notice:', migErr.message);
    }

    // Create product options table (for craft customization)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_options (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        title VARCHAR(150) NOT NULL,
        option_type VARCHAR(50) DEFAULT 'select',
        choices JSON,
        INDEX idx_product (product_id)
      ) ENGINE=InnoDB;
    `);

    // Create product customizations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_customizations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        option_name VARCHAR(150) NOT NULL,
        option_type VARCHAR(50) DEFAULT 'select',
        price_modifier DECIMAL(10,2) DEFAULT 0.00,
        INDEX idx_prod_cust (product_id)
      ) ENGINE=InnoDB;
    `);

    // Create orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        buyer_id INT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        shipping_address TEXT,
        note TEXT,
        payment_status ENUM('unpaid', 'pending_verification', 'paid', 'payment_rejected') DEFAULT 'unpaid',
        payment_slip_url TEXT NULL,
        craft_status ENUM('order_placed', 'material_prep', 'crafting', 'customizing', 'quality_check', 'ready_to_ship', 'shipped', 'completed', 'cancelled') DEFAULT 'order_placed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_buyer (buyer_id)
      ) ENGINE=InnoDB;
    `);

    // Create order items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        seller_id INT NOT NULL,
        product_title VARCHAR(200) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        subtotal DECIMAL(10,2) NOT NULL,
        customization_details JSON NULL,
        INDEX idx_order (order_id)
      ) ENGINE=InnoDB;
    `);

    // Create craft tracking logs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS craft_tracking_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        step VARCHAR(50) NOT NULL,
        status_title VARCHAR(150) NOT NULL,
        notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_order_logs (order_id)
      ) ENGINE=InnoDB;
    `);

    console.log('✅ Craftiverse database schema initialized successfully on database.');
  } catch (error) {
    console.error('Database schema initialization error:', error.message);
  }
};

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/shops', shopRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Express Server
app.listen(PORT, async () => {
  console.log(`🌿 Craftiverse API Server running smoothly on http://localhost:${PORT}`);
  await initDatabaseSchema();
});