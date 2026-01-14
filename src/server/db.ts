import { Database } from "bun:sqlite";

const db = new Database("auction.sqlite");

// 1. Create Products Table
db.run(`
  CREATE TABLE IF NOT EXISTS products (
                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        name TEXT NOT NULL,
                                        description TEXT,
                                        starting_price REAL NOT NULL,
                                        image_url TEXT,
                                        ends_at DATETIME NOT NULL,
                                        seller_id INTEGER NOT NULL
  );
`);

// 2. Create Users Table
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT DEFAULT 'USER',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// 3. Create Bids Table
db.run(`
  CREATE TABLE IF NOT EXISTS bids (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );
`);

console.log("Database updated! Tables: products, users, and bids are ready.");