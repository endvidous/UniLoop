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

// Base meeting data that both students and teachers share
export type BaseMeetingData = {
  requestedTo: string;
  purpose: string;
  id?: string; // For editing
};

// Student meeting request - no venue or timing
export type StudentMeetingData = BaseMeetingData & {
  status?: "pending"; // Students can only create pending meetings
};

// Teacher meeting data - includes venue and timing
export type TeacherMeetingData = BaseMeetingData & {
  timing: Date;
  venue: string;
  status?: "approved" | "rejected" | "completed"; // Teachers can set various statuses
};

// Union type for all possible meeting data
export type CreateMeetingData = StudentMeetingData | TeacherMeetingData;

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
      console.log(meetingId);
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
      // Determine if the requester is a student or teacher
      const isStudent = !("timing" in meetingData) && !("venue" in meetingData);

      // Prepare the payload based on the requester's role
      const payload = isStudent
        ? {
            requestedTo: meetingData.requestedTo,
            purpose: meetingData.purpose,
            status: "pending", // Students can only create pending meetings
          }
        : {
            requestedTo: meetingData.requestedTo,
            purpose: meetingData.purpose,
            timing: meetingData.timing,
            venue: meetingData.venue,
            status: meetingData.status || "approved", // Default to "approved" for teachers
          };

      const response = await axiosInstance.post(API_URL, payload);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error creating meeting request";
      console.error(errorMessage, error);
      throw new Error(errorMessage);
    }
  },

  // For teachers to set venue and timing when approving a student request
  approveMeeting: async (
    meetingId: string,
    approvalData: { venue: string; timing: Date }
  ) => {
    try {
      const response = await axiosInstance.patch(
        `${API_URL}/${meetingId}/approve-meeting`,
        approvalData
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || `Error approving meeting`;
      console.error(errorMessage, error);
      throw new Error(errorMessage);
    }
  },

  rejectMeeting: async (meetingId: string, rejectionReason?: string) => {
    try {
      const response = await axiosInstance.patch(
        `${API_URL}/${meetingId}/reject-meeting`,
        { rejectionReason }
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || `Error rejecting meeting`;
      console.error(errorMessage, error);
      throw new Error(errorMessage);
    }
  },

  updateMeetingRequest: async (
    meetingId: string,
    meetingData: CreateMeetingData
  ) => {
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
