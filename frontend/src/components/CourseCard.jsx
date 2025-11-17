import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, ShoppingCart, Heart, Play } from 'lucide-react';
import { addToCart, addToWishlist, removeFromWishlist } from '../store/studentSlice';

const CourseCard = ({ course, isWishlisted = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);
  
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(isWishlisted);

  const isDark = mode === 'dark';
  const cardBg = isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-200' : 'text-gray-600';  // Brighter text in dark mode
  const borderClass = isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300';
  const statsText = isDark ? 'text-white' : 'text-gray-900';  // New variable for stats text

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }

    setIsAddingToCart(true);
    try {
      await dispatch(addToCart(course.id)).unwrap();
      alert('Course added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert(error || 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }

    setIsWishlistLoading(true);
    try {
      if (isWishlisted) {
        await dispatch(removeFromWishlist(course.id)).unwrap();
        setIsWishlisted(false);
      } else {
        await dispatch(addToWishlist(course.id)).unwrap();
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error('Failed to update wishlist:', error);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleBuyNow = async (e) => {
    e.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }

    setIsAddingToCart(true);
    try {
      await dispatch(addToCart(course.id)).unwrap();
      navigate('/student/cart');
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div
      onClick={() => navigate(`/student/courses/${course.id}`)}
      className={`${cardBg} rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition cursor-pointer border ${borderClass}`}
    >
      {/* Course Image/Banner */}
      <div className="relative h-40 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-pattern"></div>
        <Play size={48} className="text-white opacity-50" />
        
        {/* Wishlist Button */}
        <div
          onClick={handleWishlist}
          disabled={isWishlistLoading}
          className={`absolute top-3 right-3 p-2 rounded-full transition ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'}`}
        >
          <Heart
            size={20}
            className={isWishlisted ? 'fill-red-500 text-red-500' : (isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600')}
          />
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            course.status === 'published'
              ? 'bg-green-500 text-white'
              : 'bg-yellow-500 text-white'
          }`}>
            {course.status === 'published' ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>

      {/* Course Info */}
      <div className="p-4">
        {/* Category */}
        <p className={`text-xs font-semibold ${secondaryText} uppercase mb-2`}>
          {course.category}
        </p>

        {/* Title */}
        <h3 className={`font-bold text-lg mb-2 line-clamp-2 ${textClass}`}>
          {course.name}
        </h3>

        {/* Description */}
        <p className={`text-sm ${secondaryText} line-clamp-2 mb-3`}>
          {course.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < 4 ? 'fill-yellow-400 text-yellow-400' : (isDark ? 'text-gray-600' : 'text-gray-300')}
              />
            ))}
          </div>
          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>(4.0)</span>
        </div>

        {/* Course Stats */}
        <div className={`grid grid-cols-3 gap-2 mb-4 py-3 border-t border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="text-center">
            <p className={`text-sm font-semibold ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>{course.total_videos || 0}</p>
            <p className={`text-xs ${isDark ? 'text-blue-200' : 'text-blue-500'}`}>Videos</p>
          </div>
          <div className="text-center">
            <p className={`text-sm font-semibold ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>{course.total_assignments || 0}</p>
            <p className={`text-xs ${isDark ? 'text-purple-200' : 'text-purple-500'}`}>Assignments</p>
          </div>
          <div className="text-center">
            <p className={`text-sm font-semibold ${isDark ? 'text-green-300' : 'text-green-600'}`}>{course.total_modules || 0}</p>
            <p className={`text-xs ${isDark ? 'text-green-200' : 'text-green-500'}`}>Modules</p>
          </div>
        </div>

        {/* Price and Buttons */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-2xl font-bold text-green-500">
              ${course.price?.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="flex items-center justify-center gap-2 py-2 px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-all text-sm font-semibold hover:shadow-md"
          >
            <ShoppingCart size={16} />
            Cart
          </button>
          <button
            onClick={handleBuyNow}
            disabled={isAddingToCart}
            className="py-2 px-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-all text-sm font-semibold hover:shadow-md"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
