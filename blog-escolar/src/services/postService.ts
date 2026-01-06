export const createPost = async (formData: FormData) => {
  const response = await api.post("/posts", formData);
  return response.data;
};
import api from "./authService";

type Post = {
  id: string;
  titulo: string;
  conteudo: string;
  areaDoConhecimento: string;
  CriadoEm?: string;
  AtualizadoEm?: string;
  imagem?: string;
  CriadoEmHora?: string;
  AtualizadoEmHora?: string;
};


type PostsResponse = {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

async function getPosts(page = 1, limit = 10): Promise<PostsResponse> {
  const response = await api.get<PostsResponse>(`/posts?page=${page}&limit=${limit}`);
  return response.data;
}


async function getPostById(id: string): Promise<Post> {
  const response = await api.get<Post>(`/posts/${id}`);
  return response.data;
}
export const updatePost = async (id: string, formData: FormData) => {
  const response = await api.put(`/posts/${id}`, formData);
  return response.data;
};

export type { Post };
export { getPosts, getPostById };
