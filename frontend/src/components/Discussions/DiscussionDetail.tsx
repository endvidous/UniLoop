import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useDiscussion,
  useAddComment,
  useMarkAnswer,
} from "@/src/hooks/api/useDiscussions";
import { useAuth } from "@/src/context/AuthContext";
import CommentItem from "./CommentItem";
import { useState } from "react";

const DiscussionDetail = ({ id }: { id: string }) => {
  const { data: discussion } = useDiscussion(id);
  const { user } = useAuth();
  const [comment, setComment] = useState("");
  const { mutate: addComment } = useAddComment();
  const { mutate: markAnswer } = useMarkAnswer();

  const isAuthor = discussion?.postedBy._id === user?.id;
  const hasCommented = discussion?.comments.some(
    (c: any) => c.postedBy._id === user?.id
  );

  const handleAddComment = () => {
    if (!comment.trim()) return;
    addComment({ discussionId: id, content: comment });
    setComment("");
  };

  if (!discussion) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{discussion.title}</Text>
        <View style={styles.meta}>
          <Text style={styles.author}>{discussion.postedBy.name}</Text>
          <Text style={styles.date}>
            {new Date(discussion.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <Text style={styles.description}>{discussion.description}</Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="flag-outline" size={20} />
            <Text>Report</Text>
          </TouchableOpacity>
          {isAuthor && (
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="trash-outline" size={20} />
              <Text>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.commentsSection}>
        <Text style={styles.sectionTitle}>
          Comments ({discussion.comments.length})
        </Text>

        {discussion.comments.map((comment: any) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            onMarkAnswer={() =>
              markAnswer({ discussionId: id, commentId: comment._id })
            }
            isTeacher={user?.role === "teacher"}
          />
        ))}
      </View>

      {!discussion.isClosed && !hasCommented && (
        <View style={styles.commentForm}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <TouchableOpacity
            style={styles.commentButton}
            onPress={handleAddComment}
          >
            <Text style={styles.commentButtonText}>Post Comment</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  author: {
    color: "#666",
  },
  date: {
    color: "#666",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
    marginBottom: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 8,
  },
  commentsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 12,
  },
  commentForm: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 16,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    marginBottom: 12,
  },
  commentButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  commentButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
});

export default DiscussionDetail;
