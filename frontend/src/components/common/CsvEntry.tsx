import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { pickCSVDocument } from "@/src/utils/csvPicker";
import CSVCleaner from "@/src/components/common/csvdatacleaner";

// Match your original config structure
export interface CSVConfig {
  requiredFields: string[];
  headers: string[];
  entityName?: string; // Make this optional to maintain backwards compatibility
}

interface CsvUploaderProps {
  onCSVSuccess: (data: any[]) => void;
  onCSVError: (error: string) => void;
  config: CSVConfig;
  title?: string; // Optional title override
}

const CsvUploaderComponent: React.FC<CsvUploaderProps> = ({
  onCSVSuccess,
  onCSVError,
  config,
  title,
}) => {
  interface CsvFile {
    uri?: string;
    name: string;
    size?: number;
    type?: string;
  }

  const [csvFile, setCsvFile] = useState<CsvFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCSVCleaner, setShowCSVCleaner] = useState(false);

  const validateCSVFile = (file: {
    uri?: string;
    name: string;
    size?: number;
    type?: string;
  }) => {
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
      setShowCSVCleaner(true);
    } catch (error) {
      console.error("Error uploading CSV:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload CSV file.";
      Alert.alert("Error", errorMessage);
      onCSVError(errorMessage);
      setCsvFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Display title based on entityName in config or the provided title
  const displayTitle =
    title ||
    (config.entityName
      ? `Upload ${config.entityName} CSV File`
      : "Upload CSV File");

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{displayTitle}</Text>
      <Text style={styles.instruction}>
        CSV must have the following columns: {config.requiredFields.join(", ")}
        {config.headers.length > 0 &&
          ` and headers: ${config.headers.join(", ")}`}
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

      {showCSVCleaner && csvFile && csvFile.uri && (
        <CSVCleaner
          filePath={csvFile.uri}
          config={config}
          onSuccess={onCSVSuccess}
          onError={onCSVError}
        />
      )}

      {isProcessing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Processing CSV file...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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

export default CsvUploaderComponent;
