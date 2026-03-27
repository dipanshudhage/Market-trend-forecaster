import axios from "axios";

import API_URL from "./api";
const http = axios.create({
  baseURL: API_URL,
});

// Automatically attach token to every request
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default http;
