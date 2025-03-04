import { useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import { useForm, useFieldArray } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import {
  useDepartmentTeachers,
  useCreateTeachers,
} from "@/src/hooks/api/useUser";
import { Teacher, TeacherCreateData } from "@/src/services/api/userAPI";
import CsvUploaderComponent from "@/src/components/common/CsvEntry";
import ManualEntryComponent from "@/src/components/common/ManualEntry";

// Extend Teacher interface to include an internal form ID
interface TeacherFormItem extends Omit<Teacher, "_id"> {
  name: string;
  email: string;
  role: "admin" | "teacher" | "student";
  mentor_of?: string;
  password: string; // Required for creating new teachers
  formId?: string; // Internal ID for form management only
}

interface TeacherFormData {
  teachers: TeacherFormItem[];
}

const TeacherUpload = () => {
  const { departmentId } = useLocalSearchParams<{ departmentId: string }>();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeacherFormData>({
    defaultValues: {
      teachers: [{ name: "", email: "", role: "teacher", password: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "teachers",
    keyName: "formId", // Use formId as the key for useFieldArray
  });

  const [showUploadSection, setShowUploadSection] = useState(true);
  const [isManualEntryDisabled, setIsManualEntryDisabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditingCSV, setIsEditingCSV] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const { data: existingTeachers } = useDepartmentTeachers(departmentId);
  const { mutate: createTeachers, isPending: isCreating } = useCreateTeachers();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const checkForDuplicates = (newTeachers: TeacherFormItem[]): string[] => {
    if (!existingTeachers) return [];

    const duplicates = newTeachers
      .filter(
        (teacher) => teacher.name.trim() !== "" && teacher.email.trim() !== ""
      )
      .filter((teacher) =>
        existingTeachers.data.some(
          (existing) =>
            existing.email.toLowerCase() === teacher.email.toLowerCase() ||
            existing.name.toLowerCase() === teacher.name.toLowerCase()
        )
      )
      .map((teacher) => `${teacher.email} (${teacher.name})`);

    return duplicates;
  };

  const handleAddRow = () => {
    if (!isManualEntryDisabled) {
      append({
        name: "",
        email: "",
        role: "teacher",
        password: "",
        formId: Date.now().toString(),
      });
    }
  };

  const handleRemoveRow = (index: number) => {
    if (!isManualEntryDisabled || isEditingCSV) {
      remove(index);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6; // Minimum password length of 6 characters
  };

  const onSubmit = (data: TeacherFormData) => {
    Keyboard.dismiss();

    const validTeachers = data.teachers.filter(
      (teacher) =>
        teacher.name.trim() !== "" &&
        teacher.email.trim() !== "" &&
        teacher.password.trim() !== ""
    );
    if (validTeachers.length === 0) {
      Alert.alert("Error", "Please enter at least one teacher.");
      return;
    }

    const invalidEmails = validTeachers.filter(
      (teacher) => !validateEmail(teacher.email)
    );
    if (invalidEmails.length > 0) {
      Alert.alert("Error", "Please enter valid email addresses.");
      return;
    }

    const invalidPasswords = validTeachers.filter(
      (teacher) => !validatePassword(teacher.password)
    );
    if (invalidPasswords.length > 0) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return;
    }

    const duplicates = checkForDuplicates(validTeachers);
    if (duplicates.length > 0) {
      Alert.alert(
        "Error",
        `The following teachers already exist: ${duplicates.join(", ")}`
      );
      return;
    }

    const apiNewTeachers: TeacherCreateData[] = validTeachers.map(
      ({ name, email, password }) => ({
        name,
        email,
        password,
      })
    );

    createTeachers(
      {
        departmentId,
        teachers: apiNewTeachers,
      },
      {
        onSuccess: () => {
          Alert.alert("Success", "Teachers saved successfully!");
          reset({
            teachers: [{ name: "", email: "", role: "teacher", password: "" }],
          });
          setIsEditingCSV(false);
        },
        onError: (error: any) => {
          Alert.alert("Error", error.message || "Failed to save teachers.");
        },
      }
    );
  };

  const handleCSVSuccess = (data: Array<TeacherFormItem>) => {
    const validatedData = data.map((row) => ({
      ...row,
      email: row.email.toLowerCase(), // Normalize email to lowercase
      role: row.role || "teacher", // Default role to "teacher" if not provided
      password: row.password || "defaultPassword", // Default password if not provided
    }));
    console.log("Validated data: ", validatedData);
    reset({ teachers: validatedData });
    setShowUploadSection(false);
    setIsEditingCSV(true);
    setIsManualEntryDisabled(false);
  };

  const handleCSVError = (error: string) => {
    Alert.alert("Error", error);
    setIsManualEntryDisabled(false);
    setIsEditingCSV(false);
  };

  const csvConfig = {
    headers: ["name", "email", "role", "password"],
    requiredFields: ["name", "email", "password"],
    uniqueField: "email",
    validators: {
      email: (value: string) => validateEmail(value),
      password: (value: string) => validatePassword(value),
    },
  };

  const inputConfig = [
    {
      name: "teachers",
      field: "name",
      label: "Name",
      placeholder: "Enter teacher name",
      required: true,
    },
    {
      name: "teachers",
      field: "email",
      label: "Email",
      placeholder: "Enter teacher email",
      required: true,
    },
    {
      name: "teachers",
      field: "role",
      label: "Role",
      placeholder: "Enter role (admin/teacher/student)",
      required: true,
    },
    {
      name: "teachers",
      field: "password",
      label: "Password",
      placeholder: "Enter password (min 6 characters)",
      required: true,
    },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <FlatList
        data={[]} // Empty data array since we're using ListHeaderComponent and ListFooterComponent
        renderItem={null} // No items to render
        ListHeaderComponent={
          <>
            <ManualEntryComponent
              control={control}
              fields={fields}
              handleAddRow={handleAddRow}
              handleRemoveRow={handleRemoveRow}
              isManualEntryDisabled={isManualEntryDisabled}
              isEditingCSV={isEditingCSV}
              errors={errors}
              inputConfig={inputConfig}
              title="Manual Teacher Entry"
            />

            {showUploadSection && !isEditingCSV && !isKeyboardVisible && (
              <CsvUploaderComponent
                onCSVSuccess={handleCSVSuccess}
                onCSVError={handleCSVError}
                config={csvConfig}
                title="Upload CSV File"
              />
            )}
          </>
        }
        ListFooterComponent={<View style={styles.bottomPadding} />}
        keyExtractor={() => "static"} // Static key since there are no items
      />

      <TouchableOpacity
        style={[
          styles.saveButton,
          isKeyboardVisible && styles.keyboardVisibleButton,
        ]}
        onPress={handleSubmit(onSubmit)}
        disabled={isProcessing || isCreating}
      >
        <Text style={styles.saveButtonText}>
          {isCreating ? "Saving..." : "Save Teachers"}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  saveButton: {
    backgroundColor: "#28A745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  keyboardVisibleButton: {
    bottom: 10,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomPadding: {
    height: 60,
  },
});

export default TeacherUpload;
