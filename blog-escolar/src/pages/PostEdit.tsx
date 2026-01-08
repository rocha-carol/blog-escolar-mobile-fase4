import AudioRead from '../components/AudioRead';
import React, { useState, useEffect } from "react";
import "../styles/center.css";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPostById, updatePost } from "../services/postService";
import useQuery from "../hooks/useQuery";

const PostEdit: React.FC = () => {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [area, setArea] = useState("");
  const [author, setAuthor] = useState("");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["post", id],
    enabled: Boolean(id),
    queryFn: () => getPostById(id as string),
  });

  useEffect(() => {
    if (!post) return;
    setErrorMsg(null);
    setTitle(post.titulo || "");
    setContent(post.conteudo || "");
    setArea(post.areaDoConhecimento || "");
    if (typeof post.autor === "string") {
      setAuthor(post.autor);
    } else if (post.autor && typeof post.autor === "object" && "nome" in post.autor) {
      setAuthor(post.autor.nome || "");
    } else {
      setAuthor("");
    }
    setImageSrc(post.imagem || null);
    setIsDirty(false);
  }, [post]);

  useEffect(() => {
    if (isError) {
      setErrorMsg("Não foi possível carregar a postagem para edição.");
    }
  }, [isError]);

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
      setSaving(true);
      setErrorMsg(null);
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
      setSuccessMsg("Alterações salvas com sucesso!");
      setIsDirty(false);
      setTimeout(() => {
        setSuccessMsg(null);
        navigate("/gerenciamentodepostagens");
      }, 1800);
    } catch {
      setErrorMsg("Erro ao salvar alterações. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-center" style={{ maxWidth: 720, margin: "0 auto", padding: 16, boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 800, color: '#111', fontSize: 18 }}>Edição de postagem</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/gerenciamentodepostagens" style={{ textDecoration: 'none' }}>
            <button type="button" style={{ padding: '8px 14px', borderRadius: 8, background: '#111', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
              Voltar ao gerenciamento
            </button>
          </Link>
          <Link to="/" style={{ textDecoration: "none" }}>
            <button type="button" style={{ padding: '8px 14px', borderRadius: 8, background: '#4dbec7', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
              Página Inicial
            </button>
          </Link>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 10px 30px #0001',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          border: '1px solid #eee'
        }}
      >
        <h1 style={{ margin: 0, fontSize: 26, color: '#222', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          Editar Postagem <AudioRead text="Editar Postagem" />
        </h1>
        <p style={{ margin: 0, color: '#555', lineHeight: 1.4 }}>
          Atualize o título, conteúdo, área e imagem. Ao salvar, você será redirecionado para o gerenciamento.
        </p>

        {successMsg && (
          <div style={{ background: '#4dbec7', color: '#fff', padding: '12px 16px', borderRadius: 10, fontWeight: 800, fontSize: 15, boxShadow: '0 2px 12px #0002', textAlign: 'center' }}>
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div style={{ background: '#fdecec', color: '#9b1c1c', padding: '12px 16px', borderRadius: 10, fontWeight: 800, fontSize: 15, border: '1px solid #f7caca' }}>
            {errorMsg}
          </div>
        )}

        {isLoading ? (
          <div style={{ padding: 18, borderRadius: 12, background: '#f7f7f7', color: '#444', fontWeight: 700 }}>
            Carregando postagem...
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, color: '#111', marginBottom: 6 }}>
                  <span>Título</span>
                  <AudioRead text={title} />
                </label>
                <input
                  placeholder="Ex: A importância da leitura na infância"
                  value={title}
                  onChange={e => { setTitle(e.target.value); setIsDirty(true); }}
                  required
                  style={{ width: '100%', padding: '12px 12px', borderRadius: 10, border: '1px solid #dcdcdc', fontSize: 16, outline: 'none' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, color: '#111', marginBottom: 6 }}>
                  <span>Conteúdo</span>
                  <AudioRead text={content} />
                </label>
                <textarea
                  placeholder="Escreva aqui o conteúdo completo da postagem..."
                  value={content}
                  onChange={e => { setContent(e.target.value); setIsDirty(true); }}
                  required
                  rows={10}
                  style={{ width: '100%', padding: '12px 12px', borderRadius: 10, border: '1px solid #dcdcdc', fontSize: 16, minHeight: 220, resize: 'vertical', outline: 'none', lineHeight: 1.5 }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, color: '#111', marginBottom: 6 }}>
                  <span>Autor</span>
                  <AudioRead text={author} />
                </label>
                <input
                  value={author}
                  readOnly
                  style={{ width: '100%', padding: '12px 12px', borderRadius: 10, border: '1px solid #dcdcdc', fontSize: 16, background: '#f5f5f5', color: '#666' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 800, color: '#111', marginBottom: 6 }}>Área do conhecimento</label>
                <select
                  value={area}
                  onChange={e => { setArea(e.target.value); setIsDirty(true); }}
                  required
                  style={{ width: '100%', padding: '12px 12px', borderRadius: 10, border: '1px solid #dcdcdc', fontSize: 16, background: '#fff', outline: 'none' }}
                >
                  <option value="">Selecione a área</option>
                  <option value="Linguagens">Linguagens</option>
                  <option value="Matemática">Matemática</option>
                  <option value="Ciências da Natureza">Ciências da Natureza</option>
                  <option value="Ciências Humanas">Ciências Humanas</option>
                  <option value="Tecnologias">Tecnologias</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 800, color: '#111', marginBottom: 6 }}>Imagem do post</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files && e.target.files.length > 0) {
                      const file = e.target.files[0];
                      const reader = new FileReader();
                      reader.onload = () => { setImageSrc(reader.result as string); setIsDirty(true); };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{ width: '100%' }}
                />
                <small style={{ display: 'block', marginTop: 6, color: '#666' }}>
                  Dica: envie uma imagem horizontal para melhor visualização nos cards.
                </small>
              </div>
            </div>

            {imageSrc && (
              <div style={{ marginTop: 6 }}>
                <div style={{ fontWeight: 800, color: '#111', marginBottom: 8 }}>Prévia da imagem</div>
                <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #eee', background: '#fafafa' }}>
                  <img src={imageSrc} alt="Prévia" style={{ width: '100%', maxHeight: 340, objectFit: 'cover', display: 'block' }} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
              <div style={{ color: isDirty ? '#7c4dbe' : '#777', fontWeight: 800 }}>
                {isDirty ? 'Você tem alterações não salvas.' : 'Tudo salvo.'}
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  style={{ padding: '10px 16px', borderRadius: 10, background: '#aaa', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 900 }}
                  disabled={saving}
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 18px', borderRadius: 10, background: '#7c4dbe', color: '#fff', border: 'none', cursor: !isDirty || saving ? 'not-allowed' : 'pointer', fontWeight: 900, opacity: !isDirty || saving ? 0.7 : 1 }}
                  disabled={!isDirty || saving}
                >
                  {saving ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default PostEdit;
