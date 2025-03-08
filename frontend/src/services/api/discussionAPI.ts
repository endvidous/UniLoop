import { DiscussionsResponse } from "@/src/utils/interfaces";
import axiosInstance from "./axiosConfig";

interface CreateDiscussionData {
  title: string;
  description: string;
  postedBy: string;
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
  getDiscussions: async (params: any): Promise<DiscussionsResponse> => {
    const response = await axiosInstance.get("/discussions", { params });
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
    const response = await axiosInstance.patch(`/discussions/${id}/upvote`);
    return response.data;
  },

  downvoteDiscussion: async (id: string) => {
    const response = await axiosInstance.patch(`/discussions/${id}/downvote`);
    return response.data;
  },

  addComment: async (discussionId: string, content: string) => {
    const response = await axiosInstance.post(
      `/discussions/${discussionId}/comments`,
      { content }
    );
    return response.data;
  },

  updateComment: async (
    discussionId: string,
    commentId: string,
    content: string
  ) => {
    const response = await axiosInstance.patch(
      `/discussions/${discussionId}/comments/${commentId}`,
      { content }
    );
    return response.data;
  },

  deleteComment: async (discussionId: string, commentId: string) => {
    const response = await axiosInstance.delete(
      `/discussions/${discussionId}/comments/${commentId}`
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
    const response = await axiosInstance.patch(
      `/discussions/${discussionId}/comments/${commentId}/upvote`
    );
    return response.data;
  },

  downvoteComment: async (discussionId: string, commentId: string) => {
    const response = await axiosInstance.patch(
      `/discussions/${discussionId}/comments/${commentId}/downvote`
    );
    return response.data;
  },

  markAnswer: async (discussionId: string, commentId: string) => {
    const response = await axiosInstance.patch(
      `/discussions/${discussionId}/comments/${commentId}/mark-answer`
    );
    return response.data;
  },

  unmarkAnswer: async (discussionId: string, commentId: string) => {
    const response = await axiosInstance.patch(
      `/discussions/${discussionId}/comments/${commentId}/unmark-answer`
    );
    return response.data;
  },
};
