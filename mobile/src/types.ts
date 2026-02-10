// Define os tipos de papéis de usuário
export type UserRole = "professor" | "aluno";

// Define o formato dos dados de usuário
export type User = {
  id: string;
  nome: string;
  email?: string;
  rm?: string;
  role: UserRole;
  primeiroAcesso?: boolean;
  podeGerenciarUsuarios?: boolean;
};

// Define o formato dos dados de post
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

// Define o formato de resposta paginada para listas
export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};
