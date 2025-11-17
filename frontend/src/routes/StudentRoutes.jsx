import { memo } from 'react';
import { Routes, Route } from 'react-router-dom';

// Student Pages
import Dashboard from '@/pages/Dashboard.jsx';
import CourseCatalog from '@/pages/Student/CourseCatalog.jsx';
import CourseDetailsPage from '@/pages/Student/CourseDetailsPage.jsx';
import Cart from '@/pages/Student/Cart.jsx';
import Payment from '@/pages/Student/Payment.jsx';
import Certificates from '@/pages/Student/Certificates.jsx';
import NotificationHistory from '@/pages/NotificationHistory.jsx';
import NotificationPreferences from '@/pages/NotificationPreferences.jsx';
import Messages from '@/pages/Messages.jsx';
import Forum from '@/pages/Student/Forum.jsx';
import MyEnrollments from '@/pages/Student/MyEnrollments.jsx';
import Wishlist from '@/pages/Student/Wishlist.jsx';
import RefundRequest from '@/pages/Student/RefundRequest.jsx';
import Subscriptions from '@/pages/Student/Subscriptions.jsx';
import PaymentMethods from '@/pages/Student/PaymentMethods.jsx';

const StudentRoutes = memo(() => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/courses" element={<CourseCatalog />} />
      <Route path="/courses/:courseId" element={<CourseDetailsPage />} />
      <Route path="/enrollments" element={<MyEnrollments />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/certificates" element={<Certificates />} />
      <Route path="/notifications" element={<NotificationHistory />} />
      <Route path="/notifications/preferences" element={<NotificationPreferences />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/courses/:courseId/forum" element={<Forum />} />
      <Route path="/refund-request" element={<RefundRequest />} />
      <Route path="/subscriptions" element={<Subscriptions />} />
      <Route path="/payment-methods" element={<PaymentMethods />} />
    </Routes>
  );
});

StudentRoutes.displayName = 'StudentRoutes';
export default StudentRoutes;
