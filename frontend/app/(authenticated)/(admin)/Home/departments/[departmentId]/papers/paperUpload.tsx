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
  useDepartmentPapers,
  useCreatePapers,
} from "@/src/hooks/api/useDepartments";
import { Paper } from "@/src/services/api/departmentAPI";
import CsvUploaderComponent from "@/src/components/common/CsvEntry";
import ManualEntryComponent from "@/src/components/common/ManualEntry";
import { useTheme } from "@/src/hooks/colors/useThemeColor";

// Extend Paper interface to include an internal form ID
interface PaperFormItem extends Omit<Paper, "_id"> {
  name: string;
  code: string;
  semester: number;
  formId?: string; // Internal ID for form management only
}

interface PaperFormData {
  papers: PaperFormItem[];
}

const PaperTable = () => {
  const { departmentId } = useLocalSearchParams<{ departmentId: string }>();
  const { colors } = useTheme();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaperFormData>({
    defaultValues: {
      papers: [{ name: "", code: "", semester: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "papers",
    keyName: "formId", // Use formId as the key for useFieldArray
  });

  const [showUploadSection, setShowUploadSection] = useState(true);
  const [isManualEntryDisabled, setIsManualEntryDisabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditingCSV, setIsEditingCSV] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const { data: existingPapers } = useDepartmentPapers(departmentId);
  const { mutate: createPapers, isPending: isCreating } = useCreatePapers();

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

  const checkForDuplicates = (newPapers: PaperFormItem[]): string[] => {
    if (!existingPapers) return [];

    const duplicates = newPapers
      .filter((paper) => paper.name.trim() !== "" && paper.code.trim() !== "")
      .filter((paper) =>
        existingPapers.data.some(
          (existing) =>
            existing.code.toLowerCase() === paper.code.toLowerCase() ||
            existing.name.toLowerCase() === paper.name.toLowerCase()
        )
      )
      .map((paper) => `${paper.code} (${paper.name})`);

    return duplicates;
  };

  const handleAddRow = () => {
    if (!isManualEntryDisabled) {
      append({
        name: "",
        code: "",
        semester: 1,
        formId: Date.now().toString(),
      });
    }
  };

  const handleRemoveRow = (index: number) => {
    if (!isManualEntryDisabled || isEditingCSV) {
      remove(index);
    }
  };

  const validateSemester = (value: number): boolean => {
    return value >= 1 && value <= 6;
  };

  const onSubmit = (data: PaperFormData) => {
    Keyboard.dismiss();

    const invalidSemesters = data.papers.filter(
      (paper) => !validateSemester(paper.semester)
    );
    if (invalidSemesters.length > 0) {
      Alert.alert("Error", "All semesters must be between 1 and 6.");
      return;
    }

    const validPapers = data.papers.filter(
      (paper) => paper.name.trim() !== "" && paper.code.trim() !== ""
    );
    if (validPapers.length === 0) {
      Alert.alert("Error", "Please enter at least one paper.");
      return;
    }

    const duplicates = checkForDuplicates(validPapers);
    if (duplicates.length > 0) {
      Alert.alert(
        "Error",
        `The following papers already exist: ${duplicates.join(", ")}`
      );
      return;
    }

    const apiNewPapers: Omit<Paper, "_id">[] = validPapers.map(
      ({ name, code, semester }) => ({
        name,
        code,
        semester: Number(semester),
      })
    );

    createPapers(
      {
        departmentId,
        papers: apiNewPapers,
      },
      {
        onSuccess: () => {
          Alert.alert("Success", "Papers saved successfully!");
          reset({ papers: [{ name: "", code: "", semester: 1 }] });
          setIsEditingCSV(false);
        },
        onError: (error: any) => {
          Alert.alert("Error", error.message || "Failed to save papers.");
        },
      }
    );
  };

  const handleCSVSuccess = (data: Array<PaperFormItem>) => {
    const validatedData = data.map((row) => ({
      ...row,
      semester: Math.min(Math.max(1, row.semester || 1), 6),
    }));
    reset({ papers: validatedData });
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
    headers: ["name", "code", "semester"],
    requiredFields: ["name", "code"],
    uniqueField: "code",
    validators: {
      semester: (value: string) => {
        const num = parseInt(value);
        return !isNaN(num) && num >= 1 && num <= 6;
      },
    },
  };

  const inputConfig = [
    {
      name: "papers",
      field: "name",
      label: "Name",
      placeholder: "Enter paper name",
    },
    {
      name: "papers",
      field: "code",
      label: "Code",
      placeholder: "Enter paper code",
    },
    {
      name: "papers",
      field: "semester",
      label: "Semester",
      placeholder: "Enter semester (1-6)",
    },
  ];

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: colors.secondaryBackground },
      ]}
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
              title="Manule Paper" //{<Text style={styles.title}>Manual Paper Entry</Text>}
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
          {isCreating ? "Saving..." : "Save Papers"}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  // title: {
  //   color: 'blue', // Change this to your preferred color
  //   fontSize: 18,  // Optional: Adjust the font size if needed
  //   fontWeight: 'bold', // Optional: Add styling like bold
  // },
});

export default PaperTable;
