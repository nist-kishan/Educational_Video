import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import themeReducer from './themeSlice';
import toastReducer from './toastSlice';
import courseReducer from './courseSlice';
import studentReducer from './studentSlice';

// Import new slices
import reviewReducer from './slices/reviewSlice';
import submissionReducer from './slices/submissionSlice';
import certificateReducer from './slices/certificateSlice';
import bookmarkReducer from './slices/bookmarkSlice';
import noteReducer from './slices/noteSlice';
import commentReducer from './slices/commentSlice';
import forumReducer from './slices/forumSlice';
import analyticsReducer from './slices/analyticsSlice';
import adminReducer from './slices/adminSlice';
import messageReducer from './slices/messageSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    toast: toastReducer,
    courses: courseReducer,
    student: studentReducer,
    // New slices
    reviews: reviewReducer,
    submissions: submissionReducer,
    certificates: certificateReducer,
    bookmarks: bookmarkReducer,
    notes: noteReducer,
    comments: commentReducer,
    forum: forumReducer,
    analytics: analyticsReducer,
    admin: adminReducer,
    messages: messageReducer
  }
});

export default store;
