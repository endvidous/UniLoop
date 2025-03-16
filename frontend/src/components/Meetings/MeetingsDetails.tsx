import React, { ComponentProps, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";
import { useNavigation } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { toast } from "@backpackapp-io/react-native-toast";
import { useTheme } from "@/src/hooks/colors/useThemeColor";
import {
  useOneMeeting,
  useApproveMeeting,
  useDeleteMeeting,
  useUpdateMeeting,
  useRejectMeeting,
} from "@/src/hooks/api/useMeetings";
import { Meeting } from "@/src/services/api/meetingsAPI";

type MeetingDetailComponentProps = {
  id: string;
};

const MeetingDetailComponent = ({ id }: MeetingDetailComponentProps) => {
  const { user } = useAuth();
  const { data: meeting, isLoading, error, refetch } = useOneMeeting(id);
  const [editing, setEditing] = useState(false);
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState(false);

  console.log(meeting);
  console.log(id);
  console.log(error);

  const { control, handleSubmit, reset } = useForm<Meeting>({
    defaultValues: {
      purpose: "",
      timing: new Date(),
      venue: "",
    },
  });

  const approveMeeting = useApproveMeeting();
  const rejectMeeting = useRejectMeeting();
  const updateMeeting = useUpdateMeeting();
  const deleteMeeting = useDeleteMeeting();

  useEffect(() => {
    navigation.setOptions({
      headerShown: true, // Show the header
      headerTitle: "Meeting Details", // Set the header title
      headerBackTitle: "Back",
    });
  }, [navigation]);

  useEffect(() => {
    if (meeting) {
      reset({
        purpose: meeting.purpose,
        timing: new Date(meeting.timing),
        venue: meeting.venue,
      });
    }
  }, [meeting, reset]);

  const handleApprove = async () => {
    try {
      await approveMeeting.mutateAsync(id);
      toast.success("Meeting approved successfully.");
      refetch();
    } catch (err) {
      toast.error("Failed to approve meeting.");
    }
  };

  const handleReject = async () => {
    try {
      await rejectMeeting.mutateAsync(id);
      toast.success("Meeting rejected successfully.");
      refetch();
    } catch (err) {
      toast.error("Failed to reject meeting.");
    }
  };

  const handleUpdate = async (data: Meeting) => {
    try {
      await updateMeeting.mutateAsync({ id, data });
      toast.success("Meeting updated successfully.");
      setEditing(false);
      refetch();
    } catch (err) {
      toast.error("Failed to update meeting.");
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this meeting?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMeeting.mutateAsync(id);
              toast.success("Meeting deleted successfully.");
              navigation.goBack();
            } catch (err) {
              toast.error("Failed to delete meeting.");
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !meeting) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Error loading meeting: {error?.message}
        </Text>
      </View>
    );
  }

  const isTeacher = user?.role === "teacher";
  const isStudent = user?.role === "student";
  const isRequester = meeting.requestedBy._id === user?.id;

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      {editing ? (
        <>
          <Controller
            control={control}
            name="purpose"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Purpose</Text>
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Enter purpose"
                />
              </View>
            )}
          />

          {/* Make sure edit for this only renders and if they are a teacher */}
          {isTeacher && (
            <>
              <Controller
                control={control}
                name="timing"
                render={({ field: { onChange, value } }) => (
                  <>
                    <TouchableOpacity
                            style={styles.dateInput}
                      onPress={() => setIsDateTimePickerVisible(true)}
                    >
                      <Text
                        style={value ? styles.dateText : styles.placeholderText}
                      >
                        {value
                          ? new Date(value).toLocaleString("en-GB")
                          : "Select Timing"}
                      </Text>
                      <MaterialIcons
                        name="calendar-today"
                        size={20}
                        color="#666"
                      />
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
              <Controller
                control={control}
                name="venue"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Venue</Text>
                    <TextInput
                      style={styles.input}
                      value={value}
                      onChangeText={onChange}
                      placeholder="Enter venue"
                    />
                  </View>
                )}
              />
            </>
          )}

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSubmit(handleUpdate)}
            >
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEditing(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Meeting Details
            </Text>
          </View>

          {/* Card-like container for meeting details */}
          <View style={styles.cardContainer}>
            <MetaItem
              icon="description"
              label="Purpose"
              value={meeting.purpose}
            />
            <MetaItem
              icon="schedule"
              label="Timing"
              value={new Date(meeting.timing).toLocaleString()}
            />
            <MetaItem icon="place" label="Venue" value={meeting.venue} />
            <MetaItem icon="info" label="Status" value={meeting.status} />
            <MetaItem
              icon="person"
              label="Requested By"
              value={meeting.requestedBy.name}
            />
            <MetaItem
              icon="person-outline"
              label="Requested To"
              value={meeting.requestedTo.name}
            />
          </View>

          {/* Buttons for teachers and students */}
          {/* Both teachers and students can edit their own meeting */}
          {isRequester && (
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setEditing(true)}
              >
                <Text style={styles.buttonText}>Edit Meeting</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Text style={styles.buttonText}>Delete Meeting</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* The person who was requested can approve or reject a meeting regardless of student or teacher */}
          {!isRequester && (
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.approveButton}
                onPress={handleApprove}
              >
                <Text style={styles.buttonText}>Approve Meeting</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={handleReject}
              >
                <Text style={styles.buttonText}>Reject Meeting</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

// MetaItem component to display key-value pairs in a card
const MetaItem = ({
  icon,
  label,
  value,
}: {
  icon: ComponentProps<typeof MaterialIcons>["name"];
  label: string;
  value: string;
}) => (
  <View style={styles.metaItem}>
    <MaterialIcons name={icon} size={18} color="#666" />
    <Text style={styles.metaLabel}>{label}:</Text>
    <Text style={styles.metaValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    flex: 1,
  },
  cardContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 16,
    elevation: 6,
    marginBottom: 20,
    width: "100%",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 8,
    marginRight: 4,
    flex: 1,
  },
  metaValue: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "500",
    flex: 2,
    flexWrap: "wrap",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
  },
  buttonGroup: {
    marginTop: 24,
    gap: 12,
  },
  editButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  approveButton: {
    backgroundColor: "#10b981",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  rejectButton: {
    backgroundColor: "#64748b",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#10b981",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#64748b",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 16,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  placeholderText: {
    color: "#888",
  },
  dateText: {
    color: "#000",
  },
});

export default MeetingDetailComponent;
