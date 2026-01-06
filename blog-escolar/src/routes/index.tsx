import GerenciarPostagens from "../pages/GerenciarPostagens";
import CadastroUsuario from "../pages/CadastroUsuario";
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import LoginLayout from '../layouts/LoginLayout';

// Importação das páginas (criaremos depois)
import { Home } from '../pages/Home';
import NotFound from '../pages/NotFound';
import PostRead from '../pages/PostRead';
import PostCreate from '../pages/PostCreate';
import PostEdit from '../pages/PostEdit';
// import Admin from '../pages/Admin';
// import ProtectedRoute from './ProtectedRoute';
// Import de ProtectedRoute removido pois não está sendo utilizado
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
      {/* Rota principal da aplicação */}
      <Route path="/" element={<Home />} />
        <Route path="/gerenciamentodepostagens" element={
          <ProtectedRoute>
            <GerenciarPostagens />
          </ProtectedRoute>
        } />
        <Route path="/post/:id" element={<PostRead />} />
        <Route path="/criar" element={
          <ProtectedRoute>
            <PostCreate />
          </ProtectedRoute>
        } />
        <Route path="/editar/:id" element={
          <ProtectedRoute>
            <PostEdit />
          </ProtectedRoute>
        } />
      {/* <Route path="/admin" element={<Admin />} /> */}
        <Route path="/admin" element={<CadastroUsuario />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
  import ProtectedRoute from './ProtectedRoute';

export default AppRoutes;
