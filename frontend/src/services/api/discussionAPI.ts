import axiosInstance from "./axiosConfig";

interface CreateDiscussionData {
  title: string;
  description: string;
  visibilityType: string;
  posted_to?: {
    model: string;
    id: string;
  };
}

interface UpdateDiscussionData {
  title?: string;
  description?: string;
  visibilityType?: string;
  posted_to?: {
    model: string;
    id: string;
  };
}

export const discussionsService = {
  getDiscussions: async (filters?: {
    department?: string;
    course?: string;
    batch?: string;
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await axiosInstance.get("/discussions", {
      params: filters,
    });
    return response.data;
  },

  getDiscussion: async (id: string) => {
    const response = await axiosInstance.get(`/discussions/${id}`);
    return response.data;
  },

  createDiscussion: async (data: CreateDiscussionData) => {
    const response = await axiosInstance.post("/discussions", data);
    return response.data;
  },

  updateDiscussion: async (id: string, data: UpdateDiscussionData) => {
    const response = await axiosInstance.patch(`/discussions/${id}`, data);
    return response.data;
  },

  deleteDiscussion: async (id: string) => {
    const response = await axiosInstance.delete(`/discussions/${id}`);
    return response.data;
  },

  reportDiscussion: async (id: string, reason: string) => {
    const response = await axiosInstance.post(`/discussions/${id}/report`, {
      reason,
    });
    return response.data;
  },

  upvoteDiscussion: async (id: string) => {
    const response = await axiosInstance.post(`/discussions/${id}/upvote`);
    return response.data;
  },

  addComment: async (discussionId: string, content: string) => {
    const response = await axiosInstance.post(
      `/discussions/${discussionId}/comments`,
      { content }
    );
    return response.data;
  },

  reportComment: async (
    discussionId: string,
    commentId: string,
    reason: string
  ) => {
    const response = await axiosInstance.post(
      `/discussions/${discussionId}/comments/${commentId}/report`,
      { reason }
    );
    return response.data;
  },

  upvoteComment: async (discussionId: string, commentId: string) => {
    const response = await axiosInstance.post(
      `/discussions/${discussionId}/comments/${commentId}/upvote`
    );
    return response.data;
  },

  markAnswer: async (discussionId: string, commentId: string) => {
    const response = await axiosInstance.post(
      `/discussions/${discussionId}/comments/${commentId}/mark-answer`
    );
    return response.data;
  },
};
