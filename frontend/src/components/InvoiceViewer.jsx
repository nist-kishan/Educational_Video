import { memo, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Download, Mail, Printer, FileText } from 'lucide-react';
import axios from 'axios';

const InvoiceViewer = memo(({ orderId, transactionId }) => {
  const { mode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);
  const [invoice, setInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const isDark = mode === 'dark';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  const handleDownloadPDF = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_URL}/student/certificates/${transactionId}/download`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const link = document.createElement('a');
      link.href = response.data.downloadUrl;
      link.download = `invoice-${orderId}.pdf`;
      link.click();
    } catch (error) {
      console.error('Error downloading invoice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmailInvoice = async () => {
    try {
      await axios.post(
        `${API_URL}/student/invoices/${orderId}/email`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Invoice sent to your email!');
    } catch (error) {
      console.error('Error sending invoice:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-8 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}
    >
      {/* Invoice Header */}
      <div className="flex justify-between items-start mb-8 pb-8 border-b">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            INVOICE
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Invoice #{orderId}
          </p>
        </div>
        <div className="text-right">
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Date: {new Date().toLocaleDateString()}
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Due: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            BILL TO
          </h3>
          <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {user?.first_name} {user?.last_name}
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {user?.email}
          </p>
        </div>
        <div>
          <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            FROM
          </h3>
          <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Educational Video Platform
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            support@platform.com
          </p>
        </div>
      </div>

      {/* Invoice Items */}
      <div className="mb-8 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b-2 ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
              <th className={`px-4 py-2 text-left text-sm font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>Description</th>
              <th className={`px-4 py-2 text-right text-sm font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>Quantity</th>
              <th className={`px-4 py-2 text-right text-sm font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>Unit Price</th>
              <th className={`px-4 py-2 text-right text-sm font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <td className={`px-4 py-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Course Enrollment
              </td>
              <td className={`px-4 py-4 text-right ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                1
              </td>
              <td className={`px-4 py-4 text-right ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                $99.99
              </td>
              <td className={`px-4 py-4 text-right font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                $99.99
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between mb-2">
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Subtotal:</span>
            <span className={isDark ? 'text-white' : 'text-gray-900'}>$99.99</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Tax (0%):</span>
            <span className={isDark ? 'text-white' : 'text-gray-900'}>$0.00</span>
          </div>
          <div className={`flex justify-between pt-2 border-t-2 ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
            <span className="font-bold text-lg">Total:</span>
            <span className="font-bold text-lg text-green-500">$99.99</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className={`p-4 rounded-lg mb-8 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          <span className="font-semibold">Payment Status:</span> Paid
        </p>
        <p className={`text-sm mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Thank you for your purchase! Your invoice has been recorded.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleDownloadPDF}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          <Download size={18} />
          Download PDF
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          <Printer size={18} />
          Print
        </button>
        <button
          onClick={handleEmailInvoice}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          <Mail size={18} />
          Email Invoice
        </button>
      </div>
    </motion.div>
  );
});

InvoiceViewer.displayName = 'InvoiceViewer';
export default InvoiceViewer;
