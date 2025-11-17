import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Configure axios to send cookies with requests
axios.defaults.withCredentials = true;

// Async thunks
export const createCourse = createAsyncThunk(
  'courses/createCourse',
  async (courseData, { rejectWithValue }) => {
    try {
      console.log('📤 Creating course with data:', courseData);
      const response = await axios.post(`${API_URL}/courses`, courseData);
      console.log('✅ Course created successfully:', response.data);
      return response.data.course;
    } catch (error) {
      console.error('❌ Course creation error:', error.response?.data);
      console.error('❌ Full error response:', error.response);
      // Log the specific validation errors if they exist
      if (error.response?.data?.errors) {
        console.error('❌ Validation errors details:', JSON.stringify(error.response.data.errors, null, 2));
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to create course');
    }
  }
);

export const getTutorCourses = createAsyncThunk(
  'courses/getTutorCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/courses`);
      return response.data.courses;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch courses');
    }
  }
);

export const getCourseById = createAsyncThunk(
  'courses/getCourseById',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/courses/${courseId}`);
      return response.data.course;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch course');
    }
  }
);

export const updateCourse = createAsyncThunk(
  'courses/updateCourse',
  async ({ courseId, courseData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/courses/${courseId}`, courseData);
      return response.data.course;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update course');
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'courses/deleteCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/courses/${courseId}`);
      return courseId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete course');
    }
  }
);

export const publishCourse = createAsyncThunk(
  'courses/publishCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/courses/${courseId}/publish`);
      return response.data.course;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to publish course');
    }
  }
);

// Video thunks
export const addVideo = createAsyncThunk(
  'courses/addVideo',
  async ({ courseId, moduleId, videoData }, { rejectWithValue }) => {
    try {
      // If no moduleId provided, return error
      if (!moduleId) {
        return rejectWithValue('Module ID is required to add videos');
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', videoData.file);
      formData.append('title', videoData.title);
      formData.append('description', videoData.description || '');
      formData.append('isDemo', false);

      const response = await axios.post(
        `${API_URL}/courses/${courseId}/modules/${moduleId}/videos/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data.video;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add video');
    }
  }
);

export const getCourseVideos = createAsyncThunk(
  'courses/getCourseVideos',
  async (courseId, { rejectWithValue }) => {
    try {
      // Videos are fetched per module, not per course
      // This thunk returns empty array to prevent 404 errors
      return [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch videos');
    }
  }
);

export const updateVideo = createAsyncThunk(
  'courses/updateVideo',
  async ({ courseId, videoId, videoData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/courses/${courseId}/videos/${videoId}`, videoData);
      return response.data.video;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update video');
    }
  }
);

export const deleteVideo = createAsyncThunk(
  'courses/deleteVideo',
  async ({ courseId, videoId }, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/courses/${courseId}/videos/${videoId}`);
      return videoId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete video');
    }
  }
);

// Assignment thunks
export const addAssignment = createAsyncThunk(
  'courses/addAssignment',
  async ({ courseId, moduleId, assignmentData }, { rejectWithValue }) => {
    try {
      // If no moduleId provided, return error
      if (!moduleId) {
        return rejectWithValue('Module ID is required to add assignments');
      }

      const response = await axios.post(
        `${API_URL}/courses/${courseId}/modules/${moduleId}/assignments`,
        {
          title: assignmentData.title,
          instructions: assignmentData.instructions,
          description: assignmentData.description || '',
          dueDate: assignmentData.dueDate || null
        }
      );
      return response.data.assignment;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add assignment');
    }
  }
);

export const getCourseAssignments = createAsyncThunk(
  'courses/getCourseAssignments',
  async (courseId, { rejectWithValue }) => {
    try {
      // Assignments are fetched per module, not per course
      // This thunk returns empty array to prevent 404 errors
      return [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch assignments');
    }
  }
);

export const updateAssignment = createAsyncThunk(
  'courses/updateAssignment',
  async ({ courseId, assignmentId, assignmentData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/courses/${courseId}/assignments/${assignmentId}`, assignmentData);
      return response.data.assignment;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update assignment');
    }
  }
);

export const deleteAssignment = createAsyncThunk(
  'courses/deleteAssignment',
  async ({ courseId, assignmentId }, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/courses/${courseId}/assignments/${assignmentId}`);
      return assignmentId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete assignment');
    }
  }
);

// Module thunks
export const createModule = createAsyncThunk(
  'courses/createModule',
  async ({ courseId, moduleData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/courses/${courseId}/modules`, moduleData);
      return response.data.module;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create module');
    }
  }
);

export const getCourseModules = createAsyncThunk(
  'courses/getCourseModules',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/courses/${courseId}/modules`);
      return response.data.modules;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch modules');
    }
  }
);

export const getModuleById = createAsyncThunk(
  'courses/getModuleById',
  async ({ courseId, moduleId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/courses/${courseId}/modules/${moduleId}`);
      return response.data.module;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch module');
    }
  }
);

export const updateModule = createAsyncThunk(
  'courses/updateModule',
  async ({ courseId, moduleId, moduleData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/courses/${courseId}/modules/${moduleId}`, moduleData);
      return response.data.module;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update module');
    }
  }
);

export const deleteModule = createAsyncThunk(
  'courses/deleteModule',
  async ({ courseId, moduleId }, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/courses/${courseId}/modules/${moduleId}`);
      return moduleId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete module');
    }
  }
);

// Video upload thunk
export const uploadVideo = createAsyncThunk(
  'courses/uploadVideo',
  async ({ courseId, moduleId, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/courses/${courseId}/modules/${moduleId}/videos/upload`,
        formData
      );
      return response.data.video;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload video');
    }
  }
);

// Get module videos thunk
export const getModuleVideos = createAsyncThunk(
  'courses/getModuleVideos',
  async ({ courseId, moduleId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/courses/${courseId}/modules/${moduleId}/videos`);
      return response.data.videos;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch module videos');
    }
  }
);

// Get module assignments thunk
export const getModuleAssignments = createAsyncThunk(
  'courses/getModuleAssignments',
  async ({ courseId, moduleId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/courses/${courseId}/modules/${moduleId}/assignments`);
      return response.data.assignments;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch module assignments');
    }
  }
);

// Get demo video thunk (public)
export const getDemoVideo = createAsyncThunk(
  'courses/getDemoVideo',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/courses/${courseId}/demo/public`);
      return response.data.demo;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch demo video');
    }
  }
);

// Add video to module thunk
export const addVideoToModule = createAsyncThunk(
  'courses/addVideoToModule',
  async ({ courseId, moduleId, videoData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/courses/${courseId}/modules/${moduleId}/videos`,
        videoData
      );
      return response.data.video;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add video to module');
    }
  }
);

// Add assignment to module thunk
export const addAssignmentToModule = createAsyncThunk(
  'courses/addAssignmentToModule',
  async ({ courseId, moduleId, assignmentData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/courses/${courseId}/modules/${moduleId}/assignments`,
        assignmentData
      );
      return response.data.assignment;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add assignment to module');
    }
  }
);

// Update video in module thunk
export const updateVideoInModule = createAsyncThunk(
  'courses/updateVideoInModule',
  async ({ courseId, moduleId, videoId, videoData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/courses/${courseId}/modules/${moduleId}/videos/${videoId}`,
        videoData
      );
      return response.data.video;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update video');
    }
  }
);

// Delete video from module thunk
export const deleteVideoFromModule = createAsyncThunk(
  'courses/deleteVideoFromModule',
  async ({ courseId, moduleId, videoId }, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${API_URL}/courses/${courseId}/modules/${moduleId}/videos/${videoId}`
      );
      return videoId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete video');
    }
  }
);

// Update assignment in module thunk
export const updateAssignmentInModule = createAsyncThunk(
  'courses/updateAssignmentInModule',
  async ({ courseId, moduleId, assignmentId, assignmentData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/courses/${courseId}/modules/${moduleId}/assignments/${assignmentId}`,
        assignmentData
      );
      return response.data.assignment;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update assignment');
    }
  }
);

// Delete assignment from module thunk
export const deleteAssignmentFromModule = createAsyncThunk(
  'courses/deleteAssignmentFromModule',
  async ({ courseId, moduleId, assignmentId }, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${API_URL}/courses/${courseId}/modules/${moduleId}/assignments/${assignmentId}`
      );
      return assignmentId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete assignment');
    }
  }
);

const initialState = {
  courses: [],
  currentCourse: null,
  modules: [],
  currentModule: null,
  videos: [],
  assignments: [],
  demoVideo: null,
  isLoading: false,
  error: null,
  success: null
};

const courseSlice = createSlice({
  name: 'courses',
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
    // Create Course
    builder
      .addCase(createCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses.push(action.payload);
        state.success = 'Course created successfully';
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get Tutor Courses
    builder
      .addCase(getTutorCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTutorCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = action.payload;
      })
      .addCase(getTutorCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get Course By ID
    builder
      .addCase(getCourseById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCourseById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCourse = action.payload;
        state.videos = action.payload.videos || [];
        state.assignments = action.payload.assignments || [];
      })
      .addCase(getCourseById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update Course
    builder
      .addCase(updateCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCourse = action.payload;
        const index = state.courses.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.courses[index] = action.payload;
        }
        state.success = 'Course updated successfully';
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Delete Course
    builder
      .addCase(deleteCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = state.courses.filter(c => c.id !== action.payload);
        state.currentCourse = null;
        state.success = 'Course deleted successfully';
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Publish Course
    builder
      .addCase(publishCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(publishCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCourse = action.payload;
        const index = state.courses.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.courses[index] = action.payload;
        }
        state.success = 'Course published successfully';
      })
      .addCase(publishCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Add Video
    builder
      .addCase(addVideo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addVideo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.videos.push(action.payload);
        state.success = 'Video added successfully';
      })
      .addCase(addVideo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get Course Videos
    builder
      .addCase(getCourseVideos.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCourseVideos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.videos = action.payload;
      })
      .addCase(getCourseVideos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update Video
    builder
      .addCase(updateVideo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateVideo.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.videos.findIndex(v => v.id === action.payload.id);
        if (index !== -1) {
          state.videos[index] = action.payload;
        }
        state.success = 'Video updated successfully';
      })
      .addCase(updateVideo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Delete Video
    builder
      .addCase(deleteVideo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteVideo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.videos = state.videos.filter(v => v.id !== action.payload);
        state.success = 'Video deleted successfully';
      })
      .addCase(deleteVideo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Add Assignment
    builder
      .addCase(addAssignment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addAssignment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assignments.push(action.payload);
        state.success = 'Assignment added successfully';
      })
      .addCase(addAssignment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get Course Assignments
    builder
      .addCase(getCourseAssignments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCourseAssignments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assignments = action.payload;
      })
      .addCase(getCourseAssignments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update Assignment
    builder
      .addCase(updateAssignment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAssignment.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.assignments.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.assignments[index] = action.payload;
        }
        state.success = 'Assignment updated successfully';
      })
      .addCase(updateAssignment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Delete Assignment
    builder
      .addCase(deleteAssignment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAssignment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assignments = state.assignments.filter(a => a.id !== action.payload);
        state.success = 'Assignment deleted successfully';
      })
      .addCase(deleteAssignment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Create Module
    builder
      .addCase(createModule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createModule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = 'Module created successfully';
      })
      .addCase(createModule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get Course Modules
    builder
      .addCase(getCourseModules.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCourseModules.fulfilled, (state, action) => {
        state.isLoading = false;
        state.modules = action.payload;
      })
      .addCase(getCourseModules.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get Module By ID
    builder
      .addCase(getModuleById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getModuleById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentModule = action.payload;
        state.videos = action.payload.videos || [];
        state.assignments = action.payload.assignments || [];
      })
      .addCase(getModuleById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update Module
    builder
      .addCase(updateModule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateModule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentModule = action.payload;
        state.success = 'Module updated successfully';
      })
      .addCase(updateModule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Delete Module
    builder
      .addCase(deleteModule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteModule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = 'Module deleted successfully';
      })
      .addCase(deleteModule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Upload Video
    builder
      .addCase(uploadVideo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadVideo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.videos.push(action.payload);
        state.success = 'Video uploaded successfully';
      })
      .addCase(uploadVideo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get Module Videos
    builder
      .addCase(getModuleVideos.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getModuleVideos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.videos = action.payload;
      })
      .addCase(getModuleVideos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get Module Assignments
    builder
      .addCase(getModuleAssignments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getModuleAssignments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assignments = action.payload;
      })
      .addCase(getModuleAssignments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get Demo Video
    builder
      .addCase(getDemoVideo.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDemoVideo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.demoVideo = action.payload;
      })
      .addCase(getDemoVideo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Add Video to Module
    builder
      .addCase(addVideoToModule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addVideoToModule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.videos.push(action.payload);
        state.success = 'Video added to module successfully';
      })
      .addCase(addVideoToModule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Add Assignment to Module
    builder
      .addCase(addAssignmentToModule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addAssignmentToModule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assignments.push(action.payload);
        state.success = 'Assignment added to module successfully';
      })
      .addCase(addAssignmentToModule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update Video in Module
    builder
      .addCase(updateVideoInModule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateVideoInModule.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.videos.findIndex(v => v.id === action.payload.id);
        if (index !== -1) {
          state.videos[index] = action.payload;
        }
        state.success = 'Video updated successfully';
      })
      .addCase(updateVideoInModule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Delete Video from Module
    builder
      .addCase(deleteVideoFromModule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteVideoFromModule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.videos = state.videos.filter(v => v.id !== action.payload);
        state.success = 'Video deleted successfully';
      })
      .addCase(deleteVideoFromModule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update Assignment in Module
    builder
      .addCase(updateAssignmentInModule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAssignmentInModule.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.assignments.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.assignments[index] = action.payload;
        }
        state.success = 'Assignment updated successfully';
      })
      .addCase(updateAssignmentInModule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Delete Assignment from Module
    builder
      .addCase(deleteAssignmentFromModule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAssignmentFromModule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assignments = state.assignments.filter(a => a.id !== action.payload);
        state.success = 'Assignment deleted successfully';
      })
      .addCase(deleteAssignmentFromModule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearSuccess } = courseSlice.actions;
export default courseSlice.reducer;
