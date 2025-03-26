import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { classroomService } from "@/src/services/api/classroomAPI";
import { queryKeys } from "@/src/services/api/queryKeys";
import axiosInstance from "@/src/services/api/axiosConfig";

/*-----------------------------------
  Get all classrooms with filters
------------------------------------*/
export const useClassrooms = (filters?: {
  block?: string;
  date?: string | Date;
  time?: string;
  includeOccupied?: boolean;
}) => {
  return useQuery({
    queryKey: queryKeys.classrooms.list(filters),
    queryFn: () => classroomService.getClassrooms(filters),
  });
};

/*------------------------------
 Get a single classroom by ID
-------------------------------*/
export const useClassroomById = (classroomId: string, date?: string) => {
  return useQuery({
    queryKey: queryKeys.classrooms.detail(classroomId),
    queryFn: () => classroomService.getClassroomById(classroomId, date),
    enabled: !!classroomId,
  });
};

/*------------------------------
 Book a classroom
-------------------------------*/
export const useBookClassroom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: classroomService.bookClassroom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classrooms.all });
    },
  });
};

/*------------------------------
 Get all bookings
-------------------------------*/
export const useBookings = () => {
  return useQuery({
    queryKey: queryKeys.classrooms.bookings.all,
    queryFn: () => classroomService.getBookings(),
  });
};

/*------------------------------
 Approve a booking
-------------------------------*/
export const useApproveBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) =>
      classroomService.approveBooking(bookingId),

    onSuccess: (_, bookingId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.classrooms.bookings.detail(bookingId), // Fixed key
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.classrooms.bookings.list(), // Invalidate booking list
      });

      queryClient.invalidateQueries({ queryKey: queryKeys.classrooms.all }); // Invalidate all classrooms
    },
  });
};

/*------------------------------
 Reject a booking with reason
-------------------------------*/
export const useRejectBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      reason,
    }: {
      bookingId: string;
      reason: string;
    }) => classroomService.rejectBooking(bookingId, reason),

    onSuccess: (_, { bookingId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.classrooms.bookings.detail(bookingId), // Fixed reference
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.classrooms.all }); // Also invalidating all classrooms
    },
  });
};

/*------------------------------
  Delete a booking
-------------------------------*/
export const useDeleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) =>
      classroomService.deleteBooking(bookingId),

    onSuccess: (_, bookingId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classrooms.all });

      queryClient.invalidateQueries({
        queryKey: queryKeys.classrooms.bookings.list(), // Invalidate booking list
      });

      queryClient.removeQueries({
        queryKey: queryKeys.classrooms.bookings.detail(bookingId), // Fixed key
      });
    },
  });
};
