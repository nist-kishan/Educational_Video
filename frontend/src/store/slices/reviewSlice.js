import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const token = localStorage.getItem('token');

export const fetchReviews = createAsyncThunk(
  'reviews/fetchReviews',
  async (courseId) => {
    const response = await axios.get(
      `${API_URL}/student/courses/${courseId}/reviews`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.reviews;
  }
);

export const createReview = createAsyncThunk(
  'reviews/createReview',
  async ({ courseId, rating, comment }) => {
    const response = await axios.post(
      `${API_URL}/student/courses/${courseId}/reviews`,
      { rating, comment },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.review;
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async (reviewId) => {
    await axios.delete(
      `${API_URL}/student/reviews/${reviewId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return reviewId;
  }
);

const reviewSlice = createSlice({
  name: 'reviews',
  initialState: {
    reviews: [],
    isLoading: false,
    error: null,
    success: false
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(createReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews.push(action.payload);
        state.success = true;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter(r => r.id !== action.payload);
      });
  }
});

export default reviewSlice.reducer;
