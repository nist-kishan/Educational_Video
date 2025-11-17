import { memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FileText, Save, Eye, Download } from 'lucide-react';
import axios from 'axios';

const InvoiceTemplate = memo(({ invoiceId, onClose }) => {
  const { mode } = useSelector((state) => state.theme);
  const [template, setTemplate] = useState(null);
  const [editedTemplate, setEditedTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const isDark = mode === 'dark';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchTemplate();
  }, [invoiceId]);

  const fetchTemplate = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_URL}/student/invoices/${invoiceId}/template`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTemplate(response.data.template);
      setEditedTemplate(response.data.template);
    } catch (error) {
      console.error('Error fetching template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      await axios.put(
        `${API_URL}/student/invoices/${invoiceId}/template`,
        editedTemplate,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTemplate(editedTemplate);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading template...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText size={24} className="text-blue-500" />
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Invoice Template
          </h2>
        </div>
        <button
          onClick={onClose}
          className={`px-4 py-2 rounded ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Company Name
            </label>
            <input
              type="text"
              value={editedTemplate?.company_name || ''}
              onChange={(e) => setEditedTemplate({
                ...editedTemplate,
                company_name: e.target.value
              })}
              className={`w-full px-3 py-2 rounded border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Company Address
            </label>
            <textarea
              value={editedTemplate?.company_address || ''}
              onChange={(e) => setEditedTemplate({
                ...editedTemplate,
                company_address: e.target.value
              })}
              rows="3"
              className={`w-full px-3 py-2 rounded border resize-none ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Company Email
            </label>
            <input
              type="email"
              value={editedTemplate?.company_email || ''}
              onChange={(e) => setEditedTemplate({
                ...editedTemplate,
                company_email: e.target.value
              })}
              className={`w-full px-3 py-2 rounded border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Footer Text
            </label>
            <textarea
              value={editedTemplate?.footer_text || ''}
              onChange={(e) => setEditedTemplate({
                ...editedTemplate,
                footer_text: e.target.value
              })}
              rows="3"
              className={`w-full px-3 py-2 rounded border resize-none ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSaveTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold"
            >
              <Save size={18} />
              Save Template
            </button>
            {saved && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded"
              >
                ✓ Saved!
              </motion.div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className={`p-4 rounded border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Eye size={18} className="text-blue-500" />
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Preview
            </h3>
          </div>
          <div className={`p-4 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <p className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {editedTemplate?.company_name || 'Company Name'}
            </p>
            <p className={`text-sm whitespace-pre-wrap mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {editedTemplate?.company_address || 'Company Address'}
            </p>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {editedTemplate?.company_email || 'company@email.com'}
            </p>
            <div className={`border-t pt-4 text-xs whitespace-pre-wrap ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {editedTemplate?.footer_text || 'Footer text'}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

InvoiceTemplate.displayName = 'InvoiceTemplate';
export default InvoiceTemplate;
