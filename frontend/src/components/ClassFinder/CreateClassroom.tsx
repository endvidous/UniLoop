import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { MaterialIcons } from "@expo/vector-icons";
import { toast } from "@backpackapp-io/react-native-toast";
import { useCreateClassrooms } from "@/src/hooks/api/useClassroom";
import { ClassroomData } from "@/src/services/api/classroomAPI";
import { useTheme } from "@/src/hooks/colors/useThemeColor";

const CreateClassroom = ({ onDismiss }: { onDismiss: () => void }) => {
  const { colors } = useTheme();

  const { control, handleSubmit, setValue } = useForm<ClassroomData>({
    defaultValues: {
      room_num: "",
      block: "",
      formattedAvailability: [],
    },
  });

  const createClassroomMutation = useCreateClassrooms();
  const { mutate: createClassroom } = createClassroomMutation;
  const isLoading = createClassroomMutation.isPending;

  const onSubmit = (data: ClassroomData) => {
    createClassroom([data], {
      onSuccess: (response) => {
        console.log("Classroom created:", response);
        toast.success("Classroom created successfully");
        onDismiss();
      },
      onError: (error) => {
        console.error("Error creating classroom:", error);
        toast.error("Error creating classroom");
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Classroom</Text>
        <TouchableOpacity onPress={onDismiss}>
          <MaterialIcons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      {/* Classroom Name */}
      <Controller
        name="room_num"
        control={control}
        rules={{ required: "Classroom name is required" }}
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Classroom Name</Text>
            <TextInput
              style={styles.input}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Enter classroom name"
            />
            {fieldState.error && (
              <Text style={styles.error}>{fieldState.error.message}</Text>
            )}
          </View>
        )}
      />
      {/* block name */}
      <Controller
        control={control}
        name="block"
        rules={{ required: "Block is required" }}
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Block</Text>
            <TextInput
              style={styles.input}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Enter block name (e.g., Arrupe, New, Magis, Science)"
            />
            {fieldState.error && (
              <Text style={styles.error}>{fieldState.error.message}</Text>
            )}
          </View>
        )}
      />
      {/* Submit Button */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create Classroom</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
  },
  error: {
    color: "red",
    marginTop: 4,
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: "#007BFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "500",
  },
});

export default CreateClassroom;
