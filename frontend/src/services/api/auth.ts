import axiosInstance from "./axiosConfig";

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

  logout: async () => {
    try {
      const response = await axiosInstance.post("/auth/index.ts");
      return response.data;
    } catch (error) {
      throw error;
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
