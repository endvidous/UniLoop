import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import { useForm, useFieldArray } from "react-hook-form";
import { useCourses, useCreateCourses } from "@/src/hooks/api/useCourses";
import CsvUploaderComponent from "@/src/components/common/CsvEntry";
import ManualEntryComponent from "@/src/components/common/ManualEntry";

interface CourseFormItem {
  name: string;
  code: string;
  type: string;
  formId?: string; // Internal ID for form management only
}

interface CourseFormData {
  courses: CourseFormItem[];
}

const CourseTable = () => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CourseFormData>({
    defaultValues: {
      courses: [{ name: "", code: "", type: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "courses",
    keyName: "formId", // Use formId as the key for useFieldArray
  });

  const [showUploadSection, setShowUploadSection] = useState(true);
  const [isManualEntryDisabled, setIsManualEntryDisabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditingCSV, setIsEditingCSV] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const { data: existingCourses } = useCourses();
  const { mutate: createCourses, isPending: isCreating } = useCreateCourses();

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
  }, [Keyboard]);

  const checkForDuplicates = (newCourses: CourseFormItem[]): string[] => {
    if (!existingCourses) return [];

    const duplicates = newCourses
      .filter(
        (course) => course.name.trim() !== "" && course.code.trim() !== ""
      )
      .filter((course) =>
        existingCourses.data.some(
          (existing) =>
            existing.code.toLowerCase() === course.code.toLowerCase() ||
            existing.name.toLowerCase() === course.name.toLowerCase()
        )
      )
      .map((course) => `${course.code} (${course.name})`);

    return duplicates;
  };

  const handleAddRow = () => {
    if (!isManualEntryDisabled) {
      append({
        name: "",
        code: "",
        type: "",
        formId: Date.now().toString(),
      });
    }
  };

  const handleRemoveRow = (index: number) => {
    if (!isManualEntryDisabled || isEditingCSV) {
      remove(index);
    }
  };

  const onSubmit = (data: CourseFormData) => {
    Keyboard.dismiss();

    const validCourses = data.courses.filter(
      (course) =>
        course.name.trim() !== "" &&
        course.code.trim() !== "" &&
        course.type.trim() !== ""
    );

    if (validCourses.length === 0) {
      Alert.alert("Error", "Please enter at least one course.");
      return;
    }

    const duplicates = checkForDuplicates(validCourses);
    if (duplicates.length > 0) {
      Alert.alert(
        "Error",
        `The following courses already exist: ${duplicates.join(", ")}`
      );
      return;
    }

    createCourses(
      validCourses.map(({ name, code, type }) => ({ name, code, type })),
      {
        onSuccess: () => {
          Alert.alert("Success", "Courses saved successfully!");
          reset({ courses: [{ name: "", code: "", type: "" }] });
          setIsEditingCSV(false);
        },
        onError: (error: any) => {
          Alert.alert("Error", error.message || "Failed to save courses.");
        },
      }
    );
  };

  const handleCSVSuccess = (data: Array<CourseFormItem>) => {
    reset({ courses: data });
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
    headers: ["name", "code", "type"],
    requiredFields: ["name", "code", "type"],
    uniqueField: "code",
  };

  const inputConfig = [
    {
      name: "courses",
      field: "name",
      label: "Name",
      placeholder: "Enter course name",
    },
    {
      name: "courses",
      field: "code",
      label: "Code",
      placeholder: "Enter course code",
    },
    {
      name: "courses",
      field: "type",
      label: "Type",
      placeholder: "Enter course type",
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
              title="Manual Course Entry"
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
          {isCreating ? "Saving..." : "Save Courses"}
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

export default CourseTable;
