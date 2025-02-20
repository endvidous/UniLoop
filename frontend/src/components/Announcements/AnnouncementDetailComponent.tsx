import React, { useState, useEffect, ComponentProps } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { MaterialIcons } from "@expo/vector-icons";
import CalendarModal from "../calendar/calendarModal";
import {
  useAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
} from "@/src/hooks/api/useAnnouncements";
import { ActivityIndicator } from "react-native-paper";
import { useAuth } from "@/src/context/AuthContext";
import { useUserAssociations } from "@/src/hooks/api/useAssociations";
import { useRouter } from "expo-router";
import AttachmentViewer from "../common/AttachmentViewer";
type PostedTo = {
  model: string | null;
  id?: {
    _id: string;
    name: string;
  } | null;
};

type AnnouncementData = {
  _id: string;
  title: string;
  description: string;
  priority: number;
  visibilityType: string;
  posted_to: PostedTo | null;
  expiresAt: string;
  postedBy: {
    _id: string;
    name: string;
    role: string;
  };
  createdAt: string;
  attachments: any[];
};

type Department = { _id: string; name: string };
type Course = { _id: string; name: string; code: string };
type Batch = { _id: string; code: string };
type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

const AnnouncementDetailComponent = ({ id }: { id: string }) => {
  const { user } = useAuth();
  const { data, isLoading, error, isError, refetch } = useAnnouncement(id);
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();
  const { data: associations } = useUserAssociations();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: 2,
    visibilityType: "General",
    postedToModel: "Batches",
    postedToId: null as string | null,
    expiresAt: new Date(),
  });

  const [showCalendar, setShowCalendar] = useState(false);

  // Date formatting helper
  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString("en-GB"); // DD/MM/YYYY format
  };

  // Date selection handler
  const isValidDate = (date: Date) => {
    return date instanceof Date && !isNaN(date.getTime());
  };
  const handleDateSelect = (dateString: string) => {
    // The dateString comes from CalendarModal as "YYYY/MM/DD"
    const [year, month, day] = dateString.split("/");

    // Create date using Date constructor parameters (year, monthIndex, day)
    const newDate = new Date(
      parseInt(year),
      parseInt(month) - 1, // Months are 0-based in JS Date
      parseInt(day)
    );

    if (isValidDate(newDate)) {
      setFormData({ ...formData, expiresAt: newDate });
    }
  };

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title,
        description: data.description,
        priority: data.priority,
        visibilityType: data.visibilityType,
        postedToModel: data.posted_to?.model || null,
        postedToId: data.posted_to?.id?._id || null,
        expiresAt: new Date(data.expiresAt),
      });
    }
  }, [data]);

  const handleUpdate = async () => {
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          visibilityType: formData.visibilityType,
          ...(formData.visibilityType !== "General" && {
            posted_to: {
              model: formData.postedToModel,
              id: formData.postedToId,
            },
          }),
          expiresAt: formData.expiresAt.toISOString(),
        },
      });
      Alert.alert("Success", "Announcement updated successfully.");
      setEditing(false);
      refetch();
    } catch (err) {
      Alert.alert("Error", `"Failed to update announcement." ${err}`);
    }
  };

  const formatPostedTo = (posted_to: PostedTo) => {
    if (!posted_to?.model) return "General";
    const modelPart = posted_to.model;
    const idPart = posted_to.id?.name ? `: ${posted_to.id.name}` : "";
    return `${modelPart}${idPart}`;
  };

  const handleDelete = async () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this announcement?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(id);
              Alert.alert("Success", "Announcement deleted successfully.");
              router.back();
            } catch (err) {
              Alert.alert("Error", "Failed to delete announcement.");
            }
          },
        },
      ]
    );
  };

  const canEdit = () => {
    if (!user || !data) return false;
    // Only original poster can edit (admin or regular user)
    return data.postedBy._id === user.id;
  };

  const canDelete = () => {
    if (!user || !data) return false;
    // Admins can delete any, users can delete their own
    return user.role === "admin" || data.postedBy._id === user.id;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Error loading announcement: {error?.message}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {editing ? (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Enter title"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              placeholder="Enter description"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Priority</Text>
            <Picker
              selectedValue={formData.priority}
              onValueChange={(value) =>
                setFormData({ ...formData, priority: value })
              }
              style={styles.picker}
            >
              <Picker.Item label="High" value={3} />
              <Picker.Item label="Normal" value={2} />
              <Picker.Item label="Low" value={1} />
            </Picker>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Visibility Type</Text>
            <Picker
              selectedValue={formData.visibilityType}
              onValueChange={(value) =>
                setFormData({ ...formData, visibilityType: value })
              }
              style={styles.picker}
            >
              <Picker.Item label="General" value="General" />
              <Picker.Item label="Department" value="Department" />
              <Picker.Item label="Course" value="Course" />
              <Picker.Item label="Batch" value="Batch" />
            </Picker>
          </View>

          {formData.visibilityType !== "General" && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{formData.visibilityType}</Text>
              <Picker
                selectedValue={formData.postedToId}
                onValueChange={(value) =>
                  setFormData({ ...formData, postedToId: value })
                }
                style={styles.picker}
              >
                <Picker.Item
                  label={`Select ${formData.visibilityType}`}
                  value={null}
                />
                {formData.visibilityType === "Department" &&
                  associations?.departments.map((dept: Department) => (
                    <Picker.Item
                      key={dept._id}
                      label={dept.name}
                      value={dept._id}
                    />
                  ))}
                {formData.visibilityType === "Course" &&
                  associations?.courses.map((course: Course) => (
                    <Picker.Item
                      key={course._id}
                      label={course.name}
                      value={course._id}
                    />
                  ))}
                {formData.visibilityType === "Batch" &&
                  associations?.batches.map((batch: Batch) => (
                    <Picker.Item
                      key={batch._id}
                      label={batch.code}
                      value={batch._id}
                    />
                  ))}
              </Picker>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Expiration Date</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowCalendar(true)}
            >
              <Text>{formatDateForDisplay(formData.expiresAt)}</Text>
              <MaterialIcons name="calendar-today" size={20} color="#666" />
            </TouchableOpacity>

            <CalendarModal
              visible={showCalendar}
              onClose={() => setShowCalendar(false)}
              onDateSelect={handleDateSelect}
              initialDate={formData.expiresAt.toISOString().split("T")[0]}
            />
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
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
          <View style={styles.header}>
            <Text style={styles.title}>{data.title}</Text>
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>
                {["Low", "Normal", "High"][data.priority - 1]} Priority
              </Text>
            </View>
          </View>

          <Text style={styles.description}>{data.description}</Text>

          <View style={styles.metaContainer}>
            <MetaItem
              icon="visibility"
              label="Visibility Type"
              value={data.visibilityType}
            />
            <MetaItem
              icon="category"
              label="Posted To"
              value={formatPostedTo(data.posted_to)}
            />
            <MetaItem
              icon="event"
              label="Expires"
              value={new Date(data.expiresAt).toLocaleDateString()}
            />
            <MetaItem
              icon="person"
              label="Posted By"
              value={`${data.postedBy.name} (${data.postedBy.role})`}
            />
            <MetaItem
              icon="schedule"
              label="Posted On"
              value={new Date(data.createdAt).toLocaleDateString()}
            />
          </View>
          <AttachmentViewer attachments={data.attachments} />

          {(canEdit() || canDelete()) && (
            <View style={styles.buttonGroup}>
              {canEdit() && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setEditing(true)}
                >
                  <Text style={styles.buttonText}>Edit Announcement</Text>
                </TouchableOpacity>
              )}
              {canDelete() && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDelete}
                >
                  <Text style={styles.buttonText}>Delete Announcement</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

const MetaItem = ({
  icon,
  label,
  value,
}: {
  icon: MaterialIconName;
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
    backgroundColor: "#fff",
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
  priorityBadge: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 10,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
  description: {
    fontSize: 16,
    color: "#4b5563",
    lineHeight: 24,
    marginBottom: 20,
  },
  metaContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 16,
    elevation: 6,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 8,
    marginRight: 4,
  },
  metaValue: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "500",
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
  multiline: {
    height: 100,
    textAlignVertical: "top",
  },
  picker: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
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
});

export default AnnouncementDetailComponent;
