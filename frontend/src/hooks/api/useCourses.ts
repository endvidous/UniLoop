import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  batchService,
  Course,
  courseService,
  Semester,
  SemesterService,
  CreatePapersType
} from "@/src/services/api/courseAPI";
import { queryKeys } from "@/src/services/api/queryKeys";

/* ------------Course related ----------------- */

export const useCourses = () => {
  return useQuery<{ message: string; data: Course[] }>({
    queryKey: queryKeys.courses.list(),
    queryFn: () => courseService.getCourses(),
  });
};

export const useCreateCourses = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courses: { name: string; code: string; type: string }[]) =>
      courseService.createCourses(courses),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.courses.list(),
      });
    },
  });
};

export const useGetCourse = (courseId: string) => {
  return useQuery({
    queryKey: queryKeys.courses.detail(courseId),
    queryFn: () => courseService.getOneCourse(courseId),
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      name,
      code,
    }: {
      courseId: string;
      name?: string;
      code?: string;
    }) => courseService.editCourse(courseId, name, code),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.courses.list(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.courses.detail(variables.courseId),
      });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => courseService.deleteCourse(courseId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.courses.list(),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.courses.detail(variables),
      });
    },
  });
};

/* ------------Batch related ----------------- */

export const useBatches = (courseId: string) => {
  return useQuery({
    queryKey: queryKeys.batches.lists({ courseId }),
    queryFn: () => batchService.getBatches(courseId),
  });
};

export const useCreateBatches = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      batches,
    }: {
      courseId: string;
      batches: { code: string; startYear: number }[];
    }) => batchService.createBatches(courseId, batches),
    onSuccess: (_, variables) => {
      // Invalidate queries for the specific courseId
      queryClient.invalidateQueries({
        queryKey: queryKeys.batches.lists({ courseId: variables.courseId }), // variables.courseId is courseId
      });
    },
  });
};

export const useGetBatch = (batchId: string) => {
  return useQuery({
    queryKey: queryKeys.batches.detail(batchId),
    queryFn: () => batchService.getOneBatch(batchId),
  });
};

export const useUpdateBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, code }: { batchId: string; code: string }) =>
      batchService.updateOneBatch(batchId, code),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.batches.list(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.batches.detail(variables.batchId),
      });
    },
  });
};

export const useDeleteBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (batchId: string) => batchService.deleteOneBatch(batchId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.batches.list(),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.batches.detail(variables),
      });
    },
  });
};

//Semester related hooks
export const useSemesters = (courseId: string) => {
  return useQuery({
    queryKey: queryKeys.semesters.lists({ courseId }),
    queryFn: () => SemesterService.getSemesters(courseId),
  });
};

export const useCreateSemesters = (
  courseId: string,
  sem_no: number,
  papers: Array<CreatePapersType>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => SemesterService.createSemesters(courseId, sem_no, papers),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.semesters.lists({ courseId }),
      });
    },
  });
};

export const useGetSemester = (semesterId: string) => {
  return useQuery({
    queryKey: queryKeys.semesters.detail(semesterId),
    queryFn: () => SemesterService.getOneSemester(semesterId),
  });
};

export const useUpdateSemester = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      semesterId,
      papers,
    }: {
      semesterId: string;
      papers: Semester["papers"];
    }) => SemesterService.updateOneSemester(semesterId, papers),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.semesters.list(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.semesters.detail(variables.semesterId),
      });
    },
  });
};

export const useDeleteSemester = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (semesterId: string) =>
      SemesterService.deleteOneSemester(semesterId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.semesters.list(),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.semesters.detail(variables),
      });
    },
  });
};
