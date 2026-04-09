import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import type { ChatMessage } from "@/lib/types/chat";
import { createClient } from "@supabase/supabase-js";

const SYSTEM_PROMPT =
  "You are a helpful assistant for a modern web app. Keep responses concise, clear, and accurate.";

interface ChatRequestBody {
  messages?: ChatMessage[];
  conversationId?: string;
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const bearerToken = authHeader?.replace("Bearer ", "");
    if (!bearerToken) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const userClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
      {
        global: {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        },
      },
    );

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized user." }, { status: 401 });
    }

    const body = (await request.json()) as ChatRequestBody;
    const messages = body.messages ?? [];

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "At least one message is required." },
        { status: 400 },
      );
    }

    const latestUserMessage = [...messages]
      .reverse()
      .find((message) => message.role === "user");

    if (!latestUserMessage?.content?.trim()) {
      return NextResponse.json(
        { error: "Latest user message is missing." },
        { status: 400 },
      );
    }

    let aiReply = "";
    const llmMessages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ];

    if (!openai) {
      aiReply =
        "Demo mode is active. Add OPENAI_API_KEY to enable real AI responses.";
    } else {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4.1-mini",
          temperature: 0.7,
          messages: llmMessages,
        });
        aiReply = completion.choices[0]?.message?.content?.trim() ?? "";
      } catch (openAiError) {
        console.error("OpenAI request failed:", openAiError);
        aiReply =
          "I could not reach the AI provider right now. Please check your OpenAI key/billing and try again.";
      }
    }

    if (!aiReply) {
      return NextResponse.json(
        { error: "AI returned an empty response." },
        { status: 502 },
      );
    }

    let conversationId = body.conversationId;

    if (!conversationId) {
      const { data: conversation, error: conversationError } = await userClient
        .from("conversations")
        .insert({
          user_id: user.id,
          title: latestUserMessage.content.slice(0, 60),
        })
        .select("id")
        .single();

      if (conversationError || !conversation) {
        return NextResponse.json(
          { error: "Unable to create conversation." },
          { status: 500 },
        );
      }

      conversationId = conversation.id as string;
    }

    const { error: dbError } = await userClient.from("messages").insert({
      conversation_id: conversationId,
      user_id: user.id,
      user_msg: latestUserMessage.content,
      ai_msg: aiReply,
      created_at: new Date().toISOString(),
    });

    if (dbError) {
      return NextResponse.json(
        { error: "AI response generated but failed to save chat history." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { reply: aiReply, conversationId },
      { status: 200 },
    );
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Something went wrong while processing your request." },
      { status: 500 },
    );
  }
}
