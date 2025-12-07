import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../redux/hooks";
import { setCredentials } from "../../redux/authSlice";
import LoadingSpinner from "../../components/common/LoadingSpinner";

/**
 * Component xử lý OAuth2 redirect từ backend
 * Backend redirect về: /oauth-redirect?token=JWT&username=name&role=ROLE_USER
 */
const OAuthRedirectHandler: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const username = urlParams.get("username");
    const role = urlParams.get("role") || "ROLE_USER";

    if (token && username) {
      // Lưu credentials vào Redux và localStorage
      dispatch(
        setCredentials({
          token,
          username,
          role,
        })
      );

      // Chuyển hướng đến dashboard
      navigate("/dashboard", { replace: true });
    } else {
      // Không có token -> chuyển về trang đăng nhập
      console.error("OAuth redirect missing token or username");
      navigate("/login", { replace: true });
    }
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
};

export default OAuthRedirectHandler;
