import axios from "axios";
import API_URL from "./api";

// ---------------- AXIOS INSTANCE ----------------

const api = axios.create({
  baseURL: API_URL,
});

// ---------------- REQUEST INTERCEPTOR ----------------
// Attach token automatically

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ---------------- RESPONSE INTERCEPTOR ----------------
// Handle token expiry

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      alert("Session expired. Please login again.");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// ---------------- AUTH APIs ----------------

export const signup = async (userData) => {
  const response = await api.post("/auth/signup", userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);

  // store token if returned
  if (response.data?.access_token) {
    localStorage.setItem("token", response.data.access_token);
  }

  return response.data;
};

// ---------------- PROFILE APIs ----------------

export const getProfile = async () => {
  const response = await api.get("/users/profile");

  const userData = response.data;

  return {
    name: userData.full_name || userData.username,
    username: userData.username,
    email: userData.email,
    avatar_url: userData.avatar_url,
    banner_url: userData.banner_url,
    joinedDate: userData.joinedDate || "2024-01-15",
    stats: userData.stats || {
      forecasts: 42,
      accuracy: "89%",
      lastLogin: "2 hours ago",
    },
  };
};

export const updateProfile = async (profileData) => {
  const apiData = {
    username: profileData.username,
    full_name: profileData.name,
  };

  const response = await api.put("/users/profile", apiData);
  return response.data;
};

export const updatePassword = async (passwordData) => {
  const response = await api.put("/users/password", passwordData);
  return response.data;
};

// ---------------- FILE UPLOADS ----------------

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/users/upload-avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const uploadBanner = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/users/upload-banner", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
