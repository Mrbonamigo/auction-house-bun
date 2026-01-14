import { Database } from "bun:sqlite";

const db = new Database("auction.sqlite");

console.log("🌱 Seeding database...");

// 1. Clean up products (optional if you just ran setup)
db.run("DELETE FROM product");

// 2. Create Dummy User for products
const userId = "seed-user-1";
db.run(`
    INSERT OR IGNORE INTO user (id, name, email, emailVerified, createdAt, updatedAt, role)
    VALUES (?, ?, ?, ?, ?, ?, ?)
`, [userId, "Alice Seller", "alice@example.com", true, Date.now(), Date.now(), "user"]);

// 3. Create Products
const products = [
    {
        title: "Vintage Rolex Submariner",
        description: "A classic diver's watch from 1985. Excellent condition with original box and papers.",
        startPrice: 12500,
        imageUrl: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=1000",
        duration: 2 // days
    },
    {
        title: "Cyberpunk Art Print (Signed)",
        description: "Limited edition print #42/50. Signed by the artist. Neon aesthetic.",
        startPrice: 300,
        imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000",
        duration: 0.2 // Ends soon (5 hours)
    },
    {
        title: "1967 Shelby Cobra Model",
        description: "Die-cast 1:18 scale model. Mint condition in box.",
        startPrice: 150,
        imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1000",
        duration: 7 // days
    }
];

products.forEach(p => {
    const id = crypto.randomUUID();
    const endsAt = Date.now() + (p.duration * 24 * 60 * 60 * 1000);

    db.run(`
        INSERT INTO product (id, userId, title, description, startPrice, imageUrl, endsAt, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, userId, p.title, p.description, p.startPrice, p.imageUrl, endsAt, Date.now()]);
});

// 4. Create a System Admin Placeholder
// Note: You still need to "Sign Up" or set password for this email to login,
// or manually promote your own user later.
const adminId = "admin-root";
db.run(`
    INSERT OR IGNORE INTO user (id, name, email, emailVerified, createdAt, updatedAt, balance, role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`, [adminId, "System Admin", "admin@auction.com", true, Date.now(), Date.now(), 1000000, "admin"]);

console.log("✅ Seed complete! 3 products and 1 admin user added.");