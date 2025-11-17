import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

axios.defaults.withCredentials = true;

// ==================== ASYNC THUNKS ====================

// Get all published courses
export const getAllPublishedCourses = createAsyncThunk(
  'student/getAllPublishedCourses',
  async ({ category, search, page = 1, limit = 12 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      params.append('page', page);
      params.append('limit', limit);

      const response = await axios.get(`${API_URL}/student/courses?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch courses');
    }
  }
);

// Get course details
export const getCourseDetails = createAsyncThunk(
  'student/getCourseDetails',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/student/courses/${courseId}`);
      return response.data.course;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch course details');
    }
  }
);

// Add to wishlist
export const addToWishlist = createAsyncThunk(
  'student/addToWishlist',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/student/wishlist/${courseId}`);
      return response.data.wishlistItem;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to wishlist');
    }
  }
);

// Remove from wishlist
export const removeFromWishlist = createAsyncThunk(
  'student/removeFromWishlist',
  async (courseId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/student/wishlist/${courseId}`);
      return courseId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from wishlist');
    }
  }
);

// Get wishlist
export const getWishlist = createAsyncThunk(
  'student/getWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/student/wishlist`);
      return response.data.wishlist;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wishlist');
    }
  }
);

// Add to cart
export const addToCart = createAsyncThunk(
  'student/addToCart',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/student/cart/${courseId}`);
      return response.data.cartItem;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

// Remove from cart
export const removeFromCart = createAsyncThunk(
  'student/removeFromCart',
  async (courseId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/student/cart/${courseId}`);
      return courseId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
    }
  }
);

// Get cart
export const getCart = createAsyncThunk(
  'student/getCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/student/cart`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

// Checkout
export const checkout = createAsyncThunk(
  'student/checkout',
  async ({ courseIds, paymentMethod }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/student/checkout`, {
        courseIds,
        paymentMethod
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Checkout failed');
    }
  }
);

// Complete payment
export const completePayment = createAsyncThunk(
  'student/completePayment',
  async ({ orderId, transactionId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/student/payment/complete`, {
        orderId,
        transactionId
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data.enrollments;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Payment completion failed');
    }
  }
);

// Get enrollments
export const getEnrollments = createAsyncThunk(
  'student/getEnrollments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/student/enrollments`);
      return response.data.enrollments;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch enrollments');
    }
  }
);

// Get my enrollments with pagination
export const getMyEnrollments = createAsyncThunk(
  'student/getMyEnrollments',
  async ({ page = 1, limit = 12 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/student/my-enrollments?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch my enrollments');
    }
  }
);

// Get transaction history
export const getTransactionHistory = createAsyncThunk(
  'student/getTransactionHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/student/transactions`);
      return response.data.orders;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transaction history');
    }
  }
);

// ==================== INITIAL STATE ====================

const initialState = {
  courses: [],
  currentCourse: null,
  wishlist: [],
  cart: {
    items: [],
    total: 0,
    count: 0
  },
  enrollments: [],
  transactions: [],
  currentOrder: null,
  isLoading: false,
  error: null,
  success: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 12,
    pages: 0
  }
};

// ==================== SLICE ====================

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    }
  },
  extraReducers: (builder) => {
    // Get all published courses
    builder
      .addCase(getAllPublishedCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllPublishedCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = action.payload.courses;
        state.pagination = action.payload.pagination;
      })
      .addCase(getAllPublishedCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get course details
    builder
      .addCase(getCourseDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCourseDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCourse = action.payload;
      })
      .addCase(getCourseDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Add to wishlist
    builder
      .addCase(addToWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = 'Added to wishlist';
        if (state.currentCourse) {
          state.currentCourse.isInWishlist = true;
        }
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Remove from wishlist
    builder
      .addCase(removeFromWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = 'Removed from wishlist';
        state.wishlist = state.wishlist.filter(item => item.course_id !== action.payload);
        if (state.currentCourse) {
          state.currentCourse.isInWishlist = false;
        }
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get wishlist
    builder
      .addCase(getWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wishlist = action.payload;
      })
      .addCase(getWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Add to cart
    builder
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = 'Added to cart';
        if (state.currentCourse) {
          state.currentCourse.isInCart = true;
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Remove from cart
    builder
      .addCase(removeFromCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = 'Removed from cart';
        state.cart.items = state.cart.items.filter(item => item.course_id !== action.payload);
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get cart
    builder
      .addCase(getCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = {
          items: action.payload.cart,
          total: action.payload.total,
          count: action.payload.count
        };
      })
      .addCase(getCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Checkout
    builder
      .addCase(checkout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkout.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        state.success = 'Checkout successful';
      })
      .addCase(checkout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Complete payment
    builder
      .addCase(completePayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completePayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = 'Payment completed successfully';
        state.cart = { items: [], total: 0, count: 0 };
      })
      .addCase(completePayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get enrollments
    builder
      .addCase(getEnrollments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getEnrollments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.enrollments = action.payload;
      })
      .addCase(getEnrollments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get my enrollments with pagination
    builder
      .addCase(getMyEnrollments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMyEnrollments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.enrollments = action.payload.enrollments;
        state.pagination = action.payload.pagination;
      })
      .addCase(getMyEnrollments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get transaction history
    builder
      .addCase(getTransactionHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTransactionHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload;
      })
      .addCase(getTransactionHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearSuccess } = studentSlice.actions;
export default studentSlice.reducer;
