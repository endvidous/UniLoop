import axiosInstance from "./axiosConfig";

export const userAssociationService = {
  getAssociations: async () => {
    const response = await axiosInstance.get("/associations");
    return response.data;
  },
};
