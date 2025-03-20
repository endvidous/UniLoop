import { useAuth } from "@/src/context/AuthContext";
import { useUserAssociations } from "@/src/hooks/api/useAssociations";
import { useCreateDiscussion } from "@/src/hooks/api/useDiscussions";
import { toast } from "@backpackapp-io/react-native-toast";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "@/src/hooks/colors/useThemeColor";
import SearchablePicker from "../common/PickerSearch";

type FormData = {
  title: string;
  description: string;
  visibilityType: string;
  postedToId?: string;
};

type CreateDiscussionProps = {
  onDismiss: () => void;
  batchId?: string;
  departmentId?: string;
  courseId?: string;
};

const modelMapping = {
  Department: "Departments",
  Batch: "Batches",
  Course: "Courses",
};

const CreateDiscussion = ({
  onDismiss,
  batchId,
  departmentId,
  courseId,
}: CreateDiscussionProps) => {
  const { control, handleSubmit, setValue, watch } = useForm<FormData>({
    defaultValues: {
      visibilityType: "General",
    },
  });

  useEffect(() => {
    if (departmentId) {
      setValue("visibilityType", "Department");
      setValue("postedToId", departmentId);
    } else if (courseId) {
      setValue("visibilityType", "Course");
      setValue("postedToId", courseId);
    } else if (batchId) {
      setValue("visibilityType", "Batch");
      setValue("postedToId", batchId);
    }
  }, [batchId, departmentId, courseId, setValue]);
  const { user } = useAuth();
  const { data: associations } = useUserAssociations();
  const { mutateAsync: createDiscussion } = useCreateDiscussion();
  const [submitting, setSubmitting] = useState(false);

  const visibilityType = watch("visibilityType");
  const { colors } = useTheme();

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitting(true);
      if (data.visibilityType !== "General" && !data.postedToId) {
        toast.error("Please select a target for the visibility type");
        return;
      }

      await createDiscussion({
        title: data.title,
        description: data.description,
        postedBy: user?.id!,
        visibilityType: data.visibilityType,
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

      toast.success("Discussion created successfully");
      onDismiss();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create discussion");
    } finally {
      setSubmitting(false);
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
      <View style={[styles.header, { borderBottomColor: colors.text }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Create Discussion
        </Text>
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
            <Text style={[styles.label, { color: colors.text }]}>Title</Text>
            <TextInput
              style={styles.input}
              value={field.value}
              onChangeText={field.onChange}
              placeholder="Enter title"
              placeholderTextColor={colors.text}
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
            <Text style={[styles.label, { color: colors.text }]}>
              Description
            </Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={field.value}
              onChangeText={field.onChange}
              placeholder="Enter description"
              multiline
              numberOfLines={4}
              placeholderTextColor={colors.text}
            />
          </View>
        )}
      />

      <Controller
        control={control}
        name="visibilityType"
        rules={{ required: "Visibility type is required" }}
        render={({ field, fieldState }) => (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Visibility Type
            </Text>
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
              <Text style={[styles.label, { color: colors.text }]}>
                {visibilityType}
              </Text>
              <SearchablePicker
                items={getAssociationData()}
                selectedValue={field.value ?? null}
                onValueChange={field.onChange}
                placeholder={`Select ${visibilityType}`}
                config={getConfigData()}
              />
              {fieldState.error && (
                <Text style={styles.error}>{fieldState.error.message}</Text>
              )}
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit(onSubmit)}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>
          {submitting ? "Creating..." : "Create Discussion"}
        </Text>
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
  error: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#007BFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "500",
  },
});

export default CreateDiscussion;
