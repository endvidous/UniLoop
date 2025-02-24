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
import CSVCleaner from "@/src/utils/csvdatacleaner";
import { pickCSVDocument } from "@/src/utils/csvPicker";
import {
  useDepartments,
  useCreateDepartments,
  useUpdateDepartment,
  useDeleteDepartment,
} from "@/src/hooks/api/useDepartments";

const DepartmentTable = () => {
  const [departments, setDepartments] = useState([{ id: 1, name: "" }]);
  const [showUploadSection, setShowUploadSection] = useState(true);
  const [csvFile, setCsvFile] = useState<{
    uri: string;
    name: string;
    size?: number;
    type?: string;
  } | null>(null);

  interface Department {
    name: string;
  }
  
  const [isManualEntryDisabled, setIsManualEntryDisabled] = useState(false);
  const [showCSVCleaner, setShowCSVCleaner] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch departments from the backend
  const { data: existingDepartments, isPending: isFetching } = useDepartments();
  const { mutate: createDepartments, isPending: isCreating } =
    useCreateDepartments();

  const checkForDuplicates = (newDepartments: Department[]): string[] => {
    if (!existingDepartments) return [];

    const duplicates = newDepartments
      .filter((dept) => dept.name.trim() !== "")
      .filter((dept) =>
        existingDepartments.some(
          (existing) => existing.name.toLowerCase() === dept.name.toLowerCase()
        )
      )
      .map((dept) => dept.name);

    return duplicates;
  };
  
  const handleAddRow = () => {
    if (!isManualEntryDisabled) {
      setDepartments([...departments, { id: Date.now(), name: "" }]);
    }
  };

  const handleRemoveRow = (id: number) => {
    if (!isManualEntryDisabled) {
      setDepartments(departments.filter((dept) => dept.id !== id));
    }
  };

  const handleInputChange = (id: number, text: string) => {
    if (!isManualEntryDisabled) {
      setDepartments(
        departments.map((dept) =>
          dept.id === id ? { ...dept, name: text } : dept
        )
      );
    }
  };

  const handleSave = () => {
    const validDepartments = departments.filter(
      (dept) => dept.name.trim() !== ""
    );
    if (validDepartments.length === 0) {
      Alert.alert("Error", "Please enter at least one department.");
      return;
    }

    // Call the mutation to create departments
    createDepartments(validDepartments, {
      onSuccess: () => {
        Alert.alert("Success", "Departments saved successfully!");
        setDepartments([{ id: 1, name: "" }]); // Reset form
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

    setDepartments(newDepartments);
    setShowUploadSection(false);
    setShowCSVCleaner(false);

    // Save the parsed departments to the backend
    createDepartments(newDepartments, {
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
        <Text style={styles.title}>Manual Department Entry</Text>
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
          data={departments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <TextInput
                style={[
                  styles.input,
                  isManualEntryDisabled && styles.disabledInput,
                ]}
                placeholder="Enter department name"
                value={item.name}
                onChangeText={(text) => handleInputChange(item.id, text)}
                editable={!isManualEntryDisabled}
              />
              <TouchableOpacity
                onPress={() => handleRemoveRow(item.id)}
                style={[
                  styles.deleteButton,
                  isManualEntryDisabled && styles.disabled,
                ]}
                disabled={isManualEntryDisabled}
              >
                <Ionicons name="trash-outline" size={24} color="black" />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

      {showUploadSection && (
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
        onPress={handleSave}
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
