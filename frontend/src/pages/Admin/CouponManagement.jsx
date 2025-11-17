import { memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Ticket, Plus, Edit2, Trash2, Copy } from 'lucide-react';
import axios from 'axios';

const CouponManagement = memo(() => {
  const { mode } = useSelector((state) => state.theme);
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    maxUses: '',
    expiryDate: '',
    minPurchaseAmount: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  const isDark = mode === 'dark';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_URL}/admin/coupons`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCoupons(response.data.coupons || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCoupon = async () => {
    try {
      if (editingId) {
        await axios.put(
          `${API_URL}/admin/coupons/${editingId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_URL}/admin/coupons`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      fetchCoupons();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        maxUses: '',
        expiryDate: '',
        minPurchaseAmount: '',
        description: ''
      });
    } catch (error) {
      console.error('Error saving coupon:', error);
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await axios.delete(
          `${API_URL}/admin/coupons/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchCoupons();
      } catch (error) {
        console.error('Error deleting coupon:', error);
      }
    }
  };

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    alert('Coupon code copied!');
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} p-6`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Ticket size={32} className="text-blue-500" />
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Coupon Management
            </h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold"
          >
            <Plus size={18} />
            New Coupon
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-lg mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {editingId ? 'Edit Coupon' : 'Create New Coupon'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Coupon Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className={`px-3 py-2 rounded border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                }`}
              />
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className={`px-3 py-2 rounded border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="percentage">Percentage Discount</option>
                <option value="fixed">Fixed Amount</option>
              </select>
              <input
                type="number"
                placeholder="Discount Value"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                className={`px-3 py-2 rounded border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                }`}
              />
              <input
                type="number"
                placeholder="Max Uses"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                className={`px-3 py-2 rounded border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                }`}
              />
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className={`px-3 py-2 rounded border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                }`}
              />
              <input
                type="number"
                placeholder="Min Purchase Amount"
                value={formData.minPurchaseAmount}
                onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
                className={`px-3 py-2 rounded border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                }`}
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="2"
                className={`md:col-span-2 px-3 py-2 rounded border resize-none ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSaveCoupon}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-semibold"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className={`px-4 py-2 rounded font-semibold ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Coupons List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading coupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className={`text-center py-12 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <Ticket size={48} className="mx-auto mb-4 opacity-50" />
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No coupons yet
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`px-6 py-3 text-left text-sm font-semibold ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Code</th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Discount</th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Uses</th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Expiry</th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <motion.tr
                    key={coupon.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <td className={`px-6 py-4 font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {coupon.code}
                    </td>
                    <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}%`
                        : `$${coupon.discountValue}`}
                    </td>
                    <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {coupon.currentUses}/{coupon.maxUses}
                    </td>
                    <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {new Date(coupon.expiryDate).toLocaleDateString()}
                    </td>
                    <td className={`px-6 py-4 flex gap-2`}>
                      <button
                        onClick={() => handleCopyCoupon(coupon.code)}
                        className="text-blue-500 hover:text-blue-700 p-2"
                      >
                        <Copy size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(coupon.id);
                          setFormData(coupon);
                          setShowForm(true);
                        }}
                        className="text-green-500 hover:text-green-700 p-2"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
});

CouponManagement.displayName = 'CouponManagement';
export default CouponManagement;
