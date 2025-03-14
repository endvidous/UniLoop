import React from "react";
import Papa from "papaparse";
import * as FileSystem from "expo-file-system";

type CSVConfig = {
  headers: string[];
  requiredFields: string[];
  uniqueField?: string;
  validators?: {
    [key: string]: (value: string) => boolean;
  };
  transformers?: {
    [key: string]: (value: string) => any;
  };
};

type CSVCleanerProps = {
  filePath: string;
  config: CSVConfig;
  onSuccess: (data: any[]) => void;
  onError: (error: string) => void;
};

const sanitizeHeader = (header: string): string => {
  // Remove non-alphanumeric characters and convert to lowercase
  return (
    header
      // .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase()
      .trim()
  );
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

      // Sanitize headers and trim
      const fileHeaders = rows[0].split(",").map((h) => sanitizeHeader(h));
      const sanitizedConfigHeaders = headers.map((h) => sanitizeHeader(h));

      console.log("Sanitized File Headers:", fileHeaders);
      console.log("Sanitized Expected Headers:", sanitizedConfigHeaders);

      const missingHeaders = sanitizedConfigHeaders.filter(
        (h) => !fileHeaders.includes(h)
      );

      if (missingHeaders.length > 0) {
        throw new Error(
          `Missing required headers: ${missingHeaders.join(", ")}`
        );
      }

      // Create a mapping of required fields to their column indices
      const headerIndices = sanitizedConfigHeaders.reduce((acc, header) => {
        acc[header] = fileHeaders.indexOf(header);
        return acc;
      }, {} as { [key: string]: number });

      // Parse data rows
      const parsedData = [];
      for (let i = 1; i < rows.length; i++) {
        if (!rows[i].trim()) continue;

        const values = rows[i].split(",").map((v) => v.trim());
        const row: { [key: string]: any } = {};

        // Map values to their corresponding headers
        sanitizedConfigHeaders.forEach((header, index) => {
          const originalHeader = headers[index];
          row[originalHeader] = values[headerIndices[header]] || "";
        });

        parsedData.push(row);
      }

      return parsedData;
    } catch (error) {
      console.error("Manual Parsing Error:", error);
      if (error instanceof Error) {
        throw new Error(`Manual CSV parsing failed: ${error.message}`);
      } else {
        throw new Error("Manual CSV parsing failed: Unknown error");
      }
    }
  };

  const readCSV = async () => {
    try {
      // Read file with UTF-8 encoding and handle potential BOM
      const csvString = await FileSystem.readAsStringAsync(filePath, {
        encoding: FileSystem.EncodingType.UTF8,
      }).then((content) =>
        // Remove BOM (Byte Order Mark) if present
        content.startsWith("\ufeff") ? content.slice(1) : content
      );

      console.log("Raw CSV String:", csvString);

      let parsedData;

      try {
        const result = Papa.parse(csvString, {
          header: true,
          skipEmptyLines: true,
          transformHeader: sanitizeHeader, // Sanitize headers during parsing
        });

        console.log("Papa Parse Result:", result);

        if (result.errors.length > 0) {
          console.error("Papa Parse Errors:", result.errors);
          throw new Error("Papa Parse failed");
        }

        parsedData = result.data;
        console.log("Papa Parsed Data:", parsedData);
      } catch (papaError) {
        console.log("Papa Parse failed, attempting manual parse...");
        parsedData = await parseCSVManually(csvString);
      }

      const cleanedData = cleanData(parsedData);
      console.log("Cleaned Data:", cleanedData);

      if (cleanedData.length === 0) {
        onError("No valid data found in CSV file after cleaning");
        return;
      }

      onSuccess(cleanedData);
    } catch (error) {
      console.error("Full Error:", error);
      if (error instanceof Error) {
        onError(error.message || "Failed to process CSV file");
      } else {
        onError("Failed to process CSV file");
      }
    }
  };

  const cleanData = (data: any[]): any[] => {
    console.log("Original Data before cleaning:", data);
    const cleanedData: any[] = [];
    const seenValues = new Set();

    data.forEach((row, index) => {
      console.log(`Processing Row ${index}:`, row);

      // Check for missing required fields
      const missingFields = requiredFields.filter((field) => !row[field]);
      if (missingFields.length > 0) {
        console.log(
          `Skipping row due to missing fields: ${missingFields.join(", ")}`
        );
        return;
      }

      // Validate fields
      if (validators) {
        const invalidFields = Object.keys(validators).filter(
          (key) => !validators[key](row[key])
        );
        if (invalidFields.length > 0) {
          console.log(
            `Skipping row due to invalid fields: ${invalidFields.join(", ")}`
          );
          return;
        }
      }

      // Check for duplicates
      if (uniqueField && seenValues.has(row[uniqueField])) {
        console.log(
          `Skipping row due to duplicate unique field value: ${row[uniqueField]}`
        );
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

  return null;
};

export default CSVCleaner;
