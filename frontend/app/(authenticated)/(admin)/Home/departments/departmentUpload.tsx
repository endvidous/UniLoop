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
import CSVCleaner from "@/src/components/common/csvdatacleaner";
import { pickCSVDocument } from "@/src/utils/csvPicker";
import {
  useDepartments,
  useCreateDepartments,
  useUpdateDepartment,
  useDeleteDepartment,
} from "@/src/hooks/api/useDepartments";

interface DepartmentFormData {
  departments: {
    id: number;
    name: string;
  }[];
}

const DepartmentTable = () => {
  // Setup React Hook Form
  const { control, handleSubmit, reset, setValue, getValues } =
    useForm<DepartmentFormData>({
      defaultValues: {
        departments: [{ id: Date.now(), name: "" }],
      },
    });

  // Use fieldArray for dynamic form fields
  const { fields, remove } = useFieldArray({
    control,
    name: "departments",
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

  // Fetch departments from the backend
  const { data: existingDepartments, isFetching } = useDepartments();
  const { mutate: createDepartments, isPending: isCreating } =
    useCreateDepartments();

  const checkForDuplicates = (newDepartments: { name: string }[]): string[] => {
    if (!existingDepartments) return [];

    const duplicates = newDepartments
      .filter((dept) => dept.name.trim() !== "")
      .filter((dept) =>
        existingDepartments.data.some(
          (existing) => existing.name.toLowerCase() === dept.name.toLowerCase()
        )
      )
      .map((dept) => dept.name);

    return duplicates;
  };

  const handleAddRow = () => {
    if (!isManualEntryDisabled) {
      prepend({ id: Date.now(), name: "" });
    }
  };

  const handleRemoveRow = (index: number) => {
    if (!isManualEntryDisabled || isEditingCSV) {
      remove(index);
    }
  };

  const onSubmit = (data: DepartmentFormData) => {
    const validDepartments = data.departments.filter(
      (dept) => dept.name.trim() !== ""
    );

    if (validDepartments.length === 0) {
      Alert.alert("Error", "Please enter at least one department.");
      return;
    }

    const duplicates = checkForDuplicates(validDepartments);
    if (duplicates.length > 0) {
      Alert.alert(
        "Error",
        `The following departments already exist: ${duplicates.join(", ")}`
      );
      return;
    }

    const backendData = validDepartments.map((item) => ({
      name: item.name,
    }));

    // Call the mutation to create departments
    createDepartments(backendData, {
      onSuccess: () => {
        Alert.alert("Success", "Departments saved successfully!");
        reset({ departments: [{ id: Date.now(), name: "" }] }); // Reset form
        setIsEditingCSV(false);
      },
      onError: (error: { message: any }) => {
        Alert.alert("Error", error.message || "Failed to save departments.");
      },
    });
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

      if (nameIndex === -1) {
        throw new Error("CSV file must contain a 'name' column");
      }

      const parsedData = [];
      for (let i = 1; i < rows.length; i++) {
        if (!rows[i].trim()) continue;

        const values = rows[i].split(",");
        const deptName = values[nameIndex]?.trim();

        if (deptName) {
          parsedData.push({ name: deptName });
        }
      }

      if (parsedData.length === 0) {
        throw new Error("No valid department names found in CSV");
      }

      return parsedData;
    } catch (error) {
      throw error;
    }
  };

  const handleCSVSuccess = (data: Array<{ name: string }>) => {
    const newDepartments = data.map((row, index) => ({
      id: Date.now() + index,
      name: row.name,
    }));

    // Update form with CSV data
    reset({ departments: newDepartments });
    setShowUploadSection(false);
    setShowCSVCleaner(false);
    setIsEditingCSV(true);
    setIsManualEntryDisabled(false); // Enable editing for CSV data

    // Save the parsed departments to the backend
    createDepartments(data, {
      onSuccess: () => {
        Alert.alert("Success", "Departments uploaded and saved successfully!");
      },
      onError: (error: { message: any }) => {
        Alert.alert("Error", error.message || "Failed to save departments.");
      },
    });
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
            headers: ["name"],
            requiredFields: ["name"],
            uniqueField: "name",
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
          {isEditingCSV ? "Edit CSV Departments" : "Manual Department Entry"}
        </Text>
        <View style={styles.tableHeader}>
          <Text style={styles.headerText}>Department Name</Text>
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
          keyExtractor={(item: { id: number }) => item.id.toString()}
          renderItem={({ index }) => (
            <View style={styles.row}>
              <Controller
                control={control}
                name={`departments.${index}.name`}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      isManualEntryDisabled &&
                        !isEditingCSV &&
                        styles.disabledInput,
                    ]}
                    placeholder="Enter department name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    editable={!isManualEntryDisabled || isEditingCSV}
                  />
                )}
              />
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
          )}
        />
      </View>

      {showUploadSection && !isEditingCSV && (
        <View style={styles.section}>
          <Text style={styles.title}>Upload CSV File</Text>
          <Text style={styles.instruction}>
            CSV must have a "name" column for department names
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
          {isCreating ? "Saving..." : "Save Departments"}
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 10,
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
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
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
});

export default DepartmentTable;
function prepend(arg0: { id: number; name: string }) {
  throw new Error("Function not implemented.");
}
