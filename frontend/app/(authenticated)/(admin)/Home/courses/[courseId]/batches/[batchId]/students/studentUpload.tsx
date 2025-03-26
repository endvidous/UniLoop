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
import { useTheme } from "@/src/hooks/colors/useThemeColor";

// Extend Student interface to include an internal form ID and omit the role field
interface StudentFormItem extends Omit<Student, "_id" | "role"> {
  name: string;
  email: string;
  rollnumber?: string;
  password: string; // Required for creating new students
  formId?: string; // Internal ID for form management only
}

interface StudentFormData {
  students: StudentFormItem[];
}

const StudentUpload = () => {
  const { batchId } = useLocalSearchParams<{ batchId: string }>();
  const colors = useTheme();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentFormData>({
    defaultValues: {
      students: [{ name: "", email: "", rollnumber: "", password: "" }],
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

    // Check for duplicates in the newStudents array itself
    const duplicateRollNumbers = newStudents
      .filter(
        (student) => student.rollnumber && student.rollnumber.trim() !== ""
      )
      .filter(
        (student, index, self) =>
          self.findIndex((s) => s.rollnumber === student.rollnumber) !== index
      )
      .map((student) => `Roll Number: ${student.rollnumber}`);

    // Check for duplicates in the existingStudents array
    const duplicatesInExisting = newStudents
      .filter(
        (student) =>
          student.name.trim() !== "" &&
          student.email.trim() !== "" &&
          student.rollnumber?.trim() !== ""
      )
      .filter((student) =>
        existingStudents.data.some(
          (existing) =>
            existing.email.toLowerCase() === student.email.toLowerCase() ||
            existing.name.toLowerCase() === student.name.toLowerCase() ||
            existing.roll_no === student.rollnumber
        )
      )
      .map(
        (student) =>
          `${student.email} (${student.name}) - Roll Number: ${student.rollnumber}`
      );

    return [...duplicateRollNumbers, ...duplicatesInExisting];
  };

  const handleAddRow = () => {
    if (!isManualEntryDisabled) {
      append({
        name: "",
        email: "",
        rollnumber: "",
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

  const capitalizeFirstLetter = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const onSubmit = (data: StudentFormData) => {
    Keyboard.dismiss();

    const capitalizedStudents = data.students.map((student) => ({
      ...student,
      name: capitalizeFirstLetter(student.name.trim()), // Capitalize and trim the name
    }));

    const validStudents = capitalizedStudents.filter(
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
      ({ name, email, password, rollnumber }) => ({
        name,
        email,
        password,
        roll_no: rollnumber || "", // Ensure rollnumber is always a string
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
            students: [{ name: "", email: "", rollnumber: "", password: "" }],
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

    const duplicates = checkForDuplicates(validatedData);
    if (duplicates.length > 0) {
      Alert.alert(
        "Error",
        `The following duplicates were found in the CSV: ${duplicates.join(
          ", "
        )}`
      );
      return;
    }

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
    headers: ["name", "email", "rollnumber", "password"],
    requiredFields: ["name", "email", "password"],
    uniqueField: ["email", "rollnumber"],
    validators: {
      email: (value: string) => validateEmail(value),
      password: (value: string) => validatePassword(value),
      rollnumber: (value: string, data: Array<StudentFormItem>) => {
        // Check if the rollnumber is unique in the CSV data
        const count = data.filter((row) => row.rollnumber === value).length;
        return count === 1; // Return true if the rollnumber is unique
      },
    },
  };

  const inputConfig = [
    {
      name: "students",
      field: "name",
      label: "Name",
      placeholder: "Enter student name",
    },
    {
      name: "students",
      field: "email",
      label: "Email",
      placeholder: "Enter student email",
    },
    {
      name: "students",
      field: "rollnumber",
      label: "Roll No",
      placeholder: "Enter roll number",
    },
    {
      name: "students",
      field: "password",
      label: "Password",
      placeholder: "Enter password (min 6 characters)",
    },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, {backgroundColor: colors.colors.secondaryBackground}]}
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
