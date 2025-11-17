import React from 'react';
import { motion } from 'framer-motion';

const SkeletonLoader = ({ isDark, width = 'w-full', height = 'h-4' }) => (
  <motion.div
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 1.5, repeat: Infinity }}
    className={`${width} ${height} rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
  />
);

export const CourseVideoPlayerSkeleton = ({ isDark }) => (
  <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content Skeleton */}
      <div className="lg:col-span-2 space-y-6">
        {/* Video Player Skeleton */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={`w-full aspect-video rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}
        />

        {/* Video Info Skeleton */}
        <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg space-y-4`}>
          <SkeletonLoader isDark={isDark} height="h-8" />
          <SkeletonLoader isDark={isDark} height="h-4" width="w-3/4" />
          <SkeletonLoader isDark={isDark} height="h-4" width="w-1/2" />
          <div className="flex gap-4 pt-4">
            <SkeletonLoader isDark={isDark} height="h-6" width="w-24" />
            <SkeletonLoader isDark={isDark} height="h-6" width="w-32" />
          </div>
        </div>
      </div>

      {/* Sidebar Skeleton */}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg p-4 space-y-4`}
      >
        {/* Header */}
        <div className="space-y-2 pb-4 border-b" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
          <SkeletonLoader isDark={isDark} height="h-6" width="w-32" />
          <SkeletonLoader isDark={isDark} height="h-4" width="w-40" />
        </div>

        {/* Module Items */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            {/* Module Header */}
            <SkeletonLoader isDark={isDark} height="h-5" width="w-full" />
            
            {/* Videos/Assignments */}
            <div className="pl-4 space-y-2">
              <SkeletonLoader isDark={isDark} height="h-4" width="w-5/6" />
              <SkeletonLoader isDark={isDark} height="h-4" width="w-4/5" />
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  </div>
);

export default SkeletonLoader;
