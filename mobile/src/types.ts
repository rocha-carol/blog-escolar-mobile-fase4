export type UserRole = "professor" | "aluno";

export type User = {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
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
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};
