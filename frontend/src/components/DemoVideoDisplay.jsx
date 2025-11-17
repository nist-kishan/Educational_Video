import { memo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Play, AlertCircle } from 'lucide-react';
import { getDemoVideo } from '../store/courseSlice';
import { SkeletonText } from './SkeletonLoader';

const DemoVideoDisplay = memo(({ courseId }) => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);
  const { demoVideo, isLoading, error } = useSelector((state) => state.courses);
  const isDark = mode === 'dark';

  const bgClass = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';

  useEffect(() => {
    if (courseId) {
      dispatch(getDemoVideo(courseId));
    }
  }, [courseId, dispatch]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`${bgClass} rounded-lg p-6`}
      >
        <SkeletonText lines={1} />
        <div className="mt-4 w-full aspect-video bg-gray-700 rounded-lg animate-pulse" />
      </motion.div>
    );
  }

  if (error || !demoVideo) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`${bgClass} rounded-lg p-6 border border-dashed ${isDark ? 'border-gray-700' : 'border-gray-300'}`}
      >
        <div className="flex items-center space-x-3">
          <AlertCircle className={`w-5 h-5 ${secondaryText}`} />
          <div>
            <p className={`font-semibold ${textClass}`}>No Demo Video Available</p>
            <p className={`text-sm ${secondaryText}`}>The instructor hasn't uploaded a preview video yet</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Demo Video Badge */}
      <div className="flex items-center space-x-2">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold"
        >
          <Play className="w-3 h-3" />
          <span>Preview Video</span>
        </motion.div>
      </div>

      {/* Video Player */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${bgClass} rounded-lg overflow-hidden shadow-lg`}
      >
        <video
          controls
          className="w-full aspect-video bg-black"
          poster={`https://via.placeholder.com/1280x720?text=Demo+Video`}
        >
          <source src={demoVideo.url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </motion.div>

      {/* Video Info */}
      <div className={`${bgClass} rounded-lg p-4 space-y-2`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className={`font-semibold ${textClass}`}>
              {demoVideo.title || 'Demo Video'}
            </h3>
            <p className={`text-sm ${secondaryText} mt-1`}>
              Duration: {formatDuration(demoVideo.duration)}
            </p>
          </div>
          {demoVideo.size && (
            <div className={`text-xs ${secondaryText} text-right`}>
              {(demoVideo.size / (1024 * 1024)).toFixed(2)} MB
            </div>
          )}
        </div>
        <p className={`text-sm ${secondaryText}`}>
          Watch this preview to get a feel for the course content before enrolling.
        </p>
      </div>
    </motion.div>
  );
});

DemoVideoDisplay.displayName = 'DemoVideoDisplay';
export default DemoVideoDisplay;
