import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

const BatchPage = () => {
  const { batchId } = useLocalSearchParams<{ batchId: string }>();
  // Need to implement adding announcements, or making meetings per batch and also feature to see each student details and assign two as a classrep
  return (
    <View>
      <Text>{batchId}</Text>
    </View>
  );
};

export default BatchPage;
