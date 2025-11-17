import { memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Save, Eye, Send } from 'lucide-react';
import axios from 'axios';

const EmailTemplates = memo(() => {
  const { mode } = useSelector((state) => state.theme);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editedTemplate, setEditedTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const isDark = mode === 'dark';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_URL}/admin/email-templates`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTemplates(response.data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setEditedTemplate({ ...template });
  };

  const handleSaveTemplate = async () => {
    try {
      await axios.put(
        `${API_URL}/admin/email-templates/${editedTemplate.id}`,
        editedTemplate,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTemplates(templates.map(t => t.id === editedTemplate.id ? editedTemplate : t));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleSendTestEmail = async () => {
    try {
      await axios.post(
        `${API_URL}/admin/email-templates/${editedTemplate.id}/test`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Test email sent successfully!');
    } catch (error) {
      console.error('Error sending test email:', error);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} p-6`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Mail size={32} className="text-blue-500" />
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Email Templates
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Templates List */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h2 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Available Templates
            </h2>
            <div className="space-y-2">
              {templates.map((template) => (
                <motion.button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className={`w-full text-left p-3 rounded transition-colors ${
                    selectedTemplate?.id === template.id
                      ? 'bg-blue-500 text-white'
                      : isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  <p className="font-semibold text-sm">{template.name}</p>
                  <p className={`text-xs ${
                    selectedTemplate?.id === template.id
                      ? 'text-blue-100'
                      : isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {template.subject}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Template Editor */}
          {editedTemplate ? (
            <div className="lg:col-span-2 space-y-6">
              {/* Subject */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
                  isDark ? 'border-gray-700' : 'border-gray-200'
                }`}
              >
                <label className={`block text-sm font-semibold mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email Subject
                </label>
                <input
                  type="text"
                  value={editedTemplate.subject}
                  onChange={(e) => setEditedTemplate({ ...editedTemplate, subject: e.target.value })}
                  className={`w-full px-3 py-2 rounded border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  }`}
                />
              </motion.div>

              {/* Body */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
                  isDark ? 'border-gray-700' : 'border-gray-200'
                }`}
              >
                <label className={`block text-sm font-semibold mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email Body
                </label>
                <textarea
                  value={editedTemplate.body}
                  onChange={(e) => setEditedTemplate({ ...editedTemplate, body: e.target.value })}
                  rows="12"
                  className={`w-full px-3 py-2 rounded border resize-none ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  }`}
                />
                <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Available variables: {'{'}user_name{'}'}, {'{'}course_name{'}'}, {'{'}action_url{'}'}
                </p>
              </motion.div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold"
                >
                  <Save size={18} />
                  Save Template
                </button>
                <button
                  onClick={handleSendTestEmail}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-semibold"
                >
                  <Send size={18} />
                  Send Test Email
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

              {/* Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
                  isDark ? 'border-gray-700' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Eye size={18} className="text-blue-500" />
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Preview
                  </h3>
                </div>
                <div className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Subject: {editedTemplate.subject}
                  </p>
                  <div className={`text-sm whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {editedTemplate.body}
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="lg:col-span-2 flex items-center justify-center">
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                Select a template to edit
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

EmailTemplates.displayName = 'EmailTemplates';
export default EmailTemplates;
