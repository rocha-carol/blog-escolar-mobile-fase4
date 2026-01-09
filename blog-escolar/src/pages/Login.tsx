import AudioRead from '../components/AudioRead';
import useAuth from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";

const Login: React.FC = () => {
  // Estados para armazenar usuário e senha digitados
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  // Função chamada ao enviar o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita recarregar a página
    setError("");
    setSuccess("");
    try {
      await login(email, password);
      setTimeout(() => {
        navigate("/"); // Redireciona para a Home após login
      }, 1000);
    } catch {
      setError("Usuário ou senha inválidos.");
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h1 className="login-title">
        Login <AudioRead text="Login" />
      </h1>
      <p className="login-subtitle">
        Acesse sua conta para publicar e interagir com os conteúdos.
      </p>

      {error && <div className="login-alert login-alert--error" role="alert">{error}</div>}
      {success && <div className="login-alert login-alert--success" role="status">{success}</div>}

      <div className="login-field">
        <label className="login-label" htmlFor="login-email">
          Email <AudioRead text="Email" />
        </label>
        <input
          id="login-email"
          className="login-input"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
          aria-invalid={Boolean(error) || undefined}
        />
      </div>

      <div className="login-field">
        <label className="login-label" htmlFor="login-password">
          Senha <AudioRead text="Senha" />
        </label>
        <input
          id="login-password"
          className="login-input"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          aria-invalid={Boolean(error) || undefined}
        />
      </div>

      <div className="login-actions">
        <button className="login-submit" type="submit">
          Entrar
        </button>
      </div>

      <p className="login-footer">
        Ainda não tem conta?{' '}
        <Link to="/cadastro">Criar uma conta</Link>
      </p>
    </form>
  );
};

export default Login;