import axios from "./axiosConfig";

interface CreateAnnouncementData {
  title: string;
  description: string;
  priority: number;
  visibilityType: string;
  posted_to?: {
    model: string;
    id: string;
  };
  expiresAt: Date;
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
    const response = await axios.get("/announcements", { params: filters });
    return response.data;
  },

  // Get single announcement
  getAnnouncement: async (id: string) => {
    const response = await axios.get(`/announcements/${id}`);
    return response.data;
  },

  // Create announcement
  createAnnouncement: async (
    data: CreateAnnouncementData & { attachments?: string[] }
  ) => {
    const response = await axios.post("/announcements", data);
    return response.data;
  },

  // Update announcement
  updateAnnouncement: async (id: string, data: UpdateAnnouncementData) => {
    const response = await axios.patch(`/announcements/${id}`, data);
    return response.data;
  },

  // Delete announcement
  deleteAnnouncement: async (id: string) => {
    const response = await axios.delete(`/announcements/${id}`);
    return response.data;
  },
};
