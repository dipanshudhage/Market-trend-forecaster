import axios from "axios";

const API_URL = "http://localhost:8000/auth";

export const signup = async (userData) => {
  const response = await axios.post(`${API_URL}/signup`, userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  return response.data;
};

// Profile methods
export const getProfile = async () => {
  const response = await axios.get(`http://localhost:8000/users/profile`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  const userData = response.data;

  // Return consistent structure for the UI
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
  // Map back name to full_name for backend if needed
  const apiData = {
    username: profileData.username,
    full_name: profileData.name
  };
  const response = await axios.put(`http://localhost:8000/users/profile`, apiData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });
  return response.data;
};

export const updatePassword = async (passwordData) => {
  const response = await axios.put(`http://localhost:8000/users/password`, passwordData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });
  return response.data;
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axios.post(`http://localhost:8000/users/upload-avatar`, formData, {
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
  const response = await axios.post(`http://localhost:8000/users/upload-banner`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });
  return response.data;
};
