import React, { useState, useEffect } from "react";
import "../styles/center.css";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPostById, updatePost } from "../services/postService";
import api from "../services/authService";

const PostEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [area, setArea] = useState("");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      if (!id) return;
      try {
        const post = await getPostById(id);
        setTitle(post.titulo || "");
        setContent(post.conteudo || "");
        setArea(post.areaDoConhecimento || "");
        setImageSrc(post.imagem || null);
      } catch {
        // Se não encontrar, pode mostrar erro ou redirecionar
      }
    }
    fetchPost();
    setIsDirty(false);
  }, [id]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "Deseja sair sem salvar?";
        return "Deseja sair sem salvar?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const formData = new FormData();
      formData.append("titulo", title);
      formData.append("conteudo", content);
      formData.append("areaDoConhecimento", area);
      if (imageSrc && imageSrc.startsWith("data:")) {
        // Converte base64 para blob
        const res = await fetch(imageSrc);
        const blob = await res.blob();
        formData.append("imagem", blob, "imagem.jpg");
      }
      await updatePost(id, formData);
      navigate("/gerenciamentodepostagens");
    } catch {
      alert("Erro ao salvar alterações.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="page-center" style={{ maxWidth: 400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ width: "100%", display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <Link to="/" style={{ textDecoration: "none" }}>
          <button type="button" style={{ padding: '6px 18px', borderRadius: 6, background: '#4dbec7', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            Página Inicial
          </button>
        </Link>
      </div>
      <h1>Editar Postagem</h1>
      {imageSrc && (
        <div style={{ marginBottom: 16, textAlign: 'center' }}>
          <img src={imageSrc} alt="Prévia" style={{ maxWidth: 320, maxHeight: 320, borderRadius: 8 }} />
        </div>
      )}
      <input placeholder="Título" value={title} onChange={e => { setTitle(e.target.value); setIsDirty(true); }} required />
      <textarea
        placeholder="Conteúdo"
        value={content}
        onChange={e => { setContent(e.target.value); setIsDirty(true); }}
        required
        rows={10}
        style={{ minHeight: 180, resize: 'vertical' }}
      />
      <select value={area} onChange={e => { setArea(e.target.value); setIsDirty(true); }} required>
        <option value="">Selecione a área</option>
        <option value="Linguagens">Linguagens</option>
        <option value="Matemática">Matemática</option>
        <option value="Ciências da Natureza">Ciências da Natureza</option>
        <option value="Ciências Humanas">Ciências Humanas</option>
        <option value="Tecnologias">Tecnologias</option>
      </select>
      <div>
        <label>Imagem do post:</label>
        <input type="file" accept="image/*" onChange={e => {
          if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = () => { setImageSrc(reader.result as string); setIsDirty(true); };
            reader.readAsDataURL(file);
          }
        }} />
        {imageSrc && (
          <div style={{ marginTop: 8 }}>
            <img src={imageSrc} alt="Prévia" style={{ maxWidth: 200, maxHeight: 200 }} />
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button type="submit" style={{ padding: '8px 24px', borderRadius: 8, background: '#7c4dbe', color: '#fff', border: 'none', cursor: 'pointer' }} onClick={() => setIsDirty(false)}>Salvar Alterações</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
        <button type="button" onClick={() => navigate(-1)} style={{ padding: '8px 24px', borderRadius: 8, background: '#aaa', color: '#fff', border: 'none', cursor: 'pointer' }}>Voltar</button>
      </div>
    </form>
  );
};

export default PostEdit;
