import React, { useState } from "react";

const CadastroUsuario: React.FC = () => {
  // Estados para os campos do formulário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState("professor");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  // Função para enviar o cadastro
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensagem("");
    try {
      // Envia os dados para o backend
      const response = await fetch("/usuario/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha, role })
      });
      if (response.ok) {
        setMensagem("Usuário cadastrado com sucesso!");
        alert("Usuário cadastrado com sucesso!");
        setNome(""); setEmail(""); setSenha(""); setRole("professor");
      } else {
        setMensagem("Erro ao cadastrar usuário.");
      }
    } catch {
      setMensagem("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="page-center" style={{ maxWidth: 400, margin: "0 auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ textAlign: "center" }}>Cadastro de Usuário</h2>
      <input placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} required />
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} required />
      <select value={role} onChange={e => setRole(e.target.value)} required>
        <option value="professor">Professor</option>
        <option value="estudante">Estudante</option>
        <option value="coordenador">Coordenador Pedagógico</option>
      </select>
      <button type="submit" disabled={loading} style={{ padding: "10px 28px", borderRadius: 8, background: "#7c4dbe", color: "#fff", border: "none", cursor: "pointer", fontSize: "1rem" }}>
        {loading ? "Cadastrando..." : "Cadastrar"}
      </button>
      {mensagem && <p style={{ textAlign: "center", color: mensagem.includes("sucesso") ? "green" : "red" }}>{mensagem}</p>}
    </form>
  );
};

export default CadastroUsuario;
