import React, { useEffect, useState, useCallback } from "react";
import useAuth from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { getPosts } from "../services/postService";
import type { Post } from "../services/postService";
import "../styles/Home.css";
import "../styles/center.css";

// Lista de categorias fixas (pode ser dinâmica depois)
const AREAS_CONHECIMENTO = [
  "Linguagens", "Matemática", "Ciências da Natureza", "Ciências Humanas", "Tecnologias"
];
// ...existing code...st } from "../services/postService";

export const Home: React.FC = () => {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [areaSelecionada, setAreaSelecionada] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  // Função para buscar posts paginados
  const fetchPosts = useCallback(async (pageToFetch: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await getPosts(pageToFetch, 11);
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
      setPosts(lista);
      setHasMore(res.hasMore);
    } catch (e) {
      setError("Erro ao carregar posts.");
    } finally {
      setLoading(false);
    }
  }, [search, areaSelecionada]);

  // Carrega a primeira página ao montar
  useEffect(() => {
    fetchPosts(1);
    setPage(1);
  }, [fetchPosts]);

  // Remove scroll infinito

  // Busca posts ao mudar página ou busca
  useEffect(() => {
    fetchPosts(page);
  }, [page, fetchPosts, search, areaSelecionada]);

  const destaque = posts[0];
  const outros: Post[] = posts.slice(1, 3);
  const ultimas: Post[] = posts.slice(3);

  return (
    <div className="home-container page-center">
      <div style={{ width: "100%", display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "16px 0" }}>
        {user ? (
          <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontWeight: 600, color: "#7c4dbe", fontSize: "1.1rem" }}>{user.nome}</span>
            <button onClick={logout} style={{ padding: "6px 16px", borderRadius: 8, background: "#e04d4d", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600 }}>
              Logout
            </button>
          </span>
        ) : (
          <Link to="/login">
            <button style={{ padding: "8px 20px", borderRadius: 8, background: "#7c4dbe", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600 }}>
              Login
            </button>
          </Link>
        )}
      </div>
      <h1 className="titulo-principal">Blog Escolar</h1>
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

      {/* Bloco principal roxo com destaque e outros */}
      <div className="home-top-flex">
        <div className="home-categorias-lista home-categorias-lateral">
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
          <div className="home-bloco-conteudo">
            <div className="home-bloco-titulo">
              <h2>Tudo o que você quer saber sobre <span className="home-bloco-titulo-destaque">Tecnologia Educacional</span></h2>
              <input
                className="home-busca"
                placeholder="O que você procura?"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ marginTop: 8, marginBottom: 8 }}
              />
            </div>
            <div className="home-bloco-posts">
              {destaque && (
                <Link to={`/post/${destaque.id}`} className="home-card-destaque">
                  <span className="categoria">{destaque.areaDoConhecimento || 'Artigos'}</span>
                  <span className="autor" style={{ fontSize: '0.95em', color: '#555', fontWeight: 500, marginBottom: 4 }}>
                    {destaque.autor?.nome || destaque.autor || 'Autor desconhecido'}
                  </span>
                  <span className="titulo">{destaque.titulo}</span>
                  <p>{destaque.conteudo.substring(0, 120)}...</p>
                  {destaque.AtualizadoEm
                    ? <small>Atualizado em {destaque.AtualizadoEm}</small>
                    : <small>Publicado em {destaque.CriadoEm || '--'}</small>
                  }
                </Link>
              )}
              <div className="home-cards-laterais">
                {outros.map((post: Post) => (
                  <Link to={`/post/${post.id}`} className="home-card-lateral" key={post.id}>
                    <span className="categoria">{post.areaDoConhecimento || 'Artigos'}</span>
                    <span className="autor" style={{ fontSize: '0.95em', color: '#555', fontWeight: 500, marginBottom: 4 }}>
                      {post.autor?.nome || post.autor || 'Autor desconhecido'}
                    </span>
                    <span className="titulo">{post.titulo}</span>
                    <p>{post.conteudo.substring(0, 60)}...</p>
                    {post.AtualizadoEm
                      ? <small>Atualizado em {post.AtualizadoEm}</small>
                      : <small>Publicado em {post.CriadoEm || '--'}</small>
                    }
                  </Link>
                ))}
              </div>
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
            <Link to={`/post/${post.id}`} className="home-card-ultima-ret" key={post.id}>
              <div className="home-card-img-wrapper">
                {post.imagem ? (
                  <img src={post.imagem} alt={post.titulo} />
                ) : null}
              </div>
              <span className="categoria">{post.areaDoConhecimento || 'Artigos'}</span>
              <span className="autor" style={{ fontSize: '0.95em', color: '#555', fontWeight: 500, marginBottom: 4 }}>
                {post.autor?.nome || post.autor || 'Autor desconhecido'}
              </span>
              <span className="titulo">{post.titulo}</span>
              <p>{post.conteudo.substring(0, 60)}...</p>
              {post.AtualizadoEm
                ? <small>Atualizado em {post.AtualizadoEm}</small>
                : <small>Publicado em {post.CriadoEm || '--'}</small>
              }
            </Link>
          ))}
        </div>
        {/* Segunda lista: 3 colunas, 1 linha, cards quadrados */}
        <div className="home-ultimas-lista home-ultimas-lista-3col">
          {ultimas.slice(2, 5).map((post: Post) => (
            <Link to={`/post/${post.id}`} className="home-card-ultima-quad" key={post.id}>
              <div className="home-card-img-wrapper">
                {post.imagem ? (
                  <img src={post.imagem} alt={post.titulo} />
                ) : null}
              </div>
              <span className="categoria">{post.areaDoConhecimento || 'Artigos'}</span>
              <span className="autor" style={{ fontSize: '0.95em', color: '#555', fontWeight: 500, marginBottom: 4 }}>
                {post.autor?.nome || post.autor || 'Autor desconhecido'}
              </span>
              <span className="titulo">{post.titulo}</span>
              <p>{post.conteudo.substring(0, 40)}...</p>
              {post.AtualizadoEm
                ? <small>Atualizado em {post.AtualizadoEm}</small>
                : <small>Publicado em {post.CriadoEm || '--'}</small>
              }
            </Link>
          ))}
        </div>
        {/* Terceira lista: coluna, cards retangulares com imagem à esquerda */}
        <div className="home-ultimas-lista home-ultimas-lista-leia">
          <h3 className="home-leia-titulo">Você também pode ler...</h3>
          {ultimas.slice(5, 8).map((post: Post) => (
            <Link to={`/post/${post.id}`} className="home-card-leia" key={post.id}>
              <div className="home-card-leia-img">
                {post.imagem ? (
                  <img src={post.imagem} alt={post.titulo} />
                ) : null}
              </div>
              <div className="home-card-leia-info">
                <span className="categoria">{post.areaDoConhecimento || 'Artigos'}</span>
                <span className="autor" style={{ fontSize: '0.95em', color: '#555', fontWeight: 500, marginBottom: 4 }}>
                  {post.autor?.nome || post.autor || 'Autor desconhecido'}
                </span>
                <span className="titulo">{post.titulo}</span>
                <p>{post.conteudo.substring(0, 40)}...</p>
                {post.AtualizadoEm
                  ? <small>Atualizado em {post.AtualizadoEm}</small>
                  : <small>Publicado em {post.CriadoEm || '--'}</small>
                }
              </div>
            </Link>
          ))}
        </div>
      </div>
      {/* Paginação */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
        <button disabled={page === 1} onClick={() => setPage(page - 1)} style={{ padding: '6px 16px', borderRadius: 6, background: page === 1 ? '#ccc' : '#7c4dbe', color: '#fff', border: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer', minWidth: 80 }}>Anterior</button>
        <span style={{ fontWeight: 600, color: '#7c4dbe', fontSize: 16 }}>Página {page}</span>
        <button disabled={!hasMore} onClick={() => setPage(page + 1)} style={{ padding: '6px 16px', borderRadius: 6, background: !hasMore ? '#ccc' : '#7c4dbe', color: '#fff', border: 'none', cursor: !hasMore ? 'not-allowed' : 'pointer', minWidth: 80 }}>Próxima</button>
      </div>
    </div>
  );
};
