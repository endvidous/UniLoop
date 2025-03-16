import { Stack, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Link } from "expo-router";
import {
  useDepartmentPapers,
  useDeletePaper,
  useUpdatePaper,
} from "@/src/hooks/api/useDepartments";
import { useTheme } from "@/src/hooks/colors/useThemeColor";
import { Swipeable } from "react-native-gesture-handler";
import React, { useState } from "react";

interface Paper {
  _id: string;
  name: string;
  code: string;
  semester: number;
}

const PapersIndexPage = () => {
  const { colors } = useTheme();
  //states definition
  const [deletingPaperId, setDeletingPaperId] = useState<string | null>(null);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [updatedName, setUpdatedName] = useState<string>("");
  const [updatedCode, setUpdatedCode] = useState<string>("");
  const [updatedSemester, setUpdatedSemester] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  //mutation hooks
  const { mutate: updatePaper } = useUpdatePaper();
  const { mutate: deletePaper, status } = useDeletePaper();
  //?
  const { departmentId, name } = useLocalSearchParams<{
    departmentId: string;
    name: string;
  }>();
  //?
  const { data, isFetching, isError, refetch } =
    useDepartmentPapers(departmentId);

  //delete paper function
  const isDeleting = status === "pending";
  const onDelete = (id: string) => {
    if (!isDeleting) {
      deletePaper(
        { departmentId, paperId: id },
        {
          onSuccess: () => {
            setDeletingPaperId(null);
            refetch();
          },
          onError: (error) => {
            console.error("Error deleting paper:", error);
            setDeletingPaperId(null);
          },
        }
      );
    }
  };

  //edit paper function
  const onEdit = (item: Paper) => {
    setEditingPaper(item);
    setUpdatedName(item.name);
    setUpdatedCode(item.code);
    setUpdatedSemester(item.semester.toString());
  };
  const onCancelEdit = () => {
    setEditingPaper(null);
  };
  const onConfirmEdit = () => {
    if (editingPaper) {
      // Prepare data for updating the paper
      const paperData = {
        name: updatedName,
        code: updatedCode,
        semester: Number(updatedSemester),
      };

      setIsUpdating(true); // Set loading state

      updatePaper(
        {
          departmentId,
          paperId: editingPaper._id,
          paperData,
        },
        {
          onSuccess: () => {
            setEditingPaper(null); // Close the edit form
            refetch(); // Refetch to update the papers list
            setIsUpdating(false); // Reset loading state
          },
          onError: (error) => {
            console.error("Error updating paper:", error);
            setEditingPaper(null); // Close the edit form even if the update fails
            setIsUpdating(false); // Reset loading state
          },
        }
      );
    }
  };

  const renderRightActions = (item: Paper) => {
    return (
      <View style={styles.swipeActionsContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            onEdit({
              _id: item._id,
              name: item.name,
              code: item.code,
              semester: item.semester,
            })
          }
        >
          <Icon name="pencil" size={30} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => setDeletingPaperId(item._id)}
        >
          <Icon name="trash" size={30} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderPaper = ({ item }: { item: Paper }) => {
    if (deletingPaperId === item._id) {
      return (
        <View
          style={[
            styles.confirmationCard,
            { backgroundColor: colors.background },
          ]}
        >
          <Text style={[styles.paperText, { color: colors.text }]}>
            Are you sure you want to delete {item.name}?
          </Text>
          <View style={styles.confirmationButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setDeletingPaperId(null)}
            >
              <Text style={styles.confirmationText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => onDelete(item._id)}
            >
              <Text style={styles.confirmationText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (editingPaper && editingPaper._id === item._id) {
      return (
        <View style={[styles.editCard, { backgroundColor: colors.background }]}>
          <Text style={[styles.paperText, { color: colors.text }]}>
            Edit Paper {item.name}
          </Text>

          <TextInput
            style={[
              styles.input,
              { borderColor: colors.text, color: colors.text },
            ]}
            value={updatedName}
            onChangeText={setUpdatedName}
            placeholder={item.name}
            placeholderTextColor={colors.text}
          />
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.text, color: colors.text },
            ]}
            value={updatedCode}
            onChangeText={setUpdatedCode}
            placeholder={item.code}
            placeholderTextColor={colors.text}
          />
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.text, color: colors.text },
            ]}
            value={updatedSemester}
            onChangeText={setUpdatedSemester}
            keyboardType="numeric"
            placeholder={updatedSemester || "Semester"} // Use the updatedSemester state
            placeholderTextColor={colors.text} // Set the placeholder text color to colors.text
          />
          <View style={styles.confirmationButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancelEdit}
            >
              <Text style={styles.confirmationText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={onConfirmEdit}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.confirmationText}>Confirm</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <Swipeable renderRightActions={() => renderRightActions(item)}>
        <TouchableOpacity style={styles.paperCard}>
          <Text style={styles.paperText}>{item.name}</Text>
          <Text style={styles.paperText}>{item.code}</Text>
          <Text style={styles.paperText}>{item.semester}</Text>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  if (isFetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Error loading papers. Please try again.
        </Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.secondaryBackground },
      ]}
    >
      <Stack.Screen options={{ title: `${name} Papers` }} />
      <Text style={[styles.title, { color: colors.text }]}>{name} Papers</Text>

      <FlatList
        data={data?.data}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderPaper}
        refreshing={isFetching}
        onRefresh={refetch}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No papers available</Text>
        }
      />

      <Link
        href={`/Home/departments/${departmentId}/papers/paperUpload`}
        asChild
      >
        <TouchableOpacity style={styles.button}>
          <Icon name="add" size={40} color="white" />
        </TouchableOpacity>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  paperCard: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
  },
  paperText: {
    color: "white",
    fontSize: 18,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
  button: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007BFF",
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryText: {
    color: "#007BFF",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  deleteButton: {
    backgroundColor: "red",
    marginHorizontal: 3,
    justifyContent: "center",
    alignItems: "center",
    height: 105,
    width: 50,
    borderRadius: 10,
  },
  editButton: {
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    width: 50,
    height: 105,
    borderRadius: 10,
  },
  swipeActionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  editCard: {
    padding: 20,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: 10,
    marginVertical: 8,
    borderRadius: 5,
    borderWidth: 1,
  },
  confirmationCard: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: "center",
  },
  confirmationButtons: {
    flexDirection: "row",
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
  },
  confirmationText: {
    fontSize: 16,
    color: "white",
  },
});

export default PapersIndexPage;
