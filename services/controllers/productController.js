import pool from '../config/db.js';

/**
 * Get all products with filters & search
 */
export const getProducts = async (req, res) => {
  try {
    const { category, is_made_to_order, min_price, max_price, search, sort } = req.query;

    let query = `
      SELECT p.*, u.store_name, u.name as artisan_name 
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== 'all') {
      query += ` AND p.category_id = ?`;
      params.push(category);
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
      `SELECT p.*, u.store_name, u.bank_account, u.name as artisan_name, u.email as artisan_email 
       FROM products p
       LEFT JOIN users u ON p.seller_id = u.id
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
 *
 * @deprecated This route (/products/seller/products) is UNAUTHENTICATED.
 * For secure, per-seller dashboards use GET /seller/products instead
 * (protected by verifyToken — reads seller_id from req.user.id via JWT).
 *
 * This handler is kept only for public-facing shop pages that need to list
 * a specific seller's products without a login session.
 */
export const getSellerProducts = async (req, res) => {
  try {
    // ✅ Prefer JWT identity; fall back to explicit query param (public shop pages only)
    const rawId = req.user?.id ?? req.query.seller_id;

    // ✅ Validate: must be present and a valid integer
    const sellerId = parseInt(rawId, 10);
    if (!rawId || isNaN(sellerId) || sellerId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'seller_id is required and must be a valid positive integer.'
      });
    }

    const [products] = await pool.query(
      `SELECT p.* 
       FROM products p 
       WHERE p.seller_id = ? 
       ORDER BY p.created_at DESC`,
      [sellerId]   // ✅ always a safe integer — never a raw user string
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