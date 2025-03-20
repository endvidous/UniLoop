import React, { ComponentProps, useEffect, useState } from "react";
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
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
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
import AttachmentViewer, { Attachment } from "../common/AttachmentViewer";
import { useForm, Controller } from "react-hook-form";
import { useFileDelete } from "@/src/hooks/api/useFiles";
import { toast } from "@backpackapp-io/react-native-toast";
import { useTheme } from "@/src/hooks/colors/useThemeColor";
import SearchablePicker from "../common/PickerSearch";

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
  attachments: Attachment[];
};

type Department = { _id: string; name: string };
type Course = { _id: string; name: string; code: string };
type Batch = { _id: string; code: string };

type FormValues = {
  title: string;
  description: string;
  priority: number;
  visibilityType: string;
  postedToId?: string | null;
  expiresAt: Date;
};

const AnnouncementDetailComponent = ({ id }: { id: string }) => {
  const { user } = useAuth();
  const { data, isLoading, error, isError, refetch } = useAnnouncement(id);
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();
  const { data: associations } = useUserAssociations();
  const router = useRouter();
  const { control, handleSubmit, reset, watch } = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      priority: 2,
      visibilityType: "General",
      postedToId: null,
      expiresAt: new Date(),
    },
  });
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const { mutate: deleteFile } = useFileDelete();
  const [showCalendar, setShowCalendar] = useState(false);
  const [editing, setEditing] = useState(false);
  const { colors } = useTheme();

  // When announcement data is loaded, set form values and attachments
  useEffect(() => {
    if (data) {
      reset({
        title: data.title,
        description: data.description,
        priority: data.priority,
        visibilityType: data.visibilityType,
        postedToId: data.posted_to?.id?._id || null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : new Date(),
      });
      setAttachments(data.attachments || []);
    }
  }, [data, reset]);

  const handleDateSelect = (dateString: string) => {
    // dateString comes as "YYYY/MM/DD"
    const [year, month, day] = dateString.split("/");
    const newDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day)
    );
    if (!isNaN(newDate.getTime())) {
      reset((prev) => ({ ...prev, expiresAt: newDate }));
    }
  };

  const onSubmit = async (formData: FormValues) => {
    try {
      // Identify attachments to delete:
      const attachmentsToDelete = data.attachments.filter(
        (original: any) =>
          !attachments.some((temp) => temp.key === original.key)
      );

      // Optionally, call deleteFile for each attachment that was removed:
      for (const att of attachmentsToDelete) {
        try {
          await deleteFile(att.key);
        } catch (err) {
          // Optionally log or handle the error, but don't block the update
          console.error("Failed to delete attachment:", att.key, err);
        }
      }

      await updateMutation.mutateAsync({
        id,
        data: {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          visibilityType: formData.visibilityType,
          ...(formData.visibilityType !== "General" && {
            posted_to: {
              // For example, you might want to map "Department" to "Departments", etc.
              model:
                formData.visibilityType === "Department"
                  ? "Departments"
                  : formData.visibilityType === "Course"
                  ? "Courses"
                  : formData.visibilityType === "Batch"
                  ? "Batches"
                  : null,
              id: formData.postedToId,
            },
          }),
          expiresAt: formData.expiresAt.toISOString(),
          attachments: attachments,
        },
      });
      toast.success("Announcement updated successfully.");
      setEditing(false);
      refetch();
    } catch (err) {
      toast.error("Failed to update announcement.");
    }
  };

  const handleDeleteAnnouncement = async () => {
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
              toast.success("Announcement deleted successfully.", {
                icon: <Ionicons name="checkmark" />,
              });
              router.back();
            } catch (err) {
              toast.error("Failed to delete announcement.", {
                icon: <Ionicons name="bug" />,
              });
            }
          },
        },
      ]
    );
  };

  const handleDeleteAttachment = async (attachment: Attachment) => {
    try {
      await deleteFile(attachment.key);
      setAttachments((prev) =>
        prev.filter((att) => att.key !== attachment.key)
      );
      toast.success("Attachment deleted successfully.");
    } catch (err) {
      toast.error("Failed to delete attachment.");
    }
  };

  const canEdit = () => {
    if (!user || !data) return false;
    return data.postedBy._id === user.id;
  };

  const canDelete = () => {
    if (!user || !data) return false;
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

  const visibilityType = watch("visibilityType");

  const getAssociationData = () => {
    switch (visibilityType?.toLowerCase()) {
      case "department":
        return associations?.departments || [];
      case "course":
        return associations?.courses || [];
      case "batch":
        return associations?.batches || [];
      default:
        return [];
    }
  };

  const getConfigData = () => {
    switch (visibilityType?.toLowerCase()) {
      case "department":
        return {
          labelKey: "name",
          valueKey: "_id",
          searchKeys: ["name"],
        };
      case "course":
        return {
          labelKey: "name",
          valueKey: "_id",
          searchKeys: ["name", "code"],
        };
      case "batch":
        return {
          labelKey: "code",
          valueKey: "_id",
          searchKeys: ["code", "startYear"],
        };
      default:
        return {};
    }
  };

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
            name="title"
            rules={{ required: "Title is required" }}
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Title</Text>
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Enter title"
                />
              </View>
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.multiline]}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Enter description"
                  multiline
                  numberOfLines={4}
                />
              </View>
            )}
          />

          <Controller
            control={control}
            name="priority"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Priority</Text>
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={styles.picker}
                >
                  <Picker.Item label="High" value={3} />
                  <Picker.Item label="Normal" value={2} />
                  <Picker.Item label="Low" value={1} />
                </Picker>
              </View>
            )}
          />

          <Controller
            control={control}
            name="visibilityType"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Visibility Type</Text>
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={styles.picker}
                >
                  <Picker.Item label="General" value="General" />
                  <Picker.Item label="Department" value="Department" />
                  <Picker.Item label="Course" value="Course" />
                  <Picker.Item label="Batch" value="Batch" />
                </Picker>
              </View>
            )}
          />

          {visibilityType && visibilityType !== "General" && (
            <Controller
              control={control}
              name="postedToId"
              rules={{ required: `${visibilityType} is required` }}
              render={({ field, fieldState }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{visibilityType}</Text>
                  <SearchablePicker
                    items={getAssociationData()}
                    selectedValue={field.value ?? null}
                    onValueChange={field.onChange}
                    placeholder={`Select ${visibilityType}`}
                    config={getConfigData()}
                  />
                </View>
              )}
            />
          )}

          <Controller
            control={control}
            name="expiresAt"
            render={({ field: { value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Expiration Date</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowCalendar(true)}
                >
                  <Text>
                    {value ? value.toLocaleDateString("en-GB") : "Select date"}
                  </Text>
                  <MaterialIcons name="calendar-today" size={20} color="#666" />
                </TouchableOpacity>
                <CalendarModal
                  visible={showCalendar}
                  onClose={() => setShowCalendar(false)}
                  onDateSelect={handleDateSelect}
                  initialDate={
                    value ? value.toISOString().split("T")[0] : undefined
                  }
                />
              </View>
            )}
          />

          {/* Render attachments with delete (edit) functionality */}
          <AttachmentViewer
            attachments={attachments}
            setAttachments={setAttachments}
            editable
          />

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSubmit(onSubmit)}
            >
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                // Revert temporary attachments to original
                setAttachments(data.attachments || []);
                setEditing(false);
              }}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {data.title}
            </Text>
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>
                {["Low", "Normal", "High"][data.priority - 1]} Priority
              </Text>
            </View>
          </View>
          <Text style={[styles.description, { color: colors.text }]}>
            {data.description}
          </Text>
          <View style={styles.metaContainer}>
            <MetaItem
              icon="visibility"
              label="Visibility Type"
              value={data.visibilityType}
            />
            <MetaItem
              icon="category"
              label="Posted To"
              value={
                data.posted_to
                  ? `${data.posted_to.model}: ${data.posted_to.id?.name}`
                  : "General"
              }
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
                  onPress={handleDeleteAnnouncement}
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
    //backgroundColor: "#fff",
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
