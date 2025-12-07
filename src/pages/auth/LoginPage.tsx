import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../redux/hooks";
import { setCredentials } from "../../redux/authSlice";
import { authService } from "../../services";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Card from "../../components/common/Card";
import { getErrorMessage } from "../../utils/helpers";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  // Handle OAuth2 callback (supports query params, hash fragments, common param names, and cookie fallback)
  // CHỈ CHẠY 1 LẦN khi component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let token =
      urlParams.get("token") ||
      urlParams.get("access_token") ||
      urlParams.get("jwt") ||
      null;
    let username =
      urlParams.get("username") ||
      urlParams.get("name") ||
      urlParams.get("email") ||
      null;
    let role = urlParams.get("role") || "ROLE_USER";

    // Hash fragment (e.g. implicit flow: #access_token=...&token_type=...)
    if ((!token || !username) && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      token =
        token ||
        hashParams.get("token") ||
        hashParams.get("access_token") ||
        hashParams.get("jwt") ||
        null;
      username =
        username ||
        hashParams.get("username") ||
        hashParams.get("name") ||
        hashParams.get("email") ||
        null;
      role = role || hashParams.get("role") || "ROLE_USER";
    }

    // Cookie fallback (e.g. backend sets HttpOnly token cookie but also exposes a non-HttpOnly mirror token)
    if (!token) {
      const cookieToken = document.cookie
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("token="));
      if (cookieToken) {
        token = decodeURIComponent(cookieToken.split("=")[1]);
      }
    }

    if (token && username) {
      dispatch(
        setCredentials({
          token,
          username,
          role,
        })
      );
      navigate("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // CHỈ CHẠY 1 LẦN khi mount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login({ username, password });
      dispatch(setCredentials(response));
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth2 endpoint
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  const handleFacebookLogin = () => {
    // Redirect to backend Facebook OAuth2 endpoint
    window.location.href =
      "http://localhost:8080/oauth2/authorization/facebook";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Icon */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-2xl mb-4">
            <svg
              className="w-12 h-12 text-indigo-600"
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
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Hệ Thống Quản Lý
          </h1>
          <p className="text-blue-100 text-lg">Trung Tâm Đào Tạo</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-0 animate-slide-up">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Chào mừng trở lại!
            </h2>
            <p className="text-gray-600">Đăng nhập để tiếp tục quản lý</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="transform transition-all duration-200 hover:scale-[1.01]">
              <Input
                label="Tên đăng nhập"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                required
                autoFocus
              />
            </div>

            <div className="transform transition-all duration-200 hover:scale-[1.01]">
              <Input
                label="Mật khẩu"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg animate-shake">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full py-3 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang đăng nhập...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Đăng nhập
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  Hoặc đăng nhập với
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="group flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 hover:shadow-md"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-medium text-gray-700 group-hover:text-blue-600">
                  Google
                </span>
              </button>

              <button
                type="button"
                onClick={handleFacebookLogin}
                className="group flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 hover:shadow-md"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="#1877F2"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="font-medium text-gray-700 group-hover:text-blue-600">
                  Facebook
                </span>
              </button>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div
          className="text-center mt-8 text-white/80 text-sm animate-fade-in"
          style={{ animationDelay: "0.3s" }}
        >
          <p>© 2024 Hệ Thống Quản Lý Trung Tâm. All rights reserved.</p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
