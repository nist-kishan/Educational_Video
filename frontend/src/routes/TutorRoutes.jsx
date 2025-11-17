import { memo } from 'react';
import { Routes, Route } from 'react-router-dom';

// Tutor Pages
import Dashboard from '@/pages/Dashboard.jsx';
import Courses from '@/pages/Tutor/Courses.jsx';
import CreateCourse from '@/pages/Tutor/CreateCourse.jsx';
import CourseDetails from '@/pages/Tutor/CourseDetails.jsx';
import CourseAnalytics from '@/pages/Tutor/CourseAnalytics.jsx';
import StudentManagement from '@/pages/Tutor/StudentManagement.jsx';
import Messages from '@/pages/Messages.jsx';

const TutorRoutes = memo(() => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/courses/create" element={<CreateCourse />} />
      <Route path="/courses/:courseId" element={<CourseDetails />} />
      <Route path="/courses/:courseId/analytics" element={<CourseAnalytics />} />
      <Route path="/students" element={<StudentManagement />} />
      <Route path="/messages" element={<Messages />} />
    </Routes>
  );
});

TutorRoutes.displayName = 'TutorRoutes';
export default TutorRoutes;
