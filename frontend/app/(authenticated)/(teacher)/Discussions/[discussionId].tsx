import DiscussionDetail from "@/src/components/Discussions/DiscussionDetail";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function DiscussionDetailpage() {
  const { discussionId } = useLocalSearchParams<{ discussionId: string }>();

  return (
    <View style={{ flex: 1 }}>
      <DiscussionDetail id={discussionId} />
    </View>
  );
}
