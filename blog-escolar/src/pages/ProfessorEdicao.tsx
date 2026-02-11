import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { atualizarProfessor, obterUsuario } from "../services/usuarioService";

const ProfessorEdicao: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      try {
        const usuario = await obterUsuario(id);
        setNome(usuario.nome ?? "");
        setEmail(usuario.email ?? "");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (user?.role !== "professor") {
    return (
      <div className="page-center" style={{ maxWidth: 700, margin: "0 auto", padding: 24 }}>
        <h1>Acesso restrito</h1>
        <p>Somente professores podem editar docentes.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-center" style={{ maxWidth: 700, margin: "0 auto", padding: 24 }}>
        <p>Carregando dados do professor...</p>
      </div>
    );
  }

  return (
    <form
      className="page-center"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!id) return;

        setSaving(true);
        try {
          await atualizarProfessor(id, { nome: nome.trim(), email: email.trim() });
          alert("Professor atualizado com sucesso.");
          navigate("/professores");
        } catch {
          alert("Erro ao atualizar professor.");
        } finally {
          setSaving(false);
        }
      }}
      style={{ maxWidth: 520, margin: "0 auto", padding: 24, display: "flex", flexDirection: "column", gap: 12 }}
    >
      <h1 style={{ marginBottom: 8 }}>Editar professor</h1>

      <label htmlFor="nome">Nome</label>
      <input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />

      <label htmlFor="email">Email</label>
      <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button
          type="submit"
          disabled={saving}
          style={{ padding: "10px 16px", borderRadius: 8, background: "#7c4dbe", color: "#fff", border: "none", cursor: "pointer" }}
        >
          {saving ? "Salvando..." : "Salvar alterações"}
        </button>

        <Link to="/professores" style={{ textDecoration: "none" }}>
          <button
            type="button"
            style={{ padding: "10px 16px", borderRadius: 8, background: "#aaa", color: "#fff", border: "none", cursor: "pointer" }}
          >
            Cancelar
          </button>
        </Link>
      </div>
    </form>
  );
};

export default ProfessorEdicao;
