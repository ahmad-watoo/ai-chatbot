# AI Chatbot SaaS (Next.js + OpenAI + Supabase + Stripe)

Production-ready AI chatbot SaaS starter built with Next.js App Router, TypeScript, Tailwind CSS, Material UI, Axios, OpenAI, Supabase, and Stripe.

## Features

- ChatGPT-like chat UI with responsive layout
- SaaS landing page (`/`)
- Pricing page with Free / Pro plan UI (`/pricing`)
- Multi-user authentication (`/auth`)
- Chat history dashboard (`/dashboard`)
- Theme and settings page (`/settings`)
- Reusable `ChatBox` component
- Axios client for API calls
- Next.js API route at `/api/chat`
- OpenAI integration using `gpt-4.1-mini`
- Supabase storage for user conversations and messages
- Stripe subscription checkout/portal/webhook routes
- Loading + typing indicator (`AI is typing...`)
- Auto-scroll to latest message
- Error handling on client and server
- Environment-variable based secrets (no frontend API key exposure)

## Project Structure

- `app/page.tsx` - SaaS landing page
- `app/auth/page.tsx` - sign in/sign up
- `app/chat/page.tsx` - chat screen
- `app/dashboard/page.tsx` - chat history dashboard
- `app/pricing/page.tsx` - Free/Pro plan page
- `app/settings/page.tsx` - theme and account settings
- `components/ChatBox.tsx` - reusable chat UI and state management
- `components/AppHeader.tsx` - top navigation
- `components/providers/AppProviders.tsx` - MUI theme provider + mode toggle
- `app/api/chat/route.ts` - backend chat endpoint (OpenAI + Supabase insert)
- `app/api/stripe/checkout/route.ts` - Stripe checkout session
- `app/api/stripe/portal/route.ts` - Stripe customer portal
- `app/api/stripe/webhook/route.ts` - Stripe webhook receiver
- `lib/api/chat.ts` - Axios API client
- `lib/openai.ts` - server-side OpenAI client
- `lib/supabase-browser.ts` - browser Supabase client
- `lib/stripe.ts` - server Stripe client
- `lib/types/chat.ts` - shared chat types
- `supabase/schema.sql` - full multi-user database design

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

Required:

- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

Stripe (optional now, required for live subscription):

- `STRIPE_SECRET_KEY`
- `STRIPE_PRO_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_DEFAULT_CUSTOMER_ID`

## Supabase Setup

Run the SQL in:

- `supabase/schema.sql`
- `supabase/signup-setup.sql` (signup profile auto-create trigger)
- `supabase/chat-history-setup.sql` (chat sidebar/history tables + policies)

This creates:
- `profiles`
- `conversations`
- `messages` (with `user_msg`, `ai_msg`, `created_at`, `user_id`, `conversation_id`)
- `subscriptions`
- `user_settings`

RLS policies are included for multi-user isolation.

## Supabase Email Template (Signup Confirmation)

Use `supabase/email-templates/confirm-signup.html` as your Auth email template:

1. Go to Supabase Dashboard -> Authentication -> Email Templates.
2. Open the "Confirm signup" template.
3. Replace the HTML with the file content from `supabase/email-templates/confirm-signup.html`.
4. Save and send a test email.

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If Stripe keys are not set, pricing/checkout works in demo fallback mode so UI flow still works.

## Deploy on Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import project into [Vercel](https://vercel.com).
3. Add environment variables in Vercel project settings.
4. Deploy.

This app is ready for Vercel deployment.
