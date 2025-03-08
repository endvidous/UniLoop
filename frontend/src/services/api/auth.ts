import axiosInstance from "./axiosConfig";
import { Platform } from "react-native";

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  logout: async (userId: string) => {
    try {
      const response = await axiosInstance.post("/auth/logout", {
        userId,
        platform: Platform.OS,
      });
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  },

  validateToken: async () => {
    try {
      const response = await axiosInstance.get("/auth/validate");
      return {
        newToken: response.data.token,
        user: response.data.user,
      };
    } catch (error) {
      throw error;
    }
  },
};
