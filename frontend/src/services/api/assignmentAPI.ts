import axiosInstance from "./axiosConfig";

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
  created_by: string;
  posted_to: {
    _id: string;
    code: string;
    startYear: number;
    currentSemester: number;
  };
  attachments: Array<{
    name: string;
    key: string;
    type: string;
  }>;
}

export interface TeacherAssignment extends AssignmentBase {
  submissions: Array<{
    _id: string;
    status: number;
    submitted_at: Date;
    updated_at: Date;
    attachment: {
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
  student_submission: {
    status: number;
    submitted_at?: Date;
    updated_at?: Date;
    attachment?: {
      name: string;
      key: string;
      type: string;
    };
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
    const response = await axiosInstance.get("/assignments");
    return response.data;
  },

  // Get single assignment
  getAssignment: async (
    assignmentId: string
  ): Promise<GetAssignmentResponse> => {
    const response = await axiosInstance.get(`/assignments/${assignmentId}`);
    return response.data;
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
    const response = await axiosInstance.post(
      `/assignments/${assignmentId}/submit`,
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
};
