import axios from "axios";
import { useStore } from "@/src/context/store";
import { useRouter } from "expo-router";
import { appStorage } from "@/src/services/storage/secureStorage";

const BASE_URL = `${process.env.EXPO_PUBLIC_API_URL}`; // your backend URL

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from store and add it to headers
    const token = useStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    const newToken = response.headers["authorization"];
    if (newToken) {
      useStore.getState().setToken(newToken.split(" ")[1]);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration (401 Unauthorized)
      console.log("Token expired or invalid");

      // Clear user data from app storage
      appStorage.clearAll();

      // Clear state (logout)
      useStore.getState().clearAuth();

      // Redirect to login screen
      const router = useRouter();
      router.replace("/(auth)");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
