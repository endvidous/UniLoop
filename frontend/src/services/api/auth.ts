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
      const response = await axiosInstance.post("/auth/logout");
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

  changePassword: async ({
    currentPassword,
    newPassword,
  }: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      const response = await axiosInstance.patch("/auth/edit-password", {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error: any) {
      throw Error(error);
    }
  },
};
