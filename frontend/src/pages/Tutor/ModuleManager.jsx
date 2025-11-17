import { memo, useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import {
  getCourseModules,
  createModule,
  updateModule,
  deleteModule,
  getModuleVideos,
  getModuleAssignments,
  clearError,
  clearSuccess
} from '../../store/courseSlice';
import { Alert } from '../../components/UI';
import { SkeletonGrid, SkeletonText } from '../../components/SkeletonLoader';
import VideoUploadComponent from '../../components/VideoUploadComponent';

const ModuleManager = memo(() => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { mode } = useSelector((state) => state.theme);
  const { modules, isLoading, error, success } = useSelector((state) => state.courses);
  const isDark = mode === 'dark';

  const bgClass = isDark ? 'bg-gray-900' : 'bg-white';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';
  const inputBg = isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300';
  const hoverClass = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

  const [expandedModules, setExpandedModules] = useState(new Set());
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [moduleFormData, setModuleFormData] = useState({ title: '', description: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (courseId) {
      dispatch(getCourseModules(courseId));
    }
  }, [courseId, dispatch]);

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

  const toggleModule = useCallback((moduleId) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  }, []);

  const handleCreateModule = useCallback(() => {
    if (moduleFormData.title.trim()) {
      dispatch(createModule({
        courseId,
        moduleData: moduleFormData
      }));
      setModuleFormData({ title: '', description: '' });
      setShowModuleModal(false);
    }
  }, [moduleFormData, courseId, dispatch]);

  const handleDeleteModule = useCallback((moduleId) => {
    dispatch(deleteModule({ courseId, moduleId }));
    setDeleteConfirm(null);
  }, [courseId, dispatch]);

  return (
    <div className={`min-h-screen ${bgClass} py-8 sm:py-12 overflow-x-hidden`}>
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8 w-full"
        >
          {/* Top Row: Back Button + Title */}
          <div className="flex items-start gap-2 sm:gap-4 w-full">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/tutor/courses')}
              className={`p-2 rounded-lg ${hoverClass} transition-colors cursor-pointer flex-shrink-0 mt-1`}
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>
            <div className="flex-1 min-w-0">
              <h1 className={`text-lg sm:text-2xl md:text-3xl font-bold ${textClass} break-words`}>Manage Modules</h1>
              <p className={`${secondaryText} mt-1 text-xs sm:text-sm md:text-base`}>Organize your course content into modules</p>
            </div>
          </div>

          {/* Add Module Button - Full Width on Mobile */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModuleModal(true)}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer text-sm sm:text-base"
          >
            <Plus className="w-5 h-5" />
            <span>Add Module</span>
          </motion.button>
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

        {/* Loading State */}
        {isLoading && modules.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <SkeletonGrid count={3} />
          </motion.div>
        )}

        {/* Modules List */}
        <div className="space-y-4">
          {modules && modules.length > 0 ? (
            modules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${cardBg} rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}
              >
                {/* Module Header */}
                <motion.button
                  onClick={() => toggleModule(module.id)}
                  className={`w-full flex items-center justify-between p-6 ${hoverClass} transition-colors cursor-pointer`}
                >
                  <div className="flex items-center space-x-4 flex-1 text-left">
                    <motion.div
                      animate={{ rotate: expandedModules.has(module.id) ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-5 h-5" />
                    </motion.div>
                    <div>
                      <h3 className={`font-semibold ${textClass}`}>{module.title}</h3>
                      <p className={`text-sm ${secondaryText} mt-1`}>
                        {module.videos?.length || 0} videos • {module.assignments?.length || 0} assignments
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setModuleFormData({ title: module.title, description: module.description });
                        setShowModuleModal(true);
                      }}
                      className={`p-2 rounded-lg ${hoverClass} transition-colors cursor-pointer`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(module.id);
                      }}
                      className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.button>

                {/* Module Content */}
                <AnimatePresence>
                  {expandedModules.has(module.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 w-full overflow-hidden`}
                    >
                      {/* Videos Section */}
                      <div className="w-full">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4 w-full">
                          <h4 className={`font-semibold ${textClass} text-sm sm:text-base flex-shrink-0`}>Videos ({module.videos?.length || 0})</h4>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedModuleId(module.id);
                              setShowVideoUpload(true);
                            }}
                            className="w-full sm:w-auto flex items-center justify-center space-x-1 px-3 py-1 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex-shrink-0"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Video</span>
                          </motion.button>
                        </div>
                        {module.videos && module.videos.length > 0 ? (
                          <div className="space-y-2">
                            {module.videos.map((video) => (
                              <div
                                key={video.id}
                                className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}
                              >
                                <div className="flex-1">
                                  <p className={`text-sm font-medium ${textClass}`}>{video.title}</p>
                                  <p className={`text-xs ${secondaryText} mt-1`}>
                                    {video.is_demo && <span className="text-blue-500 font-semibold">Demo • </span>}
                                    Duration: {Math.floor(video.duration / 60)} min
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className={`text-sm ${secondaryText} italic`}>No videos yet</p>
                        )}
                      </div>

                      {/* Assignments Section */}
                      <div className="w-full">
                        <h4 className={`font-semibold ${textClass} mb-3 sm:mb-4 text-sm sm:text-base`}>Assignments ({module.assignments?.length || 0})</h4>
                        {module.assignments && module.assignments.length > 0 ? (
                          <div className="space-y-2">
                            {module.assignments.map((assignment) => (
                              <div
                                key={assignment.id}
                                className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}
                              >
                                <div className="flex-1">
                                  <p className={`text-sm font-medium ${textClass}`}>{assignment.title}</p>
                                  <p className={`text-xs ${secondaryText} mt-1 line-clamp-1`}>{assignment.instructions}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className={`text-sm ${secondaryText} italic`}>No assignments yet</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Delete Confirmation */}
                <AnimatePresence>
                  {deleteConfirm === module.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} p-4 bg-red-50 dark:bg-red-900/20`}
                    >
                      <p className={`text-sm font-medium ${textClass} mb-3`}>Delete this module and all its content?</p>
                      <div className="flex space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setDeleteConfirm(null)}
                          className={`flex-1 px-3 py-2 rounded-lg border font-semibold transition-colors cursor-pointer ${
                            isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                          }`}
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteModule(module.id)}
                          className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors cursor-pointer"
                        >
                          Delete
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`${cardBg} rounded-lg p-12 text-center border-2 border-dashed ${isDark ? 'border-gray-700' : 'border-gray-300'}`}
            >
              <Plus className={`w-12 h-12 mx-auto mb-3 ${secondaryText}`} />
              <p className={`${textClass} font-semibold mb-2`}>No modules yet</p>
              <p className={secondaryText}>Create your first module to organize your course content</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Module Modal */}
      <AnimatePresence>
        {showModuleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModuleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`${cardBg} rounded-lg p-4 sm:p-6 max-w-md w-full`}
            >
              <h3 className={`text-lg sm:text-xl font-bold ${textClass} mb-4`}>Add Module</h3>
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <input
                  type="text"
                  placeholder="Module Title"
                  value={moduleFormData.title}
                  onChange={(e) => setModuleFormData({ ...moduleFormData, title: e.target.value })}
                  className={`w-full px-3 sm:px-4 py-2 rounded-lg border ${inputBg} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base`}
                />
                <textarea
                  placeholder="Description (optional)"
                  value={moduleFormData.description}
                  onChange={(e) => setModuleFormData({ ...moduleFormData, description: e.target.value })}
                  rows="3"
                  className={`w-full px-3 sm:px-4 py-2 rounded-lg border ${inputBg} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm sm:text-base`}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowModuleModal(false)}
                  className={`flex-1 px-3 sm:px-4 py-2 rounded-lg border font-semibold transition-colors cursor-pointer text-sm sm:text-base ${
                    isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateModule}
                  disabled={isLoading}
                  className="flex-1 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer text-sm sm:text-base"
                >
                  {isLoading ? 'Creating...' : 'Create'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Upload Modal */}
      <AnimatePresence>
        {showVideoUpload && selectedModuleId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4"
            onClick={() => setShowVideoUpload(false)}
          >
            <VideoUploadComponent
              courseId={courseId}
              moduleId={selectedModuleId}
              onClose={() => {
                setShowVideoUpload(false);
                dispatch(getCourseModules(courseId));
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ModuleManager.displayName = 'ModuleManager';
export default ModuleManager;
