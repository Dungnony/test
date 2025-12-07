import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppSelector } from "./redux/hooks";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Pages
import LoginPage from "./pages/auth/LoginPage";
import OAuthRedirectHandler from "./pages/auth/OAuthRedirectHandler";
import DashboardPage from "./pages/dashboard/DashboardPage";
import StudentsPage from "./pages/students/StudentsPage";
import StudentFormPage from "./pages/students/StudentFormPage";
import StudentHistoryPage from "./pages/students/StudentHistoryPage";
import CoursesPage from "./pages/courses/CoursesPage";
import CourseFormPage from "./pages/courses/CourseFormPage";
import CourseDetailPage from "./pages/courses/CourseDetailPage";
import EnrollmentPage from "./pages/enrollments/EnrollmentPage";
import CertificatesPage from "./pages/certificates/CertificatesPage";
import StatisticsPage from "./pages/statistics/StatisticsPage";

const App: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage />
            )
          }
        />

        {/* OAuth2 redirect handler - must be public */}
        <Route path="/oauth-redirect" element={<OAuthRedirectHandler />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Students routes */}
        <Route
          path="/students"
          element={
            <ProtectedRoute>
              <StudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students/new"
          element={
            <ProtectedRoute requireAdmin>
              <StudentFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students/:id/edit"
          element={
            <ProtectedRoute requireAdmin>
              <StudentFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students/:id/history"
          element={
            <ProtectedRoute>
              <StudentHistoryPage />
            </ProtectedRoute>
          }
        />

        {/* Courses routes */}
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <CoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/new"
          element={
            <ProtectedRoute requireAdmin>
              <CourseFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:id/edit"
          element={
            <ProtectedRoute requireAdmin>
              <CourseFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:courseId/:enrollmentId/detail"
          element={
            <ProtectedRoute>
              <CourseDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Enrollment route */}
        <Route
          path="/enrollments"
          element={
            <ProtectedRoute requireUserOnly>
              <EnrollmentPage />
            </ProtectedRoute>
          }
        />

        {/* Certificates route (Admin only) */}
        <Route
          path="/certificates"
          element={
            <ProtectedRoute requireAdmin>
              <CertificatesPage />
            </ProtectedRoute>
          }
        />

        {/* Statistics route */}
        <Route
          path="/statistics"
          element={
            <ProtectedRoute>
              <StatisticsPage />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
