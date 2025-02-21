import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Discussion } from "@/src/utils/interfaces";
import { RelativePathString, useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";

const DiscussionCard = ({ discussion }: { discussion: Discussion }) => {
  const { user } = useAuth();
  const router = useRouter();

  const onPress = (id: string) => {
    const basepath =
      `/(authenticated)/(${user?.role})/Discussions/[discussionId]` as RelativePathString;
    router.push({
      pathname: basepath,
      params: { discussionId: id },
    });
  };

  console.log(discussion);
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(discussion._id)}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{discussion.title}</Text>
        <Text style={styles.description} numberOfLines={3} ellipsizeMode="tail">
          {discussion.description}
        </Text>
      </View>

      <View style={styles.votesContainer}>
        <View style={styles.voteItem}>
          <Ionicons name="arrow-up-circle" size={24} color="#4CAF50" />
          <Text style={styles.voteCount}>{discussion.upvotesCount}</Text>
        </View>
        <View style={styles.voteItem}>
          <Ionicons name="arrow-down-circle" size={24} color="#F44336" />
          <Text style={styles.voteCount}>{discussion.downvotesCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  votesContainer: {
    alignItems: "center",
  },
  voteItem: {
    alignItems: "center",
    marginVertical: 4,
  },
  voteCount: {
    fontSize: 12,
    color: "#444",
    marginTop: 2,
  },
});

export default DiscussionCard;
