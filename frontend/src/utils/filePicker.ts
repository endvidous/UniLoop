// filePicker.ts
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Platform, Alert } from "react-native";

export interface SelectedFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

/**
 * Pick a PDF document using Expo's DocumentPicker.
 * Returns a SelectedFile object or null if cancelled.
 */
export async function pickPdfDocument(): Promise<SelectedFile | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true, // This is important for iOS
    });

    if (!result.assets || result.canceled) {
      console.log("User cancelled the picker");
      return null;
    }

    // Check file extension
    const fileExtension = result.assets[0].name
      ?.split(".")
      .pop()
      ?.toLowerCase();
    if (fileExtension !== "pdf") {
      Alert.alert("Invalid file", "Please select a PDF file");
      return null;
    }

    return {
      uri: result.assets[0].uri,
      name: result.assets[0].name,
      type: result.assets[0].mimeType || "application/pdf",
      size: result.assets[0].size,
    };

    return null;
  } catch (error) {
    console.error("Error picking PDF document:", error);
    return null;
  }
}

/**
 * Pick an image using Expo's ImagePicker.
 * Returns a SelectedFile object or null if cancelled.
 */
export async function pickImage(): Promise<SelectedFile | null> {
  try {
    // On native platforms, request permission to access media library.
    if (Platform.OS !== "web") {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission required",
          "Permission to access media library is required!"
        );
        return null;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      // Extract file name from the URI (this is a simple approach; adjust as needed)
      const segments = result.assets[0].uri.split("/");
      const name = segments[segments.length - 1] || `image_${Date.now()}.jpg`;

      // In many cases, you might want to determine the type dynamically.
      // For simplicity, we assume JPEG. Adjust based on your needs.
      return {
        uri: result.assets[0].uri,
        name: result.assets[0].fileName || "Image",
        type: result.assets[0].mimeType || "image/jpeg",
        size: result.assets[0].fileSize,
      };
    }
    return null;
  } catch (error) {
    console.error("Error picking image:", error);
    return null;
  }
}
