import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User } from "../types";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const raw = await AsyncStorage.getItem("auth_credentials");
  if (raw) {
    const { email, senha } = JSON.parse(raw);
    config.headers["x-email"] = email;
    config.headers["x-senha"] = senha;
  }
  return config;
});

export default api;
export { API_BASE_URL };

export class PermissionError extends Error {
  constructor(message = "Ação permitida apenas para professores.") {
    super(message);
    this.name = "PermissionError";
  }
}

export async function assertProfessorPermission(): Promise<void> {
  const rawUser = await AsyncStorage.getItem("auth_user");
  const rawCredentials = await AsyncStorage.getItem("auth_credentials");

  if (!rawUser) {
    throw new PermissionError("Faça login como professor para continuar.");
  }

  const user = JSON.parse(rawUser) as User;

  if (user.role !== "professor") {
    throw new PermissionError();
  }

  if (!rawCredentials) {
    throw new PermissionError("Credenciais de professor não encontradas. Faça login novamente.");
  }
}
