import { memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Heart, Share2, ShoppingCart, Trash2, Search, Filter } from 'lucide-react';
import axios from 'axios';

const Wishlist = memo(() => {
  const { mode } = useSelector((state) => state.theme);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [priceDrops, setPriceDrops] = useState({});

  const isDark = mode === 'dark';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_URL}/student/wishlist`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWishlistItems(response.data.wishlist || []);
      checkPriceDrops(response.data.wishlist);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkPriceDrops = (items) => {
    const drops = {};
    items.forEach(item => {
      if (item.originalPrice && item.currentPrice < item.originalPrice) {
        drops[item.id] = {
          savings: (item.originalPrice - item.currentPrice).toFixed(2),
          percentage: Math.round((item.originalPrice - item.currentPrice) / item.originalPrice * 100)
        };
      }
    });
    setPriceDrops(drops);
  };

  const handleRemoveFromWishlist = async (courseId) => {
    try {
      await axios.delete(
        `${API_URL}/student/wishlist/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWishlistItems(wishlistItems.filter(item => item.id !== courseId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const handleAddToCart = async (courseId) => {
    try {
      await axios.post(
        `${API_URL}/student/cart/${courseId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Course added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleShareWishlist = async () => {
    const shareUrl = `${window.location.origin}/wishlist/shared/${Math.random().toString(36).substr(2, 9)}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Wishlist link copied to clipboard!');
    } catch (error) {
      console.error('Error sharing wishlist:', error);
    }
  };

  const handleCompareWishlist = () => {
    const selectedItems = wishlistItems.slice(0, 3);
    // Redirect to comparison page
    window.location.href = `/compare?ids=${selectedItems.map(i => i.id).join(',')}`;
  };

  const filteredItems = wishlistItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} p-6`}>
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} p-6`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Heart size={32} className="text-red-500 fill-red-500" />
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              My Wishlist
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'
            }`}>
              {wishlistItems.length} items
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleShareWishlist}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Share2 size={18} />
              Share
            </button>
            {wishlistItems.length >= 2 && (
              <button
                onClick={handleCompareWishlist}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Compare
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search wishlist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300'
              }`}
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300'
            }`}
          >
            <option value="all">All Categories</option>
            <option value="web">Web Development</option>
            <option value="mobile">Mobile Development</option>
            <option value="data">Data Science</option>
            <option value="design">Design</option>
          </select>
        </div>

        {/* Wishlist Items */}
        {filteredItems.length === 0 ? (
          <div className={`text-center py-12 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <Heart size={48} className="mx-auto mb-4 opacity-50" />
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {wishlistItems.length === 0 ? 'Your wishlist is empty' : 'No items match your filters'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-lg overflow-hidden border ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  {priceDrops[item.id] && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      -{priceDrops[item.id].percentage}%
                    </div>
                  )}
                  <span className="text-white text-4xl">📚</span>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className={`font-semibold mb-2 line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.name}
                  </h3>
                  <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.category}
                  </p>

                  {/* Price */}
                  <div className="mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        ${item.currentPrice}
                      </span>
                      {item.originalPrice && (
                        <span className={`text-sm line-through ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          ${item.originalPrice}
                        </span>
                      )}
                    </div>
                    {priceDrops[item.id] && (
                      <p className="text-green-500 text-sm font-semibold">
                        Save ${priceDrops[item.id].savings}
                      </p>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="mb-4 flex items-center gap-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.rating} ({item.reviews} reviews)
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(item.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      <ShoppingCart size={16} />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

Wishlist.displayName = 'Wishlist';
export default Wishlist;
