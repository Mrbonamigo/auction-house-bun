import { Database } from "bun:sqlite";

const db = new Database("auction.sqlite");

console.log("🔨 Building authentication tables...");

// 1. Users Table
db.run(`
  CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT NOT NULL UNIQUE,
    emailVerified INTEGER,
    image TEXT,
    createdAt INTEGER,
    updatedAt INTEGER
  )
`);

// 2. Session Table (to track logged-in users)
db.run(`
  CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    expiresAt INTEGER,
    token TEXT NOT NULL UNIQUE,
    createdAt INTEGER,
    updatedAt INTEGER,
    ipAddress TEXT,
    userAgent TEXT,
    userId TEXT NOT NULL REFERENCES user(id)
  )
`);

// 3. Account Table (for Google, Facebook, etc.)
db.run(`
  CREATE TABLE IF NOT EXISTS account (
    id TEXT PRIMARY KEY,
    accountId TEXT NOT NULL,
    providerId TEXT NOT NULL,
    userId TEXT NOT NULL REFERENCES user(id),
    accessToken TEXT,
    refreshToken TEXT,
    idToken TEXT,
    accessTokenExpiresAt INTEGER,
    refreshTokenExpiresAt INTEGER,
    scope TEXT,
    password TEXT,
    createdAt INTEGER,
    updatedAt INTEGER
  )
`);

// 4. Verification Table (for email confirmations, etc.)
db.run(`
  CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt INTEGER,
    createdAt INTEGER,
    updatedAt INTEGER
  )
`);

// ... (keep the user, session, account, and verification tables above) ...

// 5. Product Table (The Auction Items) 🔨
db.run(`
  CREATE TABLE IF NOT EXISTS product (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL REFERENCES user(id),
    title TEXT NOT NULL,
    description TEXT,
    startPrice REAL NOT NULL,
    imageUrl TEXT,
    endsAt INTEGER NOT NULL,
    createdAt INTEGER
  )
`);

// 6. Bid Table (To track who is winning) 💰
// (Let's prepare this now for future use)
db.run(`
  CREATE TABLE IF NOT EXISTS bid (
    id TEXT PRIMARY KEY,
    productId TEXT NOT NULL REFERENCES product(id),
    userId TEXT NOT NULL REFERENCES user(id),
    amount REAL NOT NULL,
    createdAt INTEGER
  )
`);


console.log("✅ All set! Tables created successfully.");