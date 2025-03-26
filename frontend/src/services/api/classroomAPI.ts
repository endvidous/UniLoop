import axiosInstance from "./axiosConfig";

export interface ClassroomData {
  room_num: string;
  block: string;
  formattedAvailability: {
    weekday: number;
    slots: {
      startTime: string;
      endTime: string;
      occupied: boolean;
    }[];
  }[];
}

interface BookingData {
  classroomId: string; // It's an object in the backend
  date: string;
  startTime: number;
  endTime: number;
  purpose: string;
}

interface UpdateBookingData {
  purpose?: string;
}

export const classroomService = {
  /*------------------------------------------------------
    Get all classrooms with optional filters
    Filters: block, date, time, includeOccupied (boolean)
  ------------------------------------------------------*/
  getClassrooms: async (filters?: {
    block?: string;
    date?: string | Date;
    time?: string;
    includeOccupied?: boolean;
  }) => {
    const response = await axiosInstance.get("/classrooms", {
      params: filters,
    });
    return response.data;
  },

  /*------------------------------------------------------
    Get a single classroom by ID
    Optional: Provide a date to check availability for that day
  ------------------------------------------------------*/
  getClassroomById: async (classroomId: string, date?: string) => {
    const response = await axiosInstance.get(`/classrooms/${classroomId}`, {
      params: date ? { date } : {},
    });
    return response.data;
  },

  /*------------------------------------------------------
    Book a classroom
    Required data: classroom ID, date, start time, end time, purpose
  ------------------------------------------------------*/
  bookClassroom: async (data: BookingData) => {
    const response = await axiosInstance.post("/classrooms/bookings", data);
    return response.data;
  },

  /*------------------------------------------------------
    Get all bookings
  ------------------------------------------------------*/
  getBookings: async () => {
    try {
      const response = await axiosInstance.get("/classrooms/bookings");
      if (!response.data) throw new Error("No data received");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch bookings"
      );
    }
  },
  /*------------------------------------------------------
    Approve a booking request
    Only teachers and admins can approve bookings
  ------------------------------------------------------*/
  approveBooking: async (bookingId: string) => {
    const response = await axiosInstance.patch(
      `/classrooms/bookings/${bookingId}/approve`
    );
    return response.data;
  },

  /*------------------------------------------------------
    Reject a booking request with a reason
    Only teachers and admins can reject bookings
  ------------------------------------------------------*/
  rejectBooking: async (bookingId: string) => {
    const response = await axiosInstance.patch(
      `/classrooms/bookings/${bookingId}/reject`
    );
    return response.data;
  },

  /*------------------------------------------------------
    Delete a booking
    Only the user who created the booking can delete it
  ------------------------------------------------------*/
  deleteBooking: async (bookingId: string) => {
    const response = await axiosInstance.delete(
      `/classrooms/bookings/${bookingId}`
    );
    return response.data;
  },
};
