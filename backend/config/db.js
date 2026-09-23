import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'chic_fashion_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

export let pool = null;

// Built-in Seed Data for fallback or direct bootstrap
export const fallbackCategories = [
  { id: 1, name: 'NEW IN', slug: 'new-in', badge: 'NEW', image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80' },
  { id: 2, name: 'CLOTHING', slug: 'clothing', badge: null, image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80' },
  { id: 3, name: 'DRESSES', slug: 'dresses', badge: null, image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80' },
  { id: 4, name: 'TOPS', slug: 'tops', badge: null, image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&q=80' },
  { id: 5, name: 'BOTTOMS', slug: 'bottoms', badge: null, image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80' },
  { id: 6, name: 'BAGS', slug: 'bags', badge: null, image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80' },
  { id: 7, name: 'SHOES', slug: 'shoes', badge: null, image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80' },
  { id: 8, name: 'ACCESSORIES', slug: 'accessories', badge: null, image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80' }
];

export const fallbackProducts = [
  {
    id: 1,
    title: 'Linen Blend Blazer',
    category_slug: 'clothing',
    price: 2999.00,
    description: 'Structured linen-blend blazer with single-breasted horn buttons and tailored notched lapels.',
    image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=700&q=80',
    colors: ['#d9cbb8', '#222222', '#4a5568'],
    sizes: ['XS', 'S', 'M', 'L'],
    is_featured: true
  },
  {
    id: 2,
    title: 'Satin Slip Dress',
    category_slug: 'dresses',
    price: 2499.00,
    description: 'Silky cowl-neck midi slip dress tailored for effortless, understated evening elegance.',
    image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=700&q=80',
    colors: ['#111111', '#e3d2c1', '#bfa181'],
    sizes: ['XS', 'S', 'M', 'L'],
    is_featured: true
  },
  {
    id: 3,
    title: 'Ribbed Knit Top',
    category_slug: 'tops',
    price: 1299.00,
    description: 'Premium stretch fine ribbed crew-neck tee in soft ivory with subtle ribbed texture.',
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=700&q=80',
    colors: ['#f3ece2', '#111111', '#a0aec0'],
    sizes: ['S', 'M', 'L'],
    is_featured: true
  },
  {
    id: 4,
    title: 'Wide Leg Trousers',
    category_slug: 'bottoms',
    price: 1999.00,
    description: 'High-rise pleated tailored trousers featuring a fluid drape and concealed closure.',
    image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=700&q=80',
    colors: ['#c8b7a6', '#2d3748'],
    sizes: ['XS', 'S', 'M', 'L'],
    is_featured: true
  },
  {
    id: 5,
    title: 'Leather Shoulder Bag',
    category_slug: 'bags',
    price: 3499.00,
    description: 'Supple Italian full-grain leather curved shoulder bag adorned with custom gold-tone hardware.',
    image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=700&q=80',
    colors: ['#111111', '#8b5a2b'],
    sizes: ['One Size'],
    is_featured: true
  },
  {
    id: 6,
    title: 'Strappy Heeled Sandal',
    category_slug: 'shoes',
    price: 2199.00,
    description: 'Minimalist multi-strap square toe block heel crafted in buttery soft Italian nappa.',
    image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=700&q=80',
    colors: ['#111111', '#e2d4c0'],
    sizes: ['36', '37', '38', '39', '40'],
    is_featured: true
  },
  {
    id: 7,
    title: 'Sculptural Gold Hoop Earrings',
    category_slug: 'accessories',
    price: 1499.00,
    description: '18k gold vermeil chunky teardrop sculptural hoop earrings with secure click closure.',
    image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=700&q=80',
    colors: ['#d4af37', '#e5e4e2'],
    sizes: ['One Size'],
    is_featured: true
  },
  {
    id: 8,
    title: 'Silk Twill Printed Scarf',
    category_slug: 'accessories',
    price: 1899.00,
    description: '100% pure Mulberry silk twill square scarf featuring geometric hand-rolled hem.',
    image_url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=700&q=80',
    colors: ['#2b3a4a', '#8b5a2b'],
    sizes: ['90x90 cm'],
    is_featured: false
  },
  {
    id: 9,
    title: 'Pleated Halter Maxi Dress',
    category_slug: 'dresses',
    price: 3799.00,
    description: 'Floor-skimming micro-pleated halter neckline evening gown with a flowing silhouette.',
    image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=700&q=80',
    colors: ['#c5a059', '#111111', '#800020'],
    sizes: ['XS', 'S', 'M', 'L'],
    is_featured: true
  },
  {
    id: 10,
    title: 'Tailored Poplin Oversized Shirt',
    category_slug: 'tops',
    price: 1899.00,
    description: 'Crisp organic cotton poplin button-down shirt with elongated cuffs and dropped shoulders.',
    image_url: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=700&q=80',
    colors: ['#ffffff', '#87ceeb', '#111111'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    is_featured: true
  },
  {
    id: 11,
    title: 'Pleated Tailored Bermuda Shorts',
    category_slug: 'bottoms',
    price: 1699.00,
    description: 'Sophisticated knee-length tailored shorts in structured stretch twill with front pleats.',
    image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=700&q=80',
    colors: ['#222222', '#d9cbb8'],
    sizes: ['XS', 'S', 'M', 'L'],
    is_featured: false
  },
  {
    id: 12,
    title: 'Woven Leather Bucket Bag',
    category_slug: 'bags',
    price: 3999.00,
    description: 'Artisanal hand-woven calfskin leather bucket bag with removable canvas drawstring pouch.',
    image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=700&q=80',
    colors: ['#8b5a2b', '#111111', '#e3d2c1'],
    sizes: ['One Size'],
    is_featured: true
  }
];

export async function initDatabase() {
  try {
    // 1. Check or create database connection
    const rootConnection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    await rootConnection.end();

    // 2. Connect to the database pool
    pool = mysql.createPool(dbConfig);

    // 3. Create tables if they do not exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        image_url TEXT NOT NULL,
        badge VARCHAR(50) DEFAULT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category_slug VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        original_price DECIMAL(10, 2) DEFAULT NULL,
        description TEXT,
        image_url TEXT NOT NULL,
        colors JSON,
        sizes JSON,
        is_featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(64) NOT NULL UNIQUE,
        customer_name VARCHAR(150) NOT NULL,
        customer_email VARCHAR(150) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        shipping_address TEXT NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        payment_deep_link TEXT NOT NULL,
        payment_status ENUM('PENDING', 'PAID', 'FAILED') DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        product_title VARCHAR(255) NOT NULL,
        size VARCHAR(20),
        color VARCHAR(50),
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      );
    `);

    // 4. Seed categories if empty
    const [catCount] = await pool.query('SELECT COUNT(*) AS count FROM categories');
    if (catCount[0].count === 0) {
      for (const cat of fallbackCategories) {
        await pool.query(
          'INSERT INTO categories (name, slug, image_url, badge) VALUES (?, ?, ?, ?)',
          [cat.name, cat.slug, cat.image_url, cat.badge]
        );
      }
      console.log('Seeded categories successfully into MySQL');
    }

    // 5. Seed products if empty
    const [prodCount] = await pool.query('SELECT COUNT(*) AS count FROM products');
    if (prodCount[0].count === 0) {
      for (const prod of fallbackProducts) {
        await pool.query(
          'INSERT INTO products (title, category_slug, price, description, image_url, colors, sizes, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [
            prod.title,
            prod.category_slug,
            prod.price,
            prod.description,
            prod.image_url,
            JSON.stringify(prod.colors),
            JSON.stringify(prod.sizes),
            prod.is_featured
          ]
        );
      }
      console.log('Seeded products successfully into MySQL');
    }

    console.log('Connected to MySQL and initialized tables.');
  } catch (error) {
    console.warn('MySQL initialization notice:', error.message);
    console.log('Using in-memory fallback for high availability.');
  }
}
