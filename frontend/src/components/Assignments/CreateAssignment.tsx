import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Controller, useForm } from "react-hook-form";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { toast } from "@backpackapp-io/react-native-toast";
import { useCreateAssignment } from "@/src/hooks/api/useAssignments";
import { CreateAssignmentData } from "@/src/services/api/assignmentAPI";
import { useUserAssociations } from "@/src/hooks/api/useAssociations";
import {
  pickImage,
  pickPdfDocument,
  SelectedFile,
} from "@/src/utils/filePicker";
import { useFileDelete, useFileUpload } from "@/src/hooks/api/useFiles";
import { useTheme } from "@/src/hooks/colors/useThemeColor";

type FileWithKey = SelectedFile & { key: string };
const MAX_ATTACHMENTS = 2;

const CreateAssignment = ({
  onDismiss,
  batchId,
}: {
  onDismiss: () => void;
  batchId?: string;
}) => {
  const { colors } = useTheme();

  const { control, handleSubmit, setValue, watch } =
    useForm<CreateAssignmentData>({
      defaultValues: {
        title: "",
        description: "",
        posted_to: "",
      },
    });

  useEffect(() => {
    if (batchId) {
      setValue("posted_to", batchId);
    }
  }, [batchId, setValue]);

  const deadline: Date | undefined = watch("deadline");
  const lateDeadline: Date | undefined = watch("late_deadline");

  const { mutate: createAssignment } = useCreateAssignment();
  const { data: associations } = useUserAssociations();
  const { mutateAsync: uploadFile } = useFileUpload();
  const { mutateAsync: deleteFile } = useFileDelete();

  const [files, setFiles] = useState<FileWithKey[]>([]);
  const [uploading, setUploading] = useState(false);

  // For combined date-time selection
  const [isDateTimePickerVisible, setDateTimePickerVisibility] =
    useState(false);
  const [selectedField, setSelectedField] = useState<
    "deadline" | "late_deadline" | null
  >(null);

  const handleDateTimeConfirm = (date: Date) => {
    if (selectedField) {
      setValue(selectedField, date);
    }
    setDateTimePickerVisibility(false);
    setSelectedField(null);
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

  const onSubmit = (data: CreateAssignmentData) => {
    const formattedData = {
      ...data,
      attachments: files.map((f) => ({
        name: f.name,
        key: f.key,
        type: f.type,
      })),
    };

    createAssignment(formattedData, {
      onSuccess: (response) => {
        console.log("Assignment created:", response);
        toast.success("Assignment created successfully");
      },
      onError: (error) => {
        console.error("Error creating assignment:", error);
        toast.error("Error creating assignment");
      },
    });
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Assignment</Text>
        <TouchableOpacity onPress={onDismiss}>
          <MaterialIcons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      {/* Title */}
      <Controller
        control={control}
        name="title"
        rules={{ required: "Title is required" }}
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Enter title"
            />
            {fieldState.error && (
              <Text style={styles.error}>{fieldState.error.message}</Text>
            )}
          </View>
        )}
      />

      {/* Description */}
      <Controller
        control={control}
        name="description"
        rules={{ required: "Description is required" }}
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Enter description"
              multiline
              numberOfLines={4}
            />
            {fieldState.error && (
              <Text style={styles.error}>{fieldState.error.message}</Text>
            )}
          </View>
        )}
      />

      {/* Deadline Picker */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Deadline</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => {
            setSelectedField("deadline");
            setDateTimePickerVisibility(true);
          }}
        >
          <Text style={!deadline ? styles.placeholderText : styles.dateText}>
            {deadline ? deadline.toLocaleString() : "Select Deadline"}
          </Text>
          <MaterialIcons name="calendar-today" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Late Deadline Picker */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { marginBottom: 2 }]}>Final Deadline</Text>
        <Text
          style={{
            fontSize: 12,
            fontWeight: "400",
            marginBottom: 8,
            color: "#393737d8",
          }}
        >
          Optional | Submissions after deadline will be marked as late and
          closed once final deadline is reached
        </Text>
        <TouchableOpacity
          style={[
            styles.dateInput,
            { opacity: !deadline ? 0.5 : 1 }, // Disable if no deadline is set
          ]}
          onPress={() => {
            if (!deadline) {
              toast.error("Please set the main deadline first");
              return;
            }
            setSelectedField("late_deadline");
            setDateTimePickerVisibility(true);
          }}
          disabled={!deadline}
        >
          <Text
            style={!lateDeadline ? styles.placeholderText : styles.dateText}
          >
            {lateDeadline
              ? lateDeadline.toLocaleString()
              : "Select Late Deadline (Optional)"}
          </Text>
          <MaterialIcons name="calendar-today" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Batch Picker */}
      <Controller
        control={control}
        name="posted_to"
        rules={{ required: "Batch is required" }}
        render={({ field: { onChange, value }, fieldState }) => (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Batch</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                style={styles.picker}
              >
                <Picker.Item label="Select Batch" value="" />
                {associations?.batches.map((batch) => (
                  <Picker.Item
                    key={batch._id}
                    label={batch.code}
                    value={batch._id}
                  />
                ))}
              </Picker>
            </View>
            {fieldState.error && (
              <Text style={styles.error}>{fieldState.error.message}</Text>
            )}
          </View>
        )}
      />

      {/* Attachments */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Attachments ({files.length}/{MAX_ATTACHMENTS})
        </Text>
        <View style={styles.fileButtons}>
          <TouchableOpacity
            style={[
              styles.button,
              (files.length >= MAX_ATTACHMENTS || uploading) &&
                styles.buttonDisabled,
            ]}
            onPress={() => handleFilePick(pickImage)}
            disabled={files.length >= MAX_ATTACHMENTS || uploading}
          >
            <Text style={styles.buttonText}>Add Image</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              (files.length >= MAX_ATTACHMENTS || uploading) &&
                styles.buttonDisabled,
            ]}
            onPress={() => handleFilePick(pickPdfDocument)}
            disabled={files.length >= MAX_ATTACHMENTS || uploading}
          >
            <Text style={styles.buttonText}>Add PDF</Text>
          </TouchableOpacity>
        </View>
        {files.map((file, index) => (
          <View key={file.key} style={styles.fileItem}>
            <MaterialIcons
              name={file.type.startsWith("image/") ? "image" : "picture-as-pdf"}
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

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit(onSubmit)}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create Assignment</Text>
        )}
      </TouchableOpacity>

      {/* DateTime Picker Modal */}
      <DateTimePickerModal
        isVisible={isDateTimePickerVisible}
        mode="datetime"
        onConfirm={handleDateTimeConfirm}
        onCancel={() => {
          setDateTimePickerVisibility(false);
          setSelectedField(null);
        }}
        minimumDate={selectedField === "late_deadline" ? deadline : new Date()}
        maximumDate={new Date(new Date().setMonth(new Date().getMonth() + 6))}
      />
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  picker: {
    height: 50,
    width: "100%",
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
  placeholderText: {
    color: "#888",
  },
  dateText: {
    color: "#000",
  },
  fileButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
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
    marginTop: 4,
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: "#007BFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
});

export default CreateAssignment;
