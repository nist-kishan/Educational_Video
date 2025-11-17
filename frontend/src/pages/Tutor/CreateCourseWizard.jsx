import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ChevronRight, ChevronLeft, BookOpen, Video, FileText, Users, Award, Clock, DollarSign, PlayCircle, CheckCircle, ArrowLeft, ArrowRight, Upload, File as FileIcon } from 'lucide-react';
import { createCourse, uploadVideo } from '../../store/courseSlice';
import { clearError, clearSuccess } from '../../store/authSlice';
import { Alert } from '../../components/UI';
import { SkeletonText } from '../../components/SkeletonLoader';

const CreateCourseWizard = memo(() => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mode } = useSelector((state) => state.theme);
  const { isLoading, error, success } = useSelector((state) => state.courses);
  const isDark = mode === 'dark';

  const bgClass = isDark ? 'bg-gray-900' : 'bg-white';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';
  const inputBg = isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900';
  const hoverClass = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100';
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-200';
  const tagBg = isDark ? 'bg-blue-900' : 'bg-blue-100';
  const tagText = isDark ? 'text-blue-200' : 'text-blue-700';

  const [currentStep, setCurrentStep] = useState(0);
  const [courseData, setCourseData] = useState({
    name: '',
    playlist_name: '',
    description: '',
    price: 0,
    category: '',
    prerequisites: [],
    syllabus: [],
    motive: ''
  });

  const [modules, setModules] = useState([]);
  const [editingModuleIdx, setEditingModuleIdx] = useState(null);
  const [moduleForm, setModuleForm] = useState({ title: '', description: '', videos: [], assignments: [] });
  const [videoForm, setVideoForm] = useState({ title: '', description: '', duration: 0, isDemo: false, file: null });
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', instructions: '', dueDate: '', attachmentType: 'none', file: null });
  const [assignmentUploadType, setAssignmentUploadType] = useState('none');
  const assignmentFileInputRef = useRef(null);
  const [prerequisiteInput, setPrerequisiteInput] = useState('');
  const [syllabusInput, setSyllabusInput] = useState('');
  const videoInputRef = useCallback(() => {}, []);
  const assignmentInputRef = useCallback(() => {}, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
    percentage: 0,
    videoName: '',
    videoIndex: 0
  });

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => dispatch(clearSuccess()), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  const handleCourseChange = useCallback((e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  }, []);

  const addPrerequisite = useCallback(() => {
    if (prerequisiteInput.trim()) {
      setCourseData(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, prerequisiteInput.trim()]
      }));
      setPrerequisiteInput('');
    }
  }, [prerequisiteInput]);

  const removePrerequisite = useCallback((index) => {
    setCourseData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index)
    }));
  }, []);

  const addSyllabus = useCallback(() => {
    if (syllabusInput.trim()) {
      setCourseData(prev => ({
        ...prev,
        syllabus: [...prev.syllabus, syllabusInput.trim()]
      }));
      setSyllabusInput('');
    }
  }, [syllabusInput]);

  const removeSyllabus = useCallback((index) => {
    setCourseData(prev => ({
      ...prev,
      syllabus: prev.syllabus.filter((_, i) => i !== index)
    }));
  }, []);

  const addModule = useCallback(() => {
    if (moduleForm.title.trim()) {
      if (editingModuleIdx !== null) {
        setModules(prev => {
          const updated = [...prev];
          updated[editingModuleIdx] = moduleForm;
          return updated;
        });
        setEditingModuleIdx(null);
      } else {
        setModules(prev => [...prev, { ...moduleForm, id: Date.now() }]);
      }
      setModuleForm({ title: '', description: '', videos: [], assignments: [] });
    }
  }, [moduleForm, editingModuleIdx]);

  const editModule = useCallback((index) => {
    setEditingModuleIdx(index);
    setModuleForm(modules[index]);
  }, [modules]);

  const removeModule = useCallback((index) => {
    setModules(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addVideo = useCallback(() => {
    if (videoForm.title.trim() && videoForm.duration > 0 && videoForm.file) {
      setModuleForm(prev => ({
        ...prev,
        videos: [...prev.videos, { ...videoForm, id: Date.now() }]
      }));
      setVideoForm({ title: '', description: '', duration: 0, isDemo: false, file: null });
    } else {
      alert('Please fill title, duration, and select a video file');
    }
  }, [videoForm]);

  const removeVideo = useCallback((index) => {
    setModuleForm(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
  }, []);

  const addAssignment = useCallback(() => {
    if (assignmentForm.title.trim() && assignmentForm.instructions.trim()) {
      setModuleForm(prev => ({
        ...prev,
        assignments: [...prev.assignments, { ...assignmentForm, id: Date.now() }]
      }));
      setAssignmentForm({ title: '', description: '', instructions: '', dueDate: '', attachmentType: 'none', file: null });
      setAssignmentUploadType('none');
    }
  }, [assignmentForm]);

  const removeAssignment = useCallback((index) => {
    setModuleForm(prev => ({
      ...prev,
      assignments: prev.assignments.filter((_, i) => i !== index)
    }));
  }, []);

  const canProceed = useCallback(() => {
    if (currentStep === 0) {
      return courseData.name && courseData.playlist_name && courseData.description && courseData.category;
    }
    if (currentStep === 1) {
      return modules.length > 0;
    }
    return true;
  }, [currentStep, courseData, modules]);

  const handleNext = useCallback(() => {
    if (canProceed() && currentStep < 2) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, canProceed]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitStatus('Creating course...');
    try {
      console.log('📊 Current modules state:', modules);
      console.log('📊 Modules count:', modules.length);

      // Check if modules exist
      if (modules.length === 0) {
        console.error('❌ No modules added. Please add at least one module.');
        alert('Please add at least one module before creating the course.');
        setSubmitStatus('Please add at least one module before creating the course.');
        setIsSubmitting(false);
        return;
      }

      const totalVideos = modules.reduce((sum, m) => sum + (m.videos?.length || 0), 0);
      const totalAssignments = modules.reduce((sum, m) => sum + (m.assignments?.length || 0), 0);
      let processedVideos = 0;
      let processedAssignments = 0;
      const failedModules = [];
      const failedVideos = [];
      const failedAssignments = [];

      // First create the course without modules
      const coursePayload = {
        ...courseData,
        modules: [] // Create course without modules first
      };

      console.log('📤 Creating course first:', coursePayload);
      const courseResponse = await dispatch(createCourse(coursePayload)).unwrap();
      const createdCourse = courseResponse;

      console.log('✅ Course created successfully:', createdCourse);
      setSubmitStatus('Course created. Creating modules and uploading content...');

      // Now create modules and upload videos
      let moduleIndex = 0;
      for (const module of modules) {
        try {
          moduleIndex += 1;
          setSubmitStatus(`Processing module ${moduleIndex} of ${modules.length}...`);

          // Create module first
          console.log('🔑 Using httpOnly cookie for authentication');

          const moduleResponse = await fetch(`http://localhost:5000/api/courses/${createdCourse.id}/modules`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include', // Important for httpOnly cookies
            body: JSON.stringify({
              title: module.title,
              description: module.description
            })
          });

          if (!moduleResponse.ok) {
            const errorData = await moduleResponse.json().catch(() => ({}));
            console.error('❌ Module creation failed:', moduleResponse.status, errorData);
            failedModules.push(module.title || 'Untitled module');
            continue;
          }

          const createdModule = await moduleResponse.json();
          console.log('✅ Module created successfully:', createdModule);
          
          // Extract module ID from response
          const moduleId = createdModule.module?.id || createdModule.id;
          if (!moduleId) {
            console.error('❌ Module ID not found in response:', createdModule);
            failedModules.push(module.title || 'Untitled module');
            continue;
          }
          console.log('🆔 Module ID:', moduleId);

          // Upload videos for this module
          for (const video of module.videos) {
            if (video.file) {
              try {
                // Show 0% before upload starts
                setUploadProgress({
                  current: processedVideos,
                  total: totalVideos,
                  percentage: 0,
                  videoName: video.title,
                  videoIndex: processedVideos + 1
                });
                
                setSubmitStatus(`0% completed - ${video.title}`);
                console.log('📤 Uploading video:', video.title);

                const formData = new FormData();
                formData.append('file', video.file);
                formData.append('title', video.title);
                formData.append('description', video.description || '');
                formData.append('isDemo', video.isDemo || false);

                const uploadedVideo = await dispatch(uploadVideo({
                  courseId: createdCourse.id,
                  moduleId: moduleId,
                  formData
                })).unwrap();

                // Show 100% after upload completes
                processedVideos += 1;
                const percentage = Math.round((processedVideos / totalVideos) * 100);
                
                setUploadProgress({
                  current: processedVideos,
                  total: totalVideos,
                  percentage: percentage,
                  videoName: video.title,
                  videoIndex: processedVideos
                });
                
                setSubmitStatus(`${percentage}% completed - ${video.title}`);
                console.log('✅ Video uploaded successfully:', uploadedVideo);
              } catch (videoError) {
                console.error('❌ Video upload failed:', videoError);
                failedVideos.push(video.title || 'Untitled video');
              }
            }
          }

          // Create assignments for this module
          for (const assignment of module.assignments) {
            try {
              // Ensure instructions meet minimum length requirement
              const instructions = assignment.instructions || `Please complete the assignment: ${assignment.title}`;
              const dueDate = assignment.dueDate ? new Date(assignment.dueDate).toISOString() : null;

              setSubmitStatus(
                totalAssignments > 0
                  ? `Creating assignment ${processedAssignments + 1} of ${totalAssignments}...`
                  : 'Creating assignments...'
              );

              const assignmentResponse = await fetch(
                `http://localhost:5000/api/courses/${createdCourse.id}/modules/${moduleId}/assignments`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  credentials: 'include', // Important for httpOnly cookies
                  body: JSON.stringify({
                    title: assignment.title,
                    description: assignment.description || '',
                    instructions: instructions,
                    dueDate
                  })
                }
              );

              if (assignmentResponse.ok) {
                const createdAssignment = await assignmentResponse.json();
                processedAssignments += 1;
                console.log('✅ Assignment created successfully:', createdAssignment);
              } else {
                const errorData = await assignmentResponse.json().catch(() => ({}));
                console.error('❌ Assignment creation failed (response not ok):', assignmentResponse.status, errorData);
                failedAssignments.push(assignment.title || 'Untitled assignment');
              }
            } catch (assignmentError) {
              console.error('❌ Assignment creation failed:', assignmentError);
              failedAssignments.push(assignment.title || 'Untitled assignment');
            }
          }
        } catch (moduleError) {
          console.error('❌ Module processing failed:', moduleError);
          failedModules.push(module.title || 'Untitled module');
        }
      }

      if (failedModules.length === 0 && failedVideos.length === 0 && failedAssignments.length === 0) {
        console.log('🎉 Course creation with modules, videos, and assignments completed!');
        setSubmitStatus('Course, videos, and assignments created successfully.');
        navigate('/tutor/courses');
      } else {
        const summaryParts = [];
        if (failedModules.length) summaryParts.push(`Modules: ${failedModules.join(', ')}`);
        if (failedVideos.length) summaryParts.push(`Videos: ${failedVideos.join(', ')}`);
        if (failedAssignments.length) summaryParts.push(`Assignments: ${failedAssignments.join(', ')}`);
        const summaryMessage = `Course created, but some items failed. ${summaryParts.join(' | ')}`;
        console.warn('⚠️', summaryMessage);
        setSubmitStatus(summaryMessage);
      }
    } catch (error) {
      console.error('❌ Course creation error:', error);
      setSubmitStatus(`Course creation failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [courseData, modules, dispatch, navigate]);

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className={`min-h-screen ${bgClass} py-6 sm:py-12 transition-colors duration-200 overflow-x-hidden`}>
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/tutor/courses')}
            className={`p-2 rounded-lg ${hoverClass} transition-colors flex-shrink-0`}
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.button>
          <div className="flex-1">
            <h1 className={`text-2xl sm:text-3xl font-bold ${textClass}`}>Create Course</h1>
            <p className={`${secondaryText} mt-1 text-sm sm:text-base`}>
              Step {currentStep + 1} of 3: {currentStep === 0 ? 'Course Info' : currentStep === 1 ? 'Add Modules' : 'Review'}
            </p>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {['Course Info', 'Add Modules', 'Review'].map((label, idx) => (
              <div key={idx} className="flex-1 mx-1">
                <div
                  className={`h-2 rounded-full transition-all ${
                    idx <= currentStep ? 'bg-blue-500' : isDark ? 'bg-gray-700' : 'bg-gray-300'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <Alert type="error" message={error} />
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <Alert type="success" message={success} />
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${cardBg} rounded-lg p-4 sm:p-6 lg:p-8 mb-6`}
          >
            <SkeletonText lines={5} />
          </motion.div>
        )}

        {/* Step 1: Course Info */}
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`${cardBg} rounded-lg p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 transition-colors duration-200`}
            >
              <h2 className={`text-xl sm:text-2xl font-bold ${textClass}`}>Course Information</h2>

              <div>
                <label className={`block text-sm font-medium ${textClass} mb-2`}>Course Name *</label>
                <input
                  type="text"
                  name="name"
                  value={courseData.name}
                  onChange={handleCourseChange}
                  placeholder="e.g., Advanced React"
                  className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textClass} mb-2`}>Playlist Name *</label>
                <input
                  type="text"
                  name="playlist_name"
                  value={courseData.playlist_name}
                  onChange={handleCourseChange}
                  placeholder="e.g., advanced_react"
                  pattern="^[a-zA-Z0-9_]+$"
                  className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textClass} mb-2`}>Description *</label>
                <textarea
                  name="description"
                  value={courseData.description}
                  onChange={handleCourseChange}
                  placeholder="Describe your course..."
                  rows="4"
                  className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${textClass} mb-2`}>Price ($) *</label>
                  <input
                    type="number"
                    name="price"
                    value={courseData.price}
                    onChange={handleCourseChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textClass} mb-2`}>Category *</label>
                  <select
                    name="category"
                    value={courseData.category}
                    onChange={handleCourseChange}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Select Category</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="Data Science">Data Science</option>
                    <option value="AI/ML">AI/ML</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textClass} mb-2`}>Motive</label>
                <textarea
                  name="motive"
                  value={courseData.motive}
                  onChange={handleCourseChange}
                  placeholder="What will students learn?"
                  rows="2"
                  className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textClass} mb-2`}>Prerequisites</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={prerequisiteInput}
                    onChange={(e) => setPrerequisiteInput(e.target.value)}
                    placeholder="Add prerequisite..."
                    className={`flex-1 px-4 py-2 rounded-lg border ${inputBg} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addPrerequisite}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <Plus className="w-5 h-5" />
                  </motion.button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {courseData.prerequisites.map((prereq, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`px-3 py-1 rounded-full ${isDark ? 'bg-blue-900' : 'bg-blue-100'} flex items-center gap-2`}
                    >
                      <span className={isDark ? 'text-blue-200' : 'text-blue-700'}>{prereq}</span>
                      <button onClick={() => removePrerequisite(idx)} className="text-sm">×</button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Add Modules */}
          {currentStep === 1 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`${cardBg} rounded-lg p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 w-full overflow-hidden`}
            >
              <h2 className={`text-xl sm:text-2xl font-bold ${textClass}`}>Add Modules</h2>

              {/* Module List */}
              <div className="space-y-3">
                {modules.map((mod, idx) => (
                  <motion.div
                    key={mod.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} cursor-pointer hover:shadow-lg transition-all`}
                    onClick={() => editModule(idx)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className={`font-semibold ${textClass}`}>{mod.title}</h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {mod.videos.length} videos • {mod.assignments.length} assignments
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeModule(idx);
                        }}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Module Form */}
              <div className={`p-3 sm:p-4 md:p-6 rounded-lg border-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-300'} w-full overflow-hidden`}>
                <h3 className={`font-semibold ${textClass} mb-3 sm:mb-4 text-sm sm:text-base`}>
                  {editingModuleIdx !== null ? 'Edit Module' : 'New Module'}
                </h3>

                <div className="space-y-3 sm:space-y-4">
                  <input
                    type="text"
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Module title..."
                    className={`w-full px-3 sm:px-4 py-2 rounded-lg border ${inputBg} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base`}
                  />

                  <textarea
                    value={moduleForm.description}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Module description..."
                    rows="2"
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                  />

                  {/* Videos */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className={`block text-sm font-medium ${textClass}`}>Videos ({moduleForm.videos.length})</label>
                    </div>
                    <div className="space-y-2 mb-3">
                      {moduleForm.videos.map((video, idx) => (
                        <div key={video.id} className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-gray-200'} flex justify-between items-center`}>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold ${textClass} text-sm`}>{video.title}</p>
                            <p className={`text-xs ${secondaryText}`}>{video.duration} sec</p>
                          </div>
                          <button onClick={() => removeVideo(idx)} className="text-red-500 hover:text-red-600 flex-shrink-0 ml-2">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2 p-3 rounded-lg border-2 border-dashed ${isDark ? 'border-gray-600 bg-gray-700/30' : 'border-gray-400 bg-gray-100/50'}">
                      <p className={`text-xs font-semibold ${textClass} mb-2`}>Add New Video</p>
                      <input
                        type="text"
                        value={videoForm.title}
                        onChange={(e) => setVideoForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Video title..."
                        className={`w-full px-3 py-2 rounded border ${inputBg} ${textClass} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      <input
                        type="number"
                        value={videoForm.duration}
                        onChange={(e) => setVideoForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                        placeholder="Duration (seconds)"
                        min="0"
                        className={`w-full px-3 py-2 rounded border ${inputBg} ${textClass} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setVideoForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                        className={`w-full px-3 py-2 rounded border ${inputBg} ${textClass} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {videoForm.file && (
                        <p className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'} font-semibold`}>
                          ✓ Selected: {videoForm.file.name}
                        </p>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={addVideo}
                        className="w-full px-4 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 font-semibold flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Video
                      </motion.button>
                    </div>
                  </div>

                  {/* Assignments */}
                  <div>
                    <label className={`block text-sm font-medium ${textClass} mb-2`}>Assignments ({moduleForm.assignments.length})</label>
                    <div className="space-y-2 mb-3">
                      {moduleForm.assignments.map((assignment, idx) => (
                        <div key={assignment.id} className={`p-2 rounded ${isDark ? 'bg-gray-600' : 'bg-gray-200'} flex justify-between items-center`}>
                          <span className={textClass}>{assignment.title}</span>
                          <button onClick={() => removeAssignment(idx)} className="text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={assignmentForm.title}
                        onChange={(e) => setAssignmentForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Assignment title..."
                        className={`w-full px-3 py-1 rounded border ${inputBg} ${textClass} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      <textarea
                        value={assignmentForm.instructions}
                        onChange={(e) => setAssignmentForm(prev => ({ ...prev, instructions: e.target.value }))}
                        placeholder="Assignment instructions..."
                        rows="2"
                        className={`w-full px-3 py-1 rounded border ${inputBg} ${textClass} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                      />
                      <input
                        type="datetime-local"
                        value={assignmentForm.dueDate}
                        onChange={(e) => setAssignmentForm(prev => ({ ...prev, dueDate: e.target.value }))}
                        placeholder="Due date (optional)"
                        className={`w-full px-3 py-1 rounded border ${inputBg} ${textClass} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {/* File Upload Options */}
                      <div className={`p-3 rounded-lg border-2 ${isDark ? 'border-gray-600 bg-gray-700/30' : 'border-gray-300 bg-gray-100/50'}`}>
                        <p className={`text-xs font-semibold ${textClass} mb-2`}>Attachment (Optional)</p>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setAssignmentUploadType('none')}
                            className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${assignmentUploadType === 'none' ? 'bg-purple-600 text-white' : isDark ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
                          >
                            None
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setAssignmentUploadType('pdf')}
                            className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${assignmentUploadType === 'pdf' ? 'bg-red-600 text-white' : isDark ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
                          >
                            PDF
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setAssignmentUploadType('file')}
                            className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${assignmentUploadType === 'file' ? 'bg-blue-600 text-white' : isDark ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
                          >
                            File
                          </motion.button>
                        </div>
                        {assignmentUploadType !== 'none' && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-2 rounded border-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-400'} text-center cursor-pointer hover:opacity-80 transition-opacity`}
                            onClick={() => assignmentFileInputRef.current?.click()}
                          >
                            <input
                              ref={assignmentFileInputRef}
                              type="file"
                              accept={assignmentUploadType === 'pdf' ? '.pdf' : '*'}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setAssignmentForm(prev => ({ ...prev, file, attachmentType: assignmentUploadType }));
                                }
                              }}
                              className="hidden"
                            />
                            <div className="flex flex-col items-center space-y-1">
                              {assignmentForm.file ? (
                                <>
                                  <FileIcon className="w-4 h-4 text-green-500" />
                                  <p className={`text-xs font-semibold ${textClass} break-all`}>{assignmentForm.file.name}</p>
                                  <p className={`text-xs ${secondaryText}`}>{(assignmentForm.file.size / 1024).toFixed(2)} KB</p>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 text-purple-500" />
                                  <p className={`text-xs font-semibold ${textClass}`}>Click to upload {assignmentUploadType === 'pdf' ? 'PDF' : 'file'}</p>
                                </>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={addAssignment}
                        className="w-full px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
                      >
                        <Plus className="w-4 h-4 inline mr-1" />
                        Add Assignment
                      </motion.button>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={addModule}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    {editingModuleIdx !== null ? 'Save Module' : 'Add Module'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {currentStep === 2 && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`${cardBg} rounded-lg p-8 space-y-6`}
            >
              <h2 className={`text-2xl font-bold ${textClass}`}>Review Course</h2>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold ${textClass} mb-2`}>{courseData.name}</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{courseData.description}</p>
                <p className={`text-sm font-medium ${textClass} mt-2`}>${courseData.price} • {courseData.category}</p>
              </div>

              <div>
                <h3 className={`font-semibold ${textClass} mb-3`}>Modules ({modules.length})</h3>
                <div className="space-y-2">
                  {modules.map((mod, idx) => (
                    <div
                      key={mod.id}
                      className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} space-y-2`}
                    >
                      <p className={`font-medium ${textClass}`}>{idx + 1}. {mod.title}</p>
                      {mod.description && (
                        <p className={`text-xs ${secondaryText} line-clamp-2`}>{mod.description}</p>
                      )}
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {mod.videos.length} videos • {mod.assignments.length} assignments
                      </p>

                      {mod.videos && mod.videos.length > 0 && (
                        <div className="mt-1">
                          <p className={`text-xs font-semibold ${textClass} mb-1`}>Videos</p>
                          <ul className="space-y-1">
                            {mod.videos.map((video) => (
                              <li key={video.id} className="flex justify-between text-xs">
                                <span className={secondaryText}>{video.title || 'Untitled video'}</span>
                                {typeof video.duration === 'number' && video.duration > 0 && (
                                  <span className={secondaryText}>{video.duration}s</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {mod.assignments && mod.assignments.length > 0 && (
                        <div className="mt-2">
                          <p className={`text-xs font-semibold ${textClass} mb-1`}>Assignments</p>
                          <ul className="space-y-1">
                            {mod.assignments.map((assignment) => (
                              <li key={assignment.id} className="text-xs">
                                <span className={`font-medium ${textClass}`}>
                                  {assignment.title || 'Untitled assignment'}
                                </span>
                                {assignment.dueDate && (
                                  <span className={`ml-2 ${secondaryText}`}>
                                    • Due: {new Date(assignment.dueDate).toLocaleString()}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePrev}
            disabled={currentStep === 0 || isSubmitting}
            className={`flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-all text-sm sm:text-base ${
              currentStep === 0 || isSubmitting
                ? 'opacity-50 cursor-not-allowed'
                : `${hoverClass} ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`
            }`}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Back</span>
          </motion.button>

          {currentStep < 2 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className={`flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-all text-sm sm:text-base font-medium ${
                !canProceed() || isSubmitting
                  ? 'opacity-50 cursor-not-allowed bg-gray-500 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Continue</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-all text-sm sm:text-base font-medium"
            >
              {isSubmitting ? 'Creating...' : 'Create Course'}
            </motion.button>
          )}
        </div>

        {submitStatus && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <p className={`text-sm font-semibold ${textClass}`}>
                {uploadProgress.percentage > 0 
                  ? `${uploadProgress.percentage}% completed - ${uploadProgress.videoName}`
                  : submitStatus
                }
              </p>
              {uploadProgress.percentage > 0 && (
                <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {uploadProgress.current}/{uploadProgress.total}
                </span>
              )}
            </div>
            
            {uploadProgress.percentage > 0 && (
              <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress.percentage}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                />
              </div>
            )}
            
            <p className={`text-xs ${secondaryText}`}>
              {submitStatus}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
});

CreateCourseWizard.displayName = 'CreateCourseWizard';
export default CreateCourseWizard;
