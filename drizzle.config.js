import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './utils/schema.js',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.NEXT_PUBLIC_DRIZZLE_DB_URL,
    }
});