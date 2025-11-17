import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mode: localStorage.getItem('theme') || 'light',
  colors: {
    light: {
      bg: '#ffffff',
      text: '#1f2937',
      border: '#e5e7eb',
      hover: '#f3f4f6'
    },
    dark: {
      bg: '#111827',
      text: '#f3f4f6',
      border: '#374151',
      hover: '#1f2937'
    }
  }
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.mode);
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
      localStorage.setItem('theme', action.payload);
    }
  }
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
