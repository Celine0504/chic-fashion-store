import { pool, fallbackCategories, fallbackProducts } from '../config/db.js';

export const getCategories = async (req, res) => {
  try {
    if (pool) {
      const [rows] = await pool.query('SELECT * FROM categories');
      return res.json(rows);
    }
    return res.json(fallbackCategories);
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    res.json(fallbackCategories);
  }
};

export const getProducts = async (req, res) => {
  try {
    const { category, search, featured } = req.query;

    if (pool) {
      let query = 'SELECT * FROM products WHERE 1=1';
      const params = [];

      if (category) {
        const catLower = category.toLowerCase();
        if (catLower === 'clothing') {
          query += " AND category_slug IN ('clothing', 'dresses', 'tops', 'bottoms')";
        } else {
          query += ' AND category_slug = ?';
          params.push(catLower);
        }
      }
      if (search) {
        query += ' AND (title LIKE ? OR description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }
      if (featured === 'true') {
        query += ' AND is_featured = TRUE';
      }

      query += ' ORDER BY created_at DESC';
      const [rows] = await pool.query(query, params);
      return res.json(rows);
    }

    // In-memory filter fallback
    let results = [...fallbackProducts];
    if (category) {
      const catLower = category.toLowerCase();
      if (catLower === 'clothing') {
        results = results.filter((p) =>
          ['clothing', 'dresses', 'tops', 'bottoms'].includes(p.category_slug.toLowerCase())
        );
      } else {
        results = results.filter((p) => p.category_slug.toLowerCase() === catLower);
      }
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    if (featured === 'true') {
      results = results.filter((p) => p.is_featured);
    }
    res.json(results);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.json(fallbackProducts);
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (pool) {
      const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      return res.json(rows[0]);
    }

    const product = fallbackProducts.find((p) => p.id === Number(id));
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product details:', error.message);
    res.status(500).json({ error: error.message });
  }
};
