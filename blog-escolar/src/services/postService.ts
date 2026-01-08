import api from "./authService";

type Autor = {
  nome: string;
  _id: string;
};
type Post = {
  id: string;
  titulo: string;
  conteudo: string;
  areaDoConhecimento: string;
  status?: string;
  CriadoEm?: string;
  AtualizadoEm?: string;
  imagem?: string;
  CriadoEmHora?: string;
  AtualizadoEmHora?: string;
  autor?: Autor | string;
  comentariosCount?: number;
};


type PostsResponse = {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export const createPost = async (formData: FormData) => {
  const response = await api.post("/posts", formData);
  return response.data;
};

type GetPostsParams = {
  page?: number;
  limit?: number;
  autor?: string;
};

async function getPosts({ page = 1, limit = 10, autor }: GetPostsParams = {}): Promise<PostsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (autor) {
    params.set("autor", autor);
  }
  const response = await api.get<PostsResponse>(`/posts?${params.toString()}`);
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

export const deletePost = async (id: string) => {
  const response = await api.delete(`/posts/${id}`);
  return response.data;
};

export type { Post };
export { getPosts, getPostById };
