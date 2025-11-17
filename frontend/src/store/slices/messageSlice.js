import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const token = localStorage.getItem('token');

export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async () => {
    const response = await axios.get(
      `${API_URL}/student/conversations`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.conversations;
  }
);

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (conversationId) => {
    const response = await axios.get(
      `${API_URL}/student/conversations/${conversationId}/messages`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.messages;
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ conversationId, content }) => {
    const response = await axios.post(
      `${API_URL}/student/conversations/${conversationId}/messages`,
      { content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.message;
  }
);

export const markAsRead = createAsyncThunk(
  'messages/markAsRead',
  async (messageId) => {
    const response = await axios.post(
      `${API_URL}/student/messages/${messageId}/read`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.message;
  }
);

const messageSlice = createSlice({
  name: 'messages',
  initialState: {
    conversations: [],
    currentMessages: [],
    typingUsers: [],
    onlineUsers: [],
    isLoading: false,
    error: null
  },
  reducers: {
    addTypingUser: (state, action) => {
      if (!state.typingUsers.includes(action.payload)) {
        state.typingUsers.push(action.payload);
      }
    },
    removeTypingUser: (state, action) => {
      state.typingUsers = state.typingUsers.filter(u => u !== action.payload);
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    addMessage: (state, action) => {
      state.currentMessages.push(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.currentMessages = action.payload;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.currentMessages.push(action.payload);
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.currentMessages.findIndex(m => m.id === action.payload.id);
        if (index !== -1) state.currentMessages[index] = action.payload;
      });
  }
});

export const { addTypingUser, removeTypingUser, setOnlineUsers, addMessage } = messageSlice.actions;
export default messageSlice.reducer;
