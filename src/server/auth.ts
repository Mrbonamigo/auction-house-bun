import { betterAuth } from "better-auth";
import { Database } from "bun:sqlite";

export const auth = betterAuth({
    // Connect to our SQLite database
    database: new Database("auction.sqlite"),

    // Read the secret key from the .env file
    secret: process.env.BETTER_AUTH_SECRET,

    // Define the base URL so Better Auth knows where it lives 🏠
    baseURL: process.env.BETTER_AUTH_URL,

    // Enable email/password login
    emailAndPassword: {
        enabled: true
    },

    // Configure Social Login (Google & Facebook)
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
        facebook: {
            clientId: process.env.FACEBOOK_CLIENT_ID as string,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
        }
    }
});