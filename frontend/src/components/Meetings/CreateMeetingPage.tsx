import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  TouchableOpacity,
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
import { useCreateMeeting } from "@/src/hooks/api/useMeetings";
import { toast } from "@backpackapp-io/react-native-toast";

interface MeetingFormData {
  purpose: string;
  requestedTo: string; // Selected student or teacher id
  timing?: Date; // Only for teachers
  venue?: string; // Only for teachers
}

const CreateMeetingPage = () => {
  const { user } = useAuth();
  const { data: associations } = useUserAssociations();

  const departments = associations?.departments || [];
  const batches = associations?.batches || [];

  // Determine user role
  const isTeacher = user?.role === "teacher";
  const isStudent = user?.role === "student";

  // Local state for association selection (batch for teachers, department for students)
  const [associationId, setAssociationId] = useState<string | null>(null);

  // Set up react-hook-form for meeting submission data
  const { control, handleSubmit } = useForm<MeetingFormData>({
    defaultValues: {
      purpose: "",
      requestedTo: "",
      timing: new Date(),
      venue: "",
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

  const { mutate: createMeeting } = useCreateMeeting();

  const onSubmit = (data: MeetingFormData) => {
    const payload = {
      purpose: data.purpose,
      requestedTo: data.requestedTo,
      ...(isTeacher && { timing: data.timing, venue: data.venue }),
    };

    console.log("Submitting meeting:", payload);
    // Submit the payload to your backend API
    // createMeeting(payload, {
    //   onSuccess: () => {
    //     toast.success("Assignment created successfully");
    //   },
    //   onError: (error) => {
    //     console.error("Error creating assignment:", error.message);
    //     toast.error("Error: " + error.message);
    //   },
    // });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Meeting</Text>

      {/* Association Selection */}
      {isTeacher && (
        <>
          <Text style={styles.label}>Select a Batch</Text>
          <Picker
            selectedValue={associationId}
            onValueChange={(itemValue) => setAssociationId(itemValue)}
            style={styles.picker}
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
        </>
      )}
      {isStudent && (
        <>
          <Text style={styles.label}>Select a Department</Text>
          <Picker
            selectedValue={associationId}
            onValueChange={(itemValue) => setAssociationId(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select a department" value={null} />
            {departments.map((dept) => (
              <Picker.Item key={dept._id} label={dept.name} value={dept._id} />
            ))}
          </Picker>
        </>
      )}

      {/* Dependent Picker for requestedTo */}
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
              render={({ field: { onChange, value } }) => (
                <Picker
                  selectedValue={value}
                  onValueChange={(itemValue) => onChange(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select a student" value={null} />
                  {students.map((student: any) => (
                    <Picker.Item
                      key={student._id}
                      label={student.name}
                      value={student._id}
                    />
                  ))}
                </Picker>
              )}
            />
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
              render={({ field: { onChange, value } }) => (
                <Picker
                  selectedValue={value}
                  onValueChange={(itemValue) => onChange(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select a teacher" value={null} />
                  {teachers.map((teacher: any) => (
                    <Picker.Item
                      key={teacher._id}
                      label={teacher.name}
                      value={teacher._id}
                    />
                  ))}
                </Picker>
              )}
            />
          )}
        </>
      )}

      {/* Meeting Purpose */}
      <Text style={styles.label}>Meeting Purpose</Text>
      <Controller
        control={control}
        name="purpose"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Enter meeting purpose"
            onChangeText={onChange}
            value={value}
          />
        )}
      />

      {/* Additional fields for teachers only */}
      {isTeacher && (
        <>
          <Text style={styles.label}>Timing</Text>
          <Controller
            control={control}
            name="timing"
            render={({ field: { onChange, value } }) => (
              <>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setIsDateTimePickerVisible(true)}
                >
                  <Text
                    style={value ? styles.dateText : styles.placeholderText}
                  >
                    {value ? new Date(value).toLocaleString() : "Select Timing"}
                  </Text>
                </TouchableOpacity>
                <DateTimePickerModal
                  isVisible={isDateTimePickerVisible}
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

          <Text style={styles.label}>Venue</Text>
          <Controller
            control={control}
            name="venue"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Enter venue"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </>
      )}

      <Button title="Create Meeting" onPress={handleSubmit(onSubmit)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  picker: {
    height: 50,
    width: "100%",
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 16,
    justifyContent: "center",
  },
  placeholderText: {
    color: "#888",
  },
  dateText: {
    color: "#000",
  },
  errorText: {
    color: "red",
  },
});

export default CreateMeetingPage;
