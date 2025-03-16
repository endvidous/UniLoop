import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Controller } from "react-hook-form";

// Maintain your original input config structure for compatibility
export interface InputConfig {
  name: string;
  field: string;
  label: string;
  placeholder: string;
  required?: boolean;
}

// Generic props that match your usage pattern
interface ManualEntryProps {
  control: any;
  fields: any[];
  handleAddRow: () => void;
  handleRemoveRow: (index: number) => void;
  isManualEntryDisabled: boolean;
  isEditingCSV: boolean;
  errors?: any;
  inputConfig: InputConfig[];
  title?: string; // Optional title override
}

const ManualEntryComponent: React.FC<ManualEntryProps> = ({
  control,
  fields,
  handleAddRow,
  handleRemoveRow,
  isManualEntryDisabled,
  isEditingCSV,
  errors,
  inputConfig,
  title,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>
        {isEditingCSV ? `Edit ${title || "CSV Data"}` : title || "Manual Entry"}
      </Text>
      <View style={styles.tableHeader}>
        <Text style={styles.headerText}>Details</Text>
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
          <View style={styles.row}>
            <View style={styles.fieldsContainer}>
              {inputConfig.map((config, i) => (
                <View key={i} style={styles.inputRow}>
                  <Text style={styles.inputLabel}>
                    {config.label}
                    {config.required && <Text style={styles.required}>*</Text>}:
                  </Text>
                  <Controller
                    control={control}
                    name={`${config.name}.${index}.${config.field}`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[
                          styles.input,
                          isManualEntryDisabled &&
                            !isEditingCSV &&
                            styles.disabledInput,
                          errors?.[config.name]?.[index]?.[config.field] &&
                            styles.errorInput,
                        ]}
                        placeholder={config.placeholder}
                        value={value.toString()}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        editable={!isManualEntryDisabled || isEditingCSV}
                      />
                    )}
                  />
                  {errors?.[config.name]?.[index]?.[config.field] && (
                    <Text style={styles.errorText}>
                      {errors[config.name][index][config.field].message}
                    </Text>
                  )}
                </View>
              ))}
            </View>
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
      {fields.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No entries yet. Click + to add.</Text>
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
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  fieldsContainer: {
    flex: 1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  inputLabel: {
    width: 80,
    fontSize: 14,
    fontWeight: "600",
  },
  required: {
    color: "red",
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
  errorInput: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 2,
    marginLeft: 80,
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
    marginLeft: 10,
    alignSelf: "center",
  },
  disabled: {
    opacity: 0.5,
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
  },
});

export default ManualEntryComponent;
