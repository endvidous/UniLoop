import axios from "./axiosConfig";

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post("/auth/login", { email, password });
      return response.data;
    } catch (error: any) {
      console.log(error.message);
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await axios.post("/auth/index.ts");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  validateToken: async () => {
    try {
      const response = await axios.get("/auth/validate");
      return {
        newToken: response.data.token,
        user: response.data.user,
      };
    } catch (error) {
      throw error;
    }
  },
};
