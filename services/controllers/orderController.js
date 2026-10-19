import pool from '../config/db.js';
import { getSecureCloudinaryUrl } from '../middleware/uploadMiddleware.js';

/**
 * Create new orders with items (Supports splitting orders automatically by seller and per-item payment selection)
 */
export const createOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const buyerId = req.user.id;
    const { items, shipping_address, note, payment_method } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item.'
      });
    }

    await connection.beginTransaction();

    // 1. จัดกลุ่มสินค้าตาม seller_id ของแต่ละร้านค้า
    const itemsBySeller = {};

    for (const item of items) {
      const [productRows] = await connection.query(
        'SELECT id, title, price, seller_id, is_made_to_order, lead_time_days, allow_deposit FROM products WHERE id = ?',
        [item.product_id]
      );

      if (productRows.length === 0) {
        throw new Error(`Product with ID ${item.product_id} was not found.`);
      }

      const prod = productRows[0];
      const sellerId = prod.seller_id || 1;
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const itemTotal = Number(prod.price) * quantity;

      const itemPaymentType = item.payment_type || 'full';
      const isAllowed = prod.allow_deposit === 1 || prod.allow_deposit === true;

      let itemDueNow = itemTotal;
      let itemRemaining = 0;

      if (itemPaymentType === 'deposit' && isAllowed) {
        itemDueNow = itemTotal / 2;
        itemRemaining = itemTotal - itemDueNow;
      }

      if (!itemsBySeller[sellerId]) {
        itemsBySeller[sellerId] = {
          sellerId,
          totalAmount: 0,
          depositAmount: 0,
          remainingBalance: 0,
          hasDeposit: false,
          items: []
        };
      }

      itemsBySeller[sellerId].totalAmount += itemTotal;
      itemsBySeller[sellerId].depositAmount += itemDueNow;
      itemsBySeller[sellerId].remainingBalance += itemRemaining;
      if (itemPaymentType === 'deposit' && isAllowed) {
        itemsBySeller[sellerId].hasDeposit = true;
      }

      itemsBySeller[sellerId].items.push({
        product_id: prod.id,
        price: prod.price,
        quantity,
        payment_type: (itemPaymentType === 'deposit' && isAllowed) ? 'deposit' : 'full',
        customization_notes: item.customization_notes || item.customization_details ? JSON.stringify(item.customization_notes || item.customization_details) : null
      });
    }

    const createdOrders = [];

    // 2. วนลูปสร้าง Order แยกตามแต่ละร้านค้าอัตโนมัติ (Split Orders by Seller)
    for (const [sellerId, group] of Object.entries(itemsBySeller)) {
      const overallPaymentType = group.hasDeposit ? 'deposit' : 'full';

      // บันทึก order พร้อมเก็บ seller_id (หากตาราง orders มีคอลัมน์ seller_id) หรือเชื่อมผ่าน items
      const [orderResult] = await connection.query(
        `INSERT INTO orders (buyer_id, total_amount, status, shipping_address, payment_type, payment_method, deposit_amount, remaining_balance, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          buyerId,
          group.totalAmount,
          'unpaid',
          shipping_address || '',
          overallPaymentType,
          payment_method || 'bank_transfer',
          group.depositAmount,
          group.remainingBalance
        ]
      );

      const orderId = orderResult.insertId;
      createdOrders.push(orderId);

      // 3. บันทึก order_items สำหรับร้านค้านี้
      for (const it of group.items) {
        await connection.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price, payment_type, customization_notes)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [orderId, it.product_id, it.quantity, it.price, it.payment_type, it.customization_notes]
        );
      }

      // 4. บันทึก Timeline เริ่มต้นใน craft_tracking_logs
      await connection.query(
        `INSERT INTO craft_tracking_logs (order_id, step, status_title, notes, image_url, created_at)
         VALUES (?, 'order_placed', 'คำสั่งซื้อถูกส่งเรียบร้อย', 'รอการชำระเงินและตรวจสอบสลิปโอนเงิน', NULL, NOW())`,
        [orderId]
      );
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Orders created and split successfully by seller.',
      data: {
        createdOrders
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('createOrder error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create order.',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * Get orders for currently logged in buyer (ดึงข้อมูลรายการสินค้า ข้อมูลร้านค้า และ Timeline ครบถ้วน)
 */
export const getMyOrders = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const [orders] = await pool.query(
      `SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC`,
      [buyerId]
    );

    for (const order of orders) {
      // ดึงสินค้า พร้อมชื่อร้านค้า (shop_name) และ seller_id ของสินค้านั้นๆ
      const [items] = await pool.query(
        `SELECT oi.*, p.title, p.image_url, p.seller_id, s.shop_name 
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         LEFT JOIN shops s ON p.seller_id = s.seller_id
         WHERE oi.order_id = ?`,
        [order.id]
      );

      const [logs] = await pool.query(
        `SELECT id, order_id, step, status_title, notes, image_url, created_at 
         FROM craft_tracking_logs 
         WHERE order_id = ? 
         ORDER BY created_at ASC`,
        [order.id]
      );

      order.items = items;
      order.timeline = logs;

      // กำหนดชื่อร้านค้าหลักของการ์ดอิศเรศนี้ (ถ้ามีสินค้าจากร้าน ให้ดึงชื่อร้านแรกมาแสดง)
      order.shop_name = items.length > 0 ? (items[0].shop_name || `ร้านค้า #${items[0].seller_id}`) : 'ร้านค้าแฮนด์เมด';
    }

    return res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('getMyOrders error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get orders for currently logged in buyer (Alias สำหรับ getBuyerOrders)
 */
export const getBuyerOrders = async (req, res) => {
  return getMyOrders(req, res);
};

/**
 * Get specific order details (for buyer or seller involved)[cite: 9]
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];

    if (userRole !== 'admin' && order.buyer_id !== userId) {
      const [sellerItems] = await pool.query(
        `SELECT oi.id 
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ? AND p.seller_id = ? LIMIT 1`,
        [id, userId]
      );
      if (sellerItems.length === 0) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this order.' });
      }
    }

    const [items] = await pool.query(
      `SELECT oi.*, p.title, p.image_url, p.lead_time_days, p.is_made_to_order, p.seller_id, s.shop_name 
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       LEFT JOIN shops s ON p.seller_id = s.seller_id
       WHERE oi.order_id = ?`,
      [id]
    );

    const [timeline] = await pool.query(
      `SELECT id, order_id, step, status_title, notes, image_url, created_at 
       FROM craft_tracking_logs 
       WHERE order_id = ? 
       ORDER BY created_at ASC`,
      [id]
    );

    order.items = items;
    order.timeline = timeline;
    order.shop_name = items.length > 0 ? (items[0].shop_name || `ร้านค้า #${items[0].seller_id}`) : 'ร้านค้าแฮนด์เมด';

    return res.json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Upload payment slip for verification (งวดแรก / เต็มจำนวน)[cite: 9]
 */
export const uploadPaymentSlip = async (req, res) => {
  try {
    const { id } = req.params;
    const buyerId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please attach payment slip image.' });
    }

    const slipUrl = getSecureCloudinaryUrl(req.file);

    const [result] = await pool.query(
      `UPDATE orders 
       SET payment_slip_url = ?, status = 'pending_verification' 
       WHERE id = ? AND buyer_id = ?`,
      [slipUrl, id, buyerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Order not found or unauthorized.' });
    }

    await pool.query(
      `INSERT INTO craft_tracking_logs (order_id, step, status_title, notes, image_url, created_at)
       VALUES (?, 'payment_uploaded', 'ส่งหลักฐานการชำระเงินแล้ว', 'รอเจ้าหน้าที่แอดมินหรือร้านค้าตรวจสอบสลิปโอนเงิน', NULL, NOW())`,
      [id]
    );

    return res.json({
      success: true,
      message: 'Slip uploaded successfully. Waiting for verification.',
      slip_url: slipUrl
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Upload Final Payment Slip (สลิปงวดที่ 2 สำหรับยอดคงเหลือ)[cite: 9]
 */
export const uploadFinalPaymentSlip = async (req, res) => {
  try {
    const { id } = req.params;
    const buyerId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please attach final payment slip image.' });
    }

    const slipUrl = getSecureCloudinaryUrl(req.file);

    const [result] = await pool.query(
      `UPDATE orders 
       SET final_payment_slip_url = ?, craft_status = 'final_payment_verification' 
       WHERE id = ? AND buyer_id = ?`,
      [slipUrl, id, buyerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Order not found or unauthorized.' });
    }

    await pool.query(
      `INSERT INTO craft_tracking_logs (order_id, step, status_title, notes, image_url, created_at)
       VALUES (?, 'final_payment_verification', 'แนบหลักฐานการชำระเงินงวดที่ 2 แล้ว', 'รอร้านค้าตรวจสอบสลิปยอดคงเหลือ', ?, NOW())`,
      [id, slipUrl]
    );

    return res.json({
      success: true,
      message: 'Final payment slip uploaded successfully. Waiting for seller verification.',
      final_payment_slip_url: slipUrl
    });
  } catch (error) {
    console.error('uploadFinalPaymentSlip error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Buyer confirms receipt of goods and completes the order
 */
export const confirmReceivedOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const buyerId = req.user.id;

    const [orders] = await connection.query(
      'SELECT * FROM orders WHERE id = ? AND buyer_id = ?',
      [id, buyerId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found or unauthorized.' });
    }

    await connection.beginTransaction();

    await connection.query(
      `UPDATE orders SET craft_status = 'completed', status = 'completed' WHERE id = ?`,
      [id]
    );

    await connection.query(
      `INSERT INTO craft_tracking_logs (order_id, step, status_title, notes, image_url, created_at)
       VALUES (?, 'completed', '🎉 ผู้ซื้อยืนยันได้รับสินค้าเรียบร้อยแล้ว', 'คำสั่งซื้อเสร็จสมบูรณ์ ลูกค้าได้รับสินค้าเป็นที่เรียบร้อย', NULL, NOW())`,
      [id]
    );

    await connection.commit();

    return res.json({
      success: true,
      message: 'Order marked as completed successfully.'
    });
  } catch (error) {
    await connection.rollback();
    console.error('confirmReceivedOrder error:', error);
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};