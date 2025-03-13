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
import { useBatchStudents, useCreateStudents } from "@/src/hooks/api/useUser";
import { Student, StudentCreateData } from "@/src/services/api/userAPI";
import CsvUploaderComponent from "@/src/components/common/CsvEntry";
import ManualEntryComponent from "@/src/components/common/ManualEntry";

// Extend Student interface to include an internal form ID and omit the role field
interface StudentFormItem extends Omit<Student, "_id" | "role"> {
  name: string;
  email: string;
  roll_no?: string;
  password: string; // Required for creating new students
  formId?: string; // Internal ID for form management only
}

interface StudentFormData {
  students: StudentFormItem[];
}

const StudentUpload = () => {
  const { batchId } = useLocalSearchParams<{ batchId: string }>();

  console.log("Batch Id: ", batchId);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentFormData>({
    defaultValues: {
      students: [{ name: "", email: "", roll_no: "", password: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "students",
    keyName: "formId", // Use formId as the key for useFieldArray
  });

  const [showUploadSection, setShowUploadSection] = useState(true);
  const [isManualEntryDisabled, setIsManualEntryDisabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditingCSV, setIsEditingCSV] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const { data: existingStudents } = useBatchStudents(batchId);
  const { mutate: createStudents, isPending: isCreating } = useCreateStudents();

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

  const checkForDuplicates = (newStudents: StudentFormItem[]): string[] => {
    if (!existingStudents) return [];

    const duplicates = newStudents
      .filter(
        (student) => student.name.trim() !== "" && student.email.trim() !== ""
      )
      .filter((student) =>
        existingStudents.data.some(
          (existing) =>
            existing.email.toLowerCase() === student.email.toLowerCase() ||
            existing.name.toLowerCase() === student.name.toLowerCase()
        )
      )
      .map((student) => `${student.email} (${student.name})`);

    return duplicates;
  };

  const handleAddRow = () => {
    if (!isManualEntryDisabled) {
      append({
        name: "",
        email: "",
        roll_no: "",
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

  const onSubmit = (data: StudentFormData) => {
    Keyboard.dismiss();

    const validStudents = data.students.filter(
      (student) =>
        student.name.trim() !== "" &&
        student.email.trim() !== "" &&
        student.password.trim() !== ""
    );
    if (validStudents.length === 0) {
      Alert.alert("Error", "Please enter at least one student.");
      return;
    }

    const invalidEmails = validStudents.filter(
      (student) => !validateEmail(student.email)
    );
    if (invalidEmails.length > 0) {
      Alert.alert("Error", "Please enter valid email addresses.");
      return;
    }

    const invalidPasswords = validStudents.filter(
      (student) => !validatePassword(student.password)
    );
    if (invalidPasswords.length > 0) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return;
    }

    const duplicates = checkForDuplicates(validStudents);
    if (duplicates.length > 0) {
      Alert.alert(
        "Error",
        `The following students already exist: ${duplicates.join(", ")}`
      );
      return;
    }

    const apiNewStudents: StudentCreateData[] = validStudents.map(
      ({ name, email, password, roll_no }) => ({
        name,
        email,
        password,
        roll_no: roll_no || "", // Ensure roll_no is always a string
      })
    );

    createStudents(
      {
        batchId,
        students: apiNewStudents,
      },
      {
        onSuccess: () => {
          Alert.alert("Success", "Students saved successfully!");
          reset({
            students: [{ name: "", email: "", roll_no: "", password: "" }],
          });
          setIsEditingCSV(false);
        },
        onError: (error: any) => {
          Alert.alert("Error", error.message || "Failed to save students.");
        },
      }
    );
  };

  const handleCSVSuccess = (data: Array<StudentFormItem>) => {
    const validatedData = data.map((row) => ({
      ...row,
      email: row.email.toLowerCase(), // Normalize email to lowercase
      password: row.password || "defaultPassword", // Default password if not provided
    }));
    console.log("Validated data: ", validatedData);
    reset({ students: validatedData });
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
    headers: ["name", "email", "roll_no", "password"],
    requiredFields: ["name", "email", "password"],
    uniqueField: "email",
    validators: {
      email: (value: string) => validateEmail(value),
      password: (value: string) => validatePassword(value),
    },
  };

  const inputConfig = [
    {
      name: "students",
      field: "name",
      label: "Name",
      placeholder: "Enter student name",
      required: true,
    },
    {
      name: "students",
      field: "email",
      label: "Email",
      placeholder: "Enter student email",
      required: true,
    },
    {
      name: "students",
      field: "roll_no",
      label: "Roll No",
      placeholder: "Enter roll number",
      required: false,
    },
    {
      name: "students",
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
              title="Manual Student Entry"
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
          {isCreating ? "Saving..." : "Save Students"}
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

export default StudentUpload;
