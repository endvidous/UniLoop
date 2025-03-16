export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  classrep_of?: string;
  mentor_of?: string;
}

// Define allowed visibility types
export type VisibilityType = "General" | "Department" | "Batch" | "Course";

// Define allowed models for the posted_to field
export type PostedToModel = "Departments" | "Batches" | "Courses";

// Interface for the posted_to field
export interface IPostedTo {
  model: PostedToModel;
  id: string; // using string to represent the ObjectId
}

// Interface for a report, used in discussions and comments
export interface IReport {
  reportedBy: string;
  reason?: string;
  createdAt?: Date;
}

export interface IPostedBy {
  _id: string;
  name: string;
  role: string;
  mentor_of?: string;
  classrep_of?: string;
}

// Interface for a comment on a discussion
export interface IComment {
  content: string;
  postedBy: IPostedBy;
  isAnswer?: boolean;
  upvotes: string[];
  upvotesCount: number;
  downvotes: string[];
  downvotesCount: number;
  reports?: IReport[];
  createdAt?: Date;
}

// Main discussion interface
export interface Discussion {
  _id: string; // Optional, since the backend might assign this
  title: string;
  description?: string;
  postedBy: string;
  visibilityType: VisibilityType;
  posted_to?: IPostedTo; // Required if visibilityType is not "General"
  reports?: IReport[];
  upvotes: string[];
  upvotesCount: number;
  downvotes: string[];
  downvotesCount: number;
  isClosed?: boolean;
  comments?: IComment[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DiscussionsResponse {
  discussions: Discussion[];
  total: number;
  page: number;
  totalPages: number;
}
