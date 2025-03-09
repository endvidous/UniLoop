import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import meetingsAPI from "@/src/services/api/meetingsAPI";
import { queryKeys } from "@/src/services/api/queryKeys";

export const useMeetings = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.meetings.list(filters),
    queryFn: () => meetingsAPI.getMeetings(),
  });
};

export const useOneMeeting = (id: string) => {
  return useQuery({
    queryKey: queryKeys.meetings.detail(id),
    queryFn: () => meetingsAPI.getOneMeeting(id),
    enabled: !!id,
  });
};

export const useCreateMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: meetingsAPI.createMeetingRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all });
    },
  });
};

export const useUpdateMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      meetingsAPI.updateMeetingRequest(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.meetings.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all });
    },
  });
};

export const useDeleteMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => meetingsAPI.deleteMeeting(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all });
      queryClient.removeQueries({
        queryKey: queryKeys.meetings.detail(id),
      });
    },
  });
};

export const useApproveMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => meetingsAPI.approveMeeting(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.meetings.detail(id),
      });
    },
  });
};

export const useRejectMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => meetingsAPI.rejectMeeting(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.meetings.detail(id),
      });
    },
  });
};
