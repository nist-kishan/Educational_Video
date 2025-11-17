import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const token = localStorage.getItem('token');

export const fetchNotes = createAsyncThunk(
  'notes/fetchNotes',
  async (videoId) => {
    const response = await axios.get(
      `${API_URL}/student/videos/${videoId}/notes`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.notes;
  }
);

export const addNote = createAsyncThunk(
  'notes/addNote',
  async ({ videoId, content, timestamp }) => {
    const response = await axios.post(
      `${API_URL}/student/videos/${videoId}/notes`,
      { content, timestamp },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.note;
  }
);

export const updateNote = createAsyncThunk(
  'notes/updateNote',
  async ({ noteId, content }) => {
    const response = await axios.put(
      `${API_URL}/student/notes/${noteId}`,
      { content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.note;
  }
);

export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async (noteId) => {
    await axios.delete(
      `${API_URL}/student/notes/${noteId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return noteId;
  }
);

const noteSlice = createSlice({
  name: 'notes',
  initialState: {
    notes: [],
    isLoading: false,
    error: null
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes = action.payload;
      })
      .addCase(addNote.fulfilled, (state, action) => {
        state.notes.push(action.payload);
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        const index = state.notes.findIndex(n => n.id === action.payload.id);
        if (index !== -1) state.notes[index] = action.payload;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.notes = state.notes.filter(n => n.id !== action.payload);
      });
  }
});

export default noteSlice.reducer;
