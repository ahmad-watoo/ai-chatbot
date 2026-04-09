import axios from "axios";
import type { ChatApiSuccess, ChatMessage } from "@/lib/types/chat";

const chatApi = axios.create({
  baseURL: "/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function sendChatMessage(
  messages: ChatMessage[],
  accessToken: string,
  conversationId?: string,
) {
  const response = await chatApi.post<ChatApiSuccess>(
    "/chat",
    { messages, conversationId },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return response.data;
}
