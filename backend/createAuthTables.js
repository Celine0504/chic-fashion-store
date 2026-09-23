import mysql from 'mysql2/promise';

async function createTables() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'kuttyma@2004',
    database: 'chic_fashion_db'
  });

  await conn.query(`
    CREATE TABLE IF NOT EXISTS User (
      id VARCHAR(191) PRIMARY KEY,
      name VARCHAR(191),
      email VARCHAR(191) UNIQUE,
      emailVerified DATETIME(3),
      image VARCHAR(191),
      password VARCHAR(255),
      createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
      updatedAt DATETIME(3) ON UPDATE CURRENT_TIMESTAMP(3)
    );
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS Account (
      id VARCHAR(191) PRIMARY KEY,
      userId VARCHAR(191) NOT NULL,
      type VARCHAR(191) NOT NULL,
      provider VARCHAR(191) NOT NULL,
      providerAccountId VARCHAR(191) NOT NULL,
      refresh_token TEXT,
      access_token TEXT,
      expires_at INT,
      token_type VARCHAR(191),
      scope VARCHAR(191),
      id_token TEXT,
      session_state VARCHAR(191),
      FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
      UNIQUE KEY provider_providerAccountId_unique (provider, providerAccountId)
    );
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS Session (
      id VARCHAR(191) PRIMARY KEY,
      sessionToken VARCHAR(191) UNIQUE NOT NULL,
      userId VARCHAR(191) NOT NULL,
      expires DATETIME(3) NOT NULL,
      FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
    );
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS VerificationToken (
      identifier VARCHAR(191) NOT NULL,
      token VARCHAR(191) UNIQUE NOT NULL,
      expires DATETIME(3) NOT NULL,
      UNIQUE KEY identifier_token_unique (identifier, token)
    );
  `);

  console.log('SUCCESS: All Auth.js tables created in MySQL!');
  await conn.end();
}

createTables().catch(console.error);
