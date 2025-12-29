// src/services/api.js
import axios from "axios";

// هنا حط رابط السيرفر متاعك
const api = axios.create({
  baseURL: "http://localhost:7256/api", // عدل حسب الباكند متاعك
  headers: {
    "Content-Type": "application/json"
  }
});

export default api;
