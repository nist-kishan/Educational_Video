import { memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Search, X, Filter } from 'lucide-react';
import axios from 'axios';

const AdvancedSearch = memo(({ onSearch }) => {
  const { mode } = useSelector((state) => state.theme);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    priceMin: '',
    priceMax: '',
    ratingMin: 0,
    dateFrom: '',
    dateTo: '',
    level: 'all'
  });
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const isDark = mode === 'dark';
  const API_URL = import.meta.env.VITE_API_URL || ;
  const token = localStorage.getItem('token');

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = () => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setSearchHistory(history.slice(0, 5));
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    // Save to history
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const newHistory = [searchTerm, ...history.filter(h => h !== searchTerm)].slice(0, 10);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    setSearchHistory(newHistory.slice(0, 5));

    // Perform search
    try {
      const params = new URLSearchParams();
      params.append('q', searchTerm);
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all' && value !== 0) {
          params.append(key, value);
        }
      });

      const response = await axios.get(
        `${API_URL}/student/search?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onSearch(response.data.results);
      setShowHistory(false);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const handleHistoryClick = (term) => {
    setSearchTerm(term);
    setShowHistory(false);
  };

  const clearHistory = () => {
    localStorage.removeItem('searchHistory');
    setSearchHistory([]);
  };

  return (
    <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
      isDark ? 'border-gray-700' : 'border-gray-200'
    }`}>
      <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Advanced Search
      </h2>

      {/* Search Input */}
      <div className="mb-6 relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search courses, instructors, topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowHistory(true)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
          >
            Search
          </button>
        </div>

        {/* Search History */}
        {showHistory && searchHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`absolute top-full left-0 right-0 mt-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600'
                : 'bg-white border-gray-300'
            } z-10`}
          >
            <div className="p-3">
              <p className={`text-xs font-semibold mb-2 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Recent Searches</p>
              <div className="space-y-2">
                {searchHistory.map((term, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleHistoryClick(term)}
                    className={`block w-full text-left px-3 py-2 rounded hover:${
                      isDark ? 'bg-gray-600' : 'bg-gray-100'
                    }`}
                  >
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {term}
                    </p>
                  </button>
                ))}
              </div>
              <button
                onClick={clearHistory}
                className={`w-full mt-2 text-xs py-1 ${
                  isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Clear History
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Category */}
        <div className="w-full">
          <label className={`block text-sm font-semibold mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>Category</label>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="all">All Categories</option>
            <option value="web">Web Development</option>
            <option value="mobile">Mobile Development</option>
            <option value="data">Data Science</option>
            <option value="design">Design</option>
            <option value="business">Business</option>
          </select>
        </div>

        {/* Level */}
        <div className="w-full">
          <label className={`block text-sm font-semibold mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>Level</label>
          <select
            value={filters.level}
            onChange={(e) => setFilters({ ...filters, level: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Price Range */}
        <div className="w-full">
          <label className={`block text-sm font-semibold mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>Price Range</label>
          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceMin}
              onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
              className={`flex-1 px-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.priceMax}
              onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
              className={`flex-1 px-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        </div>

        {/* Rating */}
        <div className="w-full">
          <label className={`block text-sm font-semibold mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>Minimum Rating</label>
          <select
            value={filters.ratingMin}
            onChange={(e) => setFilters({ ...filters, ratingMin: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="0">All Ratings</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="w-full">
          <label className={`block text-sm font-semibold mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>From Date</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        <div className="w-full">
          <label className={`block text-sm font-semibold mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>To Date</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>
    </div>
  );
});

AdvancedSearch.displayName = 'AdvancedSearch';
export default AdvancedSearch;
