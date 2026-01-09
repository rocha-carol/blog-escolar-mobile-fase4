import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
