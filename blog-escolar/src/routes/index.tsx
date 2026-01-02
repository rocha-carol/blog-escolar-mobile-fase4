import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import LoginLayout from '../layouts/LoginLayout';

// Importação das páginas (criaremos depois)
import { Home } from '../pages/Home';
import PostRead from '../pages/PostRead';
import PostCreate from '../pages/PostCreate';
import PostEdit from '../pages/PostEdit';
import Admin from '../pages/Admin';
// import ProtectedRoute from './ProtectedRoute';
import ProtectedRoute from './ProtectedRoute';
// import Post from '../pages/Post';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={
        <LoginLayout>
          <Login />
        </LoginLayout>
      } />
      {/* Página principal (Home) liberada para todos */}
      <Route path="/" element={<Home />} />
      <Route path="/post/:id" element={<PostRead />} />
      <Route path="/criar" element={<PostCreate />} />
      <Route path="/editar/:id" element={<PostEdit />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
};

export default AppRoutes;
