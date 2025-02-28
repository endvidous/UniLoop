import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  departmentsService,
  papersService,
} from "@/src/services/api/departmentAPI";
import { queryKeys } from "@/src/services/api/queryKeys";
import { Department, Paper } from "@/src/services/api/departmentAPI";

export const useDepartments = (filters?: any) => {
  return useQuery<{ message: string; count: number; data: Department[] }>({
    queryKey: queryKeys.departments.list(filters),
    queryFn: () => departmentsService.getDepartments(),
  });
};

export const useCreateDepartments = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (departments: { name: string }[]) =>
      departmentsService.createDepartments(departments),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.departments.lists(),
      });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      departmentId,
      name,
    }: {
      departmentId: string;
      name: string;
    }) => departmentsService.updateDepartment(departmentId, name),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.departments.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.departments.detail(variables.departmentId),
      });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (departmentId: string) =>
      departmentsService.deleteDepartment(departmentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.departments.lists(),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.departments.detail(variables),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.papers.all(variables),
      });
    },
  });
};

// Papers queries
export const useDepartmentPapers = (departmentId: string, filters?: any) => {
  return useQuery<Paper[]>({
    queryKey: queryKeys.papers.list(departmentId, filters),
    queryFn: () => papersService.getPapers(departmentId),
    enabled: !!departmentId,
  });
};

// Paper mutations
export const useCreatePapers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      departmentId,
      papers,
    }: {
      departmentId: string;
      papers: Paper[];
    }) => papersService.createPapers(departmentId, papers),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.papers.list(variables.departmentId),
      });
    },
  });
};

export const useUpdatePaper = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      departmentId,
      paperId,
      paperData,
    }: {
      departmentId: string;
      paperId: string;
      paperData: Partial<Paper>;
    }) => papersService.updatePaper(departmentId, paperId, paperData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.papers.list(variables.departmentId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.papers.detail(
          variables.departmentId,
          variables.paperId
        ),
      });
    },
  });
};

export const useDeletePaper = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      departmentId,
      paperId,
    }: {
      departmentId: string;
      paperId: string;
    }) => papersService.deletePaper(departmentId, paperId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.papers.list(variables.departmentId),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.papers.detail(
          variables.departmentId,
          variables.paperId
        ),
      });
    },
  });
};
