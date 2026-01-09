import AudioRead from '../components/AudioRead';
import React, { useEffect, useMemo, useRef, useState } from "react";
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
  const nomeComentario = useMemo(() => (user?.nome?.trim() ? user.nome.trim() : "Anônimo"), [user?.nome]);
  const [search, setSearch] = useState("");
  const [areaSelecionada, setAreaSelecionada] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [search, areaSelecionada]);
  const {
    data: postsResponse,
    isLoading,
    isError,
    refetch: refetchPosts,
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

  const getInfoDataPublicacao = (p: Post) => {
    const criado = p.CriadoEm;
    const atualizado = p.AtualizadoEm;
    const foiAtualizado = Boolean(atualizado) && atualizado !== criado;
    if (foiAtualizado) {
      return { label: 'Atualizado em', data: atualizado as string };
    }
    return { label: 'Publicado em', data: criado || '--' };
  };

  // Comentários
  const [comentariosAbertos, setComentariosAbertos] = useState<string | null>(null); // postId
  const novoComentarioRef = useRef<HTMLTextAreaElement | null>(null);
  const {
    data: comentariosRaw,
    isLoading: comentariosLoading,
    refetch: refetchComentarios,
  } = useQuery<Comentario[]>({
    queryKey: ["comentarios", comentariosAbertos],
    enabled: Boolean(comentariosAbertos),
    queryFn: () => listarComentarios(comentariosAbertos as string),
  });

  const comentarios: Comentario[] = comentariosRaw ?? [];

  // Função para abrir comentários de um post
  const abrirComentarios = (postId: string) => {
    setComentariosAbertos((atual) => (atual === postId ? null : postId));
  };

  const renderComentarios = (postId: string) => {
    if (comentariosAbertos !== postId) return null;

    return (
      <div className="comentarios-card">
        <div className="comentarios-header">
          <h4>Comentários</h4>
        </div>
        {comentariosLoading ? (
          <p>Carregando comentários...</p>
        ) : (
          <>
            <form
              onSubmit={async e => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const input = form.elements.namedItem('novoComentario') as HTMLTextAreaElement;
                const texto = input.value.trim();
                if (!texto) return;
                input.disabled = true;
                try {
                  await criarComentario(comentariosAbertos!, texto, nomeComentario);
                  await refetchComentarios();
                  await refetchPosts();
                  input.value = '';
                } catch (err) {
                  alert('Erro ao enviar comentário.');
                }
                input.disabled = false;
              }}
              className="comentarios-form"
            >
              <textarea
                name="novoComentario"
                placeholder="Escreva um comentário..."
                ref={novoComentarioRef}
                rows={2}
              />
              <button type="submit">
                Comentar
              </button>
            </form>
            <div className="comentarios-identidade">Comentando como <strong>{nomeComentario}</strong></div>
            {comentarios.length === 0 ? (
              <p className="comentarios-vazio">Nenhum comentário ainda.</p>
            ) : (
              <ul className="comentarios-lista">
                {comentarios.map(com => (
                  <li key={com._id}>
                    <div className="comentarios-autor">
                      {typeof com.autor === 'string' ? com.autor : com.autor?.nome || 'Usuário'}
                    </div>
                    <div className="comentarios-texto">{com.texto}</div>
                    <div className="comentarios-data">{new Date(com.criadoEm).toLocaleString('pt-BR')}</div>
                    {user?.role === 'professor' && (
                      <button
                        onClick={async () => {
                          if (!window.confirm('Excluir este comentário?')) return;
                          try {
                            await excluirComentario(com._id);
                            await refetchComentarios();
                            await refetchPosts();
                          } catch (err) {
                            alert('Erro ao excluir comentário.');
                          }
                        }}
                        className="comentarios-excluir"
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
    );
  };

  useEffect(() => {
    if (!comentariosAbertos) return;
    const t = window.setTimeout(() => {
      novoComentarioRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, [comentariosAbertos]);

  return (
    <>
      <div className="home-container page-center">
      {/* Nome do usuário e botão de login/logout agora estão na barra de acessibilidade */}
      <h1 className="titulo-principal" style={{ color: '#7c4dbe', textAlign: 'center', width: '100%' }}>Entre linhas e ideias</h1>
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
                <div style={{ position: 'relative', gridColumn: 'span 2', minHeight: 430 }}>
                  <Link
                    to={`/post/${destaque.id}`}
                    className="home-card-destaque"
                    style={{
                      minHeight: 430,
                      height: 'auto',
                      fontSize: '1.22rem',
                      padding: '28px 34px 22px 34px',
                      boxShadow: '0 8px 36px #7c4dbe22',
                      borderRadius: 22,
                      display: 'block',
                      textDecoration: 'none',
                    }}
                  >
                    {/* 1. Imagem acima */}
                    {destaque.imagem && (
                      <img
                        src={destaque.imagem}
                        alt={destaque.titulo}
                        style={{
                          width: '100%',
                          maxHeight: 320,
                          objectFit: 'cover',
                          borderRadius: 16,
                          marginBottom: 14,
                        }}
                      />
                    )}

                    {/* 2. Área (esq) e 6. Publicado/Atualizado (dir) abaixo da imagem */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'nowrap', marginBottom: 10 }}>
                      <span className="categoria" style={{ marginBottom: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60%', fontSize: '0.78rem', padding: '2px 10px' }}>
                        {destaque.areaDoConhecimento || 'Artigos'}
                      </span>
                      {(() => {
                        const info = getInfoDataPublicacao(destaque);
                        return (
                          <small style={{ color: '#666', fontWeight: 600, fontStyle: 'italic', fontSize: '0.78rem', textAlign: 'right', whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {info.label} {info.data}
                          </small>
                        );
                      })()}
                    </div>

                    {/* 4. Título centralizado */}
                    <div style={{ textAlign: 'center', margin: '6px 0 10px 0' }}>
                      <span className="titulo" style={{ display: 'inline-block' }}>
                        {destaque.titulo} <AudioRead text={destaque.titulo} />
                      </span>
                    </div>

                    {/* 5. Conteúdo justificado */}
                    <p style={{ fontSize: '1.08rem', marginTop: 0, marginBottom: 50, textAlign: 'justify' }}>
                      {destaque.conteudo.substring(0, 120)}... <AudioRead text={destaque.conteudo.substring(0, 120)} />
                    </p>

                    {/* 7. Ícone de comentário à esquerda e 3. Publicado por à direita abaixo do conteúdo */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 0 }}>
                      <button
                        type="button"
                        className="comentario-icone-btn"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
                        title="Ver comentários"
                        aria-label="Ver comentários"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          abrirComentarios(destaque.id);
                        }}
                      >
                        <FaRegCommentDots size={20} color="#7c4dbe" />
                        <span style={{ fontWeight: 700, color: '#7c4dbe', fontSize: 15 }}>{destaque.comentariosCount ?? 0}</span>
                      </button>
                      <span className="autor" style={{ fontSize: '0.88em', color: '#555', fontWeight: 400, fontStyle: 'italic', marginBottom: 0, textAlign: 'right', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        Publicado por: {getNomeAutor(destaque)}
                      </span>
                    </div>
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
                  {renderComentarios(destaque.id)}
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
            <div key={post.id}>
              <Link to={`/post/${post.id}`} className="home-card-ultima-ret" style={{ height: 'auto' }}>
                {/* 1. Imagem acima */}
                {post.imagem && (
                  <img src={post.imagem} alt={post.titulo} style={{ width: '100%', maxHeight: 190, objectFit: 'cover', borderRadius: 10, marginBottom: 10 }} />
                )}

                {/* 2. Área (esq) e 6. Publicado/Atualizado (dir) abaixo da imagem */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'nowrap', marginBottom: 10 }}>
                  <span className="categoria" style={{ marginBottom: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60%', fontSize: '0.78rem', padding: '2px 10px' }}>
                    {post.areaDoConhecimento || 'Artigos'}
                  </span>
                  {(() => {
                    const info = getInfoDataPublicacao(post);
                    return (
                      <small style={{ color: '#666', fontWeight: 600, fontStyle: 'italic', fontSize: '0.78rem', textAlign: 'right', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {info.label} {info.data}
                      </small>
                    );
                  })()}
                </div>

                {/* 4. Título centralizado */}
                <div style={{ textAlign: 'center', margin: '4px 0 8px 0' }}>
                  <span className="titulo" style={{ display: 'inline-block' }}>
                    {post.titulo} <AudioRead text={post.titulo} />
                  </span>
                </div>

                {/* 5. Conteúdo justificado */}
                <p
                  style={{
                    marginTop: 0,
                    marginBottom: 18,
                    textAlign: 'justify',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {post.conteudo.substring(0, 130)}... <AudioRead text={post.conteudo.substring(0, 130)} />
                </p>

                {/* 7. Ícone de comentário à esquerda e 3. Publicado por à direita abaixo do conteúdo */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <button
                    type="button"
                    className="comentario-icone-btn"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
                    title="Ver comentários"
                    aria-label="Ver comentários"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      abrirComentarios(post.id);
                    }}
                  >
                    <FaRegCommentDots size={20} color="#7c4dbe" />
                    <span style={{ fontWeight: 700, color: '#7c4dbe', fontSize: 15 }}>{post.comentariosCount ?? 0}</span>
                  </button>
                  <span className="autor" style={{ fontSize: '0.88em', color: '#555', fontWeight: 400, fontStyle: 'italic', marginBottom: 0, textAlign: 'right', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    Publicado por: {getNomeAutor(post)}
                  </span>
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
              {renderComentarios(post.id)}
            </div>
          ))}
        </div>
        {/* Segunda lista: 3 colunas, 1 linha, cards quadrados */}
        <div className="home-ultimas-lista home-ultimas-lista-3col">
          {ultimas.slice(2, 5).map((post: Post) => (
            <div key={post.id}>
              <Link to={`/post/${post.id}`} className="home-card-ultima-quad" style={{ height: 'auto', aspectRatio: 'auto' }}>
                {/* 1. Imagem acima */}
                {post.imagem && (
                  <img src={post.imagem} alt={post.titulo} style={{ width: '100%', maxHeight: 170, objectFit: 'cover', borderRadius: 10, marginBottom: 8 }} />
                )}

                {/* 2. Área (esq) e 6. Publicado/Atualizado (dir) abaixo da imagem */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'nowrap', marginBottom: 8, width: '100%' }}>
                  <span className="categoria" style={{ marginBottom: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '62%', fontSize: '0.78rem', padding: '2px 10px' }}>
                    {post.areaDoConhecimento || 'Artigos'}
                  </span>
                  {(() => {
                    const info = getInfoDataPublicacao(post);
                    return (
                      <small style={{ color: '#666', fontWeight: 600, fontStyle: 'italic', fontSize: '0.78rem', textAlign: 'right', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {info.label} {info.data}
                      </small>
                    );
                  })()}
                </div>

                {/* 4. Título centralizado */}
                <div style={{ textAlign: 'center', margin: '2px 0 6px 0', width: '100%' }}>
                  <span className="titulo" style={{ display: 'inline-block' }}>
                    {post.titulo} <AudioRead text={post.titulo} />
                  </span>
                </div>

                {/* 5. Conteúdo justificado */}
                <p
                  style={{
                    marginTop: 0,
                    marginBottom: 14,
                    textAlign: 'justify',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {post.conteudo.substring(0, 100)}... <AudioRead text={post.conteudo.substring(0, 100)} />
                </p>

                {/* 7. Ícone de comentário à esquerda e 3. Publicado por à direita abaixo do conteúdo */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, width: '100%' }}>
                  <button
                    type="button"
                    className="comentario-icone-btn"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
                    title="Ver comentários"
                    aria-label="Ver comentários"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      abrirComentarios(post.id);
                    }}
                  >
                    <FaRegCommentDots size={20} color="#7c4dbe" />
                    <span style={{ fontWeight: 700, color: '#7c4dbe', fontSize: 15 }}>{post.comentariosCount ?? 0}</span>
                  </button>
                  <span className="autor" style={{ fontSize: '0.88em', color: '#555', fontWeight: 400, fontStyle: 'italic', marginBottom: 0, textAlign: 'right', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    Publicado por: {getNomeAutor(post)}
                  </span>
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
              {renderComentarios(post.id)}
            </div>
          ))}
        </div>
        {/* Terceira lista: coluna, cards retangulares com imagem à esquerda */}
        <div className="home-ultimas-lista home-ultimas-lista-leia">
          <h3 className="home-leia-titulo">Você também pode ler...</h3>
          {ultimas.slice(5).map((post: Post) => (
            <div key={post.id}>
              <Link
                to={`/post/${post.id}`}
                className="home-card-leia"
                style={{
                  display: 'flex',
                  alignItems: 'stretch',
                  gap: 16,
                }}
              >
                <div
                  aria-hidden={!post.imagem}
                  style={{
                    width: 170,
                    height: 170,
                    borderRadius: 12,
                    flexShrink: 0,
                    overflow: 'hidden',
                    background: '#eee',
                    display: 'flex',
                  }}
                >
                  {post.imagem && (
                    <img
                      src={post.imagem}
                      alt={post.titulo}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%', padding: '8px 14px 8px 0' }}>
                  {/* Área (esq) e Publicado/Atualizado (dir) */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'nowrap', marginBottom: 6 }}>
                    <span className="categoria" style={{ marginBottom: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60%', fontSize: '0.78rem', padding: '2px 10px' }}>
                      {post.areaDoConhecimento || 'Artigos'}
                    </span>
                    {(() => {
                      const info = getInfoDataPublicacao(post);
                      return (
                        <small style={{ color: '#666', fontWeight: 600, fontStyle: 'italic', fontSize: '0.78rem', textAlign: 'right', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {info.label} {info.data}
                        </small>
                      );
                    })()}
                  </div>

                  {/* Título centralizado (verticalmente no meio do card) */}
                  <div style={{ flex: 1, minHeight: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', margin: 0, paddingTop: 6, paddingBottom: 2 }}>
                    <span className="titulo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, minWidth: 0 }}>
                      <span
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {post.titulo}
                      </span>
                      <AudioRead text={post.titulo} />
                    </span>
                  </div>

                  {/* Comentário (esq) e Publicado por (dir) */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 'auto', paddingTop: 6 }}>
                    <button
                      type="button"
                      className="comentario-icone-btn"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
                      title="Ver comentários"
                      aria-label="Ver comentários"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        abrirComentarios(post.id);
                      }}
                    >
                      <FaRegCommentDots size={20} color="#7c4dbe" />
                      <span style={{ fontWeight: 700, color: '#7c4dbe', fontSize: 15 }}>{post.comentariosCount ?? 0}</span>
                    </button>
                    <span className="autor" style={{ fontSize: '0.88em', color: '#555', fontWeight: 400, fontStyle: 'italic', marginBottom: 0, textAlign: 'right', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      Publicado por: {getNomeAutor(post)}
                    </span>
                  </div>
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
              {renderComentarios(post.id)}
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
