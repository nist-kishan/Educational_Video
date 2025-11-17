import { memo } from 'react';
import { Routes, Route } from 'react-router-dom';

// Admin Pages
import AdminDashboard from '@/pages/Admin/Dashboard.jsx';
import UserManagement from '@/pages/Admin/UserManagement.jsx';
import PlatformAnalytics from '@/pages/Admin/Analytics.jsx';
import EmailTemplates from '@/pages/Admin/EmailTemplates.jsx';
import InvoiceSettings from '@/pages/Admin/InvoiceSettings.jsx';
import RecurringInvoices from '@/pages/Admin/RecurringInvoices.jsx';
import CouponManagement from '@/pages/Admin/CouponManagement.jsx';
import RefundManagement from '@/pages/Admin/RefundManagement.jsx';
import ModerationDashboard from '@/pages/Admin/ModerationDashboard.jsx';

const AdminRoutes = memo(() => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/users" element={<UserManagement />} />
      <Route path="/analytics" element={<PlatformAnalytics />} />
      <Route path="/email-templates" element={<EmailTemplates />} />
      <Route path="/invoice-settings" element={<InvoiceSettings />} />
      <Route path="/recurring-invoices" element={<RecurringInvoices />} />
      <Route path="/coupons" element={<CouponManagement />} />
      <Route path="/refunds" element={<RefundManagement />} />
      <Route path="/moderation" element={<ModerationDashboard />} />
    </Routes>
  );
});

AdminRoutes.displayName = 'AdminRoutes';
export default AdminRoutes;
