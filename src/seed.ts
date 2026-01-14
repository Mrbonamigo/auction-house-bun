import { Database } from "bun:sqlite";

const db = new Database("auction.sqlite");

console.log("🌱 Seeding database with a rich collection of items...");

// 1. Create a Demo User (The Seller)
const sellerId = crypto.randomUUID();

try {
    db.run(`
        INSERT OR IGNORE INTO user (id, name, email, emailVerified, createdAt)
        VALUES (?, ?, ?, ?, ?)
    `, [sellerId, "Auction House", "admin@auction.com", 1, Date.now()]);
    console.log(`✅ Demo Seller context ready: ${sellerId}`);
} catch (e) {
    console.log("ℹ️  Using existing seller context.");
}

// 2. Clear existing products
db.run("DELETE FROM product");

// 3. Define the Luxury Items Collection 💎
const products = [
    {
        title: "Vintage Rolex Submariner (1972)",
        description: "A pristine condition diver's watch with original bezel and patina markers.",
        startPrice: 12500.00,
        imageUrl: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=800&q=80",
        endsAt: Date.now() + (1000 * 60 * 60 * 48)
    },
    {
        title: "1967 Shelby Cobra (Replica)",
        description: "Classic blue with white stripes. V8 engine, fully restored interior.",
        startPrice: 45000.00,
        imageUrl: "https://images.unsplash.com/photo-1566008885218-90abf9200ddb?auto=format&fit=crop&w=800&q=80",
        endsAt: Date.now() + (1000 * 60 * 60 * 24 * 7)
    },
    {
        title: "Neon Cyberpunk Art Print #04",
        description: "Limited edition digital canvas print. Signed by the artist. 1 of 50.",
        startPrice: 450.00,
        imageUrl: "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=800&q=80",
        endsAt: Date.now() + (1000 * 60 * 60 * 5)
    },
    {
        title: "Hermès Birkin Bag - Black",
        description: "Authentic leather handbag. Mint condition with original packaging.",
        startPrice: 9500.00,
        imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
        endsAt: Date.now() + (1000 * 60 * 60 * 24 * 3)
    },
    {
        title: "Gibson Les Paul Custom (1985)",
        description: "Vintage electric guitar in Alpine White. Gold hardware, original pickups.",
        startPrice: 3200.00,
        // ✅ Mantido a imagem corrigida da Gibson
        imageUrl: "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?auto=format&fit=crop&w=800&q=80",
        endsAt: Date.now() + (1000 * 60 * 60 * 12)
    },
    {
        title: "Air Jordan 1 Retro High OG",
        description: "Chicago colorway. Never worn, box included. Size 10 US.",
        startPrice: 1800.00,
        imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
        endsAt: Date.now() + (1000 * 60 * 60 * 24)
    },
    {
        title: "Leica M6 Rangefinder Camera",
        description: "35mm film camera body. Classic German engineering. Fully functional.",
        startPrice: 2800.00,
        imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
        endsAt: Date.now() + (1000 * 60 * 60 * 72)
    },
    {
        title: "Eames Lounge Chair & Ottoman",
        description: "Original mid-century modern design. Rosewood and black leather.",
        startPrice: 5500.00,
        imageUrl: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80",
        endsAt: Date.now() + (1000 * 60 * 60 * 24 * 5)
    },
    {

        title: "Nintendo Game Boy (1989)",
        description: "Original grey brick console. Mint condition, still in box. Tetris included.",
        startPrice: 450.00,
        imageUrl: "https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?auto=format&fit=crop&w=800&q=80",
        endsAt: Date.now() + (1000 * 60 * 60 * 24 * 10)
    },
    {
        title: "Diamond Solitaire Ring (1.5ct)",
        description: "Brilliant cut diamond set in 18k white gold. GIA certified.",
        startPrice: 8900.00,
        imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
        endsAt: Date.now() + (1000 * 60 * 60 * 6)
    }
];

const insertProduct = db.prepare(`
    INSERT INTO product (id, userId, title, description, startPrice, imageUrl, endsAt, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

db.transaction(() => {
    for (const item of products) {
        const productId = crypto.randomUUID();
        insertProduct.run(
            productId,
            sellerId,
            item.title,
            item.description,
            item.startPrice,
            item.imageUrl,
            item.endsAt,
            Date.now()
        );
        console.log(`✨ Added item: ${item.title}`);
    }
})();

console.log(`✅ Successfully seeded ${products.length} luxury items!`);