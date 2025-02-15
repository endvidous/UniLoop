export const queryKeys = {
  //Academic Timelines
  academicTimelines: {
    all: ["academic-timelines"] as const,
    lists: () => [...queryKeys.academicTimelines.all, "list"] as const,
    details: () => [...queryKeys.academicTimelines.all, "detail"] as const,
    detail: (id: string) =>
      [...queryKeys.academicTimelines.details(), id] as const,
  },

  // Announcements keys
  announcements: {
    all: ["announcements"] as const,
    lists: () => [...queryKeys.announcements.all, "list"] as const,
    list: (filters?: {
      priority?: string[];
      department?: string;
      course?: string;
      batch?: string;
      search?: string;
      sort?: string;
      page?: number;
      limit?: number;
    }) => [...queryKeys.announcements.lists(), { ...filters }] as const,
    details: () => [...queryKeys.announcements.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.announcements.details(), id] as const,
  },

  // Files keys
  files: {
    all: ["files"] as const,
    uploads: () => [...queryKeys.files.all, "upload"] as const,
    upload: (fileKey: string) =>
      [...queryKeys.files.uploads(), fileKey] as const,
  },

  //Discussions keys
  discussions: {
    all: ["discussions"] as const,
    lists: () => [...queryKeys.discussions.all, "list"] as const,
    list: (filters?: {
      department?: string;
      course?: string;
      batch?: string;
      search?: string;
      sort?: string;
      page?: number;
      limit?: number;
    }) => [...queryKeys.discussions.lists(), { ...filters }] as const,
    details: () => [...queryKeys.discussions.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.discussions.details(), id] as const,
  },
};
