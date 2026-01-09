import AudioRead from '../components/AudioRead';
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPostById } from "../services/postService";
import type { Post } from "../services/postService";
import useQuery from "../hooks/useQuery";
import "../styles/PostRead.css";
import "../styles/center.css";

// O componente PostRead depende do useParams para saber qual post mostrar,
// e do getPosts para buscar os dados do backend.
const PostRead: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    data: post,
    isLoading,
    isError,
  } = useQuery<Post>({
    queryKey: ["post", id],
    enabled: Boolean(id),
    queryFn: () => getPostById(id as string),
  });

  if (!id) return <p style={{ color: 'red', textAlign: 'center' }}>ID inválido.</p>;
  if (isLoading) return <p style={{ textAlign: 'center' }}>Carregando...</p>;
  if (isError) return <p style={{ color: 'red', textAlign: 'center' }}>Post não encontrado.</p>;
  if (!post) return null;

  return (
    <div className="page-center postread-page">
      <div className="postread-wrapper">
        {/* Topo roxo com título, subtítulo e infos */}
        <div className="postread-topo">
          <div className="postread-titulo">{post.titulo} <AudioRead text={post.titulo} /></div>
          <div className="postread-infos">
            <span className="postread-info">{post.areaDoConhecimento || "Artigos"} <AudioRead text={post.areaDoConhecimento || 'Artigos'} /></span>
            {post.autor && (
              <span className="postread-info">Publicado por {typeof post.autor === "string" ? post.autor : post.autor.nome} <AudioRead text={`Publicado por ${typeof post.autor === "string" ? post.autor : post.autor.nome}`} /></span>
            )}
            {post.AtualizadoEm
              ? <span className="postread-info">Atualizado em {post.AtualizadoEm} <AudioRead text={`Atualizado em ${post.AtualizadoEm}`} /></span>
              : <span className="postread-info">Publicado em {post.CriadoEm || '--'} <AudioRead text={`Publicado em ${post.CriadoEm || '--'}`} /></span>
            }
          </div>
        </div>
        {post.imagem && (
          <img className="postread-img" src={post.imagem} alt={post.titulo} />
        )}
        {/* Conteúdo do post */}
        <div className="postread-conteudo">
          {post.conteudo} <AudioRead text={post.conteudo} />
        </div>
        {/* Botão de voltar */}
        <div className="postread-actions">
          <button className="postread-voltar" onClick={() => navigate(-1)}>
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostRead;
