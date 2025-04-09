import axiosInstance from "./axiosConfig";

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
  purpose: string;
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
  status?: string;
  id?: string; // For editing
};

// Student meeting request - no venue or timing
export type StudentMeetingData = BaseMeetingData;

// Teacher meeting data - includes venue and timing
export type TeacherMeetingData = BaseMeetingData & {
  timing: Date;
  venue: string;
};

// Union type for all possible meeting data
export type CreateMeetingData = StudentMeetingData | TeacherMeetingData;
export type UpdateMeetingData = StudentMeetingData | TeacherMeetingData;

const meetingsAPI = {
  getMeetings: async (): Promise<{
    message: string;
    meetings: Array<Meeting>;
  }> => {
    try {
      const response = await axiosInstance.get("/meetings");
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
      const response = await axiosInstance.get(`/meetings/${meetingId}`);
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
            status: meetingData.status,
          };

      const response = await axiosInstance.post("/meetings", payload);
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
        `/meetings/${meetingId}/approve-meeting`,
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
        `/meetings/${meetingId}/reject-meeting`,
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
      const response = await axiosInstance.patch(
        `/meetings/${meetingId}`,
        meetingData
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || `Error editing meeting request`;
      console.error("Huh error here eh?", errorMessage, error);
      throw new Error(errorMessage);
    }
  },

  deleteMeeting: async (meetingId: string) => {
    try {
      const response = await axiosInstance.delete(`/meetings/${meetingId}`);
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
