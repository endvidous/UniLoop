import React from "react";
import Papa from "papaparse";
import * as FileSystem from "expo-file-system";

// Types for the configuration
type CSVConfig = {
  headers: string[]; // Expected headers in the CSV
  requiredFields: string[]; // Fields that must be present
  uniqueField?: string; // Field to check for duplicates (e.g., email or ID)
  validators?: {
    [key: string]: (value: string) => boolean; // Validation functions for specific fields
  };
  transformers?: {
    [key: string]: (value: string) => any; // Functions to transform specific fields
  };
};

// Props for the CSV cleaner component
type CSVCleanerProps = {
  filePath: string; // URI of the CSV file
  config: CSVConfig; // Configuration for cleaning the CSV
  onSuccess: (data: any[]) => void; // Callback for successful cleaning
  onError: (error: string) => void; // Callback for errors
};

const CSVCleaner: React.FC<CSVCleanerProps> = ({
  filePath,
  config,
  onSuccess,
  onError,
}) => {
  const { headers, requiredFields, uniqueField, validators, transformers } =
    config;

  const parseCSVManually = async (csvString: string): Promise<any[]> => {
    try {
      const rows = csvString.split("\n");
      if (rows.length < 2) {
        throw new Error(
          "CSV file must contain at least a header row and one data row"
        );
      }

      // Parse headers and validate
      const fileHeaders = rows[0].split(",").map((h) => h.trim().toLowerCase());
      const missingHeaders = headers.filter(
        (h) => !fileHeaders.includes(h.toLowerCase())
      );

      if (missingHeaders.length > 0) {
        throw new Error(
          `Missing required headers: ${missingHeaders.join(", ")}`
        );
      }

      // Create a mapping of required fields to their column indices
      const headerIndices = headers.reduce((acc, header) => {
        acc[header] = fileHeaders.indexOf(header.toLowerCase());
        return acc;
      }, {} as { [key: string]: number });

      // Parse data rows
      const parsedData = [];
      for (let i = 1; i < rows.length; i++) {
        if (!rows[i].trim()) continue;

        const values = rows[i].split(",").map((v) => v.trim());
        const row: { [key: string]: any } = {};

        // Map values to their corresponding headers
        headers.forEach((header) => {
          row[header] = values[headerIndices[header]] || "";
        });

        parsedData.push(row);
      }

      return parsedData;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Manual CSV parsing failed: ${error.message}`);
      } else {
        throw new Error("Manual CSV parsing failed: Unknown error");
      }
    }
  };

  const readCSV = async () => {
    try {
      // Read the CSV file using expo-file-system
      const csvString = await FileSystem.readAsStringAsync(filePath, {
        encoding: "utf8",
      });

      let parsedData;

      // Try Papa Parse first
      try {
        const result = Papa.parse(csvString, {
          header: true,
          skipEmptyLines: true,
        });

        if (result.errors.length > 0) {
          throw new Error("Papa Parse failed");
        }

        parsedData = result.data;
      } catch (papaError) {
        // Fallback to manual parsing if Papa Parse fails
        console.log("Papa Parse failed, attempting manual parse...");
        parsedData = await parseCSVManually(csvString);
      }

      // Validate and clean the parsed data
      const cleanedData = cleanData(parsedData);

      if (cleanedData.length === 0) {
        onError("No valid data found in CSV file after cleaning");
        return;
      }

      onSuccess(cleanedData);
    } catch (error) {
      if (error instanceof Error) {
        onError(error.message || "Failed to process CSV file");
      } else {
        onError("Failed to process CSV file");
      }
      console.error("Error processing CSV file:", error);
    }
  };

  const cleanData = (data: any[]): any[] => {
    const cleanedData: any[] = [];
    const seenValues = new Set();

    data.forEach((row) => {
      // Check for missing required fields
      const isMissingRequiredFields = requiredFields.some(
        (field) => !row[field]
      );
      if (isMissingRequiredFields) {
        return;
      }

      // Validate fields
      if (validators) {
        const hasInvalidFields = Object.keys(validators).some(
          (key) => !validators[key](row[key])
        );
        if (hasInvalidFields) {
          return;
        }
      }

      // Check for duplicates
      if (uniqueField && seenValues.has(row[uniqueField])) {
        return;
      }
      if (uniqueField) {
        seenValues.add(row[uniqueField]);
      }

      // Transform fields
      const transformedRow = { ...row };
      if (transformers) {
        Object.keys(transformers).forEach((key) => {
          transformedRow[key] = transformers[key](row[key]);
        });
      }

      cleanedData.push(transformedRow);
    });

    return cleanedData;
  };

  React.useEffect(() => {
    readCSV();
  }, [filePath]);

  return null; // This component doesn't render anything
};

export default CSVCleaner;
