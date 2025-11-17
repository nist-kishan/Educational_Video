import { memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Settings, Save, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';

const InvoiceSettings = memo(() => {
  const { mode } = useSelector((state) => state.theme);
  const [settings, setSettings] = useState({
    invoice_prefix: 'INV',
    invoice_start_number: 1000,
    tax_rate: 0,
    currency: 'USD',
    payment_terms: 'Due upon receipt',
    auto_invoice_generation: true,
    invoice_due_days: 30
  });
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const isDark = mode === 'dark';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/invoice-settings`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSettings(response.data.settings || settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);
      await axios.post(
        `${API_URL}/admin/invoice-settings`,
        settings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const SettingInput = ({ label, value, onChange, type = 'text', suffix = '' }) => (
    <div>
      <label className={`block text-sm font-semibold mb-2 ${
        isDark ? 'text-gray-300' : 'text-gray-700'
      }`}>
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type={type}
          value={value}
          onChange={onChange}
          className={`flex-1 px-3 py-2 rounded border ${
            isDark
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300'
          }`}
        />
        {suffix && (
          <span className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} p-6`}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Settings size={32} className="text-blue-500" />
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Invoice Settings
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <div className="space-y-6">
            {/* Invoice Numbering */}
            <div>
              <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Invoice Numbering
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <SettingInput
                  label="Invoice Prefix"
                  value={settings.invoice_prefix}
                  onChange={(e) => setSettings({ ...settings, invoice_prefix: e.target.value })}
                />
                <SettingInput
                  label="Start Number"
                  value={settings.invoice_start_number}
                  onChange={(e) => setSettings({ ...settings, invoice_start_number: parseInt(e.target.value) })}
                  type="number"
                />
              </div>
            </div>

            {/* Tax & Currency */}
            <div>
              <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Tax & Currency
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <SettingInput
                  label="Tax Rate"
                  value={settings.tax_rate}
                  onChange={(e) => setSettings({ ...settings, tax_rate: parseFloat(e.target.value) })}
                  type="number"
                  suffix="%"
                />
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Currency
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className={`w-full px-3 py-2 rounded border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Terms */}
            <div>
              <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Payment Terms
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <SettingInput
                  label="Payment Terms"
                  value={settings.payment_terms}
                  onChange={(e) => setSettings({ ...settings, payment_terms: e.target.value })}
                />
                <SettingInput
                  label="Invoice Due Days"
                  value={settings.invoice_due_days}
                  onChange={(e) => setSettings({ ...settings, invoice_due_days: parseInt(e.target.value) })}
                  type="number"
                  suffix="days"
                />
              </div>
            </div>

            {/* Auto Generation */}
            <div>
              <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Automation
              </h2>
              <button
                onClick={() => setSettings({ ...settings, auto_invoice_generation: !settings.auto_invoice_generation })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.auto_invoice_generation ? 'bg-blue-500' : isDark ? 'bg-gray-700' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.auto_invoice_generation ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Auto-generate invoices on payment completion
              </p>
            </div>

            {/* Save Button */}
            <div className="flex gap-3 pt-6 border-t">
              <button
                onClick={handleSaveSettings}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-semibold"
              >
                <Save size={18} />
                {isLoading ? 'Saving...' : 'Save Settings'}
              </button>
              {saved && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg"
                >
                  ✓ Settings saved!
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-blue-900 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}
        >
          <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
            <span className="font-semibold">Example Invoice Number:</span> {settings.invoice_prefix}-{String(settings.invoice_start_number).padStart(6, '0')}
          </p>
        </motion.div>
      </div>
    </div>
  );
});

InvoiceSettings.displayName = 'InvoiceSettings';
export default InvoiceSettings;
