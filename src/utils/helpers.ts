import { CertificateStatus } from "../types";

/**
 * Get certificate status display text
 */
export const getStatusDisplay = (status: CertificateStatus): string => {
  switch (status) {
    case CertificateStatus.PASS:
      return "Đạt";
    case CertificateStatus.FAIL:
      return "Không đạt";
    case CertificateStatus.IN_PROGRESS:
      return "Chưa Hoàn Thành";
    case CertificateStatus.PENDING:
      return "Đã hoàn Thành chờ xử lí";
    default:
      return status;
  }
};

/**
 * Get status color class (Tailwind)
 */
export const getStatusColorClass = (status: CertificateStatus): string => {
  switch (status) {
    case CertificateStatus.PASS:
      return "bg-green-100 text-green-800";
    case CertificateStatus.FAIL:
      return "bg-red-100 text-red-800";
    case CertificateStatus.IN_PROGRESS:
      return "bg-blue-100 text-blue-800";
    case CertificateStatus.PENDING:
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/**
 * Handle API errors and return user-friendly message
 */
export const getErrorMessage = (error: unknown): string => {
  // Axios error với response từ backend
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as any;
    const status = axiosError.response?.status;
    const requestUrl = axiosError.config?.url || "";

    // Xử lý 401: Phân biệt đăng nhập sai vs token hết hạn
    if (status === 401) {
      // Nếu là endpoint đăng nhập -> sai mật khẩu
      if (requestUrl.includes("/auth/login") || requestUrl.includes("/login")) {
        return "Sai tên đăng nhập hoặc mật khẩu.";
      }
      // Nếu là API khác -> dùng message từ backend hoặc fallback
      return (
        axiosError.response?.data?.message ||
        "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."
      );
    }

    // Ưu tiên lấy message từ backend response cho các lỗi khác
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }

    // Fallback theo status code
    switch (status) {
      case 400:
        return "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
      case 403:
        return "Bạn không có quyền thực hiện thao tác này.";
      case 404:
        return "Không tìm thấy dữ liệu.";
      case 500:
        return "Lỗi máy chủ. Vui lòng thử lại sau.";
      default:
        return axiosError.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.";
    }
  }

  // Standard Error object
  if (error instanceof Error) {
    return error.message;
  }

  // String error
  if (typeof error === "string") {
    return error;
  }

  return "Đã xảy ra lỗi. Vui lòng thử lại sau.";
};
