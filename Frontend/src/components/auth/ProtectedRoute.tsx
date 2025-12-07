import React from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../redux/hooks";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireUserOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requireUserOnly = false,
}) => {
  const { isAuthenticated, role } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && role !== "ROLE_ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireUserOnly && role !== "ROLE_USER") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
