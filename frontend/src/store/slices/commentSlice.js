import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const token = localStorage.getItem('token');

export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async (videoId) => {
    const response = await axios.get(
      `${API_URL}/student/videos/${videoId}/comments`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.comments;
  }
);

export const addComment = createAsyncThunk(
  'comments/addComment',
  async ({ videoId, content }) => {
    const response = await axios.post(
      `${API_URL}/student/videos/${videoId}/comments`,
      { content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.comment;
  }
);

export const likeComment = createAsyncThunk(
  'comments/likeComment',
  async (commentId) => {
    const response = await axios.post(
      `${API_URL}/student/comments/${commentId}/like`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.comment;
  }
);

export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async (commentId) => {
    await axios.delete(
      `${API_URL}/student/comments/${commentId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return commentId;
  }
);

const commentSlice = createSlice({
  name: 'comments',
  initialState: {
    comments: [],
    isLoading: false,
    error: null
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comments = action.payload;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.comments.push(action.payload);
      })
      .addCase(likeComment.fulfilled, (state, action) => {
        const index = state.comments.findIndex(c => c.id === action.payload.id);
        if (index !== -1) state.comments[index] = action.payload;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.comments = state.comments.filter(c => c.id !== action.payload);
      });
  }
});

export default commentSlice.reducer;
