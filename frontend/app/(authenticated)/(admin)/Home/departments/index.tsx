import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ListRenderItem,
} from "react-native";
import { Link, useRouter } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import {
  useDepartments,
  useDeleteDepartment,
} from "@/src/hooks/api/useDepartments";
import { useTheme } from "@/src/hooks/colors/useThemeColor";
import {
  GestureHandlerRootView,
  RectButton,
  Swipeable,
} from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

interface Department {
  _id: string;
  name: string;
}

const HomeScreen = () => {
  // Custom hooks:
  const { colors } = useTheme();
  const router = useRouter();
  const { data: departments, isFetching, isError, refetch } = useDepartments();
  const { mutate: deleteDepartment } = useDeleteDepartment();
  // State indicators:
  const [showConfirmCard, setShowConfirmCard] = useState<string | null>(null);
  const [isDeleted, setIsDeleted] = useState(false);

  const renderRightActions = (item: Department) => {
    return (
      <TouchableOpacity
        style={styles.rightAction}
        onPress={() => setShowConfirmCard(item._id)}
      >
        <Icon name="trash-outline" size={30} color="white" />
      </TouchableOpacity>
    );
  };

  const renderLeftActions = (item: Department) => {
    return (
      <TouchableOpacity
        style={styles.leftAction}
        onPress={() => {
          void null;
          // Handle the edit action here
          ///router.push({
          //pathname: "/Home/departments/edit",
          //params: { _id: item._id, name: item.name },
          //});
        }}
      >
        <Icon name="pencil-outline" size={30} color="white" />
      </TouchableOpacity>
    );
  };

  const renderDepartment: ListRenderItem<Department> = ({ item }) => {
    if (showConfirmCard === item._id) {
      return (
        <View
          style={[styles.confirmCard, { backgroundColor: colors.background }]}
        >
          <Text style={[styles.confirmText, { color: colors.text }]}>
            Are you sure you want to delete {item.name}?
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowConfirmCard(null)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => {
                // Handle the delete action here
                deleteDepartment(item._id, {
                  onSuccess: () => {
                    setShowConfirmCard(null);
                    setIsDeleted(true);
                  },
                });
              }}
            >
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (isDeleted && showConfirmCard === item._id) {
      return (
        <View
          style={[styles.confirmCard, { backgroundColor: colors.background }]}
        >
          <Text style={[styles.confirmText, { color: colors.text }]}>
            Department deleted
          </Text>
        </View>
      );
    }

    return (
      <Swipeable
        renderRightActions={() => renderRightActions(item)}
        renderLeftActions={() => renderLeftActions(item)}
      >
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: `/Home/departments/[name]`,
              params: { _id: item._id, name: item.name },
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
          Error loading departments. Please try again.
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
      <FlatList<Department>
        data={departments?.data}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderDepartment}
        refreshing={isFetching}
        onRefresh={refetch}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No departments available</Text>
        }
      />
      <Link href="/Home/departments/departmentUpload" asChild>
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
  card: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: "center",
  },
  cardText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
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
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
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
});

export default HomeScreen;
