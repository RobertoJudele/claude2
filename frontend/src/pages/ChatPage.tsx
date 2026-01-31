import { useEffect, useRef, useState } from "react";
import { auth } from "../firebase/config";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Button,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { apiFetch } from "../api/apiClient";
import { useNavigate, useParams } from "react-router-dom";

type Message = {
  message_id: number;
  sender_uid: string;
  content: string;
  timestamp: string;
};

export default function ChatPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [input, setInput] = useState("");

  const [otherUsername, setOtherUsername] = useState<string>("");

  const ws = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { chatId } = useParams<{ chatId: string }>();

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/login");
        return;
      }
      setUser(firebaseUser);
      setLoadingUser(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

// Load other user info
useEffect(() => {
  if (!user || !chatId) return;

  const loadOtherUser = async () => {
  try {
    const res = await apiFetch<{ other_username: string }>(`/api/chat/${chatId}/info`);
    setOtherUsername(res.other_username);
  } catch (err) {
    console.error(err);
  }
};

  loadOtherUser();
}, [user, chatId]);

  // Load messages
  useEffect(() => {
    if (!user || !chatId) return;

    let canceled = false;

    const loadMessages = async (beforeId?: number) => {
      try {
        const res = await apiFetch<Message[]>(
          `/api/chat/${chatId}/messages?limit=30${beforeId ? `&before_id=${beforeId}` : ""}`
        );
        if (canceled) return;

        if (res.length < 30) setHasMore(false);
        setMessages((prev) => (beforeId ? [...res, ...prev] : res));
        if (!beforeId) scrollToBottom();
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };

    setLoadingMessages(true);
    loadMessages().finally(() => setLoadingMessages(false));

    // mark chat as read
    window.dispatchEvent(new CustomEvent("read_chat", { detail: { chat_id: chatId } }));

    return () => {
      canceled = true;
    };
  }, [user, chatId]);

  // WebSocket
  useEffect(() => {
    if (!user || !chatId) return;

    let active = true;

    const connectWS = async () => {
      try {
        const token = await user.getIdToken(true);
        if (!active) return;

        ws.current = new WebSocket(`ws://localhost/api/chat/ws/${chatId}?token=${token}`);

        ws.current.onmessage = (event) => {
          const msg: Message = JSON.parse(event.data);
          if (!msg.message_id) return;

          setMessages((prev) => {
            if (prev.some((m) => m.message_id === msg.message_id)) return prev;
            return [...prev, msg];
          });

          window.dispatchEvent(
            new CustomEvent("new_message", { detail: { chat_id: chatId, sender_uid: msg.sender_uid } })
          );

          scrollToBottom();
        };

        ws.current.onclose = () => console.log("WebSocket disconnected");
      } catch (err) {
        console.error("WS connection error:", err);
      }
    };

    connectWS();

    return () => {
      active = false;
      ws.current?.close();
    };
  }, [user, chatId]);

  const loadMore = async () => {
    if (!messages.length || !chatId) return;
    setLoadingMore(true);
    try {
      const oldestId = messages[0].message_id;
      const res = await apiFetch<Message[]>(`/api/chat/${chatId}/messages?limit=30&before_id=${oldestId}`);
      if (res.length < 30) setHasMore(false);
      setMessages((prev) => [...res, ...prev]);
    } catch (err) {
      console.error("Failed to load more messages:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const sendMessage = () => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    if (!input.trim()) return;

    ws.current.send(JSON.stringify({ content: input.trim() }));
    setInput("");
  };

  if (loadingUser)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );

  if (!user)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography>Please log in to access chat.</Typography>
      </Box>
    );

  return (
    <Box sx={{ maxWidth: 900, margin: "40px auto", padding: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Chat with {otherUsername || "loading..."}</Typography>

        <div
          ref={scrollRef}
          style={{ height: 500, overflowY: "auto", border: "1px solid #eee", borderRadius: 4, padding: 16 }}
        >
          {loadingMessages ? (
            <Typography>Loading messages...</Typography>
          ) : (
            <>
              {hasMore && (
                <Button fullWidth onClick={loadMore} disabled={loadingMore} startIcon={<ArrowUpwardIcon />}>
                  {loadingMore ? "Loading..." : "Load more"}
                </Button>
              )}

              {messages.map((m) => (
                <Box
                  key={m.message_id}
                  sx={{
                    display: "flex",
                    justifyContent: m.sender_uid === user.uid ? "flex-end" : "flex-start",
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: m.sender_uid === user.uid ? "primary.main" : "grey.200",
                      color: m.sender_uid === user.uid ? "white" : "black",
                      p: 1,
                      borderRadius: 2,
                      maxWidth: "70%",
                    }}
                  >
                    <Typography variant="body2">{m.content}</Typography>
                    <Typography variant="caption" sx={{ display: "block", textAlign: "right" }}>
                      {new Date(m.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </>
          )}
        </div>

        <Box sx={{ display: "flex", mt: 2 }}>
          <TextField
            value={input}
            onChange={(e) => setInput(e.target.value)}
            fullWidth
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
          <IconButton onClick={sendMessage}>
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
}
