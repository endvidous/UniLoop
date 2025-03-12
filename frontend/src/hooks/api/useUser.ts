import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/src/services/api/queryKeys";
import {
  teacherService,
  studentService,
  TeacherCreateData,
  TeacherUpdateData,
  StudentCreateData,
  StudentUpdateData,
} from "@/src/services/api/userAPI";

// ===================
// TEACHER HOOKS
// ===================

// Fetch a single teacher by ID
export const useTeacher = (teacherId: string) => {
  return useQuery({
    queryKey: queryKeys.teachers.detail(teacherId),
    queryFn: () => teacherService.getOneTeacher(teacherId),
  });
};

// Fetch all teachers for a given department with optional filters
export const useDepartmentTeachers = (departmentId: string, filters?: any) => {
  return useQuery({
    queryKey: queryKeys.teachers.list(departmentId, filters),
    queryFn: () => teacherService.getDepartmentTeachers(departmentId),
    enabled: !!departmentId,
  });
};

// Create teachers for a department (mutation)
export const useCreateTeachers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      departmentId,
      teachers,
    }: {
      departmentId: string;
      teachers: TeacherCreateData[];
    }) => teacherService.createTeachers(departmentId, teachers),
    onSuccess: (_data, variables) => {
      // Invalidate the teacher list for the department so new data is fetched
      queryClient.invalidateQueries({
        queryKey: queryKeys.teachers.list(variables.departmentId),
      });
    },
  });
};

// Update a teacher (mutation)
export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      departmentId,
      teacherId,
      updates,
    }: {
      departmentId: string;
      teacherId: string;
      updates: TeacherUpdateData;
    }) => teacherService.updateTeacher(departmentId, teacherId, updates),
    onSuccess: (_data, variables) => {
      // Invalidate the teacher detail and list queries to refresh updated data
      queryClient.invalidateQueries({
        queryKey: queryKeys.teachers.detail(variables.teacherId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.teachers.list(variables.departmentId),
      });
    },
  });
};

// Delete a teacher (mutation)
export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      departmentId,
      teacherId,
    }: {
      departmentId: string;
      teacherId: string;
    }) => teacherService.deleteTeacher(departmentId, teacherId),
    onSuccess: (_data, variables) => {
      // Invalidate the relevant queries after deletion
      queryClient.invalidateQueries({
        queryKey: queryKeys.teachers.detail(variables.teacherId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.teachers.list(variables.departmentId),
      });
    },
  });
};

export const useAssignMentor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      teacherId,
      batchId,
    }: {
      teacherId: string;
      batchId: string;
    }) => teacherService.assignMentor(teacherId, batchId),
    onSuccess: (_data, variables) => {
      // Invalidate the relevant queries after deletion
      queryClient.invalidateQueries({
        queryKey: queryKeys.batches.detail(variables.batchId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.teachers.detail(variables.teacherId),
      });
    },
  });
};

export const useRemoveMentor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      teacherId,
      batchId,
    }: {
      teacherId: string;
      batchId: string;
    }) => teacherService.removeMentor(teacherId, batchId),
    onSuccess: (_data, variables) => {
      // Invalidate the relevant queries after deletion
      queryClient.invalidateQueries({
        queryKey: queryKeys.batches.detail(variables.batchId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.teachers.detail(variables.teacherId),
      });
    },
  });
};

// ===================
// STUDENT HOOKS
// ===================

// Fetch a single student by ID
export const useStudent = (studentId: string) => {
  return useQuery({
    queryKey: queryKeys.students.detail(studentId),
    queryFn: () => studentService.getOneStudent(studentId),
  });
};

// Fetch all students for a given batch with optional filters
export const useBatchStudents = (batchId: string, filters?: any) => {
  return useQuery({
    queryKey: queryKeys.students.list(batchId, filters),
    queryFn: () => studentService.getBatchStudents(batchId),
  });
};

// Create students for a batch (mutation)
export const useCreateStudents = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      batchId,
      students,
    }: {
      batchId: string;
      students: StudentCreateData[];
    }) => studentService.createStudents(batchId, students),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.students.list(variables.batchId),
      });
    },
  });
};

// Update a student (mutation)
export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      batchId,
      studentId,
      updates,
    }: {
      batchId: string;
      studentId: string;
      updates: StudentUpdateData;
    }) => studentService.updateStudent(batchId, studentId, updates),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.students.detail(variables.studentId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.students.list(variables.batchId),
      });
    },
  });
};

// Delete a student (mutation)
export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      batchId,
      studentId,
    }: {
      batchId: string;
      studentId: string;
    }) => studentService.deleteStudent(batchId, studentId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.students.detail(variables.studentId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.students.list(variables.batchId),
      });
    },
  });
};

export const useAssignClassRep = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      studentId,
      batchId,
    }: {
      studentId: string;
      batchId: string;
    }) => studentService.assignClassRep(studentId, batchId),
    onSuccess: (_data, variables) => {
      // Invalidate the relevant queries after deletion
      queryClient.invalidateQueries({
        queryKey: queryKeys.students.detail(variables.studentId),
      });
    },
  });
};

export const useRemoveClassRep = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      studentId,
      batchId,
    }: {
      studentId: string;
      batchId: string;
    }) => studentService.removeClassRep(studentId, batchId),
    onSuccess: (_data, variables) => {
      // Invalidate the relevant queries after deletion
      queryClient.invalidateQueries({
        queryKey: queryKeys.batches.detail(variables.batchId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.students.detail(variables.studentId),
      });
    },
  });
};

export const useRemoveAllClassReps = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId }: { batchId: string }) =>
      studentService.removeAllClassReps(batchId),
    onSuccess: (_data, variables) => {
      // Invalidate the relevant queries after deletion
      queryClient.invalidateQueries({
        queryKey: queryKeys.batches.detail(variables.batchId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.students.list,
      });
    },
  });
};
