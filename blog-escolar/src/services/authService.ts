import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/";
const api = axios.create({ baseURL });

// Interceptor para enviar token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export type UserType = {
  id: string;
  nome: string;
  email: string;
  role: string;
};

export type LoginResponse = {
  token: string;
  usuario: UserType;
};

export async function loginService(email: string, password: string): Promise<LoginResponse> {
  // O backend espera email e senha
  const response = await api.post<LoginResponse>("/usuario/login", { email, senha: password });
  return response.data;
}
// Exporte o axios customizado para uso futuro
export default api;
