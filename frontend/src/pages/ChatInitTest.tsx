import { useEffect, useState } from "react";
import { apiFetch } from "../api/apiClient";
import { getAuth } from "firebase/auth";
import {
  Button,
  Container,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

export default function ChatInitTest() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await apiFetch("/api/chat/users");
        setUsers(data);
      } catch (err) {
        console.error("Failed to load users", err);
      }
    }
    loadUsers();
  }, []);

  const handleInitiateChat = async () => {
    if (!selectedUserId) {
      alert("Select user");
      return;
    }

    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
        alert("You are logged out");
        return;
    } 

    try {
      const res = await apiFetch("/api/chat/initiate", {
        method: "POST",
        body: JSON.stringify({
          ride_id: 1,
          driver_uid: selectedUserId,
          passenger_uid: currentUser.uid,
        }),
      });

      window.location.href = `/chat/${res.chat_id}`;
    } catch (err: any) {
      console.error(err);
      alert("Failed to initiate chat: " + err.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 10 }}>
        <Typography variant="h5" gutterBottom>
          Test – Initiate Chat
        </Typography>

        <FormControl fullWidth sx={{ mt: 2 }}>
  <InputLabel id="select-user-label">Select User</InputLabel>
  <Select
    labelId="select-user-label"
    id="select-user"
    value={selectedUserId}
    label="Select User"
    onChange={(e) => setSelectedUserId(e.target.value as string)}
  >
    {users.map((u) => (
      <MenuItem key={u.firebase_uid} value={u.firebase_uid}>
        {u.username} ({u.email})
      </MenuItem>
    ))}
  </Select>
  </FormControl>

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          onClick={handleInitiateChat}
        >
          Initiate Chat
        </Button>
      </Paper>
    </Container>
  );
}
