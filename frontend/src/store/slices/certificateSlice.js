import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const token = localStorage.getItem('token');

export const fetchCertificates = createAsyncThunk(
  'certificates/fetchCertificates',
  async () => {
    const response = await axios.get(
      `${API_URL}/student/certificates`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.certificates;
  }
);

export const downloadCertificate = createAsyncThunk(
  'certificates/downloadCertificate',
  async (certificateId) => {
    const response = await axios.get(
      `${API_URL}/student/certificates/${certificateId}/download`,
      { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
    );
    return response.data;
  }
);

const certificateSlice = createSlice({
  name: 'certificates',
  initialState: {
    certificates: [],
    isLoading: false,
    error: null
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCertificates.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCertificates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.certificates = action.payload;
      })
      .addCase(fetchCertificates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  }
});

export default certificateSlice.reducer;
