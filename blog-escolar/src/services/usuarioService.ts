import api from "./authService";

export type Usuario = {
  id: string;
  nome: string;
  email?: string;
  rm?: string;
  role: string;
};

type UsuariosResponse = {
  usuarios: Usuario[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export async function listarProfessores(params: { page?: number; limit?: number; termo?: string } = {}): Promise<UsuariosResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set("role", "professor");
  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("limit", String(params.limit ?? 10));

  if (params.termo?.trim()) {
    searchParams.set("termo", params.termo.trim());
  }

  const response = await api.get<UsuariosResponse>(`/usuarios?${searchParams.toString()}`);
  return response.data;
}

export async function obterUsuario(id: string): Promise<Usuario> {
  const response = await api.get<{ usuario: Usuario }>(`/usuarios/${id}`);
  return response.data.usuario;
}

export async function atualizarProfessor(id: string, payload: { nome: string; email: string }): Promise<Usuario> {
  const response = await api.put<{ usuario: Usuario }>(`/usuarios/${id}`, {
    nome: payload.nome,
    email: payload.email,
    role: "professor",
  });
  return response.data.usuario;
}

export async function excluirProfessor(id: string): Promise<void> {
  await api.delete(`/usuarios/${id}`);
}
