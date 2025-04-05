import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Link, useRouter, RelativePathString } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";
import { useTheme } from "@/src/hooks/colors/useThemeColor";
import {
  useCourses,
  useDeleteCourse,
  useUpdateCourse,
} from "@/src/hooks/api/useCourses";

interface Course {
  _id: string;
  name: string;
}

const CourseIndexScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { data: courses, isFetching, isError, refetch } = useCourses();
  const { mutate: deleteCourse } = useDeleteCourse();
  const { mutate: updateCourse } = useUpdateCourse();

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [newName, setNewName] = useState("");

  const handleEditCourse = (courseId: string) => {
    updateCourse(
      { courseId, name: newName },
      {
        onSuccess: () => {
          setEditingCourse(null);
          setNewName("");
          refetch();
        },
      }
    );
  };

  const handleDeleteCourse = (courseId: string) => {
    deleteCourse(courseId, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const renderRightActions = (item: Course) => {
    return (
      <TouchableOpacity
        style={styles.rightAction}
        onPress={() => handleDeleteCourse(item._id)}
      >
        <Icon name="trash-outline" size={30} color="white" />
      </TouchableOpacity>
    );
  };

  const renderLeftActions = (item: Course) => {
    return (
      <TouchableOpacity
        style={styles.leftAction}
        onPress={() => {
          setEditingCourse(item);
          setNewName(item.name);
        }}
      >
        <Icon name="pencil-outline" size={30} color="white" />
      </TouchableOpacity>
    );
  };

  const renderCourse = ({ item }: { item: Course }) => {
    // If the course is being edited, replace the card with an edit form
    if (editingCourse && editingCourse._id === item._id) {
      return (
        <View
          style={[styles.confirmCard, { backgroundColor: colors.background }]}
        >
          <Text style={[styles.confirmText, { color: colors.text }]}>
            Edit {item.name}
          </Text>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={newName}
            onChangeText={setNewName}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEditingCourse(null)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => handleEditCourse(item._id)}
            >
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Regular render if not editing
    return (
      <Swipeable
        renderRightActions={() => renderRightActions(item)}
        renderLeftActions={() => renderLeftActions(item)}
      >
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: `/Home/courses/[courseId]` as RelativePathString, // Updated pathname
              params: { courseId: item._id, name: item.name },
            })
          }
        >
          <Text style={styles.cardText}>{item.name}</Text>
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
          Error loading courses. Please try again.
        </Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <GestureHandlerRootView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.pageTitle, { color: colors.text }]}>
        Course Index
      </Text>
      <FlatList<Course>
        data={courses?.data}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderCourse}
        refreshing={isFetching}
        onRefresh={refetch}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No courses available
          </Text>
        }
      />
      <Link href="/Home/courses/CourseUpload" asChild>
        <TouchableOpacity style={styles.button}>
          <Icon name="add" size={40} color="white" />
        </TouchableOpacity>
      </Link>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderLeftWidth: 0.8,
    borderRightWidth: 0.8,
    borderBottomWidth: 1.5,
    borderTopWidth: 0.8,
  },
  cardText: {
    color: "black",
    alignItems: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  button: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007BFF",
    borderRadius: 100,
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
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 20,
  },
  rightAction: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    width: 75,
    marginVertical: 8,
    borderRadius: 10,
  },
  leftAction: {
    backgroundColor: "green",
    justifyContent: "center",
    alignItems: "center",
    width: 75,
    marginVertical: 8,
    borderRadius: 10,
  },
  confirmCard: {
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    marginVertical: 8,
  },
  confirmText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    width: 100,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    width: 100,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    width: "100%",
  },
});

export default CourseIndexScreen;
