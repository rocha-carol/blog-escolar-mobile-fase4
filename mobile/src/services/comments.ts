// Importa o módulo de requisições para API
import api from "./api";

// Define o formato dos dados recebidos do backend
export type CommentDTO = {
  _id: string;
  post: string;
  autor: string;
  texto: string;
  criadoEm?: string;
  createdAt?: string;
};

// Define o formato dos comentários usados no app
export type Comment = {
  id: string;
  postId: string;
  author: string;
  message: string;
  createdAt: string;
};

// Função para formatar data e hora no padrão brasileiro
function formatDateTimeBR(value?: string) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("pt-BR");
}

// Função para normalizar dados de comentário
function normalizeComment(raw: any): Comment {
  return {
    id: String(raw?._id ?? raw?.id ?? ""),
    postId: String(raw?.post ?? raw?.postId ?? ""),
    author: raw?.autor ?? raw?.author ?? "Anônimo",
    message: raw?.texto ?? raw?.message ?? "",
    createdAt: formatDateTimeBR(raw?.criadoEm ?? raw?.createdAt),
  };
}

// Busca comentários de um post
export async function fetchComments(postId: string): Promise<Comment[]> {
  const response = await api.get(`/comentarios/${postId}`);
  const data = response.data;
  if (!Array.isArray(data)) return [];
  return data.map(normalizeComment).filter((c) => Boolean(c.id));
}

// Cria um novo comentário em um post
export async function createComment(postId: string, payload: { autor?: string; texto: string }): Promise<Comment> {
  const response = await api.post(`/comentarios/${postId}`, payload);
  return normalizeComment(response.data);
}
