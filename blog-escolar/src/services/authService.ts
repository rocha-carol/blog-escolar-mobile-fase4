import axios from "axios";

// Altere a URL base para o endereço da sua API
const api = axios.create({
  baseURL: "http://localhost:3000/", // Exemplo, ajuste conforme API
});

export type UserType = {
  id: string;
  nome: string;
  email: string;
  role: string;
};

export type LoginResponse = {
  token: string;
  user: UserType;
};

export async function loginService(email: string, password: string): Promise<LoginResponse> {
  // O backend espera email e senha
  const response = await api.post<LoginResponse>("/usuario/login", { email, senha: password });
  return response.data;
}

// Exporte o axios customizado para uso futuro
export default api;
