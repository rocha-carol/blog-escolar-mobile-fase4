import React from 'react';
import type { ChildrenProps } from "../interfaces/children";
import "../styles/Login.css";

const LoginLayout: React.FC<ChildrenProps> = ({ children }) => {
  return (
    <div className="login-shell">
      <main className="login-card">
        {children}
      </main>
    </div>
  );
};

export default LoginLayout;
