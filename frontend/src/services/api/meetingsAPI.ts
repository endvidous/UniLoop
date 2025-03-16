import axiosInstance from "./axiosConfig";

const API_URL = "/meetings";

type MeetingUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
  roll_no?: string;
  mentor_of?: string;
};

export type Meeting = {
  _id: string;
  requestedBy: MeetingUser;
  requestedTo: MeetingUser;
  purpose?: string;
  timing?: Date;
  venue?: string;
  rejectionReason?: string;
  status: "pending" | "approved" | "rejected" | "completed";
  createdAt?: Date;
  updatedAt?: Date;
};

export type CreateMeetingData = {
  requestedTo: string;
  purpose: string;
  timing?: Date;
  venue?: string;
};

const meetingsAPI = {
  getMeetings: async (): Promise<{
    message: string;
    meetings: Array<Meeting>;
  }> => {
    try {
      const response = await axiosInstance.get(API_URL);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error fetching meetings";
      console.error(errorMessage, error);
      throw new Error(errorMessage);
    }
  },

  getOneMeeting: async (meetingId: string) => {
    try {
      console.log(meetingId)
      const response = await axiosInstance.get(`${API_URL}/${meetingId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error getting meeting";
      console.error(errorMessage, error);
      throw new Error(errorMessage);
    }
  },

  createMeetingRequest: async (meetingData: CreateMeetingData) => {
    try {
      const response = await axiosInstance.post(API_URL, meetingData);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error creating meeting request";
      console.error(errorMessage, error);
      throw new Error(errorMessage);
    }
  },

  approveMeeting: async (meetingId: string) => {
    try {
      const response = await axiosInstance.patch(
        `${API_URL}/${meetingId}/approve-meeting`
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || `Error approving meeting`;
      console.error(errorMessage, error);
      throw new Error(errorMessage);
    }
  },

  rejectMeeting: async (meetingId: string) => {
    try {
      const response = await axiosInstance.patch(
        `${API_URL}/${meetingId}/reject-meeting`
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || `Error rejecting meeting`;
      console.error(errorMessage, error);
      throw new Error(errorMessage);
    }
  },

  updateMeetingRequest: async (meetingId: string, meetingData: any) => {
    try {
      const response = await axiosInstance.patch(`${API_URL}/${meetingId}`, {
        data: meetingData,
      });
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || `Error editing meeting request`;
      console.error(errorMessage, error);
      throw new Error(errorMessage);
    }
  },

  deleteMeeting: async (meetingId: string) => {
    try {
      const response = await axiosInstance.delete(`${API_URL}/${meetingId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || `Error deleting meeting request`;
      console.error(errorMessage, error);
      throw new Error(errorMessage);
    }
  },
};

export default meetingsAPI;
