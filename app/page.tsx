"use client";

import Link from "next/link";
import { Button } from "@mui/material";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-6xl flex-col justify-center px-4 py-10 sm:px-6">
      <section className="grid items-center gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-500">
            AI Chat SaaS
          </p>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
            Production-ready AI chatbot for teams
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Multi-user chat, conversation history, Stripe subscriptions, and a
            modern dashboard powered by Next.js, OpenAI, and Supabase.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button component={Link} href="/chat" variant="contained" size="large">
              Launch Chat
            </Button>
            <Button component={Link} href="/pricing" variant="outlined" size="large">
              View Pricing
            </Button>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
          <h2 className="mb-4 text-xl font-bold">Included by default</h2>
          <ul className="space-y-2 text-slate-700 dark:text-slate-200">
            <li>- Free and Pro subscription model</li>
            <li>- Secure server-side OpenAI API usage</li>
            <li>- Supabase auth and multi-user data model</li>
            <li>- Chat history dashboard</li>
            <li>- Theme and user settings</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
