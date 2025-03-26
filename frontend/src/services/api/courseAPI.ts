import axiosInstance from "./axiosConfig";
import { Paper, Teacher } from "./departmentAPI";
import { Student } from "./userAPI";

export type Course = {
  _id: string;
  name: string;
  code: string;
  type: string;
};

export type Batch = {
  _id: string;
  course: Partial<Course>;
  code: string;
  startYear: string;
  students: Student[] | string[];
  classReps: Student[] | string[];
  mentors: Teacher[] | string[];
};

export type Semester = {
  _id: string;
  course: Partial<Course>;
  number: number;
  papers: { Paper: Partial<Paper>; Teacher: Partial<Teacher> }[];
};

export type CreatePapersType = {
  paper: string;
  teacher: string;
};

export const courseService = {
  getCourses: async (): Promise<{ data: Course[]; message: string }> => {
    const response = await axiosInstance.get("/admin/courses/");
    return response.data;
  },

  getOneCourse: async (
    courseId: string
  ): Promise<{ data: Course; message: string }> => {
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
  getBatches: async (
    courseId: string
  ): Promise<{ data: Batch[] | []; message: string }> => {
    const response = await axiosInstance.get(
      `/admin/courses/${courseId}/batches`
    );
    return response.data;
  },

  createBatches: async (
    courseId: string,
    batches: { code: string; startYear: number }[]
  ) => {
    const response = await axiosInstance.post(
      `/admin/courses/${courseId}/batches`,
      { batches }
    );
    return response.data;
  },

  getOneBatch: async (
    batchId: string
  ): Promise<{ data: Batch; message: string }> => {
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
    papers: Array<CreatePapersType>
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

  updateOneSemester: async (
    semesterId: string,
    papers: { paper: string; teacher: string }[]
  ) => {
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
