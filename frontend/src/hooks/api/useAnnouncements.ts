import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { announcementsService } from "@/src/services/api/announcementAPI";
import { queryKeys } from "@/src/services/api/queryKeys";

export const useAnnouncements = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.announcements.list(filters),
    queryFn: () => announcementsService.getAnnouncements(filters),
  });
};

export const useAnnouncement = (id: string) => {
  return useQuery({
    queryKey: queryKeys.announcements.detail(id),
    queryFn: () => announcementsService.getAnnouncement(id),
    enabled: !!id,
  });
};

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: announcementsService.createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
    },
  });
};

export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      announcementsService.updateAnnouncement(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.announcements.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
    },
  });
};

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => announcementsService.deleteAnnouncement(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
      queryClient.removeQueries({
        queryKey: queryKeys.announcements.detail(id),
      });
    },
  });
};
