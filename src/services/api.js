// src/services/api.js
import axios from "axios";

// هنا حط رابط السيرفر متاعك
const api = axios.create({
  baseURL: "http://localhost:5205/api", // عدل حسب الباكند متاعك
  headers: {
    "Content-Type": "application/json"
  }
});
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export default api;
