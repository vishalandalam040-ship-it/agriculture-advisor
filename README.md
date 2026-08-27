# AI-Powered Agriculture Crop Advisory Assistant
A full-stack web application providing AI-generated crop management decisions.

## Setup
1. Run `npm run install:all`
2. Set up Supabase and run migrations in `supabase/migrations`
3. Copy `.env.example` to `.env` in the `server` directory and fill in your keys.
4. Copy `.env.example` to `.env` in the `client` directory (rename variables to VITE_... if needed, but DO NOT EXPOSE GEMINI API KEY).
5. Run `npm run dev:server` and `npm run dev:client` in separate terminals.
