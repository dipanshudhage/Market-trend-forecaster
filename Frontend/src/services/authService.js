import axios from "axios";
import API_URL from "./api";

// Base URLs
const AUTH_API = `${API_URL}/auth`;
const USER_API = `${API_URL}/users`;

// ---------------- AUTH ----------------

export const signup = async (userData) => {
  const response = await axios.post(`${AUTH_API}/signup`, userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await axios.post(`${AUTH_API}/login`, credentials);
  return response.data;
};

// ---------------- PROFILE ----------------

export const getProfile = async () => {
  const response = await axios.get(`${USER_API}/profile`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await axios.put(`${USER_API}/profile`, profileData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return response.data;
};

export const updatePassword = async (passwordData) => {
  const response = await axios.put(`${USER_API}/password`, passwordData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return response.data;
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(`${USER_API}/upload-avatar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return response.data;
};

export const uploadBanner = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(`${USER_API}/upload-banner`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return response.data;
};
