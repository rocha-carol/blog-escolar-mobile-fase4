export type UserRole = "professor" | "aluno";

export type User = {
  id: string;
  nome: string;
  email?: string;
  rm?: string;
  role: UserRole;
  primeiroAcesso?: boolean;
  podeGerenciarUsuarios?: boolean;
};

export type Post = {
  _id: string;
  titulo: string;
  conteudo: string;
  areaDoConhecimento?: string;
  autoria?: string;
  imagem?: string;
  CriadoEm?: string;
  AtualizadoEm?: string;
  CriadoEmHora?: string;
  AtualizadoEmHora?: string;
  comentariosCount?: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};
