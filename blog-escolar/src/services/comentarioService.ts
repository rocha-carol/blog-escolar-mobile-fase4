import api from "./authService";

export type Comentario = {
  _id: string;
  post: string;
  autor: { nome: string; _id: string } | string;
  texto: string;
  createdAt: string;
};

export async function listarComentarios(postId: string): Promise<Comentario[]> {
  const response = await api.get(`/comentarios/${postId}`);
  return response.data;
}

export async function criarComentario(
  postId: string,
  texto: string,
  autor: string,
): Promise<Comentario> {
  const response = await api.post(`/comentarios/${postId}`, { texto, autor });
  return response.data;
}

export async function excluirComentario(comentarioId: string): Promise<void> {
  await api.delete(`/comentarios/${comentarioId}`);
}
