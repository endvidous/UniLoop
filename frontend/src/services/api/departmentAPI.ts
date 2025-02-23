import axiosInstance from "./axiosConfig";

export type Paper = {
  name: string;
  code: string;
  semester: number;
};

export type Teacher = {
  name?: string;
  email?: string;
};

export type Department = {
  _id: string;
  name: string;
  teachers?: string[];
};

export const departmentsService = {
  getDepartments: async () => {
    const response = await axiosInstance.get("/admin/departments");
    return response.data;
  },

  createDepartments: async (departments: { name: string }[]) => {
    const response = await axiosInstance.post("/admin/departments", {
      departments,
    });
    return response.data;
  },

  updateDepartment: async (departmentId: string, name: string) => {
    const response = await axiosInstance.patch(
      `/admin/departments/${departmentId}`,
      { name }
    );
    return response.data;
  },

  deleteDepartment: async (departmentId: string) => {
    const response = await axiosInstance.delete(
      `/admin/departments/${departmentId}`
    );
    return response.data;
  },

  getPapers: async (departmentId: string) => {
    const response = await axiosInstance.get(
      `/admin/departments/${departmentId}/papers`
    );
    return response.data;
  },

  createPapers: async (departmentId: string, papers: Paper[]) => {
    const response = await axiosInstance.post(
      `/admin/departments/${departmentId}/papers`,
      { papers }
    );
    return response.data;
  },

  updatePaper: async (
    departmentId: string,
    paperId: string,
    paperData: Partial<Paper>
  ) => {
    const response = await axiosInstance.patch(
      `/admin/departments/${departmentId}/papers/${paperId}`,
      paperData
    );
    return response.data;
  },

  deletePaper: async (departmentId: string, paperId: string) => {
    const response = await axiosInstance.delete(
      `/admin/departments/${departmentId}/papers/${paperId}`
    );
    return response.data;
  },
};
