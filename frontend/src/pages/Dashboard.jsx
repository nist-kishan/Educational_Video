import { memo, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BookOpen, Award, TrendingUp, ShoppingCart } from "lucide-react";
import { getUserProfile } from "../store/authSlice";
import { getMyEnrollments, getTransactionHistory } from "../store/studentSlice";
import { SkeletonGrid, SkeletonProfile } from "../components/SkeletonLoader";
import { StatCard, WelcomeSection, CoursesGrid, AnalyticsSection } from "./Dashboard/index.js";

const Dashboard = memo(() => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);
  const { user, isLoading } = useSelector((state) => state.auth);
  const { enrollments = [], transactions = [] } = useSelector((state) => state.student || {});
  
  const isDark = mode === "dark";
  const bgClass = isDark ? "bg-gray-900" : "bg-white";

  useEffect(() => {
    if (!user) {
      dispatch(getUserProfile());
    }
  }, [dispatch, user]);

  useEffect(() => {
    dispatch(getMyEnrollments({ page: 1, limit: 12 }));
    dispatch(getTransactionHistory());
  }, [dispatch]);

  const stats = useMemo(() => {
    const enrolledCount = enrollments?.length || 0;
    const purchasedCount = transactions?.length || 0;
    const totalCourses = enrolledCount + purchasedCount;
    
    return [
      { 
        icon: BookOpen, 
        label: "Courses Enrolled", 
        value: enrolledCount.toString(), 
        color: "from-blue-500 to-blue-600" 
      },
      { 
        icon: ShoppingCart, 
        label: "Courses Purchased", 
        value: purchasedCount.toString(), 
        color: "from-purple-500 to-purple-600" 
      },
      { 
        icon: Award, 
        label: "Total Courses", 
        value: totalCourses.toString(), 
        color: "from-green-500 to-green-600"
      },
      { 
        icon: TrendingUp, 
        label: "Learning Progress", 
        value: enrolledCount > 0 ? "Active" : "Start Learning", 
        color: "from-orange-500 to-orange-600" 
      }
    ];
  }, [enrollments, transactions]);

  const courses = useMemo(() => {
    return (enrollments || []).map((enrollment) => {
      const courseData = enrollment.courses || {};
      return {
        id: courseData.id || enrollment.course_id,
        title: courseData.name || "Untitled Course",
        description: courseData.description || "",
        progress: enrollment.progress || 0,
        instructor: courseData.instructor_name || "Unknown Instructor",
        rating: courseData.rating || 0,
        category: courseData.category || "",
        price: courseData.price || 0,
        total_duration: courseData.total_duration || 0,
        total_videos: courseData.total_videos || 0,
        modules_count: courseData.modules_count || 0,
        videos_count: courseData.videos_count || 0,
        assignments_count: courseData.assignments_count || 0,
        enrolledAt: enrollment.enrolled_at,
        status: enrollment.status
      };
    });
  }, [enrollments]);

  if (isLoading) {
    return (
      <div className={`min-h-screen ${bgClass} py-12`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SkeletonProfile />
          <div className="mt-12">
            <SkeletonGrid count={4} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} py-12`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <WelcomeSection user={user} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>

        {courses.length > 0 ? (
          <CoursesGrid courses={courses} />
        ) : (
          <div className={`text-center py-12 rounded-lg ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className={`text-lg font-medium ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              No courses enrolled yet
            </p>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Start learning by enrolling in a course
            </p>
          </div>
        )}

        <AnalyticsSection enrollments={enrollments} transactions={transactions} />
      </div>
    </div>
  );
});

Dashboard.displayName = "Dashboard";
export default Dashboard;
