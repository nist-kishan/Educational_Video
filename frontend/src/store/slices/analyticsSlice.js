import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const token = localStorage.getItem('token');

export const fetchCourseAnalytics = createAsyncThunk(
  'analytics/fetchCourseAnalytics',
  async (courseId) => {
    const response = await axios.get(
      `${API_URL}/student/courses/${courseId}/analytics`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.analytics;
  }
);

export const fetchPlatformAnalytics = createAsyncThunk(
  'analytics/fetchPlatformAnalytics',
  async () => {
    const response = await axios.get(
      `${API_URL}/admin/analytics`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.analytics;
  }
);

export const fetchStudentAnalytics = createAsyncThunk(
  'analytics/fetchStudentAnalytics',
  async () => {
    const response = await axios.get(
      `${API_URL}/student/analytics`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.analytics;
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    courseAnalytics: null,
    platformAnalytics: null,
    studentAnalytics: null,
    isLoading: false,
    error: null
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourseAnalytics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCourseAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courseAnalytics = action.payload;
      })
      .addCase(fetchCourseAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchPlatformAnalytics.fulfilled, (state, action) => {
        state.platformAnalytics = action.payload;
      })
      .addCase(fetchStudentAnalytics.fulfilled, (state, action) => {
        state.studentAnalytics = action.payload;
      });
  }
});

export default analyticsSlice.reducer;
