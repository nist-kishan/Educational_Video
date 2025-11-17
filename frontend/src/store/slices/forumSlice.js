import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const token = localStorage.getItem('token');

export const fetchThreads = createAsyncThunk(
  'forum/fetchThreads',
  async (courseId) => {
    const response = await axios.get(
      `${API_URL}/student/courses/${courseId}/forum`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.threads;
  }
);

export const createThread = createAsyncThunk(
  'forum/createThread',
  async ({ courseId, title, content }) => {
    const response = await axios.post(
      `${API_URL}/student/courses/${courseId}/forum`,
      { title, content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.thread;
  }
);

export const replyToThread = createAsyncThunk(
  'forum/replyToThread',
  async ({ threadId, content }) => {
    const response = await axios.post(
      `${API_URL}/student/forum/${threadId}/reply`,
      { content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.reply;
  }
);

const forumSlice = createSlice({
  name: 'forum',
  initialState: {
    threads: [],
    isLoading: false,
    error: null
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchThreads.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchThreads.fulfilled, (state, action) => {
        state.isLoading = false;
        state.threads = action.payload;
      })
      .addCase(createThread.fulfilled, (state, action) => {
        state.threads.push(action.payload);
      })
      .addCase(replyToThread.fulfilled, (state, action) => {
        const thread = state.threads.find(t => t.id === action.payload.threadId);
        if (thread) thread.replies.push(action.payload);
      });
  }
});

export default forumSlice.reducer;
