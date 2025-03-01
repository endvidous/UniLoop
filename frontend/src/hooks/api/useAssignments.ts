import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assignmentsService } from "@/src/services/api/assignmentAPI";
import { queryKeys } from "@/src/services/api/queryKeys";

export const useAssignments = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.assignments.list(filters),
    queryFn: () => assignmentsService.getAllAssignments(),
  });
};

export const useAssignment = (id: string) => {
  return useQuery({
    queryKey: queryKeys.assignments.detail(id),
    queryFn: () => assignmentsService.getAssignment(id),
    enabled: !!id,
  });
};

export const useCreateAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignmentsService.createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all });
    },
  });
};

export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      assignmentsService.updateAssignment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.assignments.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all });
    },
  });
};

export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => assignmentsService.deleteAssignment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all });
      queryClient.removeQueries({
        queryKey: queryKeys.assignments.detail(id),
      });
    },
  });
};

export const useSubmitAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, submission }: { id: string; submission: any }) =>
      assignmentsService.submitAssignment(id, submission),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.assignments.detail(variables.id),
      });
    },
  });
};

export const useDeleteAssignmentSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      assignmentsService.deleteAssignmentSubmission(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.assignments.detail(id),
      });
    },
  });
};
