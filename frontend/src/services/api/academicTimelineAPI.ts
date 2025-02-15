import axiosInstance from "./axiosConfig";

export type AcademicTimeline = {
  _id: string;
  academicYear: string;
  oddSemester: {
    start: Date;
    end: Date;
  };
  evenSemester: {
    start: Date;
    end: Date;
  };
};

export type CreateAcademicTimelineData = {
  academicYear: string;
  oddSemester: {
    start: Date;
    end: Date;
  };
  evenSemester: {
    start: Date;
    end: Date;
  };
};

export type UpdateAcademicTimelineData = Partial<CreateAcademicTimelineData>;

export const academicTimelineService = {
  getTimelines: async () => {
    const response = await axiosInstance.get("/admin/academic-timeline");
    return response.data;
  },

  createTimeline: async (data: CreateAcademicTimelineData) => {
    console.log("Reached create");
    const response = await axiosInstance.post("/admin/academic-timeline", data);
    return response.data;
  },

  updateTimeline: async (id: string, data: UpdateAcademicTimelineData) => {
    const response = await axiosInstance.patch(
      `/admin/academic-timeline/${id}`,
      data
    );
    return response.data;
  },

  deleteTimeline: async (id: string) => {
    const response = await axiosInstance.delete(
      `/admin/academic-timeline/${id}`
    );
    return response.data;
  },
};
