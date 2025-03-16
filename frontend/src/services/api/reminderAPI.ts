import axiosInstance from "./axiosConfig";

export type Reminder = {
  _id: string;
  userId: string;
  title: string;
  description: string;
  deadline: Date;
  priority: number;
  remindAt: { date_time: Date }[];
  completed: boolean;
};

export type ReminderCreateData = {
  title: string;
  description: string;
  deadline: Date;
  priority: number;
  remindAt: { date_time: Date }[];
};

export type ReminderUpdateData = Partial<{
  title: string;
  description: string;
  deadline: Date;
  priority: number;
  remindAt: { date_time: Date }[];
  completed: boolean;
}>;

export const reminderService = {
  getOneReminder: async (reminderId: string) => {
    const response = await axiosInstance.get(`/reminders/${reminderId}`);
    return response.data;
  },

  getReminders: async (filters?: {
    sort?: string;
    search?: string;
    priority?: number;
    completed?: boolean;
    remind_at?: Date;
  }): Promise<{ message: string; reminders: Reminder[] }> => {
    const response = await axiosInstance.get(`/reminders`, { params: filters });
    return response.data;
  },

  createReminder: async (
    reminderData: ReminderCreateData
  ): Promise<{ message: string; data: Reminder }> => {
    const response = await axiosInstance.post(`/reminders`, reminderData);
    return response.data;
  },

  updateReminder: async (
    reminderId: string,
    updates: ReminderUpdateData
  ): Promise<{ message: string; data: Reminder }> => {
    const response = await axiosInstance.patch(
      `/reminders/${reminderId}`,
      updates
    );
    return response.data;
  },

  deleteReminder: async (
    reminderId: string
  ): Promise<{ message: string; data: Reminder }> => {
    const response = await axiosInstance.delete(`/reminders/${reminderId}`);
    return response.data;
  },

  toggleReminderCompletion: async (
    reminderId: string
  ): Promise<{ message: string; data: Reminder }> => {
    const response = await axiosInstance.patch(
      `/reminders/${reminderId}/toggle-completion`
    );
    return response.data;
  },
};
