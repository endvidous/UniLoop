import { Attachment } from "@/src/components/common/AttachmentViewer";
import axiosInstance from "./axiosConfig";
import * as FileSystem from "expo-file-system";

export interface CreateAssignmentData {
  posted_to: string;
  title: string;
  description: string;
  deadline: Date;
  late_deadline?: Date | undefined;
  attachments?: Array<{
    name: string;
    key: string;
    type: string;
  }>;
}

export interface UpdateAssignmentData {
  title?: string;
  description?: string;
  deadline?: Date;
  late_deadline?: Date;
}

export interface AssignmentBase {
  _id: string;
  title: string;
  description: string;
  deadline: Date;
  late_deadline?: Date;
  created_by:
    | string
    | {
        name: string;
        role: string;
        email: string;
      };
  posted_to: {
    _id: string;
    code: string;
    startYear: number;
    currentSemester: number;
  };
  attachments?: Array<Attachment>;
}

export interface TeacherAssignment extends AssignmentBase {
  submissions?: Array<{
    _id: string;
    status: number;
    submitted_at: Date;
    attachment?: {
      name: string;
      key: string;
      type: string;
    };
    student: {
      _id: string;
      name: string;
      email: string;
      roll_no: string;
    };
  }>;
  active_submissions: number;
  late_submissions: number;
  not_submitted: number;
}

export interface StudentAssignment extends AssignmentBase {
  submission_status: number;
  deadline_status: string;
  final_deadline: Date;
  student_submission?: {
    status: number;
    submitted_at?: Date;
    attachment?: Attachment;
  };
}

export interface GetAllAssignmentsResponse {
  success: boolean;
  data: Array<TeacherAssignment | StudentAssignment>;
}

export interface GetAssignmentResponse {
  success: boolean;
  data: TeacherAssignment | StudentAssignment;
}

export const assignmentsService = {
  // Get all assignments
  getAllAssignments: async (): Promise<GetAllAssignmentsResponse> => {
    try {
      const response = await axiosInstance.get("/assignments");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Unknown error occured"
      );
    }
  },

  // Get single assignment
  getAssignment: async (
    assignmentId: string
  ): Promise<GetAssignmentResponse> => {
    try {
      const response = await axiosInstance.get(`/assignments/${assignmentId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Unknown error occured"
      );
    }
  },

  // Create assignment
  createAssignment: async (data: CreateAssignmentData) => {
    const response = await axiosInstance.post("/assignments", data);
    return response.data;
  },

  // Update assignment
  updateAssignment: async (
    assignmentId: string,
    data: UpdateAssignmentData
  ) => {
    const response = await axiosInstance.patch(
      `/assignments/${assignmentId}`,
      data
    );
    return response.data;
  },

  // Delete assignment
  deleteAssignment: async (assignmentId: string) => {
    const response = await axiosInstance.delete(`/assignments/${assignmentId}`);
    return response.data;
  },

  // Submit assignment
  submitAssignment: async (
    assignmentId: string,
    submission: { key: string; name: string; type: string }
  ) => {
    const response = await axiosInstance.patch(
      `/assignments/${assignmentId}/submission`,
      { submission }
    );
    return response.data;
  },

  // Delete assignment submission
  deleteAssignmentSubmission: async (assignmentId: string) => {
    const response = await axiosInstance.delete(
      `/assignments/${assignmentId}/submission`
    );
    return response.data;
  },

  downloadBulkAssignment: async (assignmentId: string): Promise<string> => {
    const fileUri = `${FileSystem.documentDirectory}submissions_${assignmentId}.zip`;

    const downloadResumable = FileSystem.createDownloadResumable(
      `${process.env.EXPO_PUBLIC_API_URL}/assignments/${assignmentId}/submissions/download`,
      fileUri,
      {}
    );
    console.log("File uri: ", fileUri);
    try {
      const result = await downloadResumable.downloadAsync();
      if (!result) {
        throw new Error("Download failed: No result returned");
      }
      return result.uri;
    } catch (error) {
      console.error("Download error:", error);
      throw new Error("Failed to download file");
    }
  },
};
