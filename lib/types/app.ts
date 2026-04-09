export interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  pinned?: boolean;
}

export interface MessageRow {
  id: number;
  conversation_id: string;
  user_msg: string;
  ai_msg: string;
  created_at: string;
}
