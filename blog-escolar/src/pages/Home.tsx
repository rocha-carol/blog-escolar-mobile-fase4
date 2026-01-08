import AudioRead from '../components/AudioRead';
import React, { useState } from "react";
import { FaRegCommentDots } from "react-icons/fa";
import { listarComentarios, criarComentario, excluirComentario } from "../services/comentarioService";
import type { Comentario } from "../services/comentarioService";
import useAuth from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { getPosts } from "../services/postService";
import type { Post } from "../services/postService";
import useQuery from "../hooks/useQuery";
import "../styles/Home.css";
import "../styles/center.css";

// Lista de categorias fixas (pode ser dinâmica depois)
const AREAS_CONHECIMENTO = [
  "Linguagens", "Matemática", "Ciências da Natureza", "Ciências Humanas", "Tecnologias"
];
// ...existing code...st } from "../services/postService";

export const Home: React.FC = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [areaSelecionada, setAreaSelecionada] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const {
    data: postsResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["posts", page, search, areaSelecionada],
    queryFn: async () => {
      const res = await getPosts({ page, limit: 11 });
      let lista = res.posts;
      if (search) {
        const termo = search.toLowerCase();
        lista = lista.filter((p: Post) =>
          (p.titulo && p.titulo.toLowerCase().includes(termo)) ||
          (p.conteudo && p.conteudo.toLowerCase().includes(termo)) ||
          (p.areaDoConhecimento && p.areaDoConhecimento.toLowerCase().includes(termo))
        );
      }
      if (areaSelecionada) {
        lista = lista.filter((p: Post) => p.areaDoConhecimento === areaSelecionada);
      }
      return { posts: lista, hasMore: res.hasMore };
    },
  });

  const posts = postsResponse?.posts ?? [];
  const hasMore = postsResponse?.hasMore ?? false;
  const loading = isLoading;
  const error = isError ? "Erro ao carregar posts." : "";

  const destaque = posts[0];
  const ultimas: Post[] = posts.slice(1); // todos os demais posts vão para as listas abaixo

  const getNomeAutor = (p: Post) => {
    const autorValue = (p as any).autor;
    if (typeof autorValue === 'object' && autorValue !== null && 'nome' in autorValue) {
      return (autorValue as { nome?: string }).nome || 'Autor desconhecido';
    }
    if (typeof autorValue === 'string' && autorValue.trim()) return autorValue;

    const autoriaFallback = (p as any).autoria;
    if (typeof autoriaFallback === 'string' && autoriaFallback.trim()) return autoriaFallback;

    return 'Autor desconhecido';
  };

  // Comentários
  const [comentariosAbertos, setComentariosAbertos] = useState<string | null>(null); // postId
  const {
    data: comentarios = [],
    isLoading: comentariosLoading,
    refetch: refetchComentarios,
  } = useQuery<Comentario[]>({
    queryKey: ["comentarios", comentariosAbertos],
    enabled: Boolean(comentariosAbertos),
    queryFn: () => listarComentarios(comentariosAbertos as string),
  });

  // Função para abrir comentários de um post
  const abrirComentarios = (postId: string) => {
    setComentariosAbertos(postId);
  };

  // Função para fechar comentários
  const fecharComentarios = () => {
    setComentariosAbertos(null);
  };

  return (
    <>
      <div className="home-container page-center">
      {/* Modal de comentários */}
      {comentariosAbertos && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, minWidth: 340, maxWidth: 420, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 4px 24px #0003', position: 'relative' }}>
            <button onClick={fecharComentarios} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#7c4dbe' }}>×</button>
            <h3 style={{ color: '#7c4dbe', marginBottom: 12 }}>Comentários</h3>
            {comentariosLoading ? (
              <p>Carregando comentários...</p>
            ) : (
              <>
                <form
                  onSubmit={async e => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const input = form.elements.namedItem('novoComentario') as HTMLInputElement;
                    const texto = input.value.trim();
                    if (!texto) return;
                    input.disabled = true;
                    try {
                      await criarComentario(comentariosAbertos!, texto, user?.nome ?? "");
                      await refetchComentarios();
                      input.value = '';
                    } catch (err) {
                      alert('Erro ao enviar comentário.');
                    }
                    input.disabled = false;
                  }}
                  style={{ display: 'flex', gap: 8, marginBottom: 16 }}
                >
                  <input
                    name="novoComentario"
                    type="text"
                    placeholder="Escreva um comentário..."
                    style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
                    disabled={!user}
                  />
                  <button type="submit" style={{ background: '#7c4dbe', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }} disabled={!user}>
                    Comentar
                  </button>
                </form>
                {comentarios.length === 0 ? (
                  <p style={{ color: '#888' }}>Nenhum comentário ainda.</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {comentarios.map(com => (
                      <li key={com._id} style={{ borderBottom: '1px solid #eee', padding: '8px 0', position: 'relative' }}>
                        <div style={{ fontWeight: 600, color: '#7c4dbe', fontSize: 15 }}>{typeof com.autor === 'string' ? com.autor : com.autor?.nome || 'Usuário'}</div>
                        <div style={{ fontSize: 14, color: '#444', margin: '2px 0 4px 0' }}>{com.texto}</div>
                        <div style={{ fontSize: 12, color: '#888' }}>{new Date(com.criadoEm).toLocaleString('pt-BR')}</div>
                        {user?.role === 'professor' && (
                          <button
                            onClick={async () => {
                              if (!window.confirm('Excluir este comentário?')) return;
                              try {
                                await excluirComentario(com._id);
                                await refetchComentarios();
                              } catch (err) {
                                alert('Erro ao excluir comentário.');
                              }
                            }}
                            style={{ position: 'absolute', top: 8, right: 0, background: 'none', border: 'none', color: '#e04d4d', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
                            title="Excluir comentário"
                          >
                            Excluir
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      )}
      {/* Nome do usuário e botão de login/logout agora estão na barra de acessibilidade */}
      <h1 className="titulo-principal" style={{ color: '#222', textAlign: 'center', width: '100%' }}>Blog escolar</h1>
      {user?.role === "professor" && (
        <div style={{ width: "100%", display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 16 }}>
          <Link to="/gerenciamentodepostagens">
            <button style={{ padding: "8px 20px", borderRadius: 8, background: "#4dbec7", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600 }}>
              Gerenciamento de postagens
            </button>
          </Link>
        </div>
      )}
      {/* Mensagem de boas-vindas e botão sair removidos conforme solicitado */}
      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Campo de busca acima do filtro de área */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', margin: '32px 0 18px 0' }}>
        <input
          className="home-busca"
          placeholder="O que você procura?"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: 440, padding: '12px 20px', borderRadius: 12, border: '2px solid #7c4dbe', fontSize: '1.15rem', boxShadow: '0 4px 16px #7c4dbe22', marginBottom: 0 }}
        />
      </div>
      {/* Espaço extra entre busca e filtro */}
      <div style={{ height: 8 }} />
      {/* Bloco principal roxo com destaque e outros */}
      <div className="home-top-flex">
        <div className="home-categorias-lista home-categorias-lateral" style={{ marginTop: 0, marginBottom: 24 }}>
          <span className="home-categorias-titulo">Área do Conhecimento</span>
          <ul className="home-categorias-ul" style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 'none', overflow: 'visible' }}>
            {AREAS_CONHECIMENTO.map(area => (
              <li className="home-categoria-li" key={area} style={{ width: '100%' }}>
                <button
                  style={{
                    background: '#7c4dbe',
                    color: '#fff',
                    border: '2px solid #7c4dbe',
                    cursor: 'pointer',
                    fontWeight: 600,
                    padding: '4px 12px',
                    borderRadius: 6,
                    width: '100%',
                    textAlign: 'left',
                    whiteSpace: 'normal',
                    overflow: 'visible',
                    boxShadow: areaSelecionada === area ? '0 2px 8px #7c4dbe33' : 'none',
                    transition: 'background 0.2s, color 0.2s'
                  }}
                  onClick={() => {
                    setAreaSelecionada(areaSelecionada === area ? null : area);
                    setPage(1);
                  }}
                >
                  {area}
                </button>
              </li>
            ))}
          </ul>
          {areaSelecionada && (
            <button
              style={{ marginTop: 8, background: '#e04d4d', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => setAreaSelecionada(null)}
            >
              Limpar filtro
            </button>
          )}
        </div>
        <section className="home-bloco-roxo home-bloco-roxo-flex">
          <div className="home-bloco-conteudo" style={{ marginTop: 0, paddingTop: 8 }}>
            <div className="home-bloco-titulo">
              <h2>Destaque do dia</h2>
            </div>
            <div className="home-bloco-posts">
              {destaque && (
                <div style={{ position: 'relative', gridColumn: 'span 2', minHeight: 380 }}>
                  <Link to={`/post/${destaque.id}`} className="home-card-destaque" style={{ minHeight: 380, fontSize: '1.22rem', padding: '40px 40px 28px 40px', boxShadow: '0 8px 36px #7c4dbe22', borderRadius: 22, display: 'block' }}>
                    {destaque.imagem && (
                      <img src={destaque.imagem} alt={destaque.titulo} style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 16, marginBottom: 18 }} />
                    )}
                    <span className="categoria">{destaque.areaDoConhecimento || 'Artigos'}</span>
                    <span className="autor" style={{ fontSize: '0.95em', color: '#555', fontWeight: 500, marginBottom: 4 }}>
                      Publicado por: {getNomeAutor(destaque)}
                    </span>
                    <span className="titulo">{destaque.titulo} <AudioRead text={destaque.titulo} /></span>
                    <p style={{ fontSize: '1.08rem', marginTop: 10 }}>{destaque.conteudo.substring(0, 120)}... <AudioRead text={destaque.conteudo.substring(0, 120)} /></p>
                    {destaque.AtualizadoEm
                      ? <small>Atualizado em {destaque.AtualizadoEm}</small>
                      : <small>Publicado em {destaque.CriadoEm || '--'}</small>
                    }
                  </Link>
                  <button
                    className="comentario-icone-btn"
                    style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                    title="Ver comentários"
                    onClick={() => abrirComentarios(destaque.id)}
                  >
                    <FaRegCommentDots size={20} color="#7c4dbe" />
                    <span style={{ fontWeight: 600, color: '#7c4dbe', fontSize: 15 }}>{(destaque as any).comentariosCount ?? 0}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Seção de Últimas Postagens com três listas diferentes */}
      <h2 className="home-ultimas-titulo">Últimas Postagens</h2>
      <div className="home-ultimas-listas-vertical">
        {/* Primeira lista: 2 colunas, 1 linha, cards retangulares */}
        <div className="home-ultimas-lista home-ultimas-lista-2col">
          {ultimas.slice(0, 2).map((post: Post) => (
            <div key={post.id} style={{ position: 'relative' }}>
              <Link to={`/post/${post.id}`} className="home-card-ultima-ret">
                {post.imagem && (
                  <img src={post.imagem} alt={post.titulo} style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 10, marginBottom: 10 }} />
                )}
                <span className="categoria">{post.areaDoConhecimento || 'Artigos'}</span>
                <span className="autor" style={{ fontSize: '0.95em', color: '#555', fontWeight: 500, marginBottom: 4 }}>
                  Publicado por: {getNomeAutor(post)}
                </span>
                    <span className="titulo">{post.titulo} <AudioRead text={post.titulo} /></span>
                    <p>{post.conteudo.substring(0, 60)}... <AudioRead text={post.conteudo.substring(0, 60)} /></p>
                {post.AtualizadoEm
                  ? <small>Atualizado em {post.AtualizadoEm}</small>
                  : <small>Publicado em {post.CriadoEm || '--'}</small>
                }
              </Link>
              <button
                className="comentario-icone-btn"
                style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                title="Ver comentários"
                onClick={() => abrirComentarios(post.id)}
              >
                <FaRegCommentDots size={20} color="#7c4dbe" />
                <span style={{ fontWeight: 600, color: '#7c4dbe', fontSize: 15 }}>{(post as any).comentariosCount ?? 0}</span>
              </button>
            </div>
          ))}
        </div>
        {/* Segunda lista: 3 colunas, 1 linha, cards quadrados */}
        <div className="home-ultimas-lista home-ultimas-lista-3col">
          {ultimas.slice(2, 5).map((post: Post) => (
            <div key={post.id} style={{ position: 'relative' }}>
              <Link to={`/post/${post.id}`} className="home-card-ultima-quad">
                {post.imagem && (
                  <img src={post.imagem} alt={post.titulo} style={{ width: '100%', maxHeight: 100, objectFit: 'cover', borderRadius: 10, marginBottom: 8 }} />
                )}
                <div className="home-card-img-wrapper">
                  {post.imagem ? (
                    <img src={post.imagem} alt={post.titulo} />
                  ) : null}
                </div>
                <span className="categoria">{post.areaDoConhecimento || 'Artigos'}</span>
                <span className="autor" style={{ fontSize: '0.95em', color: '#555', fontWeight: 500, marginBottom: 4 }}>
                  Publicado por: {getNomeAutor(post)}
                </span>
                    <span className="titulo">{post.titulo} <AudioRead text={post.titulo} /></span>
                    <p>{post.conteudo.substring(0, 40)}... <AudioRead text={post.conteudo.substring(0, 40)} /></p>
                {post.AtualizadoEm
                  ? <small>Atualizado em {post.AtualizadoEm}</small>
                  : <small>Publicado em {post.CriadoEm || '--'}</small>
                }
              </Link>
              <button
                className="comentario-icone-btn"
                style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                title="Ver comentários"
                onClick={() => abrirComentarios(post.id)}
              >
                <FaRegCommentDots size={20} color="#7c4dbe" />
                <span style={{ fontWeight: 600, color: '#7c4dbe', fontSize: 15 }}>{(post as any).comentariosCount ?? 0}</span>
              </button>
            </div>
          ))}
        </div>
        {/* Terceira lista: coluna, cards retangulares com imagem à esquerda */}
        <div className="home-ultimas-lista home-ultimas-lista-leia">
          <h3 className="home-leia-titulo">Você também pode ler...</h3>
          {ultimas.slice(5).map((post: Post) => (
            <div key={post.id} style={{ position: 'relative' }}>
              <Link to={`/post/${post.id}`} className="home-card-leia">
                {post.imagem && (
                  <img src={post.imagem} alt={post.titulo} style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 10, marginRight: 12 }} />
                )}
                <div className="home-card-leia-info">
                  <span className="categoria">{post.areaDoConhecimento || 'Artigos'}</span>
                  <span className="autor" style={{ fontSize: '0.95em', color: '#555', fontWeight: 500, marginBottom: 4 }}>
                    Publicado por: {getNomeAutor(post)}
                  </span>
                  <span className="titulo">{post.titulo} <AudioRead text={post.titulo} /></span>
                  <p>{post.conteudo.substring(0, 40)}... <AudioRead text={post.conteudo.substring(0, 40)} /></p>
                  {post.AtualizadoEm
                    ? <small>Atualizado em {post.AtualizadoEm}</small>
                    : <small>Publicado em {post.CriadoEm || '--'}</small>
                  }
                </div>
              </Link>
              <button
                className="comentario-icone-btn"
                style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                title="Ver comentários"
                onClick={() => abrirComentarios(post.id)}
              >
                <FaRegCommentDots size={20} color="#7c4dbe" />
                <span style={{ fontWeight: 600, color: '#7c4dbe', fontSize: 15 }}>{(post as any).comentariosCount ?? 0}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* Paginação */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
        <button disabled={page === 1} onClick={() => setPage(page - 1)} style={{ padding: '6px 16px', borderRadius: 6, background: page === 1 ? '#ccc' : '#7c4dbe', color: '#fff', border: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer', minWidth: 80 }}>Anterior</button>
        <span style={{ fontWeight: 600, color: '#7c4dbe', fontSize: 16 }}>Página {page}</span>
        <button disabled={!hasMore} onClick={() => setPage(page + 1)} style={{ padding: '6px 16px', borderRadius: 6, background: !hasMore ? '#ccc' : '#7c4dbe', color: '#fff', border: 'none', cursor: !hasMore ? 'not-allowed' : 'pointer', minWidth: 80 }}>Próxima</button>
      </div>
      {/* Mensagem de fim dos conteúdos */}
      {!hasMore && (
        <div style={{ textAlign: 'center', marginTop: 12, color: '#888', fontWeight: 500, fontSize: 18 }}>
          <span>Você chegou ao fim dos conteúdos.</span>
        </div>
      )}
      </div>
    </>
  );
};
