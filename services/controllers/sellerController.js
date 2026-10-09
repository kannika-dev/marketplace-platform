import pool from '../config/db.js';
import { getSecureCloudinaryUrl } from '../middleware/uploadMiddleware.js';

/**
 * Get seller dashboard metrics & recent orders
 */
export const getSellerDashboardStats = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const [productsCount] = await pool.query(
      'SELECT COUNT(*) as count FROM products WHERE seller_id = ?',
      [sellerId]
    );

    const [salesStats] = await pool.query(
      `SELECT COUNT(DISTINCT oi.order_id) as total_orders, 
              COALESCE(SUM(oi.price * oi.quantity), 0) as total_revenue,
              COALESCE(SUM(oi.quantity), 0) as items_crafted
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN orders o ON oi.order_id = o.id
       WHERE p.seller_id = ? AND o.status IN ('paid', 'completed')`,
      [sellerId]
    );

    const [activeOrders] = await pool.query(
      `SELECT o.id, o.status, o.created_at, p.title as product_title, oi.quantity,
              u.name as buyer_name, u.email as buyer_email
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN orders o ON oi.order_id = o.id
       JOIN users u ON o.buyer_id = u.id
       WHERE p.seller_id = ? AND o.status NOT IN ('completed', 'cancelled')
       ORDER BY o.created_at DESC LIMIT 5`,
      [sellerId]
    );

    return res.json({
      success: true,
      data: {
        totalProducts: productsCount[0].count,
        totalOrders: salesStats[0].total_orders,
        totalRevenue: Number(salesStats[0].total_revenue),
        itemsCrafted: Number(salesStats[0].items_crafted),
        recentActiveOrders: activeOrders
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all reviews for products belonging to this seller (Flexible LEFT JOIN)
 */
export const getSellerReviews = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const [reviews] = await pool.query(
      `SELECT r.id, r.product_id, r.buyer_id, r.rating, r.comment, r.created_at,
              p.title AS product_name, p.image_url AS product_image,
              COALESCE(u.name, 'ลูกค้าทั่วไป') AS customer_name
       FROM reviews r
       JOIN products p ON r.product_id = p.id
       LEFT JOIN users u ON r.buyer_id = u.id
       WHERE p.seller_id = ?
       ORDER BY r.created_at DESC`,
      [sellerId]
    );

    return res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('getSellerReviews Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Helper to safely parse boolean inputs from JSON or FormData strings
 */
const parseBoolean = (val, defaultVal = 0) => {
  if (val === undefined || val === null || val === '') return defaultVal;
  if (typeof val === 'boolean') return val ? 1 : 0;
  if (typeof val === 'number') return val > 0 ? 1 : 0;
  if (typeof val === 'string') {
    const lower = val.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(lower)) return 1;
    if (['false', '0', 'no', 'off'].includes(lower)) return 0;
  }
  return defaultVal;
};

/**
 * Helper to resolve or create a category by name or numeric ID
 */
const resolveCategoryId = async (connection, rawCategory, fallbackId = null) => {
  if (rawCategory === undefined || rawCategory === null || rawCategory === '') {
    return fallbackId;
  }

  const strCategory = String(rawCategory).trim();
  if (!strCategory) return fallbackId;

  const parsedId = parseInt(strCategory, 10);
  const isPureNumber = !isNaN(parsedId) && String(parsedId) === strCategory;

  if (isPureNumber && parsedId > 0) {
    try {
      const [catById] = await connection.query(
        'SELECT id FROM categories WHERE id = ? LIMIT 1',
        [parsedId]
      );
      if (catById.length > 0) {
        return catById[0].id;
      }
      return parsedId;
    } catch (err) {
      console.warn('Error verifying category ID:', err.message);
      return parsedId;
    }
  }

  const catName = strCategory;
  try {
    const [exactMatch] = await connection.query(
      'SELECT id FROM categories WHERE LOWER(TRIM(name)) = LOWER(?) LIMIT 1',
      [catName]
    );
    if (exactMatch.length > 0) {
      return exactMatch[0].id;
    }

    const [likeMatch] = await connection.query(
      'SELECT id FROM categories WHERE name LIKE ? LIMIT 1',
      [`%${catName}%`]
    );
    if (likeMatch.length > 0) {
      return likeMatch[0].id;
    }

    let baseSlug = catName
      .toLowerCase()
      .replace(/[^\w\u0E00-\u0E7F]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (!baseSlug) baseSlug = 'category';

    let generatedSlug = baseSlug;
    let counter = 1;
    while (true) {
      const [existingSlug] = await connection.query(
        'SELECT id FROM categories WHERE slug = ? LIMIT 1',
        [generatedSlug]
      );
      if (existingSlug.length === 0) break;
      generatedSlug = `${baseSlug}-${counter++}`;
    }

    const [newCatResult] = await connection.query(
      'INSERT INTO categories (name, slug) VALUES (?, ?)',
      [catName, generatedSlug]
    );

    return newCatResult.insertId;
  } catch (err) {
    console.error('Error in resolveCategoryId:', err.message);
    return fallbackId;
  }
};

/**
 * Add a new product
 */
export const addProduct = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ (Authentication required)'
    });
  }

  const {
    title,
    price,
    description,
    category,
    category_id,
    stock,
    stock_quantity,
    lead_time_days,
    is_made_to_order,
    supports_customization,
    options,
    customizations,
    product_customizations
  } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'กรุณาระบุชื่อสินค้า (Title is required)'
    });
  }

  if (price === undefined || price === null || price === '' || isNaN(Number(price)) || Number(price) < 0) {
    return res.status(400).json({
      success: false,
      message: 'กรุณาระบุราคาที่ถูกต้อง (Valid price is required)'
    });
  }

  const sellerId = parseInt(req.user.id, 10) || req.user.id;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const rawCategory = category_id !== undefined && category_id !== '' ? category_id : category;
    let validCategoryId = await resolveCategoryId(connection, rawCategory, null);

    if (!validCategoryId) {
      try {
        const [defaultCat] = await connection.query('SELECT id FROM categories ORDER BY id ASC LIMIT 1');
        validCategoryId = defaultCat.length > 0 ? defaultCat[0].id : null;
      } catch (err) {
        validCategoryId = null;
      }
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = getSecureCloudinaryUrl(req.file);
    } else if (req.body.image_url && typeof req.body.image_url === 'string' && req.body.image_url.trim()) {
      imageUrl = req.body.image_url.trim();
    }

    const rawStock = stock_quantity !== undefined && stock_quantity !== '' ? stock_quantity : stock;
    const finalStockQuantity = (rawStock !== undefined && rawStock !== null && rawStock !== '' && !isNaN(Number(rawStock)))
      ? Math.max(0, parseInt(rawStock, 10))
      : 0;

    const finalDescription = typeof description === 'string' ? description.trim() : '';
    const finalLeadTimeDays = (lead_time_days !== undefined && lead_time_days !== null && lead_time_days !== '' && !isNaN(Number(lead_time_days)))
      ? Math.max(0, parseInt(lead_time_days, 10))
      : 3;

    const finalIsMadeToOrder = parseBoolean(is_made_to_order, 0);

    let parsedOptions = [];
    if (options) {
      try {
        parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;
      } catch (err) {
        parsedOptions = [];
      }
    }

    let parsedCustomizations = [];
    const rawCust = customizations || product_customizations;
    if (rawCust) {
      try {
        parsedCustomizations = typeof rawCust === 'string' ? JSON.parse(rawCust) : rawCust;
      } catch (err) {
        parsedCustomizations = [];
      }
    }

    let finalSupportsCustomization = parseBoolean(supports_customization, 0);
    if (!finalSupportsCustomization && (parsedOptions.length > 0 || parsedCustomizations.length > 0)) {
      finalSupportsCustomization = 1;
    }

    const [productResult] = await connection.query(
      `INSERT INTO products (
        seller_id, category_id, title, description, price, stock_quantity,
        image_url, supports_customization, is_made_to_order, lead_time_days, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        sellerId,
        validCategoryId,
        title.trim(),
        finalDescription,
        Number(price),
        finalStockQuantity,
        imageUrl,
        finalSupportsCustomization,
        finalIsMadeToOrder,
        finalLeadTimeDays
      ]
    );

    const productId = productResult.insertId;

    if (Array.isArray(parsedOptions) && parsedOptions.length > 0) {
      for (const opt of parsedOptions) {
        if (opt && opt.title && opt.title.trim()) {
          try {
            await connection.query(
              `INSERT INTO product_options (product_id, title, option_type, choices)
               VALUES (?, ?, ?, ?)`,
              [
                productId,
                opt.title.trim(),
                opt.option_type || opt.type || 'select',
                JSON.stringify(opt.choices || [])
              ]
            );
          } catch (optErr) {
            console.error('Failed to insert product option:', optErr.message);
          }
        }
      }
    }

    if (Array.isArray(parsedCustomizations) && parsedCustomizations.length > 0) {
      for (const cust of parsedCustomizations) {
        const optName = cust.option_name || cust.name || cust.title;
        if (optName && optName.trim()) {
          try {
            await connection.query(
              `INSERT INTO product_customizations (product_id, option_name, option_type, price_modifier)
               VALUES (?, ?, ?, ?)`,
              [
                productId,
                optName.trim(),
                cust.option_type || cust.type || 'select',
                Number(cust.price_modifier) || 0.00
              ]
            );
          } catch (custErr) {
            console.error('Failed to insert product customization:', custErr.message);
          }
        }
      }
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'เพิ่มสินค้าเรียบร้อยแล้ว สามารถมาแก้ไขรายละเอียดเพิ่มทีหลังได้',
      data: { productId }
    });
  } catch (error) {
    await connection.rollback();
    console.error('addProduct Error:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเพิ่มสินค้า: ' + error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * Get all products listed by this seller
 */
export const getSellerProducts = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const [products] = await pool.query(
      `SELECT
         p.id, p.seller_id, p.category_id, p.title, p.description,
         p.price, p.stock_quantity, p.image_url,
         p.supports_customization, p.is_made_to_order, p.lead_time_days,
         p.created_at,
         c.name AS category_name, c.slug AS category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.seller_id = ?
       ORDER BY p.created_at DESC`,
      [sellerId]
    );
    return res.json({ success: true, data: products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update an existing product
 */
export const updateProduct = async (req, res) => {
  const { id } = req.params;

  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ (Authentication required)'
    });
  }

  const productId = parseInt(id, 10);
  if (isNaN(productId) || productId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'รหัสสินค้าไม่ถูกต้อง (Invalid product ID)'
    });
  }

  const sellerId = req.user.id;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existing] = await connection.query(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'ไม่พบสินค้าในระบบ'
      });
    }

    if (Number(existing[0].seller_id) !== Number(sellerId)) {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์แก้ไขสินค้านี้ เนื่องจากคุณไม่ใช่เจ้าของสินค้า'
      });
    }

    const current = existing[0];

    const {
      title,
      price,
      description,
      category,
      category_id,
      stock,
      stock_quantity,
      lead_time_days,
      is_made_to_order,
      supports_customization,
      options,
      customizations,
      product_customizations
    } = req.body;

    let imageUrl = current.image_url;
    if (req.file) {
      imageUrl = getSecureCloudinaryUrl(req.file);
    } else if (req.body.image_url !== undefined && typeof req.body.image_url === 'string' && req.body.image_url.trim()) {
      imageUrl = req.body.image_url.trim();
    }

    const rawCategory = category_id !== undefined && category_id !== '' ? category_id : category;
    const resolvedCategoryId = await resolveCategoryId(connection, rawCategory, current.category_id);

    const newTitle = (title !== undefined && title !== null && String(title).trim() !== '')
      ? String(title).trim()
      : current.title;

    let newPrice = current.price;
    if (price !== undefined && price !== null && price !== '') {
      const parsedPrice = parseFloat(price);
      if (!isNaN(parsedPrice) && parsedPrice >= 0) {
        newPrice = Number(parsedPrice.toFixed(2));
      }
    }

    const newDescription = (description !== undefined && description !== null)
      ? String(description).trim()
      : (current.description || '');

    const rawStock = stock_quantity !== undefined && stock_quantity !== '' ? stock_quantity : stock;
    let newStockQuantity = current.stock_quantity !== null && current.stock_quantity !== undefined
      ? parseInt(current.stock_quantity, 10)
      : 0;
    if (rawStock !== undefined && rawStock !== null && rawStock !== '') {
      const parsedStock = parseInt(rawStock, 10);
      if (!isNaN(parsedStock) && parsedStock >= 0) {
        newStockQuantity = parsedStock;
      }
    }

    let newLeadTimeDays = current.lead_time_days !== null && current.lead_time_days !== undefined
      ? parseInt(current.lead_time_days, 10)
      : 3;
    if (lead_time_days !== undefined && lead_time_days !== null && lead_time_days !== '') {
      const parsedLead = parseInt(lead_time_days, 10);
      if (!isNaN(parsedLead) && parsedLead >= 0) {
        newLeadTimeDays = parsedLead;
      }
    }

    const newIsMadeToOrder = is_made_to_order !== undefined
      ? parseBoolean(is_made_to_order, current.is_made_to_order ? 1 : 0)
      : (current.is_made_to_order ? 1 : 0);

    const newSupportsCustomization = supports_customization !== undefined
      ? parseBoolean(supports_customization, current.supports_customization ? 1 : 0)
      : (current.supports_customization ? 1 : 0);

    await connection.query(
      `UPDATE products SET 
        title = ?,
        price = ?,
        description = ?,
        category_id = ?,
        stock_quantity = ?,
        image_url = ?,
        lead_time_days = ?,
        is_made_to_order = ?,
        supports_customization = ?
       WHERE id = ? AND seller_id = ?`,
      [
        newTitle,
        newPrice,
        newDescription,
        resolvedCategoryId || null,
        newStockQuantity,
        imageUrl || null,
        newLeadTimeDays,
        newIsMadeToOrder,
        newSupportsCustomization,
        productId,
        sellerId
      ]
    );

    if (options !== undefined) {
      let parsedOptions = [];
      try {
        parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;
      } catch (err) {
        parsedOptions = [];
      }
      if (Array.isArray(parsedOptions)) {
        await connection.query('DELETE FROM product_options WHERE product_id = ?', [productId]);
        for (const opt of parsedOptions) {
          if (opt && opt.title && opt.title.trim()) {
            await connection.query(
              `INSERT INTO product_options (product_id, title, option_type, choices)
               VALUES (?, ?, ?, ?)`,
              [
                productId,
                opt.title.trim(),
                opt.option_type || opt.type || 'select',
                JSON.stringify(opt.choices || [])
              ]
            );
          }
        }
      }
    }

    const rawCust = customizations !== undefined ? customizations : product_customizations;
    if (rawCust !== undefined) {
      let parsedCustomizations = [];
      try {
        parsedCustomizations = typeof rawCust === 'string' ? JSON.parse(rawCust) : rawCust;
      } catch (err) {
        parsedCustomizations = [];
      }
      if (Array.isArray(parsedCustomizations)) {
        try {
          await connection.query('DELETE FROM product_customizations WHERE product_id = ?', [productId]);
          for (const cust of parsedCustomizations) {
            const optName = cust.option_name || cust.name || cust.title;
            if (optName && optName.trim()) {
              await connection.query(
                `INSERT INTO product_customizations (product_id, option_name, option_type, price_modifier)
                 VALUES (?, ?, ?, ?)`,
                [
                  productId,
                  optName.trim(),
                  cust.option_type || cust.type || 'select',
                  Number(cust.price_modifier) || 0.00
                ]
              );
            }
          }
        } catch (custErr) {
          console.error('Failed to update product customizations:', custErr.message);
        }
      }
    }

    const [updatedRows] = await connection.query(
      `SELECT
         p.id, p.seller_id, p.category_id, p.title, p.description,
         p.price, p.stock_quantity, p.image_url,
         p.supports_customization, p.is_made_to_order, p.lead_time_days,
         p.created_at,
         c.name AS category_name, c.slug AS category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [productId]
    );

    await connection.commit();
    return res.json({
      success: true,
      message: 'อัปเดตข้อมูลสินค้าเรียบร้อยแล้ว',
      data: updatedRows[0] || null
    });
  } catch (error) {
    await connection.rollback();
    console.error('updateProduct Error:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตสินค้า: ' + error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * Delete a product
 */
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ (Authentication required)'
    });
  }

  const productId = parseInt(id, 10);
  if (isNaN(productId) || productId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'รหัสสินค้าไม่ถูกต้อง (Invalid product ID)'
    });
  }

  const sellerId = req.user.id;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existing] = await connection.query(
      'SELECT id, seller_id FROM products WHERE id = ?',
      [productId]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'ไม่พบสินค้าในระบบ'
      });
    }

    if (Number(existing[0].seller_id) !== Number(sellerId)) {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์ลบสินค้านี้ เนื่องจากคุณไม่ใช่เจ้าของสินค้า'
      });
    }

    try {
      await connection.query('DELETE FROM product_customizations WHERE product_id = ?', [productId]);
    } catch (ignoreCustErr) { }

    await connection.query('DELETE FROM product_options WHERE product_id = ?', [productId]);
    await connection.query('DELETE FROM products WHERE id = ?', [productId]);

    await connection.commit();

    return res.json({
      success: true,
      message: 'ลบสินค้าออกจากระบบเรียบร้อยแล้ว'
    });
  } catch (error) {
    await connection.rollback();
    console.error('deleteProduct Error:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบสินค้า: ' + error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * Get orders that involve this seller's products
 */
export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const [orders] = await pool.query(
      `SELECT DISTINCT o.id, o.buyer_id, o.status, o.total_amount, 
              o.shipping_address, o.payment_slip_url, o.created_at, u.name as buyer_name, u.email as buyer_email
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       JOIN users u ON o.buyer_id = u.id
       WHERE p.seller_id = ?
       ORDER BY o.created_at DESC`,
      [sellerId]
    );

    for (const ord of orders) {
      const [items] = await pool.query(
        `SELECT oi.*, p.title, p.image_url 
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ? AND p.seller_id = ?`,
        [ord.id, sellerId]
      );
      ord.items = items;
    }

    return res.json({ success: true, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update craft journey / production status
 */
export const updateCraftStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { craft_status, step_title, note } = req.body;

    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [craft_status, orderId]);
    await pool.query(
      `INSERT INTO craft_tracking_logs (order_id, step, status_title, notes, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [orderId, craft_status, step_title || craft_status, note || '']
    );

    return res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};