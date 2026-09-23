import mysql from 'mysql2/promise';
import { fallbackProducts } from './config/db.js';

async function migrateProducts() {
  const conn = await mysql.createConnection('mysql://root:kuttyma%402004@localhost:3306/chic_fashion_db');
  console.log('Connected to MySQL chic_fashion_db.');

  // Drop old tables
  await conn.query('DROP TABLE IF EXISTS order_items');
  await conn.query('DROP TABLE IF EXISTS products');

  // Create products table matching frontend models
  await conn.query(`
    CREATE TABLE products (
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

  // Create order_items table
  await conn.query(`
    CREATE TABLE order_items (
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

  // Insert seed products with INR pricing and high-res images
  for (const prod of fallbackProducts) {
    await conn.query(
      `INSERT INTO products (id, title, category_slug, price, description, image_url, colors, sizes, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        prod.id,
        prod.title,
        prod.category_slug,
        prod.price,
        prod.description,
        prod.image_url,
        JSON.stringify(prod.colors),
        JSON.stringify(prod.sizes),
        prod.is_featured,
      ]
    );
  }

  const [rows] = await conn.query('SELECT id, title, price, category_slug, image_url FROM products');
  console.log('SUCCESSFULLY MIGRATED PRODUCTS:');
  console.log(rows);
  await conn.end();
}

migrateProducts()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
