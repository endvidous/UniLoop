import { create } from "lodash";
import axiosInstance from "./axiosConfig";
import { Paper, Teacher } from "./departmentAPI";

export type Course = {
  _id: string;
  name: string;
  code: string;
  type: string;
};

export type Batch = {
  _id: string;
  name: string;
  course: Partial<Course>;
  code: string;
  startYear: string;
};

export type Semester = {
  _id: string;
  course: Partial<Course>;
  number: number;
  papers: { Paper: Partial<Paper>; Teacher: Partial<Teacher> }[];
};

export const courseService = {
  getCourses: async () => {
    const response = await axiosInstance.get("/admin/courses/");
    return response.data;
  },

  getOneCourse: async (courseId: string) => {
    const response = await axiosInstance.get(`/admin/courses/${courseId}`);
    return response.data;
  },

  createCourses: async (
    courses: { name: string; type: string; code: string }[]
  ) => {
    const response = await axiosInstance.post("/admin/courses", { courses });
    return response.data;
  },

  editCourse: async (courseId: string, name?: string, code?: string) => {
    const response = await axiosInstance.patch(`/admin/courses/${courseId}`, {
      name,
      code,
    });
    return response.data;
  },

  deleteCourse: async (courseId: string) => {
    const response = await axiosInstance.delete(`/admin/courses/${courseId}`);
    return response.data;
  },
};

export const batchService = {
  getBatches: async (courseId: string) => {
    const response = await axiosInstance.get(
      `/admin/courses/${courseId}/batches`
    );
    return response.data;
  },

  createBatches: async (courseId: string, batches: { startYear: number }[]) => {
    const response = await axiosInstance.post(
      `/admin/courses/${courseId}/batches`,
      { batches }
    );
    return response.data;
  },

  getOneBatch: async (batchId: string) => {
    const response = await axiosInstance.get(
      `/admin/courses/batches/${batchId}`
    );
    return response.data;
  },

  updateOneBatch: async (batchId: string, code: string) => {
    const response = await axiosInstance.patch(
      `/admin/courses/batches/${batchId}`,
      {
        code,
      }
    );
    return response.data;
  },

  deleteOneBatch: async (batchId: string) => {
    const response = await axiosInstance.delete(
      `/admin/courses/batches/${batchId}`
    );
    return response.data;
  },
};

export const SemesterService = {
  getSemesters: async (courseId: string) => {
    const response = await axiosInstance.get(
      `/admin/courses/${courseId}/semesters`
    );
    return response.data;
  },

  createSemesters: async (
    courseId: string,
    sem_no: number,
    papers: Semester["papers"]
  ) => {
    const response = await axiosInstance.post(
      `/admin/courses/${courseId}/semesters/${sem_no}`,
      { papers }
    );
    return response.data;
  },

  getOneSemester: async (semesterId: string) => {
    const response = await axiosInstance.get(
      `/admin/courses/semesters/${semesterId}`
    );
    return response.data;
  },

  updateOneSemester: async (semesterId: string, papers: Semester["papers"]) => {
    const response = await axiosInstance.patch(
      `/admin/courses/semesters/${semesterId}`,
      {
        papers,
      }
    );
    return response.data;
  },

  deleteOneSemester: async (semesterId: string) => {
    const response = await axiosInstance.delete(
      `/admin/courses/semesters/${semesterId}`
    );
    return response.data;
  },
};
