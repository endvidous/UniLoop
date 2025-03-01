export const queryKeys = {
  //Academic Timelines
  academicTimelines: {
    all: ["academic-timelines"] as const,
    lists: () => [...queryKeys.academicTimelines.all, "list"] as const,
    details: () => [...queryKeys.academicTimelines.all, "detail"] as const,
    detail: (id: string) =>
      [...queryKeys.academicTimelines.details(), id] as const,
  },

  //Department Keys
  departments: {
    all: ["departments"] as const,
    lists: () => [...queryKeys.departments.all, "list"] as const,
    list: (filters?: any) =>
      [...queryKeys.departments.lists(), { ...filters }] as const,
    details: () => [...queryKeys.departments.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.departments.details(), id] as const,
  },

  //Paper keys
  papers: {
    all: (departmentId: string) =>
      [...queryKeys.departments.detail(departmentId), "papers"] as const,
    lists: (departmentId: string) =>
      [...queryKeys.papers.all(departmentId), "list"] as const,
    list: (departmentId: string, filters?: any) =>
      [...queryKeys.papers.lists(departmentId), { ...filters }] as const,
    details: (departmentId: string) =>
      [...queryKeys.papers.all(departmentId), "detail"] as const,
    detail: (departmentId: string, paperId: string) =>
      [...queryKeys.papers.details(departmentId), paperId] as const,
  },

  //Teacher keys
  teachers: {
    all: ["teachers"] as const,
    list: (departmentId: string, filters?: any) =>
      ["teachers", "list", { departmentId, ...filters }] as const,
    detail: (teacherId: string) => ["teachers", "detail", teacherId] as const,
  },

  // Courses keys
  courses: {
    all: ["courses"] as const,
    list: () => [...queryKeys.courses.all, "list"] as const,
    lists: (filters?: any) =>
      [...queryKeys.courses.list(), { ...filters }] as const,
    detail: (courseId: string) => ["courses", courseId],
  },

  // Batch keys
  batches: {
    all: ["batches"] as const,
    list: () => [...queryKeys.batches.all, "list"] as const,
    lists: (filters?: any) =>
      [...queryKeys.batches.list(), { ...filters }] as const,
    detail: (batchId: string) => ["batches", "detail", batchId] as const,
  },

  // Semester keys
  semesters: {
    all: ["semesters"] as const,
    list: () => [...queryKeys.semesters.all, "list"] as const,
    lists: (filters?: any) =>
      [...queryKeys.semesters.list(), { ...filters }] as const,
    detail: (semesterId: string) =>
      ["semesters", "detail", semesterId] as const,
  },

  //Student keys
  students: {
    all: ["students"] as const,
    list: (batchId: string, filters?: any) =>
      ["students", "list", { batchId, ...filters }] as const,
    detail: (studentId: string) => ["students", "detail", studentId] as const,
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

  // Assignment keys
  assignments: {
    all: ["assignments"] as const,
    lists: () => [...queryKeys.assignments.all, "list"] as const,
    list: (filters?: any) =>
      [...queryKeys.assignments.lists(), { ...filters }] as const,
    details: () => [...queryKeys.assignments.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.assignments.details(), id] as const,
  },
};
