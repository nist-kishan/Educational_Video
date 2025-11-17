import { memo, useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { createCourse, updateCourse, getCourseById, clearError, clearSuccess } from '../../store/courseSlice';
import { Alert, Input } from '../../components/UI';

const CreateCourse = memo(() => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { mode } = useSelector((state) => state.theme);
  const { currentCourse, isLoading, error, success } = useSelector((state) => state.courses);
  const isDark = mode === 'dark';

  const bgClass = isDark ? 'bg-gray-900' : 'bg-white';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const inputBg = isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300';

  const [formData, setFormData] = useState({
    name: '',
    playlist_name: '',
    description: '',
    price: 0,
    category: '',
    prerequisites: [],
    syllabus: [],
    motive: ''
  });

  const [prerequisiteInput, setPrerequisiteInput] = useState('');
  const [syllabusInput, setSyllabusInput] = useState('');

  useEffect(() => {
    if (courseId) {
      dispatch(getCourseById(courseId));
    }
  }, [courseId, dispatch]);

  useEffect(() => {
    if (currentCourse && courseId) {
      setFormData({
        name: currentCourse.name || '',
        playlist_name: currentCourse.playlist_name || '',
        description: currentCourse.description || '',
        price: currentCourse.price || 0,
        category: currentCourse.category || '',
        prerequisites: currentCourse.prerequisites || [],
        syllabus: currentCourse.syllabus || [],
        motive: currentCourse.motive || ''
      });
    }
  }, [currentCourse, courseId]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (success && !courseId) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
        navigate('/tutor/courses');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, courseId, dispatch, navigate]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  }, []);

  const addPrerequisite = useCallback(() => {
    if (prerequisiteInput.trim()) {
      setFormData(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, prerequisiteInput.trim()]
      }));
      setPrerequisiteInput('');
    }
  }, [prerequisiteInput]);

  const removePrerequisite = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index)
    }));
  }, []);

  const addSyllabus = useCallback(() => {
    if (syllabusInput.trim()) {
      setFormData(prev => ({
        ...prev,
        syllabus: [...prev.syllabus, syllabusInput.trim()]
      }));
      setSyllabusInput('');
    }
  }, [syllabusInput]);

  const removeSyllabus = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      syllabus: prev.syllabus.filter((_, i) => i !== index)
    }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (courseId) {
      dispatch(updateCourse({ courseId, courseData: formData }));
    } else {
      dispatch(createCourse(formData));
    }
  }, [formData, courseId, dispatch]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className={`min-h-screen ${bgClass} py-12`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4 mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/tutor/courses')}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors cursor-pointer`}
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          <div>
            <h1 className={`text-3xl font-bold ${textClass}`}>
              {courseId ? 'Edit Course' : 'Create New Course'}
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              {courseId ? 'Update your course details' : 'Fill in the details to create a new course'}
            </p>
          </div>
        </motion.div>

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

        {/* Form */}
        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
          className={`${cardBg} rounded-lg p-8 space-y-6`}
        >
          {/* Course Name */}
          <motion.div variants={itemVariants}>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>Course Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Advanced React Patterns"
              required
              className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </motion.div>

          {/* Playlist Name */}
          <motion.div variants={itemVariants}>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>Playlist Name (Cloudinary Folder) *</label>
            <input
              type="text"
              name="playlist_name"
              value={formData.playlist_name}
              onChange={handleInputChange}
              placeholder="e.g., Advanced_React (no spaces, alphanumeric + underscore)"
              pattern="^[a-zA-Z0-9_]+$"
              title="Only letters, numbers, and underscores allowed"
              required
              className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>This will be the folder name in Cloudinary for storing videos</p>
          </motion.div>

          {/* Description */}
          <motion.div variants={itemVariants}>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your course in detail..."
              required
              rows="4"
              className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
            />
          </motion.div>

          {/* Price & Category */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium ${textClass} mb-2`}>Price ($) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${textClass} mb-2`}>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select a category</option>
                <option value="Web Development">Web Development</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="Data Science">Data Science</option>
                <option value="Machine Learning">Machine Learning</option>
                <option value="Design">Design</option>
                <option value="Business">Business</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </motion.div>

          {/* Motive */}
          <motion.div variants={itemVariants}>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>Course Motive</label>
            <textarea
              name="motive"
              value={formData.motive}
              onChange={handleInputChange}
              placeholder="What will students achieve by taking this course?"
              rows="3"
              className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
            />
          </motion.div>

          {/* Prerequisites */}
          <motion.div variants={itemVariants}>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>Prerequisites</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={prerequisiteInput}
                onChange={(e) => setPrerequisiteInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
                placeholder="Add a prerequisite..."
                className={`flex-1 px-4 py-2 rounded-lg border ${inputBg} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={addPrerequisite}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors cursor-pointer"
              >
                Add
              </motion.button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.prerequisites.map((prereq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                >
                  <span>{prereq}</span>
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => removePrerequisite(index)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 cursor-pointer"
                  >
                    ×
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Syllabus */}
          <motion.div variants={itemVariants}>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>Syllabus</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={syllabusInput}
                onChange={(e) => setSyllabusInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSyllabus())}
                placeholder="Add a syllabus item..."
                className={`flex-1 px-4 py-2 rounded-lg border ${inputBg} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={addSyllabus}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors cursor-pointer"
              >
                Add
              </motion.button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.syllabus.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center space-x-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full"
                >
                  <span>{item}</span>
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => removeSyllabus(index)}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 cursor-pointer"
                  >
                    ×
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={itemVariants} className="flex space-x-4 pt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => navigate('/tutor/courses')}
              className={`flex-1 px-6 py-3 rounded-lg border font-semibold transition-colors cursor-pointer ${
                isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-900 hover:bg-gray-100'
              }`}
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-5 h-5" />
              <span>{isLoading ? 'Saving...' : courseId ? 'Update Course' : 'Create Course'}</span>
            </motion.button>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
});

CreateCourse.displayName = 'CreateCourse';
export default CreateCourse;
