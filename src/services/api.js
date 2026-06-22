// src/services/api.js
import axios from "axios";
import { API_ORIGIN } from "../config";
import { loadingStore } from "@/stores/loadingStore";

const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  headers: {
    "Content-Type": "application/json"
  }
});
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  loadingStore.start();
  return config;
}, (error) => {
  loadingStore.stop();
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  loadingStore.stop();
  return response;
}, (error) => {
  loadingStore.stop();
  return Promise.reject(error);
});
export default api;
