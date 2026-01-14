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

        // A. STATIC FILES & UPLOADS
        if (url.pathname === "/styles.css") return new Response(Bun.file("./public/styles.css"), { headers: { "Content-Type": "text/css" } });
        if (url.pathname === "/main.js") return new Response(Bun.file("./public/main.js"), { headers: { "Content-Type": "text/javascript" } });

        // Serve Uploaded Images
        if (url.pathname.startsWith("/uploads/")) {
            const filePath = `./public${url.pathname}`;
            const file = Bun.file(filePath);
            if (await file.exists()) return new Response(file);
            return new Response("Image not found", { status: 404 });
        }

        // B. AUTH ROUTES
        if (url.pathname.startsWith("/api/auth")) return auth.handler(req);

        // C. WALLET API
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

        // D. PRODUCT & DASHBOARD API
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

        if (url.pathname === "/api/products" && req.method === "GET") {
            try {
                const q = url.searchParams.get("q") || "";
                const sort = url.searchParams.get("sort") || "ending_soon";
                let sql = "SELECT * FROM product";
                const params: any[] = [];
                if (q) {
                    sql += " WHERE (title LIKE ? OR description LIKE ?)";
                    params.push(`%${q}%`, `%${q}%`);
                }
                switch (sort) {
                    case "price_asc": sql += " ORDER BY startPrice ASC"; break;
                    case "price_desc": sql += " ORDER BY startPrice DESC"; break;
                    case "newest": sql += " ORDER BY createdAt DESC"; break;
                    case "ending_soon": default: sql += " ORDER BY endsAt ASC"; break;
                }
                const products = db.prepare(sql).all(...params);
                return Response.json(products);
            } catch (error) { return new Response("Error fetching products", { status: 500 }); }
        }

        // Create Product (Multipart Upload)
        if (url.pathname === "/api/products" && req.method === "POST") {
            const session = await auth.api.getSession({ headers: req.headers });
            if (!session) return new Response("Unauthorized", { status: 401 });
            try {
                const formData = await req.formData();
                const title = formData.get("title") as string;
                const description = formData.get("description") as string;
                const startPrice = parseFloat(formData.get("startPrice") as string);
                const durationDays = parseInt(formData.get("durationDays") as string);
                const imageFile = formData.get("image") as File;

                if (!title || !startPrice || !durationDays || !imageFile) return new Response("Missing required fields", { status: 400 });

                const fileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, '-')}`;
                const uploadDir = "./public/uploads";
                await Bun.write(`${uploadDir}/${fileName}`, imageFile);
                const imageUrl = `/uploads/${fileName}`;

                const endsAt = Date.now() + (durationDays * 24 * 60 * 60 * 1000);
                const productId = crypto.randomUUID();
                db.prepare("INSERT INTO product (id, userId, title, description, startPrice, imageUrl, endsAt, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
                    productId, session.user.id, title, description || "", startPrice, imageUrl, endsAt, Date.now()
                );
                return Response.json({ success: true, id: productId });
            } catch (error) { return new Response("Failed to create auction", { status: 500 }); }
        }

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

        // E. TRANSACTIONAL BIDDING API
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
            } catch (error: any) { return new Response(error.message || "Transaction failed", { status: 400 }); }
        }

        // ---------------------------------------------------------
        // F. ADMIN API 👮‍♂️ (NEW)
        // ---------------------------------------------------------
        if (url.pathname.startsWith("/api/admin")) {
            const session = await auth.api.getSession({ headers: req.headers });
            if (!session) return new Response("Unauthorized", { status: 401 });

            // 1. Verify Role
            const user = db.prepare("SELECT role FROM user WHERE id = ?").get(session.user.id) as any;
            if (user?.role !== "admin") {
                return new Response("Forbidden: Admins only", { status: 403 });
            }

            // Route: Get System Stats
            if (url.pathname === "/api/admin/stats" && req.method === "GET") {
                const totalUsers = db.prepare("SELECT COUNT(*) as count FROM user").get() as any;
                const totalProducts = db.prepare("SELECT COUNT(*) as count FROM product").get() as any;
                const totalMoney = db.prepare("SELECT SUM(balance) as total FROM user").get() as any;
                const totalBids = db.prepare("SELECT COUNT(*) as count FROM bid").get() as any;

                return Response.json({
                    users: totalUsers.count,
                    products: totalProducts.count,
                    money: totalMoney.total || 0,
                    bids: totalBids.count
                });
            }

            // Route: List All Users
            if (url.pathname === "/api/admin/users" && req.method === "GET") {
                const users = db.prepare("SELECT id, name, email, role, balance, createdAt FROM user ORDER BY createdAt DESC").all();
                return Response.json(users);
            }
        }

        // Catch-All
        return new Response(Bun.file("./public/index.html"), { headers: { "Content-Type": "text/html" } });
    },
});
console.log(`🚀 Server running at http://localhost:${server.port}`);