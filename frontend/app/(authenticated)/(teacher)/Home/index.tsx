// TeacherHomePage.tsx
import React, { useState } from "react";
import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { RelativePathString, useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { useUserAssociations } from "@/src/hooks/api/useAssociations";
import { ScrollView } from "react-native-reanimated/lib/typescript/Animated";

// Component to display each batch as a clickable card
const BatchCard = ({ batch }: { batch: { _id: string; code: string } }) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname:
            `/authenticated/teacher/batch/[batchId]` as RelativePathString,
          params: { batchId: batch._id },
        })
      }
      style={{
        backgroundColor: "#fff",
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>{batch.code}</Text>
    </TouchableOpacity>
  );
};

const TeacherHomePage = () => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: associations,
    refetch,
    error,
    isLoading,
  } = useUserAssociations();

  const onRefresh = () => {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={{ fontSize: 16, margin: 16 }}>
          Error loading data. Pull down to refresh.
        </Text>
      </ScrollView>
    );
  }

  // Render the batches from the associations response
  return (
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", margin: 16 }}>
        Hey, {user?.name}. The batches you teach
      </Text>
      <FlatList
        data={associations?.batches || []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <BatchCard batch={item} />}
        contentContainerStyle={{ paddingBottom: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              minHeight: 300,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: "#777",
              }}
            >
              No Batches are being taught by you
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default TeacherHomePage;
