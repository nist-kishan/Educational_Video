import { memo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import ToastContainer from './components/ToastContainer';
import { SkeletonProfile, SkeletonText } from './components/SkeletonLoader';
import ProtectedRoute from './components/ProtectedRoute';
import AdminSidebar from './components/AdminSidebar';
import StudentSidebar from './components/StudentSidebar';
import TutorSidebar from './components/TutorSidebar';
import AdminRoutes from './routes/AdminRoutes';
import StudentRoutes from './routes/StudentRoutes';
import TutorRoutes from './routes/TutorRoutes';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import { Login, Register, ForgotPassword, ResetPassword, VerifyEmail } from './pages/Auth';
import { Courses, CreateCourse, CreateCourseWizard, CourseDetails, ModuleManager } from './pages/Tutor';
import CourseCatalog from './pages/Student/CourseCatalog';
import CourseDetailsPage from './pages/Student/CourseDetailsPage';
import CourseVideoPlayer from './pages/Student/CourseVideoPlayer';
import MyEnrollments from './pages/Student/MyEnrollments';
import TransactionHistory from './pages/Student/TransactionHistory';
import Cart from './pages/Student/Cart';
import Payment from './pages/Student/Payment';
import About from './pages/About';
import AdvancedSearch from './components/AdvancedSearch';
import CourseRecommendations from './components/CourseRecommendations';
import NotificationHistory from './pages/NotificationHistory';
import NotificationPreferences from './pages/NotificationPreferences';
import Messages from './pages/Messages';
import Wishlist from './pages/Student/Wishlist';
import Certificates from './pages/Student/Certificates';
import RefundRequest from './pages/Student/RefundRequest';
import Subscriptions from './pages/Student/Subscriptions';
import PaymentMethods from './pages/Student/PaymentMethods';
import Forum from './pages/Student/Forum';
import { initializeApp } from './store/authSlice';

const App = memo(() => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const isDark = mode === 'dark';

  // Initialize app on mount - check if user is authenticated
  useEffect(() => {
    dispatch(initializeApp());
  }, [dispatch]);

  // Show skeleton loading while initializing
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-md px-4"
        >
          <SkeletonProfile />
          <div className="mt-8 space-y-4">
            <SkeletonText lines={2} />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className={`flex flex-col min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <Header />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Welcome />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/student/courses" element={<CourseCatalog />} />
            <Route path="/student/courses/:courseId" element={<CourseDetailsPage />} />
            <Route path="/student/course/:courseId/video" element={isAuthenticated ? <CourseVideoPlayer /> : <Navigate to="/login" />} />
            <Route path="/student/course/:courseId/video/:videoId" element={isAuthenticated ? <CourseVideoPlayer /> : <Navigate to="/login" />} />
            <Route path="/search" element={<AdvancedSearch />} />
            <Route path="/recommendations" element={<CourseRecommendations />} />

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/profile" 
              element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} 
            />
            <Route path="/my-courses" element={isAuthenticated ? <MyEnrollments /> : <Navigate to="/login" />} />
            <Route path="/student/transactions" element={isAuthenticated ? <TransactionHistory /> : <Navigate to="/login" />} />
            <Route path="/notifications" element={isAuthenticated ? <NotificationHistory /> : <Navigate to="/login" />} />
            <Route path="/notifications/preferences" element={isAuthenticated ? <NotificationPreferences /> : <Navigate to="/login" />} />
            <Route path="/messages" element={isAuthenticated ? <Messages /> : <Navigate to="/login" />} />
            <Route path="/wishlist" element={isAuthenticated ? <Wishlist /> : <Navigate to="/login" />} />
            <Route path="/certificates" element={isAuthenticated ? <Certificates /> : <Navigate to="/login" />} />
            <Route path="/refund-request" element={isAuthenticated ? <RefundRequest /> : <Navigate to="/login" />} />
            <Route path="/subscriptions" element={isAuthenticated ? <Subscriptions /> : <Navigate to="/login" />} />
            <Route path="/payment-methods" element={isAuthenticated ? <PaymentMethods /> : <Navigate to="/login" />} />
            <Route path="/forum" element={isAuthenticated ? <Forum /> : <Navigate to="/login" />} />

            {/* Admin Routes */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute role="admin">
                  <div className="flex">
                    <AdminSidebar />
                    <div className="flex-1 ml-0 lg:ml-64">
                      <AdminRoutes />
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />

            {/* Student Routes */}
            <Route 
              path="/student/*" 
              element={
                <ProtectedRoute role="student">
                  <div className="flex">
                    <StudentSidebar />
                    <div className="flex-1 ml-0 lg:ml-64">
                      <StudentRoutes />
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />

            {/* Tutor Routes */}
            <Route 
              path="/tutor/*" 
              element={
                <ProtectedRoute role="tutor">
                  <div className="flex">
                    <TutorSidebar />
                    <div className="flex-1 ml-0 lg:ml-64">
                      <TutorRoutes />
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />

            {/* Legacy Tutor Routes (backward compatibility) */}
            <Route 
              path="/tutor/courses" 
              element={isAuthenticated ? <Courses /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/tutor/courses/create-wizard" 
              element={isAuthenticated ? <CreateCourseWizard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/tutor/courses/:courseId" 
              element={isAuthenticated ? <CourseDetails /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/tutor/courses/:courseId/edit" 
              element={isAuthenticated ? <CreateCourse /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/tutor/courses/:courseId/modules" 
              element={isAuthenticated ? <ModuleManager /> : <Navigate to="/login" />} 
            />

            {/* Legacy Student Routes (backward compatibility) */}
            <Route path="/student/cart" element={isAuthenticated ? <Cart /> : <Navigate to="/login" />} />
            <Route path="/student/payment" element={isAuthenticated ? <Payment /> : <Navigate to="/login" />} />

            {/* Catch All */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer />
      </div>
    </Router>
  );
});

App.displayName = 'App';
export default App;
