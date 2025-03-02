import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import CSVCleaner from "@/src/components/common/CsvDataCleaner";
import { pickCSVDocument } from "@/src/utils/csvPicker";
import {
  useDepartmentPapers,
  useCreatePapers,
} from "@/src/hooks/api/useDepartments";
import { Paper } from "@/src/services/api/departmentAPI";

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

const PaperTable = ({ departmentId }: { departmentId: string }) => {
  // Setup React Hook Form
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

  // Use fieldArray for dynamic form fields
  const { fields, append, remove } = useFieldArray({
    control,
    name: "papers",
    keyName: "formId", // Use formId as the key for useFieldArray
  });

  const [showUploadSection, setShowUploadSection] = useState(true);
  const [csvFile, setCsvFile] = useState<{
    uri: string;
    name: string;
    size?: number;
    type?: string;
  } | null>(null);
  const [isManualEntryDisabled, setIsManualEntryDisabled] = useState(false);
  const [showCSVCleaner, setShowCSVCleaner] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditingCSV, setIsEditingCSV] = useState(false);

  // Fetch papers from the backend (only for duplicate checking)
  const { data: existingPapers } = useDepartmentPapers(departmentId);
  const { mutate: createPapers, isPending: isCreating } = useCreatePapers();

  const checkForDuplicates = (newPapers: PaperFormItem[]): string[] => {
    if (!existingPapers) return [];

    const duplicates = newPapers
      .filter((paper) => paper.name.trim() !== "" && paper.code.trim() !== "")
      .filter((paper) =>
        existingPapers.some(
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
      append({ name: "", code: "", semester: 1 });
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
    // Validate all semesters are within range
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

    // Create new papers - map to the API format
    const apiNewPapers: Omit<Paper, "_id">[] = validPapers.map((item) => ({
      name: item.name,
      code: item.code,
      semester: Number(item.semester),
    }));

    createPapers(
      {
        departmentId,
        papers: apiNewPapers,
      },
      {
        onSuccess: () => {
          Alert.alert("Success", "Papers saved successfully!");
          reset({ papers: [{ name: "", code: "", semester: 1 }] }); // Reset form after successful upload
          setIsEditingCSV(false);
        },
        onError: (error: any) => {
          Alert.alert("Error", error.message || "Failed to save papers.");
        },
      }
    );
  };

  const validateCSVFile = (file: any) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      throw new Error("Selected file is not a CSV file");
    }
    if (file.size && file.size > 5000000) {
      throw new Error("CSV file too large (max 5MB)");
    }
    return true;
  };

  const handleCSVUpload = async () => {
    try {
      setIsProcessing(true);

      const file = await pickCSVDocument();
      if (!file) {
        setIsProcessing(false);
        return;
      }

      validateCSVFile(file);
      setCsvFile(file);
      setIsManualEntryDisabled(true);
      setShowCSVCleaner(true);
    } catch (error: any) {
      console.error("Error uploading CSV:", error);
      Alert.alert("Error", error.message || "Failed to upload CSV file.");
      setIsManualEntryDisabled(false);
      setCsvFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const parseCSVManually = async (fileUri: string) => {
    try {
      const response = await fetch(fileUri);
      const text = await response.text();

      const rows = text.split("\n");
      if (rows.length < 2) {
        throw new Error(
          "CSV file must contain at least a header row and one data row"
        );
      }

      const headers = rows[0].split(",").map((h) => h.trim().toLowerCase());
      const nameIndex = headers.indexOf("name");
      const codeIndex = headers.indexOf("code");
      const semesterIndex = headers.indexOf("semester");

      if (nameIndex === -1 || codeIndex === -1) {
        throw new Error("CSV file must contain 'name' and 'code' columns");
      }

      const parsedData = [];
      for (let i = 1; i < rows.length; i++) {
        if (!rows[i].trim()) continue;

        const values = rows[i].split(",");
        const paperName = values[nameIndex]?.trim();
        const paperCode = values[codeIndex]?.trim();
        let paperSemester =
          semesterIndex !== -1
            ? parseInt(values[semesterIndex]?.trim() || "1")
            : 1;

        // Ensure semester is within range 1-6
        if (isNaN(paperSemester) || paperSemester < 1 || paperSemester > 6) {
          paperSemester = 1; // Default to 1 if invalid
        }

        if (paperName && paperCode) {
          parsedData.push({
            name: paperName,
            code: paperCode,
            semester: paperSemester,
          });
        }
      }

      if (parsedData.length === 0) {
        throw new Error("No valid paper data found in CSV");
      }

      return parsedData;
    } catch (error) {
      throw error;
    }
  };

  const handleCSVSuccess = (data: Array<PaperFormItem>) => {
    // Ensure all semester values are within range 1-6
    const validatedData = data.map((row) => ({
      ...row,
      semester: Math.min(Math.max(1, row.semester || 1), 6), // Clamp between 1-6
    }));
    console.log(validatedData);
    // Update form with CSV data - we don't submit automatically but let user preview and edit
    reset({ papers: validatedData });
    setShowUploadSection(false);
    setShowCSVCleaner(false);
    setIsEditingCSV(true);
    setIsManualEntryDisabled(false); // Enable editing for CSV data
  };

  const handleCSVError = async (error: string) => {
    console.error("CSV Processing Error:", error);

    try {
      if (csvFile?.uri) {
        setIsProcessing(true);

        const parsedData = await parseCSVManually(csvFile.uri);
        handleCSVSuccess(parsedData);
      } else {
        throw new Error("No CSV file available");
      }
    } catch (fallbackError: any) {
      console.error("Fallback parsing failed:", fallbackError);
      Alert.alert(
        "Error",
        "CSV parsing failed. Please check your file format and try again."
      );
      setIsManualEntryDisabled(false);
      setCsvFile(null);
      setIsEditingCSV(false);
    } finally {
      setShowCSVCleaner(false);
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      {showCSVCleaner && csvFile && (
        <CSVCleaner
          filePath={csvFile.uri}
          config={{
            headers: ["name", "code", "semester"],
            requiredFields: ["name", "code"],
            uniqueField: "code",
            validators: {
              semester: (value) => {
                const num = parseInt(value);
                return !isNaN(num) && num >= 1 && num <= 6;
              },
            },
          }}
          onSuccess={handleCSVSuccess}
          onError={handleCSVError}
        />
      )}

      {isProcessing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Processing CSV file...</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.title}>
          {isEditingCSV ? "Edit CSV Papers" : "Manual Paper Entry"}
        </Text>
        <View style={styles.tableHeader}>
          <Text style={styles.headerText}>Paper Details</Text>
          <TouchableOpacity
            onPress={handleAddRow}
            style={[styles.addButton, isManualEntryDisabled && styles.disabled]}
            disabled={isManualEntryDisabled}
          >
            <Ionicons name="add-circle-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={fields}
          keyExtractor={(item) => item.formId || Math.random().toString()}
          renderItem={({ index }) => (
            <View style={styles.paperCard}>
              <View style={styles.rowHeader}>
                <Text style={styles.paperIndexText}>Paper {index + 1}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveRow(index)}
                  style={[
                    styles.deleteButton,
                    isManualEntryDisabled && !isEditingCSV && styles.disabled,
                  ]}
                  disabled={isManualEntryDisabled && !isEditingCSV}
                >
                  <Ionicons name="trash-outline" size={24} color="black" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Name:</Text>
                <Controller
                  control={control}
                  name={`papers.${index}.name`}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.input,
                        isManualEntryDisabled &&
                          !isEditingCSV &&
                          styles.disabledInput,
                      ]}
                      placeholder="Enter paper name"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      editable={!isManualEntryDisabled || isEditingCSV}
                    />
                  )}
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Code:</Text>
                <Controller
                  control={control}
                  name={`papers.${index}.code`}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.input,
                        isManualEntryDisabled &&
                          !isEditingCSV &&
                          styles.disabledInput,
                      ]}
                      placeholder="Enter paper code"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      editable={!isManualEntryDisabled || isEditingCSV}
                    />
                  )}
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Semester:</Text>
                <Controller
                  control={control}
                  name={`papers.${index}.semester`}
                  rules={{
                    validate: (value) =>
                      validateSemester(value) ||
                      "Semester must be between 1 and 6",
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <>
                      <TextInput
                        style={[
                          styles.input,
                          isManualEntryDisabled &&
                            !isEditingCSV &&
                            styles.disabledInput,
                        ]}
                        placeholder="Enter semester (1-6)"
                        value={value.toString()}
                        onChangeText={(text) => {
                          const num = parseInt(text);
                          if (isNaN(num)) {
                            onChange(1); // Default to 1 if not a number
                          } else {
                            // Clamp value between 1-6
                            onChange(Math.min(Math.max(1, num), 6));
                          }
                        }}
                        onBlur={onBlur}
                        keyboardType="numeric"
                        editable={!isManualEntryDisabled || isEditingCSV}
                      />
                    </>
                  )}
                />
              </View>
              {errors.papers?.[index]?.semester && (
                <Text style={styles.errorText}>
                  Semester must be between 1 and 6
                </Text>
              )}
            </View>
          )}
        />
      </View>

      {showUploadSection && !isEditingCSV && (
        <View style={styles.section}>
          <Text style={styles.title}>Upload CSV File</Text>
          <Text style={styles.instruction}>
            CSV must have "name", "code", and "semester" columns (semester must
            be 1-6)
          </Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleCSVUpload}
            disabled={isProcessing}
          >
            <Text style={styles.uploadButtonText}>
              {isProcessing ? "Processing..." : "Pick CSV File"}
            </Text>
          </TouchableOpacity>

          {csvFile && (
            <View style={styles.fileContainer}>
              <Ionicons name="document" size={24} color="#007BFF" />
              <Text style={styles.fileName}>{csvFile.name}</Text>
            </View>
          )}
        </View>
      )}

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSubmit(onSubmit)}
        disabled={isProcessing || isCreating}
      >
        <Text style={styles.saveButtonText}>
          {isCreating ? "Saving..." : "Save Papers"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
    justifyContent: "space-between",
  },
  section: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  instruction: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
    fontStyle: "italic",
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  paperCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
    marginBottom: 8,
  },
  paperIndexText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007BFF",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  inputLabel: {
    width: 80,
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
  },
  disabledInput: {
    backgroundColor: "#f0f0f0",
    color: "#a0a0a0",
  },
  addButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
  },
  disabled: {
    opacity: 0.5,
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
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  uploadButton: {
    padding: 8,
    borderWidth: 2,
    borderColor: "black",
    backgroundColor: "white",
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },
  uploadButtonText: {
    color: "black",
    fontSize: 14,
    fontWeight: "bold",
  },
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  fileName: {
    marginLeft: 10,
    fontSize: 16,
    color: "#007BFF",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#007BFF",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: -4,
    marginBottom: 8,
    marginLeft: 80, // Align with input field
  },
});

export default PaperTable;
