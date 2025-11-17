import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const token = localStorage.getItem('token');

export const fetchBookmarks = createAsyncThunk(
  'bookmarks/fetchBookmarks',
  async (videoId) => {
    const response = await axios.get(
      `${API_URL}/student/videos/${videoId}/bookmarks`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.bookmarks;
  }
);

export const addBookmark = createAsyncThunk(
  'bookmarks/addBookmark',
  async ({ videoId, title, timestamp }) => {
    const response = await axios.post(
      `${API_URL}/student/videos/${videoId}/bookmarks`,
      { title, timestamp },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.bookmark;
  }
);

export const deleteBookmark = createAsyncThunk(
  'bookmarks/deleteBookmark',
  async (bookmarkId) => {
    await axios.delete(
      `${API_URL}/student/bookmarks/${bookmarkId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return bookmarkId;
  }
);

const bookmarkSlice = createSlice({
  name: 'bookmarks',
  initialState: {
    bookmarks: [],
    isLoading: false,
    error: null
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookmarks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBookmarks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookmarks = action.payload;
      })
      .addCase(addBookmark.fulfilled, (state, action) => {
        state.bookmarks.push(action.payload);
      })
      .addCase(deleteBookmark.fulfilled, (state, action) => {
        state.bookmarks = state.bookmarks.filter(b => b.id !== action.payload);
      });
  }
});

export default bookmarkSlice.reducer;
