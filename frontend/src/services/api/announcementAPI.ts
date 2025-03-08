import axiosInstance from "./axiosConfig";

interface CreateAnnouncementData {
  title: string;
  description: string;
  priority: number;
  visibilityType: string;
  postedBy: string;
  posted_to?: {
    model: string;
    id: string;
  };
  expiresAt: Date;
  attachments: Array<{
    name: string;
    key: string;
    type: string;
  }>;
}

interface UpdateAnnouncementData {
  title?: string;
  description?: string;
  priority?: number;
  visibilityType?: string;
  posted_to?: {
    model: string;
    id: string;
  };
  expiresAt?: Date;
  attachments?: [{ name: string; key: string; type: string }];
}

export const announcementsService = {
  // Get all announcements with filters
  getAnnouncements: async (filters?: {
    priority?: string[];
    department?: string;
    course?: string;
    batch?: string;
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      const response = await axiosInstance.get("/announcements", {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.log((error as any)?.response?.data?.message);
    }
  },

  // Get single announcement
  getAnnouncement: async (id: string) => {
    const response = await axiosInstance.get(`/announcements/${id}`);
    return response.data;
  },

  // Create announcement
  createAnnouncement: async (data: CreateAnnouncementData) => {
    const response = await axiosInstance.post("/announcements", data);
    return response.data;
  },

  // Update announcement
  updateAnnouncement: async (id: string, data: UpdateAnnouncementData) => {
    const response = await axiosInstance.patch(`/announcements/${id}`, data);
    return response.data;
  },

  // Delete announcement
  deleteAnnouncement: async (id: string) => {
    const response = await axiosInstance.delete(`/announcements/${id}`);
    return response.data;
  },
};
