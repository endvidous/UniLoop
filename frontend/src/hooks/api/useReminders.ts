import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/src/services/api/queryKeys";
import {
  reminderService,
  ReminderCreateData,
  ReminderUpdateData,
} from "@/src/services/api/reminderAPI";

// Fetch a single reminder by ID
export const useReminder = (reminderId: string) => {
  return useQuery({
    queryKey: queryKeys.reminders.detail(reminderId),
    queryFn: () => reminderService.getOneReminder(reminderId),
  });
};

// Fetch all reminders
export const useReminders = () => {
  return useQuery({
    queryKey: queryKeys.reminders.lists(),
    queryFn: () => reminderService.getReminders(),
  });
};

// Create a reminder (mutation)
export const useCreateReminder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reminderData: ReminderCreateData) =>
      reminderService.createReminder(reminderData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.reminders.lists(),
      });
    },
  });
};

// Update a reminder (mutation)
export const useUpdateReminder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reminderId,
      updates,
    }: {
      reminderId: string;
      updates: ReminderUpdateData;
    }) => reminderService.updateReminder(reminderId, updates),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.reminders.detail(variables.reminderId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.reminders.lists(),
      });
    },
  });
};

// Delete a reminder (mutation)
export const useDeleteReminder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reminderId: string) =>
      reminderService.deleteReminder(reminderId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.reminders.lists(),
      });
    },
  });
};

// Toggle reminder completion (mutation)
export const useToggleReminderCompletion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reminderId: string) =>
      reminderService.toggleReminderCompletion(reminderId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.reminders.detail(variables),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.reminders.lists(),
      });
    },
  });
};
