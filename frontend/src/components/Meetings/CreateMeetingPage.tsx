import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useForm, Controller } from "react-hook-form";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useAuth } from "@/src/context/AuthContext";
import { useUserAssociations } from "@/src/hooks/api/useAssociations";
import {
  useBatchStudents,
  useDepartmentTeachers,
} from "@/src/hooks/api/useUser";
import {
  useCreateMeeting,
  useUpdateMeeting,
  useApproveMeeting,
} from "@/src/hooks/api/useMeetings";
import { toast } from "@backpackapp-io/react-native-toast";
import {
  StudentMeetingData,
  TeacherMeetingData,
} from "@/src/services/api/meetingsAPI";

interface MeetingFormData {
  purpose: string;
  requestedTo: string; // Selected student or teacher id
  timing?: Date; // Only required for teachers
  venue?: string; // Only required for teachers
}

interface CreateMeetingPageProps {
  onDismiss: () => void;
  meetingData?: any; // Optional meeting data for editing
  isEditing?: boolean;
}

const CreateMeetingPage: React.FC<CreateMeetingPageProps> = ({
  onDismiss,
  meetingData,
  isEditing = false,
}) => {
  const { user } = useAuth();
  const { data: associations } = useUserAssociations();

  const departments = associations?.departments || [];
  const batches = associations?.batches || [];

  // Determine user role
  const isTeacher = user?.role === "teacher";
  const isStudent = user?.role === "student";

  // Local state for association selection (batch for teachers, department for students)
  const [associationId, setAssociationId] = useState<string | null>(
    isEditing ? meetingData?.associationId : null
  );

  // State for button press effect
  const [isSubmitPressed, setIsSubmitPressed] = useState(false);

  // Set up react-hook-form for meeting submission data
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MeetingFormData>({
    defaultValues: {
      purpose: isEditing ? meetingData?.purpose : "",
      requestedTo: isEditing
        ? meetingData?.requestedTo?._id || meetingData?.requestedTo
        : "",
      timing:
        isEditing && meetingData?.timing
          ? new Date(meetingData.timing)
          : new Date(),
      venue: isEditing ? meetingData?.venue : "",
    },
  });

  // Load dependent data:
  // If teacher, load students for the selected batch;
  // If student, load teachers for the selected department.
  const {
    data: BatchData,
    isLoading: studentsLoading,
    error: studentsError,
  } = useBatchStudents(associationId || "", {
    enabled: isTeacher && !!associationId,
  });

  const {
    data: DepartmentData,
    isLoading: teachersLoading,
    error: teachersError,
  } = useDepartmentTeachers(associationId || "", {
    enabled: isStudent && !!associationId,
  });

  const students = BatchData?.data || [];
  const teachers = DepartmentData?.data || [];

  // State to control the DateTimePicker modal
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState(false);

  // API hooks
  const { mutate: createMeeting } = useCreateMeeting();
  const { mutate: updateMeeting } = useUpdateMeeting();
  const { mutate: approveMeeting } = useApproveMeeting();

  const onSubmit = (data: MeetingFormData) => {
    // Determine if this is a teacher viewing a student's pending request
    const isTeacherApprovingRequest =
      isTeacher && isEditing && meetingData?.status === "pending";

    // CASE 1: Student creating a new meeting request
    if (isStudent && !isEditing) {
      const studentPayload: StudentMeetingData = {
        purpose: data.purpose,
        requestedTo: data.requestedTo,
        // Students can only create pending meetings
      };
      console.log(studentPayload);

      createMeeting(studentPayload, {
        onSuccess: () => {
          toast.success("Meeting request sent successfully");
          onDismiss();
        },
        onError: (error: any) => {
          console.error("Error creating Meeting:", error.message);
          toast.error("Error: " + error.message);
        },
      });
    }

    // CASE 2: Student editing an existing meeting request
    else if (isStudent && isEditing) {
      const studentUpdatePayload: StudentMeetingData = {
        id: meetingData?._id,
        purpose: data.purpose,
        requestedTo: data.requestedTo,
      };

      updateMeeting(
        { id: meetingData?._id, data: studentUpdatePayload },
        {
          onSuccess: () => {
            toast.success("Meeting request updated successfully");
            onDismiss();
          },
          onError: (error: any) => {
            console.error("Error updating Meeting:", error.message);
            toast.error("Error: " + error.message);
          },
        }
      );
    }

    // CASE 3: Teacher creating a new meeting
    else if (isTeacher && !isEditing) {
      // Validate teacher-specific fields
      if (!data.timing || !data.venue) {
        toast.error("Please provide both timing and venue");
        return;
      }

      const teacherPayload: TeacherMeetingData = {
        purpose: data.purpose,
        requestedTo: data.requestedTo,
        timing: data.timing,
        venue: data.venue,
        status: "approved", // Teacher-created meetings are auto-approved
      };

      createMeeting(teacherPayload, {
        onSuccess: () => {
          toast.success("Meeting created successfully");
          onDismiss();
        },
        onError: (error: any) => {
          console.error("Error creating Meeting:", error.message);
          toast.error("Error: " + error.message);
        },
      });
    }

    // CASE 4: Teacher approving a student's meeting request
    else if (isTeacherApprovingRequest) {
      // Validate teacher-specific fields
      if (!data.timing || !data.venue) {
        toast.error("Please provide both timing and venue");
        return;
      }

      approveMeeting(
        {
          id: meetingData?._id,
          data: {
            venue: data.venue,
            timing: data.timing,
          },
        },
        {
          onSuccess: () => {
            toast.success("Meeting approved successfully");
            onDismiss();
          },
          onError: (error: any) => {
            console.error("Error approving Meeting:", error.message);
            toast.error("Error: " + error.message);
          },
        }
      );
    }

    // CASE 5: Teacher editing an existing meeting
    else if (isTeacher && isEditing && !isTeacherApprovingRequest) {
      // Validate teacher-specific fields
      if (!data.timing || !data.venue) {
        toast.error("Please provide both timing and venue");
        return;
      }

      const teacherUpdatePayload: TeacherMeetingData = {
        id: meetingData?._id,
        purpose: data.purpose,
        requestedTo: data.requestedTo,
        timing: data.timing,
        venue: data.venue,
      };

      updateMeeting(
        { id: meetingData?._id, data: teacherUpdatePayload },
        {
          onSuccess: () => {
            toast.success("Meeting updated successfully");
            onDismiss();
          },
          onError: (error: any) => {
            console.error("Error updating Meeting:", error.message);
            toast.error("Error: " + error.message);
          },
        }
      );
    }
  };

  // Determine if this is a teacher viewing a student's pending request
  const isTeacherApprovingRequest =
    isTeacher && isEditing && meetingData?.status === "pending";

  return (
    <View style={styles.container}>
      {/* Close button at top right */}
      <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>

      <Text style={styles.title}>
        {isEditing
          ? isTeacherApprovingRequest
            ? "Approve Meeting Request"
            : "Edit Meeting"
          : isStudent
          ? "Request a Meeting"
          : "Create a Meeting"}
      </Text>

      {isEditing && (
        <Text
          style={[
            styles.statusText,
            meetingData?.status === "pending"
              ? styles.pendingStatus
              : meetingData?.status === "approved"
              ? styles.approvedStatus
              : meetingData?.status === "rejected"
              ? styles.rejectedStatus
              : styles.completedStatus,
          ]}
        >
          Status:{" "}
          {meetingData?.status.charAt(0).toUpperCase() +
            meetingData?.status.slice(1)}
        </Text>
      )}

      {/* Association Selection - Only show if not editing or if creating new */}
      {(!isEditing || isTeacherApprovingRequest) && (
        <>
          {isTeacher && (
            <>
              <Text style={styles.label}>Select a Batch</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={associationId}
                  onValueChange={(itemValue) => setAssociationId(itemValue)}
                  style={styles.picker}
                  enabled={!isEditing || isTeacherApprovingRequest}
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Select a batch" value={null} />
                  {batches.map((batch) => (
                    <Picker.Item
                      key={batch._id}
                      label={batch.code}
                      value={batch._id}
                    />
                  ))}
                </Picker>
              </View>
            </>
          )}

          {isStudent && (
            <>
              <Text style={styles.label}>Select a Department</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={associationId}
                  onValueChange={(itemValue) => setAssociationId(itemValue)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Select a department" value={null} />
                  {departments.map((dept) => (
                    <Picker.Item
                      key={dept._id}
                      label={dept.name}
                      value={dept._id}
                    />
                  ))}
                </Picker>
              </View>
            </>
          )}
        </>
      )}

      {/* Dependent Picker for requestedTo - Only show if not editing or if creating new */}
      {(!isEditing ||
        (isTeacherApprovingRequest && !meetingData?.requestedTo)) && (
        <>
          {isTeacher && associationId && (
            <>
              <Text style={styles.label}>Select a Student</Text>
              {studentsLoading && <Text>Loading students...</Text>}
              {studentsError && (
                <Text style={styles.errorText}>Error loading students</Text>
              )}
              {!studentsLoading && !studentsError && (
                <Controller
                  control={control}
                  name="requestedTo"
                  rules={{ required: "Please select a student" }}
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={value}
                        onValueChange={(itemValue) => onChange(itemValue)}
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                      >
                        <Picker.Item label="Select a student" value="" />
                        {students.map((student: any) => (
                          <Picker.Item
                            key={student._id}
                            label={student.name}
                            value={student._id}
                          />
                        ))}
                      </Picker>
                    </View>
                  )}
                />
              )}
              {errors.requestedTo && (
                <Text style={styles.errorText}>
                  {errors.requestedTo.message}
                </Text>
              )}
            </>
          )}

          {isStudent && associationId && (
            <>
              <Text style={styles.label}>Select a Teacher</Text>
              {teachersLoading && <Text>Loading teachers...</Text>}
              {teachersError && (
                <Text style={styles.errorText}>Error loading teachers</Text>
              )}
              {!teachersLoading && !teachersError && (
                <Controller
                  control={control}
                  name="requestedTo"
                  rules={{ required: "Please select a teacher" }}
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={value}
                        onValueChange={(itemValue) => onChange(itemValue)}
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                      >
                        <Picker.Item label="Select a teacher" value="" />
                        {teachers.map((teacher: any) => (
                          <Picker.Item
                            key={teacher._id}
                            label={teacher.name}
                            value={teacher._id}
                          />
                        ))}
                      </Picker>
                    </View>
                  )}
                />
              )}
              {errors.requestedTo && (
                <Text style={styles.errorText}>
                  {errors.requestedTo.message}
                </Text>
              )}
            </>
          )}
        </>
      )}

      {/* Meeting Purpose - Always editable for both roles */}
      <Text style={styles.label}>Meeting Purpose</Text>
      <Controller
        control={control}
        name="purpose"
        rules={{ required: "Please enter a purpose" }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Enter meeting purpose"
            onChangeText={onChange}
            value={value}
            editable={!(isTeacherApprovingRequest && meetingData?.purpose)}
          />
        )}
      />
      {errors.purpose && (
        <Text style={styles.errorText}>{errors.purpose.message}</Text>
      )}

      {/* Additional fields visible only for teachers */}
      {isTeacher && (
        <>
          <Text style={styles.label}>Timing</Text>
          <Controller
            control={control}
            name="timing"
            rules={{ required: "Please select a timing" }}
            render={({ field: { onChange, value } }) => (
              <>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setIsDateTimePickerVisible(true)}
                >
                  <Text
                    style={value ? styles.dateText : styles.placeholderText}
                  >
                    {value
                      ? new Date(value).toLocaleString("en-GB")
                      : "Select Timing"}
                  </Text>
                </TouchableOpacity>
                <DateTimePickerModal
                  isVisible={isDateTimePickerVisible}
                  minimumDate={new Date()}
                  mode="datetime"
                  onConfirm={(date) => {
                    onChange(date);
                    setIsDateTimePickerVisible(false);
                  }}
                  onCancel={() => setIsDateTimePickerVisible(false)}
                />
              </>
            )}
          />
          {errors.timing && (
            <Text style={styles.errorText}>{errors.timing.message}</Text>
          )}

          <Text style={styles.label}>Venue</Text>
          <Controller
            control={control}
            name="venue"
            rules={{ required: "Please enter a venue" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Enter venue"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.venue && (
            <Text style={styles.errorText}>{errors.venue.message}</Text>
          )}
        </>
      )}

      {/* If student is viewing an approved meeting, show the details */}
      {isStudent && isEditing && meetingData?.status === "approved" && (
        <>
          <Text style={styles.label}>Meeting Details</Text>
          <View style={styles.detailsContainer}>
            <Text style={styles.detailLabel}>Time:</Text>
            <Text style={styles.detailValue}>
              {meetingData?.timing
                ? new Date(meetingData.timing).toLocaleString("en-GB")
                : "Not set"}
            </Text>
          </View>
          <View style={styles.detailsContainer}>
            <Text style={styles.detailLabel}>Venue:</Text>
            <Text style={styles.detailValue}>
              {meetingData?.venue || "Not set"}
            </Text>
          </View>
        </>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.submitButton,
          pressed || isSubmitPressed
            ? styles.submitButtonPressed
            : styles.submitButtonNormal,
        ]}
        onPressIn={() => setIsSubmitPressed(true)}
        onPressOut={() => setIsSubmitPressed(false)}
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={styles.submitButtonText}>
          {isEditing
            ? isTeacherApprovingRequest
              ? "Approve Meeting"
              : "Update Meeting"
            : isStudent
            ? "Request Meeting"
            : "Create Meeting"}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    position: "relative",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#f8f8f8",
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  pickerItem: {
    height: 44,
    fontSize: 16,
  },
  input: {
    height: 48,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    justifyContent: "center",
    backgroundColor: "#f8f8f8",
  },
  placeholderText: {
    color: "#888",
  },
  dateText: {
    color: "#000",
  },
  errorText: {
    color: "red",
    marginTop: -12,
    marginBottom: 12,
    fontSize: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#007BFF",
  },
  pendingStatus: {
    color: "#FFA500",
  },
  approvedStatus: {
    color: "#28A745",
  },
  rejectedStatus: {
    color: "#DC3545",
  },
  completedStatus: {
    color: "#6C757D",
  },
  detailsContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: "bold",
    width: 80,
  },
  detailValue: {
    flex: 1,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
  },
  submitButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonNormal: {
    backgroundColor: "#e0e0e0",
  },
  submitButtonPressed: {
    backgroundColor: "#007BFF",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});

export default CreateMeetingPage;
