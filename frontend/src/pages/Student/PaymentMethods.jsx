import { memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { CreditCard, Plus, Trash2, Check } from 'lucide-react';
import axios from 'axios';

const PaymentMethods = memo(() => {
  const { mode } = useSelector((state) => state.theme);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    isDefault: false
  });
  const [isLoading, setIsLoading] = useState(true);

  const isDark = mode === 'dark';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_URL}/student/payment-methods`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPaymentMethods(response.data.paymentMethods || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      await axios.post(
        `${API_URL}/student/payment-methods`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPaymentMethods();
      setShowForm(false);
      setFormData({
        cardNumber: '',
        cardholderName: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        isDefault: false
      });
    } catch (error) {
      console.error('Error adding payment method:', error);
    }
  };

  const handleDeletePaymentMethod = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      try {
        await axios.delete(
          `${API_URL}/student/payment-methods/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchPaymentMethods();
      } catch (error) {
        console.error('Error deleting payment method:', error);
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await axios.patch(
        `${API_URL}/student/payment-methods/${id}/default`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error setting default payment method:', error);
    }
  };

  const maskCardNumber = (cardNumber) => {
    const last4 = cardNumber.slice(-4);
    return `•••• •••• •••• ${last4}`;
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} p-6`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <CreditCard size={32} className="text-blue-500" />
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Payment Methods
            </h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold"
          >
            <Plus size={18} />
            Add Card
          </button>
        </div>

        {/* Add Card Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-lg mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Add New Card
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Cardholder Name"
                value={formData.cardholderName}
                onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
                className={`w-full px-3 py-2 rounded border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                }`}
              />
              <input
                type="text"
                placeholder="Card Number"
                value={formData.cardNumber}
                onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value.replace(/\s/g, '') })}
                maxLength="16"
                className={`w-full px-3 py-2 rounded border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                }`}
              />
              <div className="grid grid-cols-3 gap-4">
                <select
                  value={formData.expiryMonth}
                  onChange={(e) => setFormData({ ...formData, expiryMonth: e.target.value })}
                  className={`px-3 py-2 rounded border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="">Month</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                      {String(i + 1).padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <select
                  value={formData.expiryYear}
                  onChange={(e) => setFormData({ ...formData, expiryYear: e.target.value })}
                  className={`px-3 py-2 rounded border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="">Year</option>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
                <input
                  type="text"
                  placeholder="CVV"
                  value={formData.cvv}
                  onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                  maxLength="4"
                  className={`px-3 py-2 rounded border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Set as default payment method
                </span>
              </label>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddPaymentMethod}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-semibold"
              >
                Add Card
              </button>
              <button
                onClick={() => setShowForm(false)}
                className={`px-4 py-2 rounded font-semibold ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Payment Methods List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading payment methods...</p>
          </div>
        ) : paymentMethods.length === 0 ? (
          <div className={`text-center py-12 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <CreditCard size={48} className="mx-auto mb-4 opacity-50" />
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No payment methods added yet
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-lg border ${
                  isDark
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CreditCard size={24} className="text-blue-500" />
                      <div>
                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {method.cardholderName}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {maskCardNumber(method.cardNumber)}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          Expires {method.expiryMonth}/{method.expiryYear}
                        </p>
                      </div>
                    </div>
                    {method.isDefault && (
                      <span className="inline-block px-3 py-1 bg-green-500 text-white text-xs rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!method.isDefault && (
                      <button
                        onClick={() => handleSetDefault(method.id)}
                        className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        <Check size={14} />
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePaymentMethod(method.id)}
                      className="flex items-center gap-1 px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      <Trash2 size={14} />
                      Delete
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

PaymentMethods.displayName = 'PaymentMethods';
export default PaymentMethods;
