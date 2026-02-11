import api, { assertProfessorPermission } from "./api";
import type { Post, PaginatedResponse } from "../types";

// Define o formato do arquivo de imagem para upload
export type UploadFile = {
  uri: string;
  name: string;
  type: string;
};

// Função para normalizar dados de post vindos do backend
function normalizePost(raw: any): Post {
  return {
    _id: String(raw?._id ?? raw?.id ?? ""),
    titulo: raw?.titulo ?? "",
    conteudo: raw?.conteudo ?? "",
    areaDoConhecimento: raw?.areaDoConhecimento,
    autoria: raw?.autoria ?? raw?.autor,
    imagem: raw?.imagem,
    CriadoEm: raw?.CriadoEm ?? raw?.["criado em"],
    AtualizadoEm: raw?.AtualizadoEm ?? raw?.atualizadoEm,
    CriadoEmHora: raw?.CriadoEmHora,
    AtualizadoEmHora: raw?.AtualizadoEmHora,
    comentariosCount: typeof raw?.comentariosCount === "number" ? raw.comentariosCount : raw?.comentarios?.length,
  };
}

// Busca lista de posts com filtros e paginação
export async function fetchPosts(params?: {
  page?: number;
  limit?: number;
  termo?: string;
  autor?: string;
}): Promise<PaginatedResponse<Post>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));

  // Busca por termo livre
  if (params?.termo) searchParams.set("q", params.termo);

  // Filtro por autor
  if (params?.autor) searchParams.set("autor", params.autor);

  const url = params?.termo ? `/posts/search?${searchParams.toString()}` : `/posts?${searchParams.toString()}`;
  const response = await api.get(url);
  const data = response.data;

  // Normalização de retorno: busca pode vir como array em vez de paginação.
  if (Array.isArray(data)) {
    const items = data.map(normalizePost).filter((p) => Boolean(p._id));
    return {
      items,
      total: items.length,
      page: 1,
      limit: items.length,
      hasMore: false,
    };
  }

  const rawItems = (data?.posts ?? data?.resultados ?? []) as any[];
  const items = rawItems.map(normalizePost).filter((p) => Boolean(p._id));

  return {
    items,
    total: data.total ?? (rawItems?.length ?? 0),
    page: data.page ?? 1,
    limit: data.limit ?? (rawItems?.length ?? 0),
    hasMore: data.hasMore ?? false,
  };
}

// Busca um post pelo id
export async function fetchPost(id: string): Promise<Post> {
  const response = await api.get(`/posts/${id}`);
  return normalizePost(response.data);
}

// Cria um novo post
export async function createPost(payload: {
  titulo: string;
  conteudo: string;
  autoria: string;
  areaDoConhecimento?: string;
  imagem?: UploadFile | null;
}): Promise<Post> {
  await assertProfessorPermission();

  const form = new FormData();
  form.append("titulo", payload.titulo);
  form.append("conteudo", payload.conteudo);
  form.append("autoria", payload.autoria);
  if (payload.areaDoConhecimento) form.append("areaDoConhecimento", payload.areaDoConhecimento);
  if (payload.imagem) {
    form.append("imagem", payload.imagem as any);
  }

  const response = await api.post("/posts", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return normalizePost(response.data);
}

// Atualiza um post existente
export async function updatePost(id: string, payload: {
  titulo: string;
  conteudo: string;
  autoria: string;
  areaDoConhecimento?: string;
  imagem?: UploadFile | null;
}): Promise<Post> {
  await assertProfessorPermission();

  const form = new FormData();
  form.append("titulo", payload.titulo);
  form.append("conteudo", payload.conteudo);
  form.append("autoria", payload.autoria);
  if (payload.areaDoConhecimento) form.append("areaDoConhecimento", payload.areaDoConhecimento);
  if (payload.imagem) {
    form.append("imagem", payload.imagem as any);
  }

  const response = await api.put(`/posts/${id}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return normalizePost(response.data);
}

// Remove um post pelo id
export async function deletePost(id: string): Promise<void> {
  await assertProfessorPermission();
  await api.delete(`/posts/${id}`);
}
