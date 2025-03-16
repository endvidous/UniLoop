// DepartmentTable.js
import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useForm, useFieldArray } from "react-hook-form";
import ManualEntryComponent from "@/src/components/common/ManualEntry";
import CsvUploaderComponent from "@/src/components/common/CsvEntry";
import {
  useDepartments,
  useCreateDepartments,
} from "@/src/hooks/api/useDepartments";

const DepartmentTable = () => {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      departments: [{ id: Date.now(), name: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "departments",
  });

  const [isManualEntryDisabled, setIsManualEntryDisabled] = useState(false);
  const [isEditingCSV, setIsEditingCSV] = useState(false);

  const { data: existingDepartments } = useDepartments();
  const { mutate: createDepartments, isPending: isCreating } =
    useCreateDepartments();

  const handleAddRow = () => {
    if (!isManualEntryDisabled) {
      append({ id: Date.now(), name: "" });
    }
  };

  const handleRemoveRow = (index: number | number[] | undefined) => {
    if (!isManualEntryDisabled || isEditingCSV) {
      remove(index);
    }
  };

  const onSubmit = (data: { departments: any[] }) => {
    const validDepartments = data.departments.filter(
      (dept) => dept.name.trim() !== ""
    );

    if (validDepartments.length === 0) {
      Alert.alert("Error", "Please enter at least one department.");
      return;
    }

    const duplicates = validDepartments
      .filter((dept) =>
        existingDepartments?.data?.some(
          (existing) => existing.name.toLowerCase() === dept.name.toLowerCase()
        )
      )
      .map((dept) => dept.name);

    if (duplicates.length > 0) {
      Alert.alert(
        "Error",
        `The following departments already exist: ${duplicates.join(", ")}`
      );
      return;
    }

    createDepartments(
      validDepartments.map((item) => ({ name: item.name })),
      {
        onSuccess: () => {
          Alert.alert("Success", "Departments saved successfully!");
          reset({ departments: [{ id: Date.now(), name: "" }] });
          setIsEditingCSV(false);
        },
        onError: (error) => {
          Alert.alert("Error", error.message || "Failed to save departments.");
        },
      }
    );
  };

  const handleCSVSuccess = (data: any[]) => {
    const newDepartments = data.map((row, index) => ({
      id: Date.now() + index,
      name: row.name,
    }));

    reset({ departments: newDepartments });
    setIsEditingCSV(true);
    setIsManualEntryDisabled(false);
  };

  const handleCSVError = (error: any) => {
    console.error("CSV Processing Error:", error);
    Alert.alert(
      "Error",
      "CSV parsing failed. Please check your file format and try again."
    );
    setIsManualEntryDisabled(false);
    setIsEditingCSV(false);
  };

  return (
    <View style={styles.container}>
      <ManualEntryComponent
        control={control}
        fields={fields}
        handleAddRow={handleAddRow}
        handleRemoveRow={handleRemoveRow}
        isManualEntryDisabled={isManualEntryDisabled}
        isEditingCSV={isEditingCSV}
        inputConfig={[
          {
            name: "departments",
            field: "name",
            label: "Department Name",
            placeholder: "Enter department name",
          },
        ]}
        errors={undefined}
      />

      {!isEditingCSV && (
        <CsvUploaderComponent
          onCSVSuccess={handleCSVSuccess}
          onCSVError={handleCSVError}
          config={{
            headers: ["name"],
            requiredFields: ["name"],
          }}
        />
      )}

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSubmit(onSubmit)}
        disabled={isCreating}
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
});

export default DepartmentTable;
