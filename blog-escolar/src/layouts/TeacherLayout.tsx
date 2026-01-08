import React from 'react';
import type { ChildrenProps } from "../interfaces/children";

const TeacherLayout: React.FC<ChildrenProps> = ({ children }) => {
  return (
    <div>
      <header style={{ background: '#388e3c', color: '#fff', padding: '1rem' }}>
        <h2>Área do Docente</h2>
      </header>
      <main>{children}</main>
      <footer style={{ background: '#eee', padding: '0.5rem', textAlign: 'center' }}>
        <small>© 2025 Blog Escolar - Docente</small>
      </footer>
    </div>
  );
};

export default TeacherLayout;
