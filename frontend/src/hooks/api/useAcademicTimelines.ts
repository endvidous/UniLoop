import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  academicTimelineService,
  UpdateAcademicTimelineData,
} from "@/src/services/api/academicTimelineAPI";
import { queryKeys } from "@/src/services/api/queryKeys";

export const useAcademicTimelines = () => {
  return useQuery({
    queryKey: queryKeys.academicTimelines.all,
    queryFn: academicTimelineService.getTimelines,
  });
};

export const useCreateAcademicTimeline = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: academicTimelineService.createTimeline,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.academicTimelines.all,
      });
    },
  });
};

export const useUpdateAcademicTimeline = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateAcademicTimelineData;
    }) => academicTimelineService.updateTimeline(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.academicTimelines.all,
      });
      queryClient.setQueryData(
        queryKeys.academicTimelines.detail(variables.id),
        data
      );
    },
  });
};

export const useDeleteAcademicTimeline = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => academicTimelineService.deleteTimeline(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.academicTimelines.all,
      });
      queryClient.removeQueries({
        queryKey: queryKeys.academicTimelines.detail(id),
      });
    },
  });
};
