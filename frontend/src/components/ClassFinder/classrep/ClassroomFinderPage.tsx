import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useClassrooms } from "@/src/hooks/api/useClassroom";
import { useState } from "react";

const ClassRoomFinderPage = () => {
  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useClassrooms();

  const classrooms =
    response?.classrooms.map((block: any) => ({
      title: block.block, // Rename "block" to "title"
      data: block.classrooms, // Rename "classrooms" to "data"
    })) || [];

  //Refresh state
  const [refreshing, setRefreshing] = useState(false);

  //Make state to handle modal

  const OnRefresh = () => {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  };
  if (isLoading && !classrooms) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  if (isError) {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={OnRefresh} />
        }
        style={styles.container}
      >
        <Text style={styles.error}>
          Error loading discussions {error.message}
        </Text>
      </ScrollView>
    );
  }

  return (
    <View
      //   refreshControl={
      //     <RefreshControl refreshing={refreshing} onRefresh={OnRefresh} />
      //   }
      style={styles.container}
    >
      <SectionList
        sections={classrooms}
        keyExtractor={(item) => item._id}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        renderItem={({ item }) => {
          return <Text>{item.room_num}</Text>;
        }}
        ListEmptyComponent={<Text>No Unoccupied classrooms</Text>}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={OnRefresh} />
        }
      ></SectionList>

      {/* Call custom modal here and pass in the control values and data through it */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loader: {
    marginTop: 20,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "#f4f4f4",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 10,
  },
});

export default ClassRoomFinderPage;
