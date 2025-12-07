import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { logout } from "../../redux/authSlice";
import { isAdmin, getRoleDisplay } from "../../utils/roleUtils";

const Navbar: React.FC = () => {
  const { username, role, isAuthenticated } = useAppSelector(
    (state: any) => state.auth
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-white opacity-5"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <span className="text-xl font-bold">Quản Lý Trung Tâm</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/dashboard"
              className="hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg font-medium"
            >
              Trang chủ
            </Link>
            <Link
              to="/students"
              className="hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg font-medium"
            >
              Học viên
            </Link>
            <Link
              to="/courses"
              className="hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg font-medium"
            >
              Khóa học
            </Link>
            {!isAdmin(role) && (
              <Link
                to="/enrollments"
                className="hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg font-medium"
              >
                Đăng ký học
              </Link>
            )}
            {isAdmin(role) && (
              <Link
                to="/certificates"
                className="hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg font-medium"
              >
                Cấp chứng chỉ
              </Link>
            )}
            <Link
              to="/statistics"
              className="hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg font-medium"
            >
              Thống kê
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="font-medium">{username}</div>
              <div className="text-xs text-primary-200">
                {getRoleDisplay(role || "")}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg font-medium flex items-center space-x-2 backdrop-blur-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
