import { Database } from "bun:sqlite";

const db = new Database("auction.sqlite");


const targetEmail = "abc@abc.com";

console.log(`🔍 Looking for user: ${targetEmail}...`);

const result = db.run("UPDATE user SET role = 'admin' WHERE email = ?", [targetEmail]);

if (result.changes > 0) {
    console.log(`✅ SUCCESS! User '${targetEmail}' is now an ADMIN.`);
    console.log("👉 Go to http://localhost:3000/admin");
} else {
    console.log(`❌ ERROR: User not found.`);
    console.log("⚠️  Make sure you have Signed Up with this email first!");
}