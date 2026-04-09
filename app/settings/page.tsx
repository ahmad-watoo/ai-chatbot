"use client";

import { useEffect, useState } from "react";
import { Alert, Button, Paper, Stack, Typography } from "@mui/material";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useThemeMode } from "@/components/providers/AppProviders";

export default function SettingsPage() {
  const { mode, toggleMode } = useThemeMode();
  const [email, setEmail] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabaseBrowser.auth.getSession();
      setEmail(data.session?.user.email ?? null);
    };
    void load();
  }, []);

  const openBillingPortal = async () => {
    setStatus("");
    const { data: sessionData } = await supabaseBrowser.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) {
      setStatus("Sign in first to access billing.");
      return;
    }

    const response = await fetch("/api/stripe/portal", { method: "POST" });
    const data = (await response.json()) as { url?: string; error?: string };
    if (data.url) {
      window.location.href = data.url;
      return;
    }
    setStatus(data.error ?? "Billing portal unavailable.");
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-3xl flex-col px-4 py-10">
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
        Theme and settings
      </Typography>

      <Stack spacing={2}>
        <Paper className="rounded-xl p-5 text-slate-900 dark:text-slate-100" elevation={1}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Appearance
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Current mode: {mode}
          </Typography>
          <Button variant="contained" onClick={toggleMode}>
            Toggle theme
          </Button>
        </Paper>

        <Paper className="rounded-xl p-5 text-slate-900 dark:text-slate-100" elevation={1}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Account
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {email ? `Signed in as ${email}` : "Not signed in"}
          </Typography>
          <Button variant="outlined" onClick={() => void supabaseBrowser.auth.signOut()}>
            Sign out
          </Button>
        </Paper>

        <Paper className="rounded-xl p-5 text-slate-900 dark:text-slate-100" elevation={1}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Billing
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Manage your subscription in Stripe billing portal.
          </Typography>
          <Button variant="contained" onClick={() => void openBillingPortal()}>
            Open billing portal
          </Button>
          {status ? <Alert sx={{ mt: 2 }}>{status}</Alert> : null}
        </Paper>
      </Stack>
    </main>
  );
}
