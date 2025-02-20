import * as DocumentPicker from "expo-document-picker";

export const pickCSVDocument = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["text/csv", "text/comma-separated-values"], // Only allow CSV files
      copyToCacheDirectory: true, // This is important for iOS
    });

    if (!result.assets || result.canceled) {
      console.log("User cancelled the picker");
      return;
    }

    // Check file extension
    const fileExtension = result.assets[0].name
      ?.split(".")
      .pop()
      ?.toLowerCase();
    if (fileExtension !== "csv") {
      alert("Please select a CSV file");
      return;
    }
    console.log("File uri:", result.assets[0].uri);
    console.log("File name:", result.assets[0].name);
    console.log("File size:", result.assets[0].size);
    console.log("File type:", result.assets[0].mimeType);

    // File details are in result.assets[0]
    return {
      uri: result.assets[0].uri,
      name: result.assets[0].name,
      size: result.assets[0].size,
      type: result.assets[0].mimeType,
    };
  } catch (err) {
    console.error("Error picking document:", err);
  }
};
