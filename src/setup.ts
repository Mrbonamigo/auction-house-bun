import { Database } from "bun:sqlite";

const db = new Database("auction.sqlite");

console.log("💣 Dropping existing tables to ensure a clean slate...");

// 1. DROP ALL TABLES (Reverse order to handle foreign key constraints)
db.run("DROP TABLE IF EXISTS bid");
db.run("DROP TABLE IF EXISTS product");
db.run("DROP TABLE IF EXISTS account");
db.run("DROP TABLE IF EXISTS session");
db.run("DROP TABLE IF EXISTS verification");
db.run("DROP TABLE IF EXISTS user");

console.log("🏗️  Rebuilding database schema...");

// 2. RECREATE TABLES

// User Table (Now includes 'role') 👤
db.run(`
    CREATE TABLE user (
                          id TEXT PRIMARY KEY,
                          name TEXT NOT NULL,
                          email TEXT NOT NULL UNIQUE,
                          emailVerified BOOLEAN NOT NULL,
                          image TEXT,
                          createdAt INTEGER NOT NULL,
                          updatedAt INTEGER,
                          balance REAL DEFAULT 0,
                          role TEXT DEFAULT 'user' -- 👈 NEW: 'user' or 'admin'
    )
`);

db.run(`
    CREATE TABLE session (
                             id TEXT PRIMARY KEY,
                             expiresAt INTEGER NOT NULL,
                             token TEXT NOT NULL UNIQUE,
                             createdAt INTEGER NOT NULL,
                             updatedAt INTEGER NOT NULL,
                             ipAddress TEXT,
                             userAgent TEXT,
                             userId TEXT NOT NULL REFERENCES user(id)
    )
`);

db.run(`
    CREATE TABLE account (
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
                             createdAt INTEGER NOT NULL,
                             updatedAt INTEGER NOT NULL
    )
`);

db.run(`
    CREATE TABLE verification (
                                  id TEXT PRIMARY KEY,
                                  identifier TEXT NOT NULL,
                                  value TEXT NOT NULL,
                                  expiresAt INTEGER NOT NULL,
                                  createdAt INTEGER,
                                  updatedAt INTEGER
    )
`);

db.run(`
    CREATE TABLE product (
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

db.run(`
    CREATE TABLE bid (
                         id TEXT PRIMARY KEY,
                         productId TEXT NOT NULL REFERENCES product(id),
                         userId TEXT NOT NULL REFERENCES user(id),
                         amount REAL NOT NULL,
                         createdAt INTEGER
    )
`);

console.log("✅ Database reset complete. The 'role' column is ready.");