import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useQuery from "../hooks/useQuery";
import useAuth from "../hooks/useAuth";
import { excluirProfessor, listarProfessores } from "../services/usuarioService";

const ProfessoresListagem: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [termo, setTermo] = useState("");
  const [buscaDebounced, setBuscaDebounced] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const limit = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setBuscaDebounced(termo.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [termo]);

  useEffect(() => {
    setPage(1);
  }, [buscaDebounced]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["professores", page, buscaDebounced],
    enabled: user?.role === "professor",
    queryFn: () => listarProfessores({ page, limit, termo: buscaDebounced }),
  });

  const professores = useMemo(() => data?.usuarios ?? [], [data]);
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / limit));

  if (user?.role !== "professor") {
    return (
      <div className="page-center" style={{ maxWidth: 780, margin: "0 auto", padding: 24 }}>
        <h1>Acesso restrito</h1>
        <p>Somente professores podem acessar a listagem de docentes.</p>
      </div>
    );
  }

  return (
    <div className="page-center" style={{ maxWidth: 1000, margin: "0 auto", padding: 24, boxSizing: "border-box" }}>
      <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Listagem de professores</h1>
        <Link to="/" style={{ textDecoration: "none" }}>
          <button type="button" style={{ padding: "8px 16px", borderRadius: 8, background: "#4dbec7", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700 }}>
            Voltar para Home
          </button>
        </Link>
      </div>

      <input
        type="text"
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        placeholder="Buscar por nome ou email"
        style={{ width: "100%", padding: 10, border: "1px solid #ccc", borderRadius: 8, marginBottom: 14 }}
      />

      {isLoading && <p>Carregando professores...</p>}
      {!isLoading && isError && <p style={{ color: "#e74c3c" }}>Erro ao carregar professores.</p>}

      {!isLoading && !isError && (
        <>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720, background: "#fff", borderRadius: 8, overflow: "hidden" }}>
              <thead>
                <tr style={{ background: "#f5f6fb" }}>
                  <th style={{ padding: 10, border: "1px solid #ddd", textAlign: "left" }}>Nome</th>
                  <th style={{ padding: 10, border: "1px solid #ddd", textAlign: "left" }}>Email</th>
                  <th style={{ padding: 10, border: "1px solid #ddd" }}>Editar</th>
                  <th style={{ padding: 10, border: "1px solid #ddd" }}>Excluir</th>
                </tr>
              </thead>
              <tbody>
                {professores.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: 16, textAlign: "center", border: "1px solid #ddd" }}>
                      Nenhum professor encontrado.
                    </td>
                  </tr>
                )}
                {professores.map((professor) => (
                  <tr key={professor.id}>
                    <td style={{ padding: 10, border: "1px solid #ddd" }}>{professor.nome}</td>
                    <td style={{ padding: 10, border: "1px solid #ddd" }}>{professor.email ?? "-"}</td>
                    <td style={{ padding: 10, border: "1px solid #ddd", textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => navigate(`/professores/editar/${professor.id}`)}
                        style={{ padding: "6px 16px", borderRadius: 6, background: "#7c4dbe", color: "#fff", border: "none", cursor: "pointer" }}
                      >
                        Editar
                      </button>
                    </td>
                    <td style={{ padding: 10, border: "1px solid #ddd", textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm("Deseja excluir este professor?")) return;
                          setDeletingId(professor.id);
                          try {
                            await excluirProfessor(professor.id);
                            await refetch();
                          } finally {
                            setDeletingId(null);
                          }
                        }}
                        disabled={deletingId === professor.id}
                        style={{ padding: "6px 16px", borderRadius: 6, background: "#e74c3c", color: "#fff", border: "none", cursor: "pointer" }}
                      >
                        {deletingId === professor.id ? "Excluindo..." : "Excluir"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 10, justifyContent: "center", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ padding: "6px 16px", borderRadius: 6, border: "none", background: page === 1 ? "#ccc" : "#7c4dbe", color: "#fff" }}
            >
              Anterior
            </button>
            <span style={{ fontWeight: 700 }}>Página {page} de {totalPages}</span>
            <button
              type="button"
              onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
              disabled={page >= totalPages}
              style={{ padding: "6px 16px", borderRadius: 6, border: "none", background: page >= totalPages ? "#ccc" : "#7c4dbe", color: "#fff" }}
            >
              Próxima
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfessoresListagem;
