import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { deletePost, getPosts } from "../services/postService";
import type { Post } from "../services/postService";
import { Link } from "react-router-dom";
import useQuery from "../hooks/useQuery";

const normalizarTexto = (valor: string) =>
  valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const GerenciarPostagens: React.FC = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState("");
  // Removidos areaFilter e order pois não são mais usados
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [modalPost, setModalPost] = useState<Post | null>(null);
  const navigate = useNavigate();

  const {
    data: postsResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["posts", user?.nome, page],
    enabled: Boolean(user?.nome),
    queryFn: () =>
      getPosts({
        page,
        limit,
        autor: user?.nome || undefined,
      }),
  });

  const orderedPosts = useMemo(() => {
    const lista = postsResponse?.posts ? [...postsResponse.posts] : [];
    return lista.sort((a: Post, b: Post) => {
      const dateA = new Date(a.AtualizadoEm || a.CriadoEm || 0).getTime();
      const dateB = new Date(b.AtualizadoEm || b.CriadoEm || 0).getTime();
      return dateB - dateA;
    });
  }, [postsResponse]);

  const hasPosts = orderedPosts.length > 0;
  const filteredPosts = useMemo(() => {
    if (!search.trim()) return orderedPosts;
    const termos = normalizarTexto(search)
      .split(/\s+/)
      .map(t => t.trim())
      .filter(Boolean);

    return orderedPosts.filter((p: Post) => {
      const titulo = p.titulo ? normalizarTexto(p.titulo) : '';
      const conteudo = p.conteudo ? normalizarTexto(p.conteudo) : '';
      const area = p.areaDoConhecimento ? normalizarTexto(p.areaDoConhecimento) : '';
      const autor = p.autor ? normalizarTexto(p.autor) : '';

      // Match quando QUALQUER palavra digitada aparece em qualquer campo
      return termos.some(t => titulo.includes(t) || conteudo.includes(t) || area.includes(t) || autor.includes(t));
    });
  }, [orderedPosts, search]);

  const totalPages = postsResponse?.total ? Math.ceil(postsResponse.total / limit) : 1;
  const loading = Boolean(user?.nome) && isLoading;
  const error = isError ? "Erro ao buscar postagens." : "";

  return (
    <div className="page-center" style={{ maxWidth: 800, margin: "0 auto", padding: 24, boxSizing: 'border-box', justifyContent: 'flex-start' }}>
      <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontWeight: 900, color: '#111', fontSize: 22 }}>
          Gerenciamento de posts
        </h1>
        <Link to="/" style={{ textDecoration: "none" }}>
          <button
            type="button"
            style={{ padding: '8px 16px', borderRadius: 8, background: '#4dbec7', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}
          >
            Voltar para a Home
          </button>
        </Link>
      </div>
      {/* Barra de busca + botão Criar (apenas quando já existem postagens) */}
      {hasPosts && (
        <div style={{ width: '100%', display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Buscar"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', minWidth: 220, flex: '1 1 220px' }}
          />

          <Link to="/criar" style={{ textDecoration: 'none' }}>
            <button
              type="button"
              style={{ padding: '10px 22px', borderRadius: 8, background: '#111', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 700 }}
            >
              Criar
            </button>
          </Link>
        </div>
      )}
      {loading && <p>Carregando...</p>}
      {!loading && error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && orderedPosts.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 12 }}>
            Não há postagens
          </p>
          <Link to="/criar">
            <button style={{ padding: '10px 28px', borderRadius: 8, background: '#111', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 800 }}>
              Faça sua primeira postagem aqui
            </button>
          </Link>
        </div>
      )}
      {!loading && orderedPosts.length > 0 && filteredPosts.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: 16, width: '100%' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: 0 }}>
            Nenhuma postagem encontrada para a busca.
          </p>
        </div>
      )}
      {/* Tabela de posts do professor logado */}
      {!loading && filteredPosts.length > 0 && (
        <>
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead>
                <tr style={{ background: "#f3f3f3" }}>
                  <th style={{ padding: 8, border: "1px solid #ddd", color: '#000' }}>Título</th>
                  <th style={{ padding: 8, border: "1px solid #ddd", color: '#000' }}>Autor</th>
                  <th style={{ padding: 8, border: "1px solid #ddd", color: '#000' }}>Resumo</th>
                  <th style={{ padding: 8, border: "1px solid #ddd", color: '#000' }}>Publicado em</th>
                  <th style={{ padding: 8, border: "1px solid #ddd", color: '#000' }}>Editar</th>
                  <th style={{ padding: 8, border: "1px solid #ddd", color: '#000' }}>Deletar</th>
                </tr>
              </thead>
              <tbody>
                {/* Exibe cada post em uma linha da tabela */}
                {filteredPosts.map(post => (
                  <tr key={post.id}>
                    {/* Apenas uma linha para o título */}
                    <td style={{ padding: 8, border: "1px solid #ddd", fontWeight: 700, color: '#7c4dbe', fontSize: 16, minWidth: 120, maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {post.titulo}
                    </td>
                    <td style={{ padding: 8, border: "1px solid #ddd", color: '#111', minWidth: 140, maxWidth: 200 }}>
                      {post.autor || "Autor desconhecido"}
                    </td>
                    {/* Resumo do conteúdo (100 caracteres) */}
                    <td style={{ padding: 8, border: "1px solid #ddd", wordBreak: 'break-word', minWidth: 220, maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', color: '#111' }}>{(post.conteudo || "").substring(0, 100)}...</td>
                    {/* Data/hora de publicação ou atualização */}
                    <td style={{ padding: 8, border: "1px solid #ddd", whiteSpace: 'nowrap', color: '#111' }}>
                      {post.AtualizadoEm || post.CriadoEm ? (
                        <>
                          {post.AtualizadoEm || post.CriadoEm}
                          {('AtualizadoEmHora' in post && post.AtualizadoEmHora) || ('CriadoEmHora' in post && post.CriadoEmHora)
                            ? ` às ${post.AtualizadoEmHora || post.CriadoEmHora}`
                            : ""}
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
            <p style={{ marginBottom: 24, color: '#111', fontWeight: 800 }}>
              Tem certeza que você quer excluir?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
              <button disabled={deleting} onClick={async () => {
                setDeleting(true);
                try {
                  await deletePost(confirmDeleteId);
                  await refetch();
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
          <div style={{ marginBottom: 8, color: '#444', fontWeight: 700 }}>{modalPost.autor || 'Autor desconhecido'}</div>
          {modalPost.imagem && <img src={modalPost.imagem} alt="imagem do post" style={{ maxWidth: 180, maxHeight: 180, borderRadius: 8, marginBottom: 12 }} />}
          <div style={{ marginBottom: 12, color: '#111', fontWeight: 800 }}>{modalPost.areaDoConhecimento || ''}</div>
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
