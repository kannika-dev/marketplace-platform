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
      `SELECT o.id, o.status, o.craft_status, o.created_at, p.title as product_title, oi.quantity,
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
              r.reply_text, r.replied_at,
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
 * Reply to a specific product review (Seller Response Thread)
 */
export const replyToReview = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { reviewId } = req.params;
    const { reply_text } = req.body;

    if (!reply_text || reply_text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุข้อความตอบกลับ'
      });
    }

    const [reviewCheck] = await pool.query(
      `SELECT r.id FROM reviews r
       JOIN products p ON r.product_id = p.id
       WHERE r.id = ? AND p.seller_id = ?`,
      [reviewId, sellerId]
    );

    if (reviewCheck.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์ตอบกลับรีวิวนี้'
      });
    }

    await pool.query(
      `UPDATE reviews 
       SET reply_text = ?, replied_at = NOW() 
       WHERE id = ?`,
      [reply_text.trim(), reviewId]
    );

    return res.json({
      success: true,
      message: 'ตอบกลับรีวิวเรียบร้อยแล้ว',
      data: {
        review_id: reviewId,
        reply_text: reply_text.trim(),
        replied_at: new Date()
      }
    });
  } catch (error) {
    console.error('replyToReview Error:', error);
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
    allow_deposit,
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
    const finalAllowDeposit = parseBoolean(allow_deposit, 0);

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
        image_url, supports_customization, is_made_to_order, allow_deposit, lead_time_days, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
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
        finalAllowDeposit,
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
         p.supports_customization, p.is_made_to_order, p.allow_deposit, p.lead_time_days,
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
      allow_deposit,
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

    const newAllowDeposit = allow_deposit !== undefined
      ? parseBoolean(allow_deposit, current.allow_deposit ? 1 : 0)
      : (current.allow_deposit ? 1 : 0);

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
        supports_customization = ?,
        allow_deposit = ?
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
        newAllowDeposit,
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
         p.supports_customization, p.is_made_to_order, p.allow_deposit, p.lead_time_days,
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
 * Get orders that involve this seller's products (รองรับระบบชำระเงิน 2 งวด สลิปรอบสอง สินค้ารายชิ้น 1:1 และ Timeline)
 */
export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.id;

    // ✅ เพิ่มการ LEFT JOIN ดึง buyer_note จาก order_update_requests (สถานะ pending)
    const [orders] = await pool.query(
      `SELECT DISTINCT o.id, o.buyer_id, o.seller_id, o.total_amount, o.status, 
              o.payment_slip_url, o.shipping_address, o.created_at, 
              o.payment_status, o.craft_status, o.payment_method, o.payment_type, 
              o.deposit_amount, o.remaining_balance, o.final_payment_slip_url,
              o.has_pending_update_request,
              our.buyer_note AS update_buyer_note,
              COALESCE(u.name, 'ผู้ซื้อทั่วไป') as buyer_name, u.email as buyer_email
       FROM orders o
       LEFT JOIN users u ON o.buyer_id = u.id
       LEFT JOIN order_update_requests our ON o.id = our.order_id AND our.status = 'pending'
       WHERE o.seller_id = ? OR o.id IN (
         SELECT oi.order_id FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE p.seller_id = ?
       )
       ORDER BY o.created_at DESC`,
      [sellerId, sellerId]
    );

    for (const ord of orders) {
      const [items] = await pool.query(
        `SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price, oi.customization_notes,
                p.title, p.image_url, p.is_made_to_order, p.lead_time_days,
                p.title AS product_title, p.image_url AS product_image
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ? AND p.seller_id = ?`,
        [ord.id, sellerId]
      );

      for (const it of items) {
        it.product_title = it.product_title || it.title;
        it.product_image = it.product_image || it.image_url;
        if (it.customization_notes && typeof it.customization_notes === 'string') {
          try {
            it.customization_details = JSON.parse(it.customization_notes);
          } catch (e) {
            it.customization_details = it.customization_notes;
          }
        } else {
          it.customization_details = it.customization_notes || null;
        }
      }
      ord.items = items;

      const [timeline] = await pool.query(
        `SELECT id, order_id, step, status_title, notes, image_url, created_at 
         FROM craft_tracking_logs 
         WHERE order_id = ? 
         ORDER BY created_at ASC`,
        [ord.id]
      );
      ord.timeline = timeline;
    }

    return res.json({ success: true, data: orders });
  } catch (error) {
    console.error('getSellerOrders Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update craft journey / production status
 */
export const updateCraftStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    let craft_status = req.body?.craft_status || req.body?.step;
    if (!craft_status || craft_status === 'undefined' || craft_status === 'null') {
      craft_status = 'crafting';
    }

    const step_title = req.body?.step_title || req.body?.status_title || craft_status;
    const note = req.body?.note || req.body?.notes || '';

    let imageUrl = null;
    if (req.file) {
      imageUrl = getSecureCloudinaryUrl(req.file);
    } else if (req.body?.image_url) {
      imageUrl = req.body.image_url;
    }

    let updateSql = 'UPDATE orders SET craft_status = ?';
    let updateParams = [craft_status];

    if (craft_status === 'in_progress' && (step_title.includes('ตรวจสอบสลิป') || step_title.includes('อนุมัติสลิป') || step_title.includes('สลิปถูกต้อง'))) {
      updateSql += ', status = ?, payment_status = ?';
      updateParams.push('paid', 'paid');
    } else if (craft_status === 'ready_to_ship') {
      updateSql += ', status = ?, payment_status = ?';
      updateParams.push('paid', 'paid');
    } else if (craft_status === 'slip_rejected') {
      updateSql += ', payment_status = ?';
      updateParams.push('payment_rejected');
    } else if (craft_status === 'completed') {
      updateSql += ', status = ?';
      updateParams.push('completed');
    }

    updateSql += ' WHERE id = ?';
    updateParams.push(orderId);

    await pool.query(updateSql, updateParams);

    // บันทึกลงตาราง craft_tracking_logs
    await pool.query(
      `INSERT INTO craft_tracking_logs (order_id, step, status_title, notes, image_url, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [orderId, craft_status, step_title, note, imageUrl]
    );

    // 🔔 🌟 เมื่อผู้ขายอัปเดตสเต็ปงาน ให้เคลียร์คำร้องขออัปเดต (has_pending_update_request = FALSE) ทันที
    try {
      await pool.query(`UPDATE orders SET has_pending_update_request = FALSE WHERE id = ?`, [orderId]);
      await pool.query(`UPDATE order_update_requests SET status = 'resolved' WHERE order_id = ?`, [orderId]);
    } catch (resolveErr) {
      console.warn('Resolve update request notice:', resolveErr.message);
    }

    // ตรวจสอบและแจกเหรียญรางวัล (Badges) อัตโนมัติเมื่อคำสั่งซื้อสำเร็จ
    if (craft_status === 'completed') {
      try {
        let targetSellerId = req.user?.id;
        if (!targetSellerId) {
          const [orderRows] = await pool.query('SELECT seller_id FROM orders WHERE id = ?', [orderId]);
          targetSellerId = orderRows[0]?.seller_id;
        }
        if (targetSellerId) {
          await checkAndAwardBadges(targetSellerId);
        }
      } catch (badgeErr) {
        console.warn('⚠️ checkAndAwardBadges notice:', badgeErr.message);
      }
    }

    return res.json({
      success: true,
      message: 'อัปเดตสเต็ปงานคราฟต์ ข้อความ และรูปภาพเรียบร้อยแล้ว',
      image_url: imageUrl
    });
  } catch (error) {
    console.error('updateCraftStatus Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🌟 ตรวจสอบและแจกเหรียญรางวัล (Badges) ให้กับผู้ขาย (Artisan) อัตโนมัติเมื่อคำสั่งซื้อสำเร็จ
 * @param {number|string} sellerId - รหัสผู้ขาย (Artisan)
 */
export const checkAndAwardBadges = async (sellerId) => {
  if (!sellerId) return { success: false, message: 'sellerId is required' };

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS badges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT NULL,
        criteria_type VARCHAR(50) DEFAULT 'orders',
        criteria_value DECIMAL(10,2) DEFAULT 0,
        min_orders INT DEFAULT 0,
        min_revenue DECIMAL(10,2) DEFAULT 0.00,
        icon VARCHAR(100) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_badges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        badge_id INT NOT NULL,
        awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_badge (user_id, badge_id)
      ) ENGINE=InnoDB;
    `);

    const [stats] = await pool.query(
      `SELECT 
         COUNT(DISTINCT oi.order_id) AS totalOrders,
         COALESCE(SUM(oi.price * oi.quantity), 0) AS totalRevenue
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN orders o ON oi.order_id = o.id
       WHERE p.seller_id = ? AND (o.status = 'completed' OR o.craft_status = 'completed')`,
      [sellerId]
    );

    const totalOrders = Number(stats[0]?.totalOrders || 0);
    const totalRevenue = Number(stats[0]?.totalRevenue || 0);

    const [availableBadges] = await pool.query(
      `SELECT b.* 
       FROM badges b
       LEFT JOIN user_badges ub ON b.id = ub.badge_id AND ub.user_id = ?
       WHERE ub.id IS NULL`,
      [sellerId]
    );

    const newlyAwarded = [];

    for (const badge of availableBadges) {
      let isEligible = false;

      const cType = badge.criteria_type;
      const cVal = Number(badge.criteria_value || 0);
      const minOrders = Number(badge.min_orders || 0);
      const minRevenue = Number(badge.min_revenue || 0);

      if (cType === 'revenue' && totalRevenue >= cVal && cVal > 0) {
        isEligible = true;
      } else if (cType === 'orders' && totalOrders >= cVal && cVal > 0) {
        isEligible = true;
      } else if (minRevenue > 0 && totalRevenue >= minRevenue) {
        isEligible = true;
      } else if (minOrders > 0 && totalOrders >= minOrders) {
        isEligible = true;
      }

      if (isEligible) {
        await pool.query(
          `INSERT IGNORE INTO user_badges (user_id, badge_id, awarded_at) 
           VALUES (?, ?, NOW())`,
          [sellerId, badge.id]
        );
        newlyAwarded.push(badge);
      }
    }

    return { success: true, newlyAwarded, totalOrders, totalRevenue };
  } catch (error) {
    console.error('Error in checkAndAwardBadges:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * ดึงข้อมูลเหรียญรางวัล (Badges) และระดับเลเวล (Tiers & EXP) ของผู้ขาย
 */
export const getSellerBadges = async (req, res) => {
  try {
    const sellerId = req.user.id;

    await checkAndAwardBadges(sellerId);

    const [stats] = await pool.query(
      `SELECT 
         COUNT(DISTINCT oi.order_id) AS totalOrders,
         COALESCE(SUM(oi.price * oi.quantity), 0) AS totalRevenue
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN orders o ON oi.order_id = o.id
       WHERE p.seller_id = ? AND (o.status = 'completed' OR o.craft_status = 'completed')`,
      [sellerId]
    );

    const totalOrders = Number(stats[0]?.totalOrders || 0);
    const totalRevenue = Number(stats[0]?.totalRevenue || 0);

    const expPoints = (totalOrders * 100) + Math.floor(totalRevenue / 50);

    let currentLevel = 1;
    let levelTitle = 'ช่างฝีมือฝึกหัด (Apprentice)';
    let minExp = 0;
    let nextLevelExp = 500;

    if (expPoints >= 4000) {
      currentLevel = 4;
      levelTitle = 'ปรมาจารย์แห่งงานคราฟต์ (Grandmaster)';
      minExp = 4000;
      nextLevelExp = 10000;
    } else if (expPoints >= 1500) {
      currentLevel = 3;
      levelTitle = 'ช่างศิลป์ชั้นสูง (Master Artisan)';
      minExp = 1500;
      nextLevelExp = 4000;
    } else if (expPoints >= 500) {
      currentLevel = 2;
      levelTitle = 'ช่างฝีมือผู้ชำนาญ (Skilled Craftsman)';
      minExp = 500;
      nextLevelExp = 1500;
    }

    const expInLevel = Math.max(0, expPoints - minExp);
    const expNeeded = Math.max(1, nextLevelExp - minExp);
    const progressPercent = Math.min(100, Math.round((expInLevel / expNeeded) * 100));

    const [existingBadgesCount] = await pool.query('SELECT COUNT(*) as count FROM badges');
    if (existingBadgesCount[0]?.count === 0) {
      await pool.query(`
        INSERT INTO badges (name, description, criteria_type, criteria_value, icon) VALUES
        ('ก้าวแรกช่างฝีมือ (First Sale)', 'มีคำสั่งซื้อที่เสร็จสมบูรณ์รายการแรก', 'orders', 1, 'Award'),
        ('ยอดนิยมประจำชุมชน (Rising Artisan)', 'ส่งมอบผลงานสำเร็จครบ 5 คำสั่งซื้อ', 'orders', 5, 'Sparkles'),
        ('ยอดขายก้าวหน้า (Craft Milestone)', 'สร้างรายได้สะสมทะลุ ฿3,000', 'revenue', 3000, 'TrendingUp'),
        ('ช่างศิลป์ชั้นครู (Master Artisan)', 'ส่งมอบผลงานสำเร็จครบ 15 คำสั่งซื้อ', 'orders', 15, 'ShieldCheck'),
        ('ยอดขายหมื่นแรก (Top Studio)', 'สร้างรายได้สะสมทะลุ ฿10,000', 'revenue', 10000, 'Crown')
      `);
      await checkAndAwardBadges(sellerId);
    }

    const [allBadges] = await pool.query(
      `SELECT 
         b.*, 
         ub.awarded_at, 
         (ub.id IS NOT NULL) AS is_unlocked
       FROM badges b
       LEFT JOIN user_badges ub ON b.id = ub.badge_id AND ub.user_id = ?
       ORDER BY b.id ASC`,
      [sellerId]
    );

    return res.json({
      success: true,
      data: {
        level: {
          current_level: currentLevel,
          title: levelTitle,
          exp_points: expPoints,
          min_exp: minExp,
          next_level_exp: nextLevelExp,
          progress_percent: progressPercent
        },
        stats: {
          totalOrders,
          totalRevenue
        },
        badges: allBadges.map(b => ({
          ...b,
          is_unlocked: Boolean(b.is_unlocked)
        }))
      }
    });
  } catch (error) {
    console.error('getSellerBadges Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};