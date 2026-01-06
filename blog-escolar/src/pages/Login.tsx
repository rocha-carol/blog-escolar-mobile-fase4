import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
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
    <form onSubmit={handleSubmit}>
      <h1>Login</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <div>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Senha:
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </label>
      </div>
      <button type="submit">Entrar</button>
    </form>
  );
};

export default Login;