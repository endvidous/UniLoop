import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";

const CommentItem = ({ comment, onMarkAnswer, isTeacher }: any) => {
  const { user } = useAuth();
  const isAuthor = comment.postedBy._id === user?.id;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.author}>{comment.postedBy.name}</Text>
        {comment.isAnswer && (
          <Ionicons name="checkmark-circle" color="#4CAF50" size={20} />
        )}
      </View>

      <Text style={styles.content}>{comment.content}</Text>

      <View style={styles.actions}>
        <View style={styles.votes}>
          <TouchableOpacity style={styles.voteButton}>
            <Ionicons name="arrow-up" size={16} />
            <Text>{comment.upvotes.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.voteButton}>
            <Ionicons name="arrow-down" size={16} />
            <Text>{comment.downvotes.length}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rightActions}>
          {(isAuthor || isTeacher) && (
            <TouchableOpacity onPress={onMarkAnswer}>
              <Text style={styles.actionText}>Mark as Answer</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity>
            <Text style={styles.actionText}>Report</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  author: {
    fontWeight: "500",
    color: "#444",
  },
  content: {
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  votes: {
    flexDirection: "row",
    gap: 16,
  },
  voteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rightActions: {
    flexDirection: "row",
    gap: 16,
  },
  actionText: {
    color: "#007BFF",
  },
});

export default CommentItem;
