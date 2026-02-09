// Importa axios para requisições HTTP e AsyncStorage para persistência local
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define a URL base da API, usando variável de ambiente ou localhost
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000";

// Cria instância do axios já configurada para a API
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // tempo máximo de espera para resposta
});

// Interceptor: adiciona email e senha nos headers de cada requisição, se estiverem salvos
api.interceptors.request.use(async (config) => {
  const raw = await AsyncStorage.getItem("auth_credentials");
  if (raw) {
    const { email, senha } = JSON.parse(raw);
    config.headers["x-email"] = email;
    config.headers["x-senha"] = senha;
  }
  return config;
});

// Exporta a instância da API e a URL base
export default api;
export { API_BASE_URL };
