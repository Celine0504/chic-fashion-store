-- ==========================================================
-- CHIC FASHION STORE - FULL DATABASE INITIALIZATION SCRIPT
-- MySQL Workbench Compatible
-- ==========================================================

-- 1. Create Database if it does not exist
CREATE DATABASE IF NOT EXISTS chic_fashion_db;
USE chic_fashion_db;

-- 2. Drop existing tables if needed (disabled by default)
-- SET FOREIGN_KEY_CHECKS = 0;
-- DROP TABLE IF EXISTS order_items, orders, verificationtoken, session, account, user, products, categories;
-- SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------
-- Table: user (Client & Admin Authentication)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `email` varchar(191) DEFAULT NULL,
  `emailVerified` datetime(3) DEFAULT NULL,
  `phoneNumber` varchar(30) DEFAULT NULL,
  `phoneVerified` datetime DEFAULT NULL,
  `image` varchar(191) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `createdAt` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(3),
  `cart` longtext,
  `wishlist` longtext,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phoneNumber` (`phoneNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------
-- Table: account (Google OAuth & NextAuth Accounts)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `account` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `provider` varchar(191) NOT NULL,
  `providerAccountId` varchar(191) NOT NULL,
  `refresh_token` text,
  `access_token` text,
  `expires_at` int DEFAULT NULL,
  `token_type` varchar(191) DEFAULT NULL,
  `scope` varchar(191) DEFAULT NULL,
  `id_token` text,
  `session_state` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `provider_providerAccountId_unique` (`provider`,`providerAccountId`),
  KEY `userId` (`userId`),
  CONSTRAINT `account_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------
-- Table: session (User Sessions)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `session` (
  `id` varchar(191) NOT NULL,
  `sessionToken` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `expires` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sessionToken` (`sessionToken`),
  KEY `userId` (`userId`),
  CONSTRAINT `session_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------
-- Table: verificationtoken (6-Digit OTP Verification)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `verificationtoken` (
  `identifier` varchar(191) NOT NULL,
  `token` varchar(191) NOT NULL,
  `expires` datetime(3) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `token` (`token`),
  UNIQUE KEY `identifier_token_unique` (`identifier`,`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------
-- Table: categories (Store Categories)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `image_url` text NOT NULL,
  `badge` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------
-- Table: products (Luxury Catalog Items)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `category_slug` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `original_price` decimal(10,2) DEFAULT NULL,
  `description` text,
  `image_url` text NOT NULL,
  `colors` json DEFAULT NULL,
  `sizes` json DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------
-- Table: orders (Checkout Orders)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(255) NOT NULL,
  `customer_phone` varchar(50) NOT NULL,
  `shipping_address` text NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `payment_status` varchar(50) DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------
-- Table: order_items (Items inside an Order)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_title` varchar(255) NOT NULL,
  `size` varchar(20) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- ----------------------------------------------------------
-- SEED DATA: CATEGORIES
-- ----------------------------------------------------------
INSERT INTO `categories` (`id`, `name`, `slug`, `image_url`, `badge`) VALUES (1, 'NEW IN', 'new-in', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80', 'NEW') ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);
INSERT INTO `categories` (`id`, `name`, `slug`, `image_url`, `badge`) VALUES (2, 'CLOTHING', 'clothing', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80', NULL) ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);
INSERT INTO `categories` (`id`, `name`, `slug`, `image_url`, `badge`) VALUES (3, 'DRESSES', 'dresses', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80', NULL) ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);
INSERT INTO `categories` (`id`, `name`, `slug`, `image_url`, `badge`) VALUES (4, 'TOPS', 'tops', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&q=80', NULL) ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);
INSERT INTO `categories` (`id`, `name`, `slug`, `image_url`, `badge`) VALUES (5, 'BOTTOMS', 'bottoms', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80', NULL) ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);
INSERT INTO `categories` (`id`, `name`, `slug`, `image_url`, `badge`) VALUES (6, 'BAGS', 'bags', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80', NULL) ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);
INSERT INTO `categories` (`id`, `name`, `slug`, `image_url`, `badge`) VALUES (7, 'SHOES', 'shoes', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80', NULL) ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);
INSERT INTO `categories` (`id`, `name`, `slug`, `image_url`, `badge`) VALUES (8, 'ACCESSORIES', 'accessories', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80', NULL) ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- ----------------------------------------------------------
-- SEED DATA: 12 LUXURY PRODUCTS
-- ----------------------------------------------------------
INSERT INTO `products` (`id`, `title`, `category_slug`, `price`, `original_price`, `description`, `image_url`, `colors`, `sizes`, `is_featured`) VALUES (1, 'Linen Blend Blazer', 'clothing', 2999, NULL, 'Structured linen-blend blazer with single-breasted horn buttons and tailored notched lapels.', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=700&q=80', '["#d9cbb8","#222222","#4a5568"]', '["XS","S","M","L"]', 1) ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);
INSERT INTO `products` (`id`, `title`, `category_slug`, `price`, `original_price`, `description`, `image_url`, `colors`, `sizes`, `is_featured`) VALUES (2, 'Satin Slip Dress', 'dresses', 2499, NULL, 'Silky cowl-neck midi slip dress tailored for effortless, understated evening elegance.', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=700&q=80', '["#111111","#e3d2c1","#bfa181"]', '["XS","S","M","L"]', 1) ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);
INSERT INTO `products` (`id`, `title`, `category_slug`, `price`, `original_price`, `description`, `image_url`, `colors`, `sizes`, `is_featured`) VALUES (3, 'Ribbed Knit Top', 'tops', 1299, NULL, 'Premium stretch fine ribbed crew-neck tee in soft ivory with subtle ribbed texture.', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=700&q=80', '["#f3ece2","#111111","#a0aec0"]', '["S","M","L"]', 1) ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);
INSERT INTO `products` (`id`, `title`, `category_slug`, `price`, `original_price`, `description`, `image_url`, `colors`, `sizes`, `is_featured`) VALUES (4, 'Wide Leg Trousers', 'bottoms', 1999, NULL, 'High-rise pleated tailored trousers featuring a fluid drape and concealed closure.', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=700&q=80', '["#c8b7a6","#2d3748"]', '["XS","S","M","L"]', 1) ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);
INSERT INTO `products` (`id`, `title`, `category_slug`, `price`, `original_price`, `description`, `image_url`, `colors`, `sizes`, `is_featured`) VALUES (5, 'Leather Shoulder Bag', 'bags', 3499, NULL, 'Supple Italian full-grain leather curved shoulder bag adorned with custom gold-tone hardware.', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=700&q=80', '["#111111","#8b5a2b"]', '["One Size"]', 1) ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);
INSERT INTO `products` (`id`, `title`, `category_slug`, `price`, `original_price`, `description`, `image_url`, `colors`, `sizes`, `is_featured`) VALUES (6, 'Strappy Heeled Sandal', 'shoes', 2199, NULL, 'Minimalist multi-strap square toe block heel crafted in buttery soft Italian nappa.', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=700&q=80', '["#111111","#e2d4c0"]', '["36","37","38","39","40"]', 1) ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);
INSERT INTO `products` (`id`, `title`, `category_slug`, `price`, `original_price`, `description`, `image_url`, `colors`, `sizes`, `is_featured`) VALUES (7, 'Sculptural Gold Hoop Earrings', 'accessories', 1499, NULL, '18k gold vermeil chunky teardrop sculptural hoop earrings with secure click closure.', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=700&q=80', '["#d4af37","#e5e4e2"]', '["One Size"]', 1) ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);
INSERT INTO `products` (`id`, `title`, `category_slug`, `price`, `original_price`, `description`, `image_url`, `colors`, `sizes`, `is_featured`) VALUES (8, 'Silk Twill Printed Scarf', 'accessories', 1899, NULL, '100% pure Mulberry silk twill square scarf featuring geometric hand-rolled hem.', 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=700&q=80', '["#2b3a4a","#8b5a2b"]', '["90x90 cm"]', 0) ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);
INSERT INTO `products` (`id`, `title`, `category_slug`, `price`, `original_price`, `description`, `image_url`, `colors`, `sizes`, `is_featured`) VALUES (9, 'Pleated Halter Maxi Dress', 'dresses', 3799, NULL, 'Floor-skimming micro-pleated halter neckline evening gown with a flowing silhouette.', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=700&q=80', '["#c5a059","#111111","#800020"]', '["XS","S","M","L"]', 1) ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);
INSERT INTO `products` (`id`, `title`, `category_slug`, `price`, `original_price`, `description`, `image_url`, `colors`, `sizes`, `is_featured`) VALUES (10, 'Tailored Poplin Oversized Shirt', 'tops', 1899, NULL, 'Crisp organic cotton poplin button-down shirt with elongated cuffs and dropped shoulders.', 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=700&q=80', '["#ffffff","#87ceeb","#111111"]', '["XS","S","M","L","XL"]', 1) ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);
INSERT INTO `products` (`id`, `title`, `category_slug`, `price`, `original_price`, `description`, `image_url`, `colors`, `sizes`, `is_featured`) VALUES (11, 'Pleated Tailored Bermuda Shorts', 'bottoms', 1699, NULL, 'Sophisticated knee-length tailored shorts in structured stretch twill with front pleats.', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=700&q=80', '["#222222","#d9cbb8"]', '["XS","S","M","L"]', 0) ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);
INSERT INTO `products` (`id`, `title`, `category_slug`, `price`, `original_price`, `description`, `image_url`, `colors`, `sizes`, `is_featured`) VALUES (12, 'Woven Leather Bucket Bag', 'bags', 3999, NULL, 'Artisanal hand-woven calfskin leather bucket bag with removable canvas drawstring pouch.', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=700&q=80', '["#8b5a2b","#111111","#e3d2c1"]', '["One Size"]', 1) ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);
