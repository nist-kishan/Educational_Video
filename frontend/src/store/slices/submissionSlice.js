import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const token = localStorage.getItem('token');

export const fetchSubmissions = createAsyncThunk(
  'submissions/fetchSubmissions',
  async (assignmentId) => {
    const response = await axios.get(
      `${API_URL}/student/assignments/${assignmentId}/submissions`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.submissions;
  }
);

export const submitAssignment = createAsyncThunk(
  'submissions/submitAssignment',
  async ({ assignmentId, content, file }) => {
    const formData = new FormData();
    formData.append('content', content);
    if (file) formData.append('file', file);

    const response = await axios.post(
      `${API_URL}/student/assignments/${assignmentId}/submit`,
      formData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.submission;
  }
);

const submissionSlice = createSlice({
  name: 'submissions',
  initialState: {
    submissions: [],
    isLoading: false,
    error: null,
    success: false
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubmissions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.submissions = action.payload;
      })
      .addCase(fetchSubmissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(submitAssignment.fulfilled, (state, action) => {
        state.submissions.push(action.payload);
        state.success = true;
      });
  }
});

export default submissionSlice.reducer;
