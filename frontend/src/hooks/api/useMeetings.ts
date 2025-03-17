import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import meetingsAPI, { CreateMeetingData } from "@/src/services/api/meetingsAPI";
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
    mutationFn: (meetingData: CreateMeetingData) =>
      meetingsAPI.createMeetingRequest(meetingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all });
    },
  });
};

export const useUpdateMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateMeetingData }) =>
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
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { venue: string; timing: Date };
    }) => meetingsAPI.approveMeeting(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.meetings.detail(variables.id),
      });
    },
  });
};

export const useRejectMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      meetingsAPI.rejectMeeting(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.meetings.detail(variables.id),
      });
    },
  });
};
