"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setInfo("");

    const { error: authError } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });
    if (authError) {
      setError(authError.message);
      return;
    }

    setInfo("Signed in successfully.");
    router.push("/chat");
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-md items-center px-4 py-10">
      <Paper className="w-full rounded-2xl p-6 text-slate-900 dark:text-slate-100" elevation={2}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Sign in to AI SaaS Chat
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Use email and password authentication with Supabase.
        </Typography>

        <Box component="form" onSubmit={(event) => void onSubmit(event)}>
          <Stack spacing={2}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            {info ? <Alert severity="success">{info}</Alert> : null}
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              fullWidth
              sx={{
                "& .MuiInputBase-input": { color: "text.primary" },
                "& .MuiInputLabel-root": { color: "text.secondary" },
              }}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              fullWidth
              sx={{
                "& .MuiInputBase-input": { color: "text.primary" },
                "& .MuiInputLabel-root": { color: "text.secondary" },
              }}
            />
            <Button type="submit" variant="contained">
              Sign In
            </Button>
            <Typography variant="body2" color="text.secondary">
              New here?{" "}
              <Button component={Link} href="/signup" variant="text" sx={{ p: 0, minWidth: 0 }}>
                Create account
              </Button>
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </main>
  );
}
