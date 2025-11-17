import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const token = localStorage.getItem('token');

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async () => {
    const response = await axios.get(
      `${API_URL}/admin/users`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.users;
  }
);

export const suspendUser = createAsyncThunk(
  'admin/suspendUser',
  async (userId) => {
    const response = await axios.post(
      `${API_URL}/admin/users/${userId}/suspend`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.user;
  }
);

export const activateUser = createAsyncThunk(
  'admin/activateUser',
  async (userId) => {
    const response = await axios.post(
      `${API_URL}/admin/users/${userId}/activate`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.user;
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId) => {
    await axios.delete(
      `${API_URL}/admin/users/${userId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return userId;
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    users: [],
    isLoading: false,
    error: null
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(suspendUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) state.users[index] = action.payload;
      })
      .addCase(activateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) state.users[index] = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u.id !== action.payload);
      });
  }
});

export default adminSlice.reducer;
