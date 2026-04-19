import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "https://private-chat-app-qzju.onrender.com/api";
console.log("Connecting to API at:", BASE_URL);

const API = axios.create({
  baseURL: BASE_URL,
});

// Interceptor to add JWT token to headers
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const login = (formData) => API.post("/auth/login", formData);
export const register = (formData) => API.post("/auth/register", formData);
export const fetchUsers = () => API.get("/users");
export const fetchMessages = (otherUserId) => API.get(`/messages/${otherUserId}`);

export default API;
