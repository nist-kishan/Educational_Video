import { memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, BookOpen, Heart } from 'lucide-react';
import axios from 'axios';

const CourseRecommendations = memo(() => {
  const { mode } = useSelector((state) => state.theme);
  const [recommendations, setRecommendations] = useState([]);
  const [trending, setTrending] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recommended');

  const isDark = mode === 'dark';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      const [recRes, trendRes, simRes] = await Promise.all([
        axios.get(`${API_URL}/student/recommendations`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/student/trending-courses`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/student/similar-courses`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setRecommendations(recRes.data.recommendations || []);
      setTrending(trendRes.data.trending || []);
      setSimilar(simRes.data.similar || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const CourseCard = ({ course, icon: Icon }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`rounded-lg overflow-hidden border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } cursor-pointer`}
    >
      {/* Image */}
      <div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <Icon size={40} className="text-white opacity-50" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className={`font-semibold mb-2 line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {course.name}
        </h3>
        <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {course.instructor}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-yellow-500">⭐</span>
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {course.rating} ({course.reviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            ${course.price}
          </span>
          <span className={`text-xs px-2 py-1 rounded ${
            isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
          }`}>
            {course.students} students
          </span>
        </div>

        {/* Enroll Button */}
        <button className="w-full mt-4 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-semibold">
          Enroll Now
        </button>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading recommendations...</p>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
      isDark ? 'border-gray-700' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Sparkles size={24} className="text-blue-500" />
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Recommended For You
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-700">
        {[
          { id: 'recommended', label: 'Recommended', icon: Sparkles },
          { id: 'trending', label: 'Trending', icon: TrendingUp },
          { id: 'similar', label: 'Similar Courses', icon: BookOpen }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-500'
                : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeTab === 'recommended' &&
          recommendations.map((course) => (
            <CourseCard key={course.id} course={course} icon={Sparkles} />
          ))}
        {activeTab === 'trending' &&
          trending.map((course) => (
            <CourseCard key={course.id} course={course} icon={TrendingUp} />
          ))}
        {activeTab === 'similar' &&
          similar.map((course) => (
            <CourseCard key={course.id} course={course} icon={BookOpen} />
          ))}
      </div>

      {/* Empty State */}
      {((activeTab === 'recommended' && recommendations.length === 0) ||
        (activeTab === 'trending' && trending.length === 0) ||
        (activeTab === 'similar' && similar.length === 0)) && (
        <div className="text-center py-12">
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            No {activeTab} courses available
          </p>
        </div>
      )}
    </div>
  );
});

CourseRecommendations.displayName = 'CourseRecommendations';
export default CourseRecommendations;
