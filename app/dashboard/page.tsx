"use client";

import { useEffect, useState } from "react";
import { Alert, Paper, Stack, Typography } from "@mui/material";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { Conversation, MessageRow } from "@/lib/types/app";

export default function DashboardPage() {
  const [rows, setRows] = useState<
    Array<{ conversation: Conversation; lastMessage: MessageRow | null }>
  >([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setError("");
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) {
        setError("Please sign in first.");
        return;
      }

      const { data: conversations, error: conversationError } = await supabaseBrowser
        .from("conversations")
        .select("id,title,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (conversationError) {
        setError(conversationError.message);
        return;
      }

      const withMessages = await Promise.all(
        (conversations ?? []).map(async (conversation) => {
          const { data: lastMessage } = await supabaseBrowser
            .from("messages")
            .select("id,conversation_id,user_msg,ai_msg,created_at")
            .eq("conversation_id", conversation.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            conversation: conversation as Conversation,
            lastMessage: (lastMessage as MessageRow | null) ?? null,
          };
        }),
      );

      setRows(withMessages);
    };

    void load();
  }, []);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-5xl flex-col px-4 py-10">
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
        Chat history dashboard
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        View your saved multi-user conversations and latest AI responses.
      </Typography>

      {error ? <Alert severity="warning">{error}</Alert> : null}

      <Stack spacing={2} sx={{ mt: 2 }}>
        {rows.map((row) => (
          <Paper
            key={row.conversation.id}
            className="rounded-xl p-4 text-slate-900 dark:text-slate-100"
            elevation={1}
          >
            <Typography sx={{ fontWeight: 700 }}>
              {row.conversation.title ?? "Untitled conversation"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Created: {new Date(row.conversation.created_at).toLocaleString()}
            </Typography>
            <Typography sx={{ mt: 1 }}>
              Last user: {row.lastMessage?.user_msg ?? "No messages yet"}
            </Typography>
            <Typography color="text.secondary">
              Last AI: {row.lastMessage?.ai_msg ?? "No response yet"}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </main>
  );
}
