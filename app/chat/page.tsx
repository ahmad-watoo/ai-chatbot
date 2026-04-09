"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CircularProgress } from "@mui/material";
import { ChatBox } from "@/components/ChatBox";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function ChatPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabaseBrowser.auth.getSession();
      if (!data.session) {
        router.replace("/auth");
        return;
      }
      setIsCheckingAuth(false);
    };

    void checkAuth();
  }, [router]);

  if (isCheckingAuth) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-5xl items-center justify-center p-2 sm:p-4">
        <CircularProgress />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-6xl p-2 sm:p-4">
      <div className="h-[calc(100vh-88px)] w-full overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <ChatBox />
      </div>
    </main>
  );
}
