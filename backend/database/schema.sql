CREATE DATABASE IF NOT EXISTS chic_fashion_db;
USE chic_fashion_db;

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  image_url TEXT NOT NULL,
  badge VARCHAR(50) DEFAULT NULL
);

-- 2. Products Table
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

-- 3. Orders Table
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

-- 4. Order Items Table
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

-- Seed Categories
INSERT IGNORE INTO categories (id, name, slug, image_url, badge) VALUES
(1, 'NEW IN', 'new-in', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80', 'NEW'),
(2, 'CLOTHING', 'clothing', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80', NULL),
(3, 'DRESSES', 'dresses', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80', NULL),
(4, 'TOPS', 'tops', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&q=80', NULL),
(5, 'BOTTOMS', 'bottoms', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80', NULL),
(6, 'BAGS', 'bags', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80', NULL),
(7, 'SHOES', 'shoes', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80', NULL),
(8, 'ACCESSORIES', 'accessories', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80', NULL);

-- Seed Products matching UI screenshot
INSERT IGNORE INTO products (id, title, category_slug, price, description, image_url, colors, sizes, is_featured) VALUES
(1, 'Linen Blend Blazer', 'clothing', 129.00, 'Structured linen-blend blazer with single-breasted horn buttons and tailored notched lapels.', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=700&q=80', '["#d9cbb8", "#222222", "#4a5568"]', '["XS", "S", "M", "L"]', TRUE),
(2, 'Satin Slip Dress', 'dresses', 99.00, 'Silky cowl-neck midi slip dress tailored for effortless, understated evening elegance.', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=700&q=80', '["#111111", "#e3d2c1", "#bfa181"]', '["XS", "S", "M", "L"]', TRUE),
(3, 'Ribbed Knit Top', 'tops', 69.00, 'Premium stretch fine ribbed crew-neck tee in soft ivory with subtle ribbed texture.', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=700&q=80', '["#f3ece2", "#111111", "#a0aec0"]', '["S", "M", "L"]', TRUE),
(4, 'Wide Leg Trousers', 'bottoms', 89.00, 'High-rise pleated tailored trousers featuring a fluid drape and concealed closure.', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=700&q=80', '["#c8b7a6", "#2d3748"]', '["XS", "S", "M", "L"]', TRUE),
(5, 'Leather Shoulder Bag', 'bags', 159.00, 'Supple Italian full-grain leather curved shoulder bag adorned with custom gold-tone hardware.', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=700&q=80', '["#111111", "#8b5a2b"]', '["One Size"]', TRUE),
(6, 'Strappy Heeled Sandal', 'shoes', 119.00, 'Minimalist multi-strap square toe block heel crafted in buttery soft Italian nappa.', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=700&q=80', '["#111111", "#e2d4c0"]', '["36", "37", "38", "39", "40"]', TRUE);
