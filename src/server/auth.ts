import { betterAuth } from "better-auth";
import { Database } from "bun:sqlite";

const db = new Database("auction.sqlite");

export const auth = betterAuth({
    database: new Database("auction.sqlite"),

    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
});