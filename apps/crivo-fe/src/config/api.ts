import axios from "axios";
import { getSession } from "next-auth/react";

import { env } from "./env";

const api = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
});

api.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    const session = await getSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== "undefined" &&
      error.response?.status === 403 &&
      error.response?.data?.error === "TRIAL_EXPIRED"
    ) {
      window.location.href = "/#precos";
    }
    return Promise.reject(error);
  },
);

export default api;
