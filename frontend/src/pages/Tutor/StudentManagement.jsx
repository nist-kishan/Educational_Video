import { memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Users, Search, Filter, Mail, TrendingUp } from 'lucide-react';
import axios from 'axios';

const StudentManagement = memo(() => {
  const { mode } = useSelector((state) => state.theme);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  const isDark = mode === 'dark';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchStudents();
  }, [page]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_URL}/student/tutor/students?page=${page}&limit=20`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudents(response.data.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} p-6`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Users size={32} className="text-blue-500" />
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Student Management
            </h1>
          </div>
          <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Total Students: {students.length}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300'
              }`}
            />
          </div>
          <button className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
          }`}>
            <Filter size={20} />
            Filter
          </button>
        </div>

        {/* Students Table */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className={`text-center py-12 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No students found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`px-6 py-3 text-left text-sm font-semibold ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Name</th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Email</th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Progress</th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Status</th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} hover:${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                  >
                    <td className={`px-6 py-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <p className="font-semibold">{student.first_name} {student.last_name}</p>
                    </td>
                    <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {student.email}
                    </td>
                    <td className={`px-6 py-4`}>
                      <div className="w-32 bg-gray-300 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${student.progress || 0}%` }}
                        />
                      </div>
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {student.progress || 0}%
                      </p>
                    </td>
                    <td className={`px-6 py-4`}>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        student.status === 'completed'
                          ? 'bg-green-500 text-white'
                          : 'bg-blue-500 text-white'
                      }`}>
                        {student.status || 'Active'}
                      </span>
                    </td>
                    <td className={`px-6 py-4`}>
                      <button className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                        <Mail size={14} />
                        Message
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredStudents.length > 0 && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Previous
            </button>
            <span className={`px-4 py-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Page {page}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

StudentManagement.displayName = 'StudentManagement';
export default StudentManagement;
