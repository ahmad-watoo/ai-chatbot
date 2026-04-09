export type Role = "user" | "assistant";

export interface ChatMessage {
  role: Role;
  content: string;
}

export interface ChatApiSuccess {
  reply: string;
  conversationId: string;
}

export interface ChatApiError {
  error: string;
}
