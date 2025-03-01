import CalendarModal from "@/src/components/calendar/calendarModal";
import { useAuth } from "@/src/context/AuthContext";
import { useCreateAnnouncement } from "@/src/hooks/api/useAnnouncements";
import { useUserAssociations } from "@/src/hooks/api/useAssociations";
import { useFileDelete, useFileUpload } from "@/src/hooks/api/useFiles";
import {
  pickImage,
  pickPdfDocument,
  SelectedFile,
} from "@/src/utils/filePicker";
import { toast } from "@backpackapp-io/react-native-toast";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type FormData = {
  title: string;
  description: string;
  priority: number;
  visibilityType: string;
  postedToId?: string;
  expiresAt: Date;
  attachments?:
    | { name: string; key: string; type: string }[]
    | undefined
    | null;
};

type FileWithKey = SelectedFile & { key: string };
type CreateAnnouncementProps = {
  onDismiss: () => void;
};
const MAX_ATTACHMENTS = 3;
type VisibilityType = "General" | "Department" | "Batch" | "Course";

const modelMapping = {
  Department: "Departments",
  Batch: "Batches",
  Course: "Courses",
};

const CreateAnnouncement = ({ onDismiss }: CreateAnnouncementProps) => {
  const { control, handleSubmit, setValue, watch } = useForm<FormData>({
    defaultValues: {
      priority: 2,
      visibilityType: "General",
    },
  });
  const { user } = useAuth();
  const { data: associations } = useUserAssociations();
  const { mutateAsync: uploadFile } = useFileUpload();
  const { mutateAsync: deleteFile } = useFileDelete();
  const { mutateAsync: createAnnouncement } = useCreateAnnouncement();

  const [showCalendar, setShowCalendar] = useState(false);
  const [files, setFiles] = useState<FileWithKey[]>([]);
  const [uploading, setUploading] = useState(false);

  const visibilityType = watch("visibilityType");
  const expiresAt = watch("expiresAt");

  const handleDateSelect = (dateString: string) => {
    const isoDateStr = dateString.replace(/\//g, "-");
    const [year, month, day] = isoDateStr.split("-").map(Number);
    setValue("expiresAt", new Date(year, month - 1, day));
    setShowCalendar(false);
  };

  const handleFilePick = async (picker: () => Promise<SelectedFile | null>) => {
    if (files.length >= MAX_ATTACHMENTS) {
      toast.error(`Maximum ${MAX_ATTACHMENTS} attachments allowed`);
      return;
    }

    const file = await picker();
    if (!file) return;

    setUploading(true);
    try {
      const key = await uploadFile(file);
      setFiles((prev) => [...prev, { ...file, key }]);
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = async (index: number) => {
    const fileToRemove = files[index];
    setFiles((prev) => prev.filter((_, i) => i !== index));
    try {
      await deleteFile(fileToRemove.key);
    } catch (error) {
      toast.error("Failed to remove file");
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (data.visibilityType !== "General" && !data.postedToId) {
        toast.error("Please select a target for the visibility type");
        return;
      }
      const formattedAttachments = files.map((f) => ({
        name: f.name,
        key: f.key,
        type: f.type,
      }));

      await createAnnouncement({
        ...data,
        postedBy: user?.id!,
        attachments: formattedAttachments,
        posted_to:
          data.visibilityType === "General"
            ? undefined
            : {
                model:
                  modelMapping[
                    visibilityType as "Department" | "Batch" | "Course"
                  ],
                id: data.postedToId!,
              },
      });

      toast.success("Announcement created successfully");
      onDismiss();
    } catch (error) {
      console.log(error);
      toast.error("Failed to create announcement");
    }
  };

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

  const getIconForType = (type: string) => {
    if (type.startsWith("image/")) return "image";
    if (type === "application/pdf") return "picture-as-pdf";
    return "attach-file";
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Announcement</Text>
        <TouchableOpacity onPress={onDismiss}>
          <MaterialIcons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <Controller
        control={control}
        name="title"
        rules={{ required: "Title is required" }}
        render={({ field, fieldState }) => (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={field.value}
              onChangeText={field.onChange}
              placeholder="Enter title"
            />
            {fieldState.error && (
              <Text style={styles.error}>{fieldState.error.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={field.value}
              onChangeText={field.onChange}
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
        render={({ field }) => (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Priority</Text>
            <Picker
              selectedValue={field.value}
              onValueChange={field.onChange}
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
        rules={{ required: "Visibility type is required" }}
        render={({ field, fieldState }) => (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Visibility Type</Text>
            <Picker
              selectedValue={field.value}
              onValueChange={field.onChange}
              style={styles.picker}
            >
              <Picker.Item label="General" value="General" />
              {associations?.departments.length !== 0 && (
                <Picker.Item label="Department" value="Department" />
              )}
              {associations?.courses.length !== 0 && (
                <Picker.Item label="Course" value="Course" />
              )}
              {associations?.batches.length !== 0 && (
                <Picker.Item label="Batch" value="Batch" />
              )}
            </Picker>
            {fieldState.error && (
              <Text style={styles.error}>{fieldState.error.message}</Text>
            )}
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
              <Picker
                selectedValue={field.value}
                onValueChange={field.onChange}
                style={styles.picker}
              >
                <Picker.Item label={`Select ${visibilityType}`} value="" />
                {getAssociationData().map((item: any) => (
                  <Picker.Item
                    key={item._id}
                    label={item.name}
                    value={item._id}
                  />
                ))}
              </Picker>
              {fieldState.error && (
                <Text style={styles.error}>{fieldState.error.message}</Text>
              )}
            </View>
          )}
        />
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Expiration Date</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowCalendar(true)}
        >
          <Text>
            {expiresAt ? expiresAt.toLocaleDateString() : "Select date"}
          </Text>
          <MaterialIcons name="calendar-today" size={20} color="#666" />
        </TouchableOpacity>
        <CalendarModal
          visible={showCalendar}
          onClose={() => setShowCalendar(false)}
          onDateSelect={handleDateSelect}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Attachments ({files.length}/{MAX_ATTACHMENTS})
        </Text>
        <View style={styles.fileButtons}>
          <TouchableOpacity
            style={[styles.button, uploading && styles.buttonDisabled]}
            onPress={() => handleFilePick(pickImage)}
            disabled={files.length >= MAX_ATTACHMENTS || uploading}
          >
            <Text style={styles.buttonText}>Add Image</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, uploading && styles.buttonDisabled]}
            onPress={() => handleFilePick(pickPdfDocument)}
            disabled={files.length >= MAX_ATTACHMENTS || uploading}
          >
            <Text style={styles.buttonText}>Add PDF</Text>
          </TouchableOpacity>
        </View>

        {files.map((file, index) => (
          <View key={file.key} style={styles.fileItem}>
            <MaterialIcons
              name={getIconForType(file.type)}
              size={20}
              color="#666"
            />
            <Text style={styles.fileName}>{file.name}</Text>
            <TouchableOpacity onPress={() => removeFile(index)}>
              <MaterialIcons name="close" size={20} color="#ff4444" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit(onSubmit)}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create Announcement</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
  },
  multiline: {
    height: 100,
    textAlignVertical: "top",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
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
  fileButtons: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 8,
  },
  fileName: {
    flex: 1,
    marginLeft: 10,
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: "#007BFF",
    borderRadius: 8,
    padding: 12,
    flex: 1,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#cccccc",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#007BFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
});

export default CreateAnnouncement;
