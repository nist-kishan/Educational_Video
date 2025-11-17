import { memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Mail,
  FileText,
  Repeat2,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const AdminSidebar = memo(() => {
  const { mode } = useSelector((state) => state.theme);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const isDark = mode === 'dark';

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'User Management', path: '/admin/users' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: Mail, label: 'Email Templates', path: '/admin/email-templates' },
    { icon: FileText, label: 'Invoice Settings', path: '/admin/invoice-settings' },
    { icon: Repeat2, label: 'Recurring Invoices', path: '/admin/recurring-invoices' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ duration: 0.3 }}
        className={`fixed left-0 top-0 h-screen w-64 ${
          isDark ? 'bg-gray-800' : 'bg-gray-50'
        } border-r ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6 z-40 lg:relative lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="mb-8">
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Admin Panel
          </h2>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Platform Management
          </p>
        </div>

        {/* Menu Items */}
        <nav className="space-y-2 mb-8">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <motion.button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsOpen(false);
                }}
                whileHover={{ x: 5 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-blue-500 text-white'
                    : isDark
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} my-8`} />

        {/* Logout */}
        <button
          onClick={() => {
            localStorage.removeItem('token');
            navigate('/login');
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isDark
              ? 'text-red-400 hover:bg-red-900 hover:bg-opacity-20'
              : 'text-red-600 hover:bg-red-50'
          }`}
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </motion.div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
        />
      )}
    </>
  );
});

AdminSidebar.displayName = 'AdminSidebar';
export default AdminSidebar;
