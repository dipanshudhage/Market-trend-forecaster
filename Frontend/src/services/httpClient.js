import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:8000", // updated to backend port 8000
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
