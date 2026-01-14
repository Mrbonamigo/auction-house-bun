import { createAuthClient } from "better-auth/react";

// Initialize the client to talk to our Bun server
export const authClient = createAuthClient({
    baseURL: "http://localhost:3000"
});