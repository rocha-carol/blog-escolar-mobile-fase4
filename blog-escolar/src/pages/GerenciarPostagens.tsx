import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api from "../services/authService";
import { Link } from "react-router-dom";

// Estrutura de um post para listagem
interface Post {
  id: string;
  titulo: string;
  conteudo: string;
  status: string;
  CriadoEm?: string;
  AtualizadoEm?: string;
  imagem?: string;
}

const GerenciarPostagens: React.FC = () => {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState("");
  // Removidos areaFilter e order pois não são mais usados
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [modalPost, setModalPost] = useState<Post | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelado = false;
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError("");
        let url = `/posts?page=${page}&limit=${limit}`;
        if (user && user.nome) {
          url += `&autor=${encodeURIComponent(user.nome)}`;
        }
        const response = await api.get(url);
        let lista = response.data.posts || [];
        // Filtro por título, conteúdo ou área do conhecimento
        if (search) {
          const termo = search.toLowerCase();
          lista = lista.filter((p: import("../services/postService").Post) =>
            (p.titulo && p.titulo.toLowerCase().includes(termo)) ||
            (p.conteudo && p.conteudo.toLowerCase().includes(termo)) ||
            (p.areaDoConhecimento && p.areaDoConhecimento.toLowerCase().includes(termo))
          );
        }
        // Ordenação por data
        lista = lista.sort((a, b) => {
          const dateA = new Date(a.AtualizadoEm || a.CriadoEm || 0).getTime();
          const dateB = new Date(b.AtualizadoEm || b.CriadoEm || 0).getTime();
          return order === 'desc' ? dateB - dateA : dateA - dateB;
        });
        if (!cancelado) setPosts(lista);
        if (!cancelado && response.data.total) {
          setTotalPages(Math.ceil(response.data.total / limit));
        }
      } catch (err: any) {
        if (!cancelado) setError("Erro ao buscar postagens.");
      } finally {
        if (!cancelado) setLoading(false);
      }
    };
    if (user && user.nome) fetchPosts();
    else {
      setLoading(false);
      setPosts([]);
    }
    return () => { cancelado = true; };
  }, [user, search, page]);

  return (
    <div className="page-center" style={{ maxWidth: 800, margin: "0 auto", padding: 24, boxSizing: 'border-box' }}>
      <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Avatar do usuário */}
          {user ? (
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#7c4dbe", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18 }}>
              {user.nome ? user.nome[0].toUpperCase() : "?"}
            </div>
          ) : null}
          <span style={{ fontWeight: 600, color: '#7c4dbe', fontSize: 16 }}>
            {user ? user.nome : "Não logado"}
          </span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <button type="button" style={{ padding: '6px 18px', borderRadius: 6, background: '#4dbec7', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Página Inicial
            </button>
          </Link>
          <button type="button" onClick={() => {
            if (window.confirm("Deseja realmente sair?")) logout();
          }} style={{ padding: '6px 18px', borderRadius: 6, background: '#e74c3c', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            Logout
          </button>
        </div>
      </div>
      <h1 style={{ textAlign: "center", marginBottom: 24 }}>Gerenciamento de Postagens</h1>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
        <input
          type="text"
          placeholder="Buscar"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', minWidth: 180 }}
        />
      </div>
      {loading && <p>Carregando...</p>}
      {!loading && error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && posts.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <p>Crie seu primeiro post</p>
          <Link to="/criar">
            <button style={{ padding: '10px 28px', borderRadius: 8, background: '#7c4dbe', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '1rem', marginTop: 12 }}>
              Criar
            </button>
          </Link>
        </div>
      )}
      {/* Tabela de posts do professor logado */}
      {!loading && posts.length > 0 && (
        <>
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead>
                <tr style={{ background: "#f3f3f3" }}>
                  <th style={{ padding: 8, border: "1px solid #ddd", color: '#000' }}>Título</th>
                  <th style={{ padding: 8, border: "1px solid #ddd", color: '#000' }}>Resumo</th>
                  <th style={{ padding: 8, border: "1px solid #ddd", color: '#000' }}>Publicado em</th>
                  <th style={{ padding: 8, border: "1px solid #ddd", color: '#000' }}>Editar</th>
                  <th style={{ padding: 8, border: "1px solid #ddd", color: '#000' }}>Deletar</th>
                </tr>
              </thead>
              <tbody>
                {/* Exibe cada post em uma linha da tabela */}
                {posts.map(post => (
                  <tr key={post.id}>
                    {/* Apenas uma linha para o título */}
                    <td style={{ padding: 8, border: "1px solid #ddd", fontWeight: 700, color: '#7c4dbe', fontSize: 16, minWidth: 120, maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {post.titulo}
                    </td>
                    {/* Resumo do conteúdo (100 caracteres) */}
                    <td style={{ padding: 8, border: "1px solid #ddd", wordBreak: 'break-word', minWidth: 220, maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>{(post.conteudo || "").substring(0, 100)}...</td>
                    {/* Data/hora de publicação ou atualização */}
                    <td style={{ padding: 8, border: "1px solid #ddd", whiteSpace: 'nowrap' }}>
                      {post.AtualizadoEm || post.CriadoEm ? (
                        <>
                          {post.AtualizadoEm || post.CriadoEm}
                          {(post.AtualizadoEmHora || post.CriadoEmHora) ? ` às ${post.AtualizadoEmHora || post.CriadoEmHora}` : ""}
                        </>
                      ) : "-"}
                    </td>
                    {/* Botão para editar o post */}
                    <td style={{ padding: 8, border: "1px solid #ddd" }}>
                      <button onClick={() => navigate(`/editar/${post.id}`)} style={{ padding: '6px 18px', borderRadius: 6, background: '#7c4dbe', color: '#fff', border: 'none', cursor: 'pointer', minWidth: 80 }}>Editar</button>
                    </td>
                    {/* Botão para deletar o post */}
                    <td style={{ padding: 8, border: "1px solid #ddd" }}>
                      <button onClick={() => setConfirmDeleteId(post.id)} style={{ padding: '6px 18px', borderRadius: 6, background: '#e74c3c', color: '#fff', border: 'none', cursor: 'pointer', minWidth: 80 }}>Deletar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Paginação */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
            <button disabled={page === 1} onClick={() => setPage(page - 1)} style={{ padding: '6px 16px', borderRadius: 6, background: page === 1 ? '#ccc' : '#7c4dbe', color: '#fff', border: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer', minWidth: 80 }}>Anterior</button>
            <span style={{ fontWeight: 600, color: '#7c4dbe', fontSize: 16 }}>Página {page} de {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} style={{ padding: '6px 16px', borderRadius: 6, background: page === totalPages ? '#ccc' : '#7c4dbe', color: '#fff', border: 'none', cursor: page === totalPages ? 'not-allowed' : 'pointer', minWidth: 80 }}>Próxima</button>
          </div>
        </>
      )}

      {/* Modal de confirmação de exclusão */}
      {confirmDeleteId && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 2px 12px #0002', minWidth: 320, textAlign: 'center' }}>
            <p style={{ marginBottom: 24 }}>Você tem certeza que quer excluir?</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
              <button disabled={deleting} onClick={async () => {
                setDeleting(true);
                try {
                  await api.delete(`/posts/${confirmDeleteId}`);
                  setPosts(posts.filter(p => p.id !== confirmDeleteId));
                  setConfirmDeleteId(null);
                  setToast('Post excluído com sucesso!');
                  setTimeout(() => setToast(null), 2500);
                } catch {
                  setToast('Erro ao excluir post.');
                  setTimeout(() => setToast(null), 2500);
                } finally {
                  setDeleting(false);
                }
              }} style={{ padding: '8px 28px', borderRadius: 8, background: '#e74c3c', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>Sim</button>
              <button disabled={deleting} onClick={() => setConfirmDeleteId(null)} style={{ padding: '8px 28px', borderRadius: 8, background: '#aaa', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    {/* Modal de visualização rápida do post */}
    {modalPost && (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
        <div style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 2px 12px #0002', minWidth: 320, maxWidth: 420, textAlign: 'center', position: 'relative' }}>
          <button onClick={() => setModalPost(null)} style={{ position: 'absolute', top: 12, right: 12, background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 700, cursor: 'pointer' }}>Fechar</button>
          <h2 style={{ marginBottom: 12 }}>{modalPost.titulo}</h2>
          {modalPost.imagem && <img src={modalPost.imagem} alt="imagem do post" style={{ maxWidth: 180, maxHeight: 180, borderRadius: 8, marginBottom: 12 }} />}
          <div style={{ marginBottom: 12, color: '#7c4dbe', fontWeight: 600 }}>{modalPost.areaDoConhecimento || ''}</div>
          <div style={{ marginBottom: 12 }}>{modalPost.conteudo}</div>
          <div style={{ fontSize: 13, color: '#888' }}>{modalPost.AtualizadoEm || modalPost.CriadoEm || '-'}</div>
          <div style={{ marginTop: 8 }}>
            {modalPost.status === 'publicado' ? (
              <span style={{ background: '#4dbec7', color: '#fff', borderRadius: 6, padding: '4px 12px', fontWeight: 600 }}>Publicado</span>
            ) : (
              <span style={{ background: '#aaa', color: '#fff', borderRadius: 6, padding: '4px 12px', fontWeight: 600 }}>Rascunho</span>
            )}
          </div>
        </div>
      </div>
    )}
    {/* Botão flutuante para criar novo post */}
    <Link to="/criar" style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 9999, textDecoration: 'none' }}>
      <button style={{ background: '#7c4dbe', color: '#fff', border: 'none', borderRadius: '50%', width: 60, height: 60, fontSize: 32, fontWeight: 700, boxShadow: '0 2px 12px #0002', cursor: 'pointer' }} title="Criar novo post">
        +
      </button>
    </Link>
    {/* Toast de feedback */}
    {toast && (
      <div style={{ position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', background: '#4dbec7', color: '#fff', padding: '12px 32px', borderRadius: 8, fontWeight: 600, fontSize: 16, boxShadow: '0 2px 12px #0002', zIndex: 9999 }}>
        {toast}
      </div>
    )}
    </div>
  );
};

export default GerenciarPostagens;
