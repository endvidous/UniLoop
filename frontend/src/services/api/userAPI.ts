import axiosInstance from "./axiosConfig";

export type Teacher = {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "teacher" | "student";
  mentor_of?: string;
};

export type TeacherCreateData = {
  name: string;
  email: string;
  password: string;
};

export type TeacherUpdateData = Partial<{
  name: string;
  email: string;
  mentor_of?: string;
}>;

export const teacherService = {
  getOneTeacher: async (teacherId: string) => {
    const response = await axiosInstance.get(`/admin/teachers/${teacherId}`);
    return response.data;
  },

  getDepartmentTeachers: async (
    departmentId: string
  ): Promise<{ message: string; count: number; data: Teacher[] }> => {
    const response = await axiosInstance.get(
      `/admin/users/${departmentId}/teachers`
    );
    return response.data;
  },

  // Expects an array of teacher creation data and returns an array of teacher IDs.
  createTeachers: async (
    departmentId: string,
    teachers: TeacherCreateData[]
  ): Promise<{ message: string; data: string[] }> => {
    const response = await axiosInstance.post(
      `/admin/users/${departmentId}/teachers`,
      { teachers }
    );
    return response.data;
  },

  updateTeacher: async (
    departmentId: string,
    teacherId: string,
    updates: TeacherUpdateData
  ): Promise<{ message: string; data: Teacher }> => {
    const response = await axiosInstance.patch(
      `/admin/users/${departmentId}/teachers/${teacherId}`,
      updates
    );
    return response.data;
  },

  deleteTeacher: async (
    departmentId: string,
    teacherId: string
  ): Promise<{ message: string; data: Teacher }> => {
    const response = await axiosInstance.delete(
      `/admin/users/${departmentId}/teachers/${teacherId}`
    );
    return response.data;
  },

  assignMentor: async (batchId: string, teacherId: string) => {
    const response = await axiosInstance.post(`users/assign-mentor`, {
      teacherId,
      batchId,
    });
    return response.data;
  },

  removeMentor: async (batchId: string, teacherId: string) => {
    const response = await axiosInstance.post("users/remove-mentor", {
      teacherId,
      batchId,
    });
    return response.data;
  },
};

export type Student = {
  _id: string;
  name: string;
  email: string;
  role: "student";
  classrep_of?: string;
  roll_no?: string;
};

// Input type for creating a student
export type StudentCreateData = {
  name: string;
  email: string;
  password: string;
  roll_no: string;
};

// Input type for updating a student (role is not allowed to be updated)
export type StudentUpdateData = Partial<{
  name: string;
  email: string;
  roll_no: string;
  classrep_of: string;
}>;

export const studentService = {
  getOneStudent: async (
    studentId: string
  ): Promise<{ message: string; data: Student }> => {
    const response = await axiosInstance.get(`/admin/students/${studentId}`);
    return response.data;
  },

  getBatchStudents: async (
    batchId: string
  ): Promise<{ message: string; count: number; data: Student[] }> => {
    const response = await axiosInstance.get(`/admin/${batchId}/students`);
    return response.data;
  },

  // Expects an array of student creation data and returns an array of new student IDs
  createStudents: async (
    batchId: string,
    students: StudentCreateData[]
  ): Promise<{ message: string; data: string[] }> => {
    const response = await axiosInstance.post(`/admin/${batchId}/students`, {
      students,
    });
    return response.data;
  },

  updateStudent: async (
    batchId: string,
    studentId: string,
    updates: StudentUpdateData
  ): Promise<{ message: string; data: Student }> => {
    const response = await axiosInstance.patch(
      `/admin/${batchId}/students/${studentId}`,
      updates
    );
    return response.data;
  },

  deleteStudent: async (
    batchId: string,
    studentId: string
  ): Promise<{ message: string; data: Student }> => {
    const response = await axiosInstance.delete(
      `/admin/${batchId}/students/${studentId}`
    );
    return response.data;
  },

  assignClassRep: async (batchId: string, studentId: string) => {
    const response = await axiosInstance.post(`/users/assign-classrep`, {
      batchId,
      studentId,
    });
    return response.data;
  },

  removeClassRep: async (batchId: string, studentId: string) => {
    const response = await axiosInstance.post(`/users/remove-classrep`, {
      batchId,
      studentId,
    });
    return response.data;
  },

  removeAllClassReps: async (batchId: string) => {
    const response = await axiosInstance.delete(`/users/remove-all-classreps`, {
      data: batchId,
    });
    return response.data;
  },
};
