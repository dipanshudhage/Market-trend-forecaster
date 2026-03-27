import axios from "axios";
import API_URL from "./api";

// Auth base
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
  return axios.post(`${AUTH_API}/login`, credentials);
};
};

// ---------------- PROFILE ----------------

export const getProfile = async () => {
  const response = await axios.get(`${USER_API}/profile`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

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
      lastLogin: "2 hours ago"
    }
  };
};

export const updateProfile = async (profileData) => {
  const apiData = {
    username: profileData.username,
    full_name: profileData.name
  };

  const response = await axios.put(`${USER_API}/profile`, apiData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  return response.data;
};

export const updatePassword = async (passwordData) => {
  const response = await axios.put(`${USER_API}/password`, passwordData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  return response.data;
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(`${USER_API}/upload-avatar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  return response.data;
};

export const uploadBanner = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(`${USER_API}/upload-banner`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  return response.data;
};
