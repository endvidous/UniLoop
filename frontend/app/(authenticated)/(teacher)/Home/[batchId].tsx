import { useGetBatch } from "@/src/hooks/api/useCourses";
import { Batch } from "@/src/services/api/courseAPI";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

const BatchPage = () => {
  const { batchId } = useLocalSearchParams<{ batchId: string }>();
  const navigation = useNavigation();
  const { data: response, error, isLoading, refetch } = useGetBatch(batchId);
  const batch = response?.data as Batch;
  const message = response?.message;
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: `Batch ${batch.startYear} - ${batch.code}`,
    });
  }, [navigation]);

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

  // Need to implement adding announcements, or
  // making meetings per batch and also feature to see
  // each student details and assign two as a classrep
  return (
    <View>
      <Text>{batchId}</Text>
    </View>
  );
};

export default BatchPage;
