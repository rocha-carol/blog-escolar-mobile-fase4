import AudioRead from '../components/AudioRead';
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPostById } from "../services/postService";
import type { Post } from "../services/postService";
import "../styles/PostRead.css";
import "../styles/center.css";

// O componente PostRead depende do useParams para saber qual post mostrar,
// e do getPosts para buscar os dados do backend.
const PostRead: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Busca o post pelo id assim que o componente carrega
  useEffect(() => {
    if (!id) {
      setError("ID inválido.");
      setLoading(false);
      return;
    }
    getPostById(id as string)
      .then(setPost)
      .catch(() => setError("Post não encontrado."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p style={{ textAlign: 'center' }}>Carregando...</p>;
  if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;
  if (!post) return null;

  return (
    <div className="page-center">
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
      {/* Imagem centralizada */}
      {/* Se quiser exibir imagem, adicione campo no backend e frontend */}
      {/* Conteúdo do post */}
      <div className="postread-conteudo">
        {post.conteudo} <AudioRead text={post.conteudo} />
      </div>
      {/* Botão de voltar */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
        <button onClick={() => navigate(-1)} style={{ padding: '10px 24px', borderRadius: 8, background: '#7c4dbe', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
          Voltar
        </button>
      </div>
    </div>
  );
};

export default PostRead;
