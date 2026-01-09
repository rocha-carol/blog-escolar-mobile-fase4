import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import type { ChildrenProps } from "../interfaces/children";

const ProtectedRoute: React.FC<ChildrenProps> = ({ children }) => {
  const { isAuthenticated, user, isAuthLoading } = useAuth();

  // Evita "piscar" (redirect) enquanto o contexto ainda está carregando do localStorage
  if (isAuthLoading) {
    return (
      <div className="page-center" style={{ justifyContent: 'flex-start', paddingTop: 32 }}>
        <p style={{ color: '#111', fontWeight: 700 }}>Carregando...</p>
      </div>
    );
  }

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
