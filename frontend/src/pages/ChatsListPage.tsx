import { auth } from "../firebase/config";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  Box, List, ListItemButton, ListItemAvatar, Avatar, ListItemText,
  Typography, Divider, Paper, CircularProgress, Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/apiClient";

type ChatListItem = {
  chat_id: number;
  title: string;
  last_message?: string;
  updated_at?: string;
  has_new?: boolean;
};

export default function ChatsListPage() {
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        navigate("/login");
        return;
      }
      setUser(u);
    });
    return () => unsub();
  }, [navigate]);

  // Load chats after user is ready
  useEffect(() => {
    if (!user) return;

    async function loadChats() {
      setLoading(true);
      try {
        const data = await apiFetch<ChatListItem[]>("/api/chat/list");
        setChats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadChats();
  }, [user]);

  // Listen for new messages
  useEffect(() => {
    const handler = (e: any) => {
      const { chat_id, sender_uid } = e.detail;
      if (!sender_uid || sender_uid === auth.currentUser?.uid) return;

      setChats(prev =>
        prev.map(chat => chat.chat_id === Number(chat_id) ? { ...chat, has_new: true } : chat)
      );
    };
    window.addEventListener("new_message", handler);
    return () => window.removeEventListener("new_message", handler);
  }, []);

  // Listen for read chat event
  useEffect(() => {
    const handler = (e: any) => {
      const { chat_id } = e.detail;
      setChats(prev =>
        prev.map(chat => chat.chat_id === Number(chat_id) ? { ...chat, has_new: false } : chat)
      );
    };
    window.addEventListener("read_chat", handler);
    return () => window.removeEventListener("read_chat", handler);
  }, []);

  if (!user) return <Typography>Loading user...</Typography>;

  return (
    <Box sx={{ maxWidth: 800, margin: "40px auto", padding: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Chats</Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {chats.map(c => (
              <div key={c.chat_id}>
                <ListItemButton onClick={() => navigate(`/chat/${c.chat_id}`)}>
                  <ListItemAvatar>
                    <Avatar>{(c.title?.charAt(0) ?? "?").toUpperCase()}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={c.title ?? "Unknown user"}
                    secondary={
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          {c.last_message ?? "No messages yet"}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {c.has_new && <Chip label="NEW" size="small" color="error" />}
                          {c.updated_at && (
                            <Typography variant="caption" color="text.secondary">
                              {new Date(c.updated_at).toLocaleTimeString()}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    }
                  />
                </ListItemButton>
                <Divider />
              </div>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}
