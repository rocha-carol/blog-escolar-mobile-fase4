import AudioRead from '../components/AudioRead';
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../services/postService";
import useAuth from "../hooks/useAuth";
import Cropper, { type Area } from "react-easy-crop";
import "../styles/center.css";
import "../styles/cropper.css";
// Import de uuid removido pois não é utilizado

const PostCreate: React.FC = () => {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<string | null>(null);

  // Imagem
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  // Estados para título, conteúdo, autor e imagem
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { user } = useAuth();
  const author = user?.nome ?? "";

  // Áreas do conhecimento
  const AREAS_CONHECIMENTO = [
    "Linguagens",
    "Matemática",
    "Ciências da Natureza",
    "Ciências Humanas",
    "Tecnologias"
  ];
  const [area, setArea] = useState(AREAS_CONHECIMENTO[0]);


  // Função para ler imagem do input
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result as string);
      });
      reader.readAsDataURL(file);
    }
  };

  // Função chamada ao recortar
  // Função chamada ao recortar imagem
  const onCropComplete = useCallback((_: Area, croppedAreaPixelsValue: Area) => {
    setCroppedAreaPixels(croppedAreaPixelsValue);
  }, []);

  // Função para gerar imagem recortada
  const getCroppedImg = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    const createImage = (url: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.addEventListener('load', () => resolve(img));
        img.addEventListener('error', error => reject(error));
        img.setAttribute('crossOrigin', 'anonymous');
        img.src = url;
      });
    };
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );
    return new Promise<string>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setCroppedImage(url);
          resolve(url);
        }
      }, 'image/jpeg');
    });
  };

  // Função para enviar o post (ainda não implementada)
  // Função para salvar post apenas como publicado
  const savePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    let finalImage = croppedImage;
    if (imageSrc && croppedAreaPixels && !croppedImage) {
      finalImage = await getCroppedImg() as string | null;
    }
    if (!finalImage) {
      setFeedback("Imagem obrigatória. Por favor, insira uma imagem para o post.");
      return;
    }
    const now = new Date();
    const formData = new FormData();
    formData.append("titulo", title);
    formData.append("conteudo", content);
    formData.append("autoria", author);
    formData.append("areaDoConhecimento", area);
    formData.append("CriadoEm", now.toISOString());
    formData.append("status", "publicado");
    if (finalImage && finalImage.startsWith("blob:")) {
      const response = await fetch(finalImage);
      const blob = await response.blob();
      formData.append("imagem", blob, "imagem.jpg");
    }
    try {
      await createPost(formData);
      setFeedback("Post publicado com sucesso!");
      setTimeout(() => {
        navigate("/gerenciamentodepostagens");
      }, 1200);
    } catch (err) {
      console.error("Erro ao publicar o post:", err);
      setFeedback("Erro ao publicar o post. Tente novamente.");
    }
  };

  // Submissão padrão publica
  const handleSubmit = (e: React.FormEvent) => savePost(e);

  return (
    <>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, maxWidth: 400, margin: '0 auto' }}>
        <button type="button" onClick={() => window.history.back()} style={{ padding: '6px 18px', borderRadius: 6, background: '#aaa', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Voltar</button>
        <a href="/" style={{ textDecoration: 'none' }}>
          <button type="button" style={{ padding: '6px 18px', borderRadius: 6, background: '#4dbec7', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Página Inicial</button>
        </a>
      </div>
      {feedback && (
        <div style={{ margin: '12px 0', color: feedback.includes('sucesso') ? '#4dbec7' : '#e04d4d', fontWeight: 600, textAlign: 'center' }}>{feedback}</div>
      )}
      <form onSubmit={handleSubmit} className="page-center" style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ textAlign: 'center', marginBottom: 24 }}>Criar Postagem <AudioRead text="Criar Postagem" /></h1>

      {/* Escolha/crop de imagem acima do título */}
      <div style={{ margin: '0 0 16px 0', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <label style={{ marginBottom: 8 }}>Imagem do post:</label>
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          onChange={onFileChange}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          onClick={() => document.getElementById('fileInput')?.click()}
          style={{ padding: '10px 28px', borderRadius: 8, background: '#7c4dbe', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '1rem', marginTop: 8 }}
        >
          Escolher imagem
        </button>
      </div>
      {imageSrc && (
        <>
          <div className="crop-container">
            {/* Componente de recorte de imagem */}
            {/* Componente de recorte de imagem */}
            {Cropper && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>
          <div className="crop-controls">
            <label>Zoom:</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={e => setZoom(Number(e.target.value))}
              style={{ width: 120 }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, margin: '12px 0' }}>
            <button type="button" onClick={() => { setImageSrc(null); setCroppedImage(null); }} style={{ padding: '10px 28px', borderRadius: 8, background: '#aaa', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
              Trocar imagem
            </button>
          </div>
        </>
      )}
      {croppedImage && (
        <div style={{ margin: '16px 0', textAlign: 'center' }}>
          <div>Prévia da imagem recortada:</div>
          <img src={croppedImage} alt="Prévia" style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8, marginTop: 8 }} />
        </div>
      )}

      <input placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} required style={{ margin: '12px 0', width: '100%', maxWidth: 350, textAlign: 'center' }} /> <AudioRead text={title} />
      <textarea placeholder="Conteúdo" value={content} onChange={e => setContent(e.target.value)} required style={{ margin: '12px 0', width: '100%', maxWidth: 350, minHeight: 100, textAlign: 'center' }} /> <AudioRead text={content} />
      <input
        placeholder="Autor"
        value={author}
        required
        readOnly
        style={{ margin: '12px 0', width: '100%', maxWidth: 350, textAlign: 'center', background: '#f3f3f3', color: '#555', border: '1px solid #ddd' }}
      /> <AudioRead text={author} />


      <div style={{ margin: '16px 0', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <label>Área do conhecimento:</label><br />
        <select value={area} onChange={e => setArea(e.target.value)} required style={{ padding: '8px', borderRadius: 6, minWidth: 180, textAlign: 'center' }}>
          {AREAS_CONHECIMENTO.map(opcao => (
            <option value={opcao} key={opcao}>{opcao}</option>
          ))}
        </select>
      </div>

      <div style={{ margin: '6px 0 0', width: '100%', maxWidth: 350, textAlign: 'center', color: '#555', fontWeight: 500 }}>
        Autor preenchido a partir do seu perfil.
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <button type="submit" style={{ padding: '10px 28px', borderRadius: 8, background: '#7c4dbe', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>Publicar</button>
        {/* Botão de rascunho removido */}
      </div>
      </form>
    </>
  );
};

export default PostCreate;
