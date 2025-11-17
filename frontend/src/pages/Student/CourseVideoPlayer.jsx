import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, CheckCircle, Clock, BookOpen, FileText, Download, Eye, X, Share2 } from 'lucide-react';
import VideoPlayer from '../../components/VideoPlayer';
import { CourseVideoPlayerSkeleton } from '../../components/SkeletonLoaders';
import axios from 'axios';

const CourseVideoPlayer = () => {
  const { courseId, moduleId, videoId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);
  const isDark = mode === 'dark';

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [studentSubmission, setStudentSubmission] = useState(null);
  const [loadingSubmission, setLoadingSubmission] = useState(false);
  const fetchAbortControllerRef = React.useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  // Fetch course details and modules
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // Cancel previous request if still pending
        if (fetchAbortControllerRef.current) {
          fetchAbortControllerRef.current.abort();
        }
        
        fetchAbortControllerRef.current = new AbortController();
        setLoading(true);
        
        const response = await axios.get(
          `${API_URL}/student/courses/${courseId}`,
          { 
            headers: { Authorization: `Bearer ${token}` },
            signal: fetchAbortControllerRef.current.signal
          }
        );

        console.log('Course data:', response.data.course);
        console.log('📊 Modules:', response.data.course.modules);
        response.data.course.modules?.forEach((mod, idx) => {
          console.log(`📌 Module ${idx} (${mod.title}):`, {
            videos: mod.videos?.length || 0,
            assignments: mod.assignments?.length || 0,
            videoList: mod.videos,
            assignmentList: mod.assignments
          });
        });
        setCourse(response.data.course);
        setModules(response.data.course.modules || []);

        // Auto-expand all modules
        if (response.data.course.modules?.length > 0) {
          const expandedState = {};
          response.data.course.modules.forEach(module => {
            expandedState[module.id] = true;
          });
          setExpandedModules(expandedState);
        }

        // Set current video
        if (videoId) {
          const video = findVideoById(response.data.course.modules, videoId);
          if (video) {
            console.log('Setting video by ID:', video);
            setCurrentVideo(video);
          }
        } else if (response.data.course.modules?.length > 0) {
          // Find first video with valid URL
          let firstVideo = null;
          for (const module of response.data.course.modules) {
            if (module.videos?.length > 0) {
              firstVideo = module.videos.find(v => v.video_url || v.url);
              if (firstVideo) break;
            }
          }
          
          if (firstVideo) {
            console.log('Setting first video:', firstVideo);
            console.log('Video URL:', firstVideo.video_url || firstVideo.url);
            setCurrentVideo(firstVideo);
          } else {
            console.warn('No videos with valid URLs found');
          }
        }
      } catch (err) {
        // Ignore CanceledError - it's expected when request is aborted
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
          console.log('ℹ️ Previous request canceled (expected behavior)');
          return;
        }
        console.error('❌ Error fetching course:', err.message);
        setError('Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) fetchCourseData();

    // Cleanup: cancel request on unmount
    return () => {
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
      }
    };
  }, [courseId, videoId, API_URL, token]);

  // Find video by ID in modules
  const findVideoById = (modules, id) => {
    for (const module of modules) {
      const video = module.videos?.find(v => v.id === id);
      if (video) return video;
    }
    return null;
  };

  // Toggle module expansion
  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  // Select video
  const selectVideo = (video) => {
    setCurrentVideo(video);
    setCurrentAssignment(null);
    navigate(`/student/course/${courseId}/video/${video.id}`);
  };

  // Select assignment and fetch submission
  const selectAssignment = async (assignment) => {
    setCurrentAssignment(assignment);
    setCurrentVideo(null);
    setShowSubmissionForm(false);
    setSubmissionText('');
    setSubmissionFile(null);
    setStudentSubmission(null);

    // Log assignment info
    console.log('📋 ========== ASSIGNMENT INFO ==========');
    console.log('📌 Assignment ID:', assignment.id);
    console.log('📌 Title:', assignment.title);
    console.log('📌 Description:', assignment.description);
    console.log('📌 Instructions:', assignment.instructions);
    console.log('📌 Due Date:', assignment.due_date ? new Date(assignment.due_date).toLocaleString() : 'No due date');
    console.log('📌 Course:', course?.name);
    console.log('📌 Module:', modules.find(m => m.assignments?.some(a => a.id === assignment.id))?.title);
    console.log('📋 =====================================');

    // Fetch student's submission for this assignment
    try {
      setLoadingSubmission(true);
      const response = await axios.get(
        `${API_URL}/student/assignments/${assignment.id}/submissions`,
        { withCredentials: true }
      );
      
      if (response.data.submissions && response.data.submissions.length > 0) {
        const submission = response.data.submissions[0];
        setStudentSubmission(submission);
        
        // Log submission info
        console.log('📝 ========== SUBMISSION INFO ==========');
        console.log('📝 Submission ID:', submission.id);
        console.log('📝 Student ID:', submission.student_id);
        console.log('📝 Submission Text:', submission.submission_text);
        console.log('📝 File URL:', submission.file_url);
        console.log('📝 Status:', submission.status);
        console.log('📝 Submitted At:', new Date(submission.submitted_at).toLocaleString());
        console.log('📝 Score:', submission.score || 'Not graded');
        console.log('📝 Feedback:', submission.feedback || 'No feedback');
        console.log('📝 =====================================');
      } else {
        console.log('⚠️ No submission found for this assignment');
      }
    } catch (err) {
      console.log('⚠️ Error fetching submission:', err.message);
    } finally {
      setLoadingSubmission(false);
    }
  };

  // Download assignment as text file
  const downloadAssignment = () => {
    if (!currentAssignment) return;

    const content = `
ASSIGNMENT: ${currentAssignment.title}
Course: ${course?.name || 'Unknown Course'}
Due Date: ${currentAssignment.due_date ? new Date(currentAssignment.due_date).toLocaleDateString() : 'No due date'}

DESCRIPTION:
${currentAssignment.description || 'No description available'}

INSTRUCTIONS:
${currentAssignment.instructions || 'No instructions provided'}

---
Downloaded on: ${new Date().toLocaleString()}
    `.trim();

    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${currentAssignment.title.replace(/\s+/g, '_')}_assignment.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  };

  // Handle file preview
  const handleFilePreview = (file) => {
    const fileType = file.type;
    const fileName = file.name;
    
    if (fileType === 'application/pdf') {
      // For PDF, create a URL to display
      const fileUrl = URL.createObjectURL(file);
      setFilePreview({ url: fileUrl, type: 'pdf', name: fileName });
      setShowFilePreview(true);
    } else if (fileType.includes('word') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      // For DOCX, show download option
      setFilePreview({ url: URL.createObjectURL(file), type: 'docx', name: fileName });
      setShowFilePreview(true);
    } else if (fileType.includes('sheet') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // For Excel
      setFilePreview({ url: URL.createObjectURL(file), type: 'excel', name: fileName });
      setShowFilePreview(true);
    } else {
      // For other files, just show info
      setFilePreview({ url: null, type: 'other', name: fileName });
      setShowFilePreview(true);
    }
  };

  // Handle assignment submission
  const handleSubmitAssignment = async () => {
    if (!submissionText.trim() && !submissionFile) {
      alert('Please enter submission text or upload a file');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create FormData for file upload if file exists
      const formData = new FormData();
      formData.append('submissionText', submissionText);
      if (submissionFile) {
        formData.append('file', submissionFile);
      }

      const response = await axios.post(
        `${API_URL}/student/assignments/${currentAssignment.id}/submit`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        alert('Assignment submitted successfully!');
        setShowSubmissionForm(false);
        setSubmissionText('');
        setSubmissionFile(null);
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('Failed to submit assignment: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle video progress
  const handleVideoProgress = async (currentTime) => {
    try {
      // Only save progress every 5 seconds to avoid too many requests
      if (Math.floor(currentTime) % 5 !== 0) return;
      
      // Get enrollment for this course
      if (!course?.enrollments?.[0]?.id) {
        console.log('No enrollment found for this course');
        return;
      }

      const enrollmentId = course.enrollments[0].id;
      
      await axios.post(
        `${API_URL}/student/enrollments/${enrollmentId}/videos/${currentVideo.id}/watch`,
        {
          currentTime,
          duration: currentVideo.duration
        },
        { withCredentials: true }
      );
      
      console.log(`✅ Video progress saved: ${Math.floor(currentTime)}s`);
    } catch (err) {
      // Silently fail - don't spam console with errors
      if (err.response?.status !== 404) {
        console.error('Error saving progress:', err.message);
      }
    }
  };

  if (loading) {
    return <CourseVideoPlayerSkeleton isDark={isDark} />;
  }

  if (error || !course) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-6 flex items-center justify-center`}>
        <div className="text-center">
          <p className={`text-lg font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
            {error || 'Course not found'}
          </p>
          <button
            onClick={() => navigate('/student/courses')}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate('/student/courses')}
            className={`text-sm font-semibold ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} mb-4`}
          >
            ← Back to Courses
          </button>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {course.name}
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Instructor: {course.tutor?.name || 'Unknown'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Player */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2"
          >
            {currentVideo ? (
              <>
                <VideoPlayer
                  videoUrl={currentVideo.video_url || currentVideo.url || ''}
                  videoTitle={currentVideo.title}
                  courseTitle={course.name}
                  onProgress={handleVideoProgress}
                  duration={currentVideo.duration || 0}
                />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`mt-6 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
                >
                  <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {currentVideo.title}
                  </h2>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                    {currentVideo.description || 'No description available'}
                  </p>
                  <div className="flex items-center gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        {currentVideo.duration ? Math.floor(currentVideo.duration / 60) : 0} minutes
                      </span>
                    </div>
                  </div>
                </motion.div>
              </>
            ) : currentAssignment ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`p-8 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg space-y-6`}
              >
                {!showSubmissionForm ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText size={32} className="text-green-500" />
                        <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {currentAssignment.title}
                        </h2>
                      </div>
                      <button
                        onClick={downloadAssignment}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                        title="Download assignment details"
                      >
                        <Download size={18} />
                        <span className="hidden sm:inline">Download</span>
                      </button>
                    </div>
                    
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <h3 className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        Assignment Details
                      </h3>
                      <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed whitespace-pre-wrap`}>
                        {currentAssignment.description || 'No description available'}
                      </p>
                    </div>

                    {currentAssignment.due_date && (
                      <div className={`p-4 rounded-lg border-l-4 border-orange-500 ${isDark ? 'bg-orange-900/20' : 'bg-orange-50'}`}>
                        <p className={`font-semibold ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
                          Due Date: {new Date(currentAssignment.due_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {/* Display Student Submission if exists */}
                    {loadingSubmission ? (
                      <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading submission...</p>
                      </div>
                    ) : studentSubmission ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg border-l-4 border-green-500 ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}
                      >
                        <h3 className={`font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                          <CheckCircle size={20} />
                          Your Submission
                        </h3>
                        
                        {studentSubmission.submission_text && (
                          <div className={`mb-3 p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                            <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              Text Submission:
                            </p>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} whitespace-pre-wrap`}>
                              {studentSubmission.submission_text}
                            </p>
                          </div>
                        )}

                        {studentSubmission.file_url && (
                          <div className={`p-3 rounded flex items-center justify-between ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                            <div className="flex items-center gap-2">
                              <FileText size={18} className="text-blue-500" />
                              <div>
                                <p className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Uploaded File
                                </p>
                                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                  {studentSubmission.file_url.split('/').pop()}
                                </p>
                              </div>
                            </div>
                            <a
                              href={`${API_URL.replace('/api', '')}${studentSubmission.file_url}`}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-all"
                            >
                              <Download size={16} />
                              Download
                            </a>
                          </div>
                        )}

                        <p className={`text-xs mt-3 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          Submitted: {new Date(studentSubmission.submitted_at).toLocaleString()}
                        </p>
                      </motion.div>
                    ) : null}

                    <button 
                      onClick={() => setShowSubmissionForm(true)}
                      className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all cursor-pointer"
                    >
                      {studentSubmission ? 'Update Submission' : 'Submit Assignment'}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <FileText size={32} className="text-green-500" />
                      <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Submit: {currentAssignment.title}
                      </h2>
                    </div>

                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        Your Submission
                      </label>
                      <textarea
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                        placeholder="Enter your assignment submission here..."
                        className={`w-full h-40 p-3 rounded-lg border ${
                          isDark 
                            ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-green-500`}
                      />
                    </div>

                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        Upload File (Optional)
                      </label>
                      <input
                        type="file"
                        onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                        className={`w-full p-2 rounded-lg border ${
                          isDark 
                            ? 'bg-gray-600 border-gray-500 text-gray-300' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                      {submissionFile && (
                        <div className="flex items-center justify-between mt-2">
                          <p className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                            ✓ File selected: {submissionFile.name}
                          </p>
                          <button
                            onClick={() => handleFilePreview(submissionFile)}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-all"
                          >
                            <Eye size={16} />
                            Preview
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowSubmissionForm(false)}
                        className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                          isDark
                            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmitAssignment}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ) : (
              <div className={`p-12 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  Select a video or assignment to view
                </p>
              </div>
            )}
          </motion.div>

          {/* Sidebar - Modules and Videos */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}
          >
            <div className={`p-4 border-b ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
              <h3 className={`font-bold text-lg flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <BookOpen size={20} />
                Course Content
              </h3>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {modules.length} modules • {modules.reduce((sum, m) => sum + (m.videos?.length || 0), 0)} videos • {modules.reduce((sum, m) => sum + (m.assignments?.length || 0), 0)} tasks
              </p>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              {modules.map((module) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  {/* Module Header */}
                  <button
                    onClick={() => toggleModule(module.id)}
                    className={`w-full p-4 flex items-center justify-between hover:${
                      isDark ? 'bg-gray-700' : 'bg-gray-50'
                    } transition-colors`}
                  >
                    <div className="flex-1 text-left">
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {module.title}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {module.videos?.length || 0} videos
                      </p>
                    </div>
                    {expandedModules[module.id] ? (
                      <ChevronUp size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                    ) : (
                      <ChevronDown size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                    )}
                  </button>

                  {/* Videos List */}
                  {expandedModules[module.id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`${isDark ? 'bg-gray-750' : 'bg-gray-50'}`}
                    >
                      {/* Videos */}
                      {module.videos?.map((video) => (
                        <button
                          key={video.id}
                          onClick={() => selectVideo(video)}
                          className={`w-full p-3 pl-8 text-left flex items-start gap-3 hover:${
                            isDark ? 'bg-gray-700' : 'bg-gray-100'
                          } transition-colors border-l-4 ${
                            currentVideo?.id === video.id
                              ? 'border-blue-500 bg-blue-500/10'
                              : isDark
                              ? 'border-gray-700'
                              : 'border-gray-200'
                          }`}
                        >
                          <CheckCircle
                            size={16}
                            className={`mt-1 flex-shrink-0 ${
                              currentVideo?.id === video.id
                                ? 'text-blue-500'
                                : isDark
                                ? 'text-gray-600'
                                : 'text-gray-400'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium truncate ${
                                currentVideo?.id === video.id
                                  ? isDark
                                    ? 'text-blue-400'
                                    : 'text-blue-600'
                                  : isDark
                                  ? 'text-gray-300'
                                  : 'text-gray-700'
                              }`}
                            >
                              {video.title}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                              {Math.floor(video.duration / 60)} min
                            </p>
                          </div>
                        </button>
                      ))}

                      {/* Assignments/Tasks */}
                      {module.assignments?.map((assignment) => (
                        <button
                          key={assignment.id}
                          onClick={() => selectAssignment(assignment)}
                          className={`w-full p-3 pl-8 text-left flex items-start gap-3 hover:${
                            isDark ? 'bg-gray-700' : 'bg-gray-100'
                          } transition-colors border-l-4 ${
                            currentAssignment?.id === assignment.id
                              ? 'border-green-500 bg-green-500/10'
                              : 'border-green-500'
                          }`}
                        >
                          <FileText
                            size={16}
                            className={`mt-1 flex-shrink-0 ${
                              currentAssignment?.id === assignment.id
                                ? 'text-green-500'
                                : 'text-green-500'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              currentAssignment?.id === assignment.id
                                ? isDark ? 'text-green-400' : 'text-green-600'
                                : isDark ? 'text-green-400' : 'text-green-600'
                            }`}>
                              {assignment.title}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                              Assignment
                            </p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* File Preview Modal */}
      {showFilePreview && filePreview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowFilePreview(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className={`rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${
              isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center gap-2">
                <FileText size={24} className="text-blue-500" />
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {filePreview.name}
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {filePreview.type.toUpperCase()} File
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFilePreview(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all"
              >
                <X size={24} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {filePreview.type === 'pdf' ? (
                <iframe
                  src={filePreview.url}
                  className="w-full h-[600px] rounded-lg border"
                  title="PDF Preview"
                />
              ) : filePreview.type === 'docx' ? (
                <div className={`p-8 rounded-lg text-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <FileText size={48} className="mx-auto mb-4 text-blue-500" />
                  <p className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {filePreview.name}
                  </p>
                  <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    DOCX files cannot be previewed directly in the browser.
                  </p>
                  <a
                    href={filePreview.url}
                    download={filePreview.name}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                  >
                    <Download size={18} />
                    Download File
                  </a>
                </div>
              ) : filePreview.type === 'excel' ? (
                <div className={`p-8 rounded-lg text-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <FileText size={48} className="mx-auto mb-4 text-green-500" />
                  <p className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {filePreview.name}
                  </p>
                  <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Excel files cannot be previewed directly in the browser.
                  </p>
                  <a
                    href={filePreview.url}
                    download={filePreview.name}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                  >
                    <Download size={18} />
                    Download File
                  </a>
                </div>
              ) : (
                <div className={`p-8 rounded-lg text-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <FileText size={48} className="mx-auto mb-4 text-gray-500" />
                  <p className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {filePreview.name}
                  </p>
                  <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    This file type cannot be previewed in the browser.
                  </p>
                  <a
                    href={filePreview.url}
                    download={filePreview.name}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                  >
                    <Download size={18} />
                    Download File
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default CourseVideoPlayer;
