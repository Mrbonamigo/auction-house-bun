import { auth } from "./auth";
import { Database } from "bun:sqlite";

const db = new Database("auction.sqlite");

// 1. Build Frontend 🏗️
console.log("🛠️  Compiling Frontend...");
await Bun.build({
    entrypoints: ["./src/client/main.tsx"],
    outdir: "./public",
});

const server = Bun.serve({
    port: 3000,
    async fetch(req) {
        const url = new URL(req.url);

        // Debug Log
        console.log(`${req.method} ${url.pathname}`);

        // A. Static Files
        if (url.pathname === "/styles.css") return new Response(Bun.file("./public/styles.css"), { headers: { "Content-Type": "text/css" } });
        if (url.pathname === "/main.js") return new Response(Bun.file("./public/main.js"), { headers: { "Content-Type": "text/javascript" } });

        // B. Auth Routes
        if (url.pathname.startsWith("/api/auth")) return auth.handler(req);

        // C. Wallet API
        if (url.pathname === "/api/me/balance" && req.method === "GET") {
            const session = await auth.api.getSession({ headers: req.headers });
            if (!session) return new Response("Unauthorized", { status: 401 });
            const user = db.prepare("SELECT balance FROM user WHERE id = ?").get(session.user.id) as any;
            return Response.json({ balance: user?.balance || 0 });
        }
        if (url.pathname === "/api/me/deposit" && req.method === "POST") {
            const session = await auth.api.getSession({ headers: req.headers });
            if (!session) return new Response("Unauthorized", { status: 401 });
            try {
                const { amount } = await req.json();
                if (!amount || amount <= 0) return new Response("Invalid amount", { status: 400 });
                db.prepare("UPDATE user SET balance = balance + ? WHERE id = ?").run(amount, session.user.id);
                return Response.json({ success: true, message: `Deposited $${amount}` });
            } catch (error) { return new Response("Failed to deposit", { status: 500 }); }
        }

        // D. Product & Dashboard API

        // My Bids
        if (url.pathname === "/api/me/bids" && req.method === "GET") {
            const session = await auth.api.getSession({ headers: req.headers });
            if (!session) return new Response("Unauthorized", { status: 401 });
            try {
                const myBids = db.prepare(`
                    SELECT bid.amount as myAmount, bid.createdAt as bidDate, product.id as productId, product.title, product.imageUrl, product.endsAt, product.startPrice
                    FROM bid JOIN product ON bid.productId = product.id
                    WHERE bid.userId = ? ORDER BY bid.createdAt DESC
                `).all(session.user.id) as any[];
                const enrichedBids = myBids.map(bid => {
                    const highestBidObj = db.prepare("SELECT MAX(amount) as maxAmount FROM bid WHERE productId = ?").get(bid.productId) as any;
                    const highestAmount = highestBidObj?.maxAmount || bid.startPrice;
                    return { ...bid, highestAmount, status: bid.myAmount >= highestAmount ? "WINNING" : "OUTBID" };
                });
                return Response.json(enrichedBids);
            } catch (error) { return new Response("Server error", { status: 500 }); }
        }

        // 👇 UPDATED: LIST PRODUCTS (With Search & Sort) 🔍
        if (url.pathname === "/api/products" && req.method === "GET") {
            try {
                // 1. Extract Query Params
                const q = url.searchParams.get("q") || "";
                const sort = url.searchParams.get("sort") || "ending_soon";

                // 2. Build SQL Dynamically
                let sql = "SELECT * FROM product";
                const params: any[] = [];

                // Search Filter
                if (q) {
                    sql += " WHERE (title LIKE ? OR description LIKE ?)";
                    params.push(`%${q}%`, `%${q}%`);
                }

                // Sorting Logic
                switch (sort) {
                    case "price_asc":
                        sql += " ORDER BY startPrice ASC";
                        break;
                    case "price_desc":
                        sql += " ORDER BY startPrice DESC";
                        break;
                    case "newest":
                        sql += " ORDER BY createdAt DESC";
                        break;
                    case "ending_soon":
                    default:
                        sql += " ORDER BY endsAt ASC";
                        break;
                }

                const products = db.prepare(sql).all(...params);
                return Response.json(products);

            } catch (error) {
                console.error(error);
                return new Response("Error fetching products", { status: 500 });
            }
        }

        // Create Product
        if (url.pathname === "/api/products" && req.method === "POST") {
            const session = await auth.api.getSession({ headers: req.headers });
            if (!session) return new Response("Unauthorized", { status: 401 });
            try {
                const { title, description, startPrice, imageUrl, durationDays } = await req.json();
                if (!title || !startPrice || !imageUrl) return new Response("Missing fields", { status: 400 });
                const endsAt = Date.now() + (durationDays * 24 * 60 * 60 * 1000);
                const productId = crypto.randomUUID();
                db.prepare("INSERT INTO product (id, userId, title, description, startPrice, imageUrl, endsAt, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
                    productId, session.user.id, title, description || "", startPrice, imageUrl, endsAt, Date.now()
                );
                return Response.json({ success: true, id: productId });
            } catch (error) { return new Response("Error", { status: 500 }); }
        }

        // Get Single Product
        const idMatch = url.pathname.match(/^\/api\/products\/([\w-]+)$/);
        if (idMatch && req.method === "GET") {
            const productId = idMatch[1];
            const product = db.prepare("SELECT * FROM product WHERE id = ?").get(productId) as any;
            if (product) {
                const highestBid = db.prepare("SELECT MAX(amount) as maxAmount FROM bid WHERE productId = ?").get(productId) as any;
                product.currentPrice = highestBid?.maxAmount || product.startPrice;
                return Response.json(product);
            }
            return new Response("Not found", { status: 404 });
        }

        // E. Transactional Bidding API
        if (url.pathname === "/api/bids" && req.method === "POST") {
            const session = await auth.api.getSession({ headers: req.headers });
            if (!session) return new Response("Unauthorized", { status: 401 });

            try {
                const { productId, amount } = await req.json();
                const result = db.transaction(() => {
                    const product = db.prepare("SELECT * FROM product WHERE id = ?").get(productId) as any;
                    if (!product) throw new Error("Product not found");
                    if (Date.now() > product.endsAt) throw new Error("Auction has ended");

                    const highestBid = db.prepare("SELECT * FROM bid WHERE productId = ? ORDER BY amount DESC LIMIT 1").get(productId) as any;
                    const currentPrice = highestBid?.amount || product.startPrice;
                    if (amount <= currentPrice) throw new Error(`Bid must be higher than $${currentPrice}`);

                    const user = db.prepare("SELECT balance FROM user WHERE id = ?").get(session.user.id) as any;
                    if (user.balance < amount) throw new Error(`Insufficient funds. Balance: $${user.balance}`);

                    if (highestBid) {
                        db.prepare("UPDATE user SET balance = balance + ? WHERE id = ?").run(highestBid.amount, highestBid.userId);
                    }
                    db.prepare("UPDATE user SET balance = balance - ? WHERE id = ?").run(amount, session.user.id);
                    db.prepare("INSERT INTO bid (id, productId, userId, amount, createdAt) VALUES (?, ?, ?, ?, ?)").run(
                        crypto.randomUUID(), productId, session.user.id, amount, Date.now()
                    );
                    return { success: true, newPrice: amount };
                })();
                return Response.json(result);
            } catch (error: any) {
                return new Response(error.message || "Transaction failed", { status: 400 });
            }
        }

        return new Response(Bun.file("./public/index.html"), { headers: { "Content-Type": "text/html" } });
    },
});
console.log(`🚀 Server running at http://localhost:${server.port}`);