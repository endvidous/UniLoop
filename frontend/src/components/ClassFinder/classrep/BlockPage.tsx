import { useState } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useBlocks } from "@/src/hooks/api/useClassroom"; // Hook to fetch block data

const BlockPage = () => {
  const navigation = useNavigation();
  const { data: blocks, isLoading, isError, error, refetch } = useBlocks(); // Fetch blocks
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={blocks || ["Arrupe", "New", "Magis", "Science"]}
        keyExtractor={(item) => item}
        renderItem={({ item: block }) => (
          <TouchableOpacity
            style={styles.blockButton}
            //onPress={() => navigation.navigate("SelectionPage", { block })}
          >
            <Text style={styles.blockText}>{block}</Text>
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.noDataText}>No Blocks Available</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  blockButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  blockText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  noDataText: {
    fontSize: 16,
    color: "#777",
  },
});

export default BlockPage;
