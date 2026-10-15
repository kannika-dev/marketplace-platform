import pool from '../config/db.js';

/**
 * Get all products with filters & search
 */
export const getProducts = async (req, res) => {
  try {
    const { category, is_made_to_order, min_price, max_price, search, sort } = req.query;

    let query = `
      SELECT p.*, u.store_name, u.name as artisan_name, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== 'all') {
      // ✅ รองรับทั้งส่งมาเป็น category_id (ตัวเลข), slug (เช่น 'wood-craft'), หรือชื่อหมวดหมู่
      query += ` AND (p.category_id = ? OR c.slug = ? OR c.name LIKE ? OR p.category_id IN (SELECT id FROM categories WHERE slug = ? OR name LIKE ?))`;
      params.push(category, category, `%${category}%`, category, `%${category}%`);
    }

    if (is_made_to_order !== undefined && is_made_to_order !== '') {
      query += ` AND p.is_made_to_order = ?`;
      params.push(is_made_to_order === 'true' || is_made_to_order === '1' ? 1 : 0);
    }

    if (min_price) {
      query += ` AND p.price >= ?`;
      params.push(Number(min_price));
    }

    if (max_price) {
      query += ` AND p.price <= ?`;
      params.push(Number(max_price));
    }

    if (search) {
      query += ` AND (p.title LIKE ? OR p.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    // Sort order
    if (sort === 'price_asc') {
      query += ` ORDER BY p.price ASC`;
    } else if (sort === 'price_desc') {
      query += ` ORDER BY p.price DESC`;
    } else {
      query += ` ORDER BY p.created_at DESC`;
    }

    const [products] = await pool.query(query, params);

    return res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('getProducts error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get single product by ID with custom options
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await pool.query(
      `SELECT p.*, u.store_name, u.bank_account, u.name as artisan_name, u.email as artisan_email, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN users u ON p.seller_id = u.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ? LIMIT 1`,
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    const product = products[0];

    // Fetch customisation options (e.g. engravings, colors, sizes)
    const [options] = await pool.query(
      'SELECT * FROM product_options WHERE product_id = ?',
      [id]
    );

    product.custom_options = options.map(opt => ({
      ...opt,
      choices: typeof opt.choices === 'string' ? JSON.parse(opt.choices || '[]') : opt.choices
    }));

    return res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('getProductById error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get products belonging to a seller.
 */
export const getSellerProducts = async (req, res) => {
  try {
    const rawId = req.user?.id ?? req.query.seller_id;
    const sellerId = parseInt(rawId, 10);
    if (!rawId || isNaN(sellerId) || sellerId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'seller_id is required and must be a valid positive integer.'
      });
    }

    const [products] = await pool.query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.seller_id = ? 
       ORDER BY p.created_at DESC`,
      [sellerId]
    );

    return res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('getSellerProducts error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};