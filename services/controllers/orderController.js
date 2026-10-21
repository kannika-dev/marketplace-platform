import pool from '../config/db.js';
import { getSecureCloudinaryUrl } from '../middleware/uploadMiddleware.js';
import { checkAndAwardBadges } from './sellerController.js';

/**
 * Create new orders with items and initial payment slip (Supports splitting orders automatically by seller and direct slip attachment)
 */
export const createOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const buyerId = req.user.id;
    const { shipping_address, note, payment_method } = req.body;
    let items = req.body.items;

    if (typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch (e) {
        items = [];
      }
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item.'
      });
    }

    // จัดการรูปสลิปงวดแรกที่แนบมาพร้อมกับตอนสร้างคำสั่งซื้อ (ถ้ามี)
    let slipUrl = null;
    if (req.file) {
      slipUrl = getSecureCloudinaryUrl(req.file);
    } else if (req.body.payment_slip_url) {
      slipUrl = req.body.payment_slip_url;
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

    // 2. วนลูปสร้าง Order แยกตามแต่ละร้านค้าอัตโนมัติ พร้อมบันทึก payment_slip_url ลงตาราง orders ทันที
    for (const [sellerId, group] of Object.entries(itemsBySeller)) {
      const overallPaymentType = group.hasDeposit ? 'deposit' : 'full';
      const initialStatus = slipUrl ? 'pending_verification' : 'unpaid';
      const initialPaymentStatus = slipUrl ? 'pending_verification' : 'unpaid';
      const initialCraftStatus = slipUrl ? 'pending_verification' : 'order_placed';

      let orderResult;
      try {
        [orderResult] = await connection.query(
          `INSERT INTO orders (buyer_id, seller_id, total_amount, status, payment_status, craft_status, shipping_address, payment_type, payment_method, deposit_amount, remaining_balance, payment_slip_url, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            buyerId,
            sellerId,
            group.totalAmount,
            initialStatus,
            initialPaymentStatus,
            initialCraftStatus,
            shipping_address || '',
            overallPaymentType,
            payment_method || 'bank_transfer',
            group.depositAmount,
            group.remainingBalance,
            slipUrl || null
          ]
        );
      } catch (insertErr) {
        [orderResult] = await connection.query(
          `INSERT INTO orders (buyer_id, seller_id, total_amount, status, shipping_address, payment_type, payment_method, deposit_amount, remaining_balance, payment_slip_url, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            buyerId,
            sellerId,
            group.totalAmount,
            initialStatus,
            shipping_address || '',
            overallPaymentType,
            payment_method || 'bank_transfer',
            group.depositAmount,
            group.remainingBalance,
            slipUrl || null
          ]
        );
      }

      const orderId = orderResult.insertId;
      createdOrders.push(orderId);

      // 3. บันทึก order_items สำหรับร้านค้านี้
      for (const it of group.items) {
        await connection.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price, customization_notes)
           VALUES (?, ?, ?, ?, ?)`,
          [orderId, it.product_id, it.quantity, it.price, it.customization_notes]
        );
      }

      // 4. บันทึก Timeline เริ่มต้นใน craft_tracking_logs
      const logTitle = slipUrl ? 'ส่งหลักฐานการชำระเงินแล้ว' : 'คำสั่งซื้อถูกส่งเรียบร้อย';
      const logNotes = slipUrl ? 'ผู้ซื้อแนบสลิปโอนเงินเรียบร้อยแล้ว ร้านค้ากำลังตรวจสอบความถูกต้อง' : 'รอการชำระเงินและตรวจสอบสลิปโอนเงิน';

      await connection.query(
        `INSERT INTO craft_tracking_logs (order_id, step, status_title, notes, image_url, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [orderId, slipUrl ? 'payment_uploaded' : 'order_placed', logTitle, logNotes, slipUrl || null]
      );
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Orders created and payment slips uploaded successfully.',
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
      `SELECT o.*, s.shop_name 
       FROM orders o
       LEFT JOIN shops s ON o.seller_id = s.seller_id
       WHERE o.buyer_id = ? 
       ORDER BY o.created_at DESC`,
      [buyerId]
    );

    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price, oi.customization_notes,
                p.title, p.image_url, p.seller_id, p.is_made_to_order, p.lead_time_days,
                p.title AS product_title, p.image_url AS product_image,
                s.shop_name 
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         LEFT JOIN shops s ON p.seller_id = s.seller_id
         WHERE oi.order_id = ?`,
        [order.id]
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

      const [logs] = await pool.query(
        `SELECT id, order_id, step, status_title, notes, image_url, created_at 
         FROM craft_tracking_logs 
         WHERE order_id = ? 
         ORDER BY created_at ASC`,
        [order.id]
      );

      order.items = items;
      order.timeline = logs;

      if (!order.shop_name) {
        order.shop_name = items.length > 0 ? (items[0].shop_name || `ร้านค้า #${items[0].seller_id}`) : 'ร้านค้าแฮนด์เมด';
      }
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
 * Get specific order details (for buyer or seller involved)
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const [orders] = await pool.query(
      `SELECT o.*, s.shop_name 
       FROM orders o
       LEFT JOIN shops s ON o.seller_id = s.seller_id
       WHERE o.id = ?`,
      [id]
    );

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
      `SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price, oi.customization_notes,
              p.title, p.image_url, p.lead_time_days, p.is_made_to_order, p.seller_id,
              p.title AS product_title, p.image_url AS product_image,
              s.shop_name 
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       LEFT JOIN shops s ON p.seller_id = s.seller_id
       WHERE oi.order_id = ?`,
      [id]
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

    const [timeline] = await pool.query(
      `SELECT id, order_id, step, status_title, notes, image_url, created_at 
       FROM craft_tracking_logs 
       WHERE order_id = ? 
       ORDER BY created_at ASC`,
      [id]
    );

    order.items = items;
    order.timeline = timeline;
    if (!order.shop_name) {
      order.shop_name = items.length > 0 ? (items[0].shop_name || `ร้านค้า #${items[0].seller_id}`) : 'ร้านค้าแฮนด์เมด';
    }

    return res.json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Upload payment slip for verification (งวดแรก / เต็มจำนวน)
 */
export const uploadPaymentSlip = async (req, res) => {
  try {
    const { id } = req.params;
    const buyerId = req.user.id;

    let slipUrl = null;
    if (req.file) {
      slipUrl = getSecureCloudinaryUrl(req.file);
    } else if (req.body.payment_slip_url || req.body.slip_url) {
      slipUrl = req.body.payment_slip_url || req.body.slip_url;
    }

    if (!slipUrl) {
      return res.status(400).json({ success: false, message: 'กรุณาแนบรูปภาพสลิปการโอนเงิน (Please attach payment slip image).' });
    }

    try {
      await pool.query(
        `UPDATE orders 
         SET payment_slip_url = ?, status = 'pending_verification', payment_status = 'pending_verification', craft_status = 'pending_verification' 
         WHERE id = ? AND buyer_id = ?`,
        [slipUrl, id, buyerId]
      );
    } catch (e) {
      await pool.query(
        `UPDATE orders 
         SET payment_slip_url = ?, status = 'pending_verification' 
         WHERE id = ? AND buyer_id = ?`,
        [slipUrl, id, buyerId]
      );
    }

    await pool.query(
      `INSERT INTO craft_tracking_logs (order_id, step, status_title, notes, image_url, created_at)
       VALUES (?, 'payment_uploaded', 'ส่งหลักฐานการชำระเงินแล้ว', 'ผู้ซื้อแนบสลิปใหม่เรียบร้อยแล้ว รอร้านค้าตรวจสอบความถูกต้อง', ?, NOW())`,
      [id, slipUrl]
    );

    return res.json({
      success: true,
      message: 'แนบสลิปเรียบร้อยแล้ว รอการตรวจสอบความถูกต้อง',
      slip_url: slipUrl,
      payment_slip_url: slipUrl
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Upload Final Payment Slip (สลิปงวดที่ 2 สำหรับยอดคงเหลือ)
 */
export const uploadFinalPaymentSlip = async (req, res) => {
  try {
    const { id } = req.params;
    const buyerId = req.user.id;

    let slipUrl = null;
    if (req.file) {
      slipUrl = getSecureCloudinaryUrl(req.file);
    } else if (req.body.payment_slip_url || req.body.final_payment_slip_url || req.body.slip_url) {
      slipUrl = req.body.payment_slip_url || req.body.final_payment_slip_url || req.body.slip_url;
    }

    if (!slipUrl) {
      return res.status(400).json({ success: false, message: 'กรุณาแนบรูปภาพสลิปยอดคงเหลือ (Please attach final payment slip image).' });
    }

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

    // 🌟 ตรวจสอบและแจกเหรียญรางวัล (Badges) ให้กับผู้ขายอัตโนมัติเมื่อผู้ซื้อยืนยันได้รับสินค้า
    const targetSellerId = orders[0]?.seller_id;
    if (targetSellerId) {
      checkAndAwardBadges(targetSellerId).catch(err =>
        console.warn('⚠️ checkAndAwardBadges notice on confirmReceivedOrder:', err.message)
      );
    }

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

/**
 * Get orders for seller (ดึงรายการออเดอร์, ข้อมูลสลิปทั้งงวดแรกและงวดสอง, สินค้าแยกชิ้นย่อย 1:1, และ Timeline)
 */
export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.params.sellerId || req.user.id;

    // ✅ ดึงข้อมูลออเดอร์ตามโครงสร้างตาราง orders จริง 100%
    const [orders] = await pool.query(
      `SELECT DISTINCT o.id, o.buyer_id, o.seller_id, o.total_amount, o.status, 
              o.payment_slip_url, o.shipping_address, o.created_at, 
              o.payment_status, o.craft_status, o.payment_method, o.payment_type, 
              o.deposit_amount, o.remaining_balance, o.final_payment_slip_url,
              COALESCE(u.name, 'ผู้ซื้อทั่วไป') as buyer_name, u.email as buyer_email
       FROM orders o
       LEFT JOIN users u ON o.buyer_id = u.id
       WHERE o.seller_id = ? OR o.id IN (
         SELECT oi.order_id FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE p.seller_id = ?
       )
       ORDER BY o.created_at DESC`,
      [sellerId, sellerId]
    );

    for (const ord of orders) {
      // ✅ ดึงข้อมูล order_items โดย JOIN products และไม่อ้างอิง oi.seller_id
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

      // ✅ ดึงประวัติจาก craft_tracking_logs ตามโครงสร้างจริง 100%
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