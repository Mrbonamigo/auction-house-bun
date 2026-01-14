import { auth } from "./auth";
import { Database } from "bun:sqlite";

const db = new Database("auction.sqlite");

// 1. Build the React Frontend 🏗️
// Runs once on server start to compile TSX to JS.
console.log("🛠️  Compiling Frontend...");
await Bun.build({
    entrypoints: ["./src/client/main.tsx"],
    outdir: "./public",
});

const server = Bun.serve({
    port: 3000,
    async fetch(req) {
        const url = new URL(req.url);

        // Debug: Log every request
        console.log(`${req.method} ${url.pathname}`);

        // ---------------------------------------------------------
        // A. STATIC FILES (CSS & JS) 🎨
        // ---------------------------------------------------------
        if (url.pathname === "/styles.css") {
            return new Response(Bun.file("./public/styles.css"), { headers: { "Content-Type": "text/css" } });
        }
        if (url.pathname === "/main.js") {
            return new Response(Bun.file("./public/main.js"), { headers: { "Content-Type": "text/javascript" } });
        }

        // ---------------------------------------------------------
        // B. AUTHENTICATION API 🛡️
        // ---------------------------------------------------------
        if (url.pathname.startsWith("/api/auth")) {
            return auth.handler(req);
        }

        // ---------------------------------------------------------
        // C. USER DASHBOARD API (MY BIDS) 👤
        // ---------------------------------------------------------
        if (url.pathname === "/api/me/bids" && req.method === "GET") {
            const session = await auth.api.getSession({ headers: req.headers });
            if (!session) return new Response("Unauthorized", { status: 401 });

            try {
                // Get all bids made by this user
                const myBids = db.prepare(`
                    SELECT
                        bid.amount as myAmount,
                        bid.createdAt as bidDate,
                        product.id as productId,
                        product.title,
                        product.imageUrl,
                        product.endsAt,
                        product.startPrice
                    FROM bid
                             JOIN product ON bid.productId = product.id
                    WHERE bid.userId = ?
                    ORDER BY bid.createdAt DESC
                `).all(session.user.id) as any[];

                // Calculate status (WINNING vs OUTBID)
                const enrichedBids = myBids.map(bid => {
                    const highestBidObj = db.prepare("SELECT MAX(amount) as maxAmount FROM bid WHERE productId = ?").get(bid.productId) as any;
                    const highestAmount = highestBidObj?.maxAmount || bid.startPrice;

                    return {
                        ...bid,
                        highestAmount,
                        status: bid.myAmount >= highestAmount ? "WINNING" : "OUTBID"
                    };
                });

                return Response.json(enrichedBids);
            } catch (error) {
                console.error(error);
                return new Response("Server error", { status: 500 });
            }
        }

        // ---------------------------------------------------------
        // D. PRODUCT API 💎
        // ---------------------------------------------------------

        // 1. LIST ALL PRODUCTS
        if (url.pathname === "/api/products" && req.method === "GET") {
            try {
                const products = db.prepare("SELECT * FROM product ORDER BY endsAt ASC").all();
                return Response.json(products);
            } catch (error) {
                return new Response("Error fetching products", { status: 500 });
            }
        }

        // 2. CREATE NEW AUCTION (SELL ITEM) 🔨 (NEW!)
        if (url.pathname === "/api/products" && req.method === "POST") {
            const session = await auth.api.getSession({ headers: req.headers });
            if (!session) return new Response("Unauthorized", { status: 401 });

            try {
                const body = await req.json();
                const { title, description, startPrice, imageUrl, durationDays } = body;

                // Validate
                if (!title || !startPrice || !imageUrl || !durationDays) {
                    return new Response("Missing required fields", { status: 400 });
                }

                // Logic: Calculate End Date
                const endsAt = Date.now() + (durationDays * 24 * 60 * 60 * 1000);
                const productId = crypto.randomUUID();

                // Insert into DB
                const insert = db.prepare(`
                    INSERT INTO product (id, userId, title, description, startPrice, imageUrl, endsAt, createdAt)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `);

                insert.run(
                    productId,
                    session.user.id,
                    title,
                    description || "",
                    startPrice,
                    imageUrl,
                    endsAt,
                    Date.now()
                );

                return Response.json({ success: true, id: productId });

            } catch (error) {
                console.error(error);
                return new Response("Failed to create auction", { status: 500 });
            }
        }

        // 3. GET SINGLE PRODUCT (With Dynamic Price) 📈
        const idMatch = url.pathname.match(/^\/api\/products\/([\w-]+)$/);
        if (idMatch && req.method === "GET") {
            const productId = idMatch[1];
            try {
                const product = db.prepare("SELECT * FROM product WHERE id = ?").get(productId) as any;

                if (product) {
                    const highestBid = db.prepare("SELECT MAX(amount) as maxAmount FROM bid WHERE productId = ?").get(productId) as any;
                    product.currentPrice = highestBid?.maxAmount || product.startPrice;
                    return Response.json(product);
                } else {
                    return new Response("Product not found", { status: 404 });
                }
            } catch (error) {
                return new Response("Database error", { status: 500 });
            }
        }

        // ---------------------------------------------------------
        // E. BIDDING API 💰
        // ---------------------------------------------------------
        if (url.pathname === "/api/bids" && req.method === "POST") {
            const session = await auth.api.getSession({ headers: req.headers });
            if (!session) return new Response("Unauthorized", { status: 401 });

            try {
                const body = await req.json();
                const { productId, amount } = body;

                if (!productId || !amount) return new Response("Missing data", { status: 400 });

                const product = db.prepare("SELECT * FROM product WHERE id = ?").get(productId) as any;
                if (!product) return new Response("Product not found", { status: 404 });

                if (Date.now() > product.endsAt) {
                    return new Response("Auction has ended", { status: 400 });
                }

                const highestBid = db.prepare("SELECT MAX(amount) as maxAmount FROM bid WHERE productId = ?").get(productId) as any;
                const currentPrice = highestBid?.maxAmount || product.startPrice;

                if (amount <= currentPrice) {
                    return new Response(`Bid must be higher than $${currentPrice}`, { status: 400 });
                }

                db.prepare("INSERT INTO bid (id, productId, userId, amount, createdAt) VALUES (?, ?, ?, ?, ?)").run(
                    crypto.randomUUID(), productId, session.user.id, amount, Date.now()
                );

                return Response.json({ success: true, newPrice: amount });
            } catch (error) {
                console.error(error);
                return new Response("Failed to place bid", { status: 500 });
            }
        }

        // ---------------------------------------------------------
        // F. SPA CATCH-ALL 🚪
        // ---------------------------------------------------------
        return new Response(Bun.file("./public/index.html"), {
            headers: { "Content-Type": "text/html" },
        });
    },
});

console.log(`🚀 Server running at http://localhost:${server.port}`);