"use client";

import { MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Drawer,
  IconButton,
  Divider,
  List,
  ListItemButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import PushPinRoundedIcon from "@mui/icons-material/PushPinRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { sendChatMessage } from "@/lib/api/chat";
import type { ChatApiError, ChatMessage } from "@/lib/types/chat";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { Conversation, MessageRow } from "@/lib/types/app";

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content: "Hi! I am your AI assistant. Ask anything and I will do my best to help.",
};

export function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchText, setSearchText] = useState("");
  const [input, setInput] = useState("");
  const [isBootLoading, setIsBootLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuConversation, setMenuConversation] = useState<Conversation | null>(null);
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(
    () => input.trim().length > 0 && !isLoading,
    [input, isLoading],
  );
  const filteredConversations = useMemo(() => {
    const normalized = searchText.trim().toLowerCase();
    const rows = conversations.filter((conversation) =>
      (conversation.title ?? "Untitled chat").toLowerCase().includes(normalized),
    );
    return rows.sort((a, b) => {
      if (Boolean(a.pinned) !== Boolean(b.pinned)) {
        return a.pinned ? -1 : 1;
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [conversations, searchText]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const notifyError = useCallback((message: string) => {
    toast.error(message);
  }, []);

  const fetchConversations = useCallback(async (userId: string): Promise<Conversation[]> => {
    const { data: conversationData, error } = await supabaseBrowser
      .from("conversations")
      .select("id,title,created_at,updated_at,pinned")
      .eq("user_id", userId);

    if (error) {
      notifyError(error.message);
      return [];
    }

    return (conversationData ?? []) as Conversation[];
  }, [notifyError]);

  const loadConversation = useCallback(async (selectedConversationId: string) => {
    setIsHistoryLoading(true);
    setConversationId(selectedConversationId);

    const { data, error } = await supabaseBrowser
      .from("messages")
      .select("id,conversation_id,user_msg,ai_msg,created_at")
      .eq("conversation_id", selectedConversationId)
      .order("created_at", { ascending: true });

    if (error) {
      notifyError(error.message);
      setIsHistoryLoading(false);
      return;
    }

    const rows = (data ?? []) as MessageRow[];
    const hydrated = rows.flatMap<ChatMessage>((row) => [
      { role: "user", content: row.user_msg },
      { role: "assistant", content: row.ai_msg },
    ]);

    setMessages(hydrated.length ? hydrated : [WELCOME_MESSAGE]);
    setIsHistoryLoading(false);
  }, [notifyError]);

  useEffect(() => {
    const initialize = async () => {
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) {
        notifyError("Please sign in to use chat.");
        setIsBootLoading(false);
        return;
      }

      const rows = await fetchConversations(userId);
      setConversations(rows);

      if (rows.length > 0) {
        await loadConversation(rows[0].id);
      }

      setIsBootLoading(false);
    };

    void initialize();
  }, [fetchConversations, loadConversation, notifyError]);

  const handleNewChat = () => {
    setConversationId(undefined);
    setMessages([WELCOME_MESSAGE]);
    setMobileHistoryOpen(false);
  };

  const openConversationMenu = (
    event: MouseEvent<HTMLButtonElement>,
    conversation: Conversation,
  ) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setMenuConversation(conversation);
  };

  const closeConversationMenu = () => {
    setMenuAnchorEl(null);
    setMenuConversation(null);
  };

  const selectConversation = async (id: string) => {
    await loadConversation(id);
    setMobileHistoryOpen(false);
  };

  const startRenameConversation = () => {
    if (!menuConversation) return;
    setEditingConversationId(menuConversation.id);
    setEditingTitle(menuConversation.title ?? "Untitled chat");
    closeConversationMenu();
  };

  const saveRenameConversation = async (id: string) => {
    const title = editingTitle.trim();
    if (!title) {
      setEditingConversationId(null);
      setEditingTitle("");
      return;
    }

    const { error } = await supabaseBrowser
      .from("conversations")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      notifyError(error.message);
      return;
    }

    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === id
          ? { ...conversation, title, updated_at: new Date().toISOString() }
          : conversation,
      ),
    );
    setEditingConversationId(null);
    setEditingTitle("");
  };

  const togglePinConversation = async () => {
    if (!menuConversation) return;
    const nextPinned = !menuConversation.pinned;

    const { error } = await supabaseBrowser
      .from("conversations")
      .update({ pinned: nextPinned, updated_at: new Date().toISOString() })
      .eq("id", menuConversation.id);

    if (error) {
      notifyError(error.message);
      closeConversationMenu();
      return;
    }

    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === menuConversation.id
          ? {
              ...conversation,
              pinned: nextPinned,
              updated_at: new Date().toISOString(),
            }
          : conversation,
      ),
    );
    closeConversationMenu();
  };

  const deleteConversation = async () => {
    if (!menuConversation) return;
    const deletingId = menuConversation.id;

    const { error } = await supabaseBrowser
      .from("conversations")
      .delete()
      .eq("id", deletingId);

    if (error) {
      notifyError(error.message);
      closeConversationMenu();
      return;
    }

    setConversations((previous) =>
      previous.filter((conversation) => conversation.id !== deletingId),
    );

    if (conversationId === deletingId) {
      setConversationId(undefined);
      setMessages([WELCOME_MESSAGE]);
    }

    closeConversationMenu();
  };

  const handleSendMessage = async () => {
    const userInput = input.trim();
    if (!userInput || isLoading) {
      return;
    }

    setInput("");

    const userMessage: ChatMessage = { role: "user", content: userInput };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      const userId = sessionData.session?.user.id;

      if (!accessToken || !userId) {
        notifyError("Please sign in to use chat.");
        setIsLoading(false);
        return;
      }

      let currentConversationId = conversationId;

      if (!currentConversationId) {
        const nowIso = new Date().toISOString();
        const { data: createdConversation, error: createError } = await supabaseBrowser
          .from("conversations")
          .insert({
            user_id: userId,
            title: userInput.slice(0, 60),
            updated_at: nowIso,
          })
          .select("id,title,created_at,updated_at,pinned")
          .single();

        if (createError || !createdConversation) {
          notifyError(createError?.message ?? "Unable to create conversation.");
          setIsLoading(false);
          return;
        }

        const newConversation = createdConversation as Conversation;
        setConversations((previous) => [newConversation, ...previous]);
        currentConversationId = newConversation.id;
      }

      const { reply, conversationId: returnedConversationId } = await sendChatMessage(
        nextMessages,
        accessToken,
        currentConversationId,
      );
      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: reply },
      ]);

      setConversationId(returnedConversationId);
      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === returnedConversationId
            ? { ...conversation, updated_at: new Date().toISOString() }
            : conversation,
        ),
      );
    } catch (error) {
      let message = "Unable to reach the assistant right now.";

      if (error instanceof AxiosError) {
        const apiError = error.response?.data as ChatApiError | undefined;
        if (apiError?.error) {
          message = apiError.error;
        }
      }

      notifyError(message);
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack direction="row" className="h-full" spacing={0} sx={{ color: "text.primary" }}>
      <Box
        className="hidden h-full w-72 p-3 md:block"
        sx={{ borderRight: 1, borderColor: "divider", bgcolor: "background.paper" }}
      >
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          fullWidth
          onClick={handleNewChat}
          sx={{ mb: 2 }}
        >
          New chat
        </Button>
        <Divider sx={{ mb: 1 }} />
        <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: "center" }}>
          <HistoryRoundedIcon fontSize="small" />
          <Typography variant="subtitle2">History</Typography>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: "center" }}>
          <SearchRoundedIcon fontSize="small" />
          <TextField
            size="small"
            placeholder="Search chats..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            fullWidth
          />
        </Stack>
        <List dense className="max-h-[calc(100vh-220px)] overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <ListItemButton
              key={conversation.id}
              selected={conversation.id === conversationId}
              onClick={() => void selectConversation(conversation.id)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                bgcolor:
                  conversation.id === conversationId
                    ? "action.selected"
                    : "transparent",
                color:
                  conversation.id === conversationId ? "primary.main" : "text.primary",
                "&.Mui-selected:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              {editingConversationId === conversation.id ? (
                <TextField
                  size="small"
                  fullWidth
                  value={editingTitle}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => setEditingTitle(event.target.value)}
                  onBlur={() => void saveRenameConversation(conversation.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void saveRenameConversation(conversation.id);
                    }
                    if (event.key === "Escape") {
                      setEditingConversationId(null);
                      setEditingTitle("");
                    }
                  }}
                  autoFocus
                />
              ) : (
                <>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      noWrap
                      sx={{ fontWeight: conversation.id === conversationId ? 700 : 500 }}
                    >
                      {conversation.pinned
                        ? `📌 ${conversation.title ?? "Untitled chat"}`
                        : (conversation.title ?? "Untitled chat")}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(event) => openConversationMenu(event, conversation)}
                    sx={{
                      color:
                        conversation.id === conversationId
                          ? "primary.main"
                          : "text.secondary",
                    }}
                  >
                    <MoreVertRoundedIcon fontSize="small" />
                  </IconButton>
                </>
              )}
            </ListItemButton>
          ))}
        </List>
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={closeConversationMenu}
        >
          <MenuItem onClick={togglePinConversation}>
            <PushPinRoundedIcon fontSize="small" sx={{ mr: 1 }} />
            {menuConversation?.pinned ? "Unpin chat" : "Pin chat"}
          </MenuItem>
          <MenuItem onClick={startRenameConversation}>
            <EditRoundedIcon fontSize="small" sx={{ mr: 1 }} />
            Rename
          </MenuItem>
          <MenuItem onClick={deleteConversation} sx={{ color: "error.main" }}>
            <DeleteOutlineRoundedIcon fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>
      </Box>

      <Drawer
        anchor="left"
        open={mobileHistoryOpen}
        onClose={() => setMobileHistoryOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: 300, p: 1.5 },
        }}
      >
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          fullWidth
          onClick={handleNewChat}
          sx={{ mb: 2 }}
        >
          New chat
        </Button>
        <Divider sx={{ mb: 1 }} />
        <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: "center" }}>
          <HistoryRoundedIcon fontSize="small" />
          <Typography variant="subtitle2">History</Typography>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: "center" }}>
          <SearchRoundedIcon fontSize="small" />
          <TextField
            size="small"
            placeholder="Search chats..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            fullWidth
          />
        </Stack>
        <List dense className="overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <ListItemButton
              key={conversation.id}
              selected={conversation.id === conversationId}
              onClick={() => void selectConversation(conversation.id)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                bgcolor:
                  conversation.id === conversationId ? "action.selected" : "transparent",
                color: conversation.id === conversationId ? "primary.main" : "text.primary",
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  noWrap
                  sx={{ fontWeight: conversation.id === conversationId ? 700 : 500 }}
                >
                  {conversation.pinned
                    ? `📌 ${conversation.title ?? "Untitled chat"}`
                    : (conversation.title ?? "Untitled chat")}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={(event) => openConversationMenu(event, conversation)}
              >
                <MoreVertRoundedIcon fontSize="small" />
              </IconButton>
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Stack className="h-full flex-1" spacing={0}>
        <Box
          className="px-4 py-3"
          sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            AI Chatbot
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Powered by Next.js, OpenAI, and Supabase
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            size="small"
            onClick={handleNewChat}
            sx={{ mt: 1, display: { xs: "inline-flex", md: "none" }, mr: 1 }}
          >
            New chat
          </Button>
          <Button
            variant="outlined"
            startIcon={<MenuRoundedIcon />}
            size="small"
            onClick={() => setMobileHistoryOpen(true)}
            sx={{ mt: 1, display: { xs: "inline-flex", md: "none" } }}
          >
            History
          </Button>
        </Box>

        <Box
          className="flex-1 overflow-y-auto px-3 py-4 sm:px-6"
          sx={{ bgcolor: "background.default" }}
        >
          <Stack spacing={2}>
            {isBootLoading || isHistoryLoading ? (
              <Box className="flex h-full min-h-[160px] items-center justify-center">
                <CircularProgress size={24} />
              </Box>
            ) : null}

          {!isBootLoading &&
            !isHistoryLoading &&
            messages.map((message, index) => {
              const isUser = message.role === "user";
              return (
                <Box
                  key={`${message.role}-${index}`}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <Stack
                    direction={isUser ? "row-reverse" : "row"}
                    spacing={1}
                    sx={{ alignItems: "flex-end" }}
                  >
                    <Avatar
                      sx={{
                        width: 30,
                        height: 30,
                        bgcolor: isUser ? "primary.main" : "grey.600",
                      }}
                    >
                      {isUser ? (
                        <PersonRoundedIcon fontSize="small" />
                      ) : (
                        <SmartToyRoundedIcon fontSize="small" />
                      )}
                    </Avatar>

                    <Paper
                      elevation={0}
                      className="max-w-[75vw] rounded-2xl px-4 py-2 shadow-sm sm:max-w-[70%]"
                      sx={{
                        borderRadius: 2,
                        borderBottomRightRadius: isUser ? 4 : 16,
                        borderBottomLeftRadius: isUser ? 16 : 4,
                        bgcolor: isUser ? "primary.main" : "background.paper",
                        color: isUser ? "primary.contrastText" : "text.primary",
                      }}
                    >
                      <Typography variant="body1" className="whitespace-pre-wrap">
                        {message.content}
                      </Typography>
                    </Paper>
                  </Stack>
                </Box>
              );
            })}

            {isLoading && (
              <Box className="flex justify-start">
                <Paper
                  elevation={0}
                  className="rounded-2xl rounded-bl-sm px-4 py-2 shadow-sm"
                  sx={{ bgcolor: "background.paper", color: "text.secondary" }}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <CircularProgress size={14} />
                    <Typography variant="body2">AI is typing...</Typography>
                  </Stack>
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Stack>
        </Box>

        <Box
          className="p-3 sm:p-4"
          sx={{ borderTop: 1, borderColor: "divider", bgcolor: "background.paper" }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "flex-end" }}>
            <TextField
              fullWidth
              minRows={1}
              maxRows={5}
              multiline
              placeholder="Type your message..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void handleSendMessage();
                }
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "background.paper",
                },
                "& .MuiInputBase-input": {
                  color: "text.primary",
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "text.secondary",
                  opacity: 1,
                },
                "& .MuiInputLabel-root": {
                  color: "text.secondary",
                },
              }}
            />

            <Button
              variant="contained"
              onClick={() => void handleSendMessage()}
              disabled={!canSend}
              sx={{ minWidth: 52, height: 56 }}
              aria-label="Send message"
            >
              <SendRoundedIcon />
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Stack>
  );
}
