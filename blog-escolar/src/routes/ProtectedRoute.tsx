import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import type { ChildrenProps } from "../interfaces/children";

const ProtectedRoute: React.FC<ChildrenProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    // Redireciona para o login se não estiver autenticado
    return <Navigate to="/login" replace />;
  }
  if (!user || user.role !== "professor") {
    // Redireciona para a home se não for professor
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
