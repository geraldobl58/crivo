import axios from "axios";

import { env } from "./env";

const api = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
});

api.interceptors.request.use(async (config) => {
  return config;
});

export default api;
