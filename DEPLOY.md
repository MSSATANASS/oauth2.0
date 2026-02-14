# Deployment Guide

This project is a Next.js application using Supabase for authentication and database.

## Prerequisites

- **Supabase Project**: Ensure you have a Supabase project set up.
- **Environment Variables**: You need the following variables in your deployment environment:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
ENCRYPTION_KEY=your_32_char_encryption_key
GEMINI_CLIENT_ID=...
GEMINI_REDIRECT_URI=...
BINANCE_CLIENT_ID=...
BINANCE_REDIRECT_URI=...
COINBASE_CLIENT_ID=...
COINBASE_REDIRECT_URI=...
```

## Deploy to Vercel (Recommended)

The easiest way to deploy is using [Vercel](https://vercel.com).

1.  **Push to Git**: Commit your code to a Git repository (GitHub, GitLab, Bitbucket).
2.  **Import Project**: Go to Vercel Dashboard, click "Add New..." -> "Project", and select your repository.
3.  **Configure Environment Variables**:
    - In the "Environment Variables" section, add all the variables listed above.
    - **Important**: `SUPABASE_SERVICE_ROLE_KEY` is critical for the login flow (creating users/sessions).
4.  **Deploy**: Click "Deploy". Vercel will automatically detect Next.js and build your project.

## Deploy to Node.js Server (Docker / VPS)

1.  **Build**:
    ```bash
    npm run build
    ```

2.  **Start**:
    ```bash
    npm run start
    ```

3.  **Process Manager**: Use `pm2` or similar to keep the app running.

## Database Migration

Ensure your Supabase database has the required tables. Run the SQL commands provided in `lib/schema.sql` in the Supabase SQL Editor.

## OAuth Redirect URIs

Update your Exchange OAuth applications (Coinbase, Binance, Gemini) to point to your production URL:
- `https://your-domain.com/api/auth/coinbase/callback`
- `https://your-domain.com/api/auth/binance/callback`
- `https://your-domain.com/api/auth/gemini/callback`