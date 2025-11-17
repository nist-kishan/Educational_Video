import { memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Repeat2, Plus, Edit2, Trash2, Pause, Play } from 'lucide-react';
import axios from 'axios';

const RecurringInvoices = memo(() => {
  const { mode } = useSelector((state) => state.theme);
  const [recurringInvoices, setRecurringInvoices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    customer_email: '',
    amount: '',
    frequency: 'monthly',
    start_date: '',
    end_date: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  const isDark = mode === 'dark';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchRecurringInvoices();
  }, []);

  const fetchRecurringInvoices = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_URL}/admin/recurring-invoices`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecurringInvoices(response.data.invoices || []);
    } catch (error) {
      console.error('Error fetching recurring invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRecurringInvoice = async () => {
    try {
      if (editingId) {
        await axios.put(
          `${API_URL}/admin/recurring-invoices/${editingId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_URL}/admin/recurring-invoices`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      fetchRecurringInvoices();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        customer_email: '',
        amount: '',
        frequency: 'monthly',
        start_date: '',
        end_date: '',
        description: ''
      });
    } catch (error) {
      console.error('Error saving recurring invoice:', error);
    }
  };

  const handleDeleteRecurringInvoice = async (id) => {
    if (window.confirm('Are you sure you want to delete this recurring invoice?')) {
      try {
        await axios.delete(
          `${API_URL}/admin/recurring-invoices/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchRecurringInvoices();
      } catch (error) {
        console.error('Error deleting recurring invoice:', error);
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await axios.patch(
        `${API_URL}/admin/recurring-invoices/${id}/status`,
        { status: currentStatus === 'active' ? 'paused' : 'active' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRecurringInvoices();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} p-6`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Repeat2 size={32} className="text-blue-500" />
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Recurring Invoices
            </h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold"
          >
            <Plus size={18} />
            New Recurring Invoice
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
              {editingId ? 'Edit Recurring Invoice' : 'Create Recurring Invoice'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="email"
                placeholder="Customer Email"
                value={formData.customer_email}
                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                className={`px-3 py-2 rounded border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                }`}
              />
              <input
                type="number"
                placeholder="Amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={`px-3 py-2 rounded border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                }`}
              />
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className={`px-3 py-2 rounded border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className={`px-3 py-2 rounded border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                }`}
              />
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
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
                onClick={handleSaveRecurringInvoice}
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

        {/* List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading...</p>
          </div>
        ) : recurringInvoices.length === 0 ? (
          <div className={`text-center py-12 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <Repeat2 size={48} className="mx-auto mb-4 opacity-50" />
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No recurring invoices yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recurringInvoices.map((invoice) => (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${
                  isDark
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {invoice.customer_email}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      ${invoice.amount} {invoice.frequency}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    invoice.status === 'active'
                      ? 'bg-green-500 text-white'
                      : 'bg-yellow-500 text-white'
                  }`}>
                    {invoice.status}
                  </span>
                </div>

                <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {invoice.description}
                </p>

                <p className={`text-xs mb-4 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {new Date(invoice.start_date).toLocaleDateString()} - {new Date(invoice.end_date).toLocaleDateString()}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleStatus(invoice.id, invoice.status)}
                    className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs rounded ${
                      invoice.status === 'active'
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {invoice.status === 'active' ? (
                      <>
                        <Pause size={12} />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play size={12} />
                        Resume
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(invoice.id);
                      setFormData(invoice);
                      setShowForm(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    <Edit2 size={12} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteRecurringInvoice(invoice.id)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

RecurringInvoices.displayName = 'RecurringInvoices';
export default RecurringInvoices;
