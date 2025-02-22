import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Menu, Portal, Dialog, Button } from "react-native-paper";
import { useAuth } from "@/src/context/AuthContext";
import {
  useUpvoteComment,
  useDownvoteComment,
} from "@/src/hooks/api/useDiscussions";
import ReportModal from "./ReportModal";
import { formatNumber } from "@/src/utils/helperFunctions";

interface CommentItemProps {
  comment: any;
  isTeacher: boolean;
  hasMarkedAnswer: boolean;
  discussionId: string;
  onMarkAnswer: () => void;
  onUnmarkAnswer: () => void;
  onUpdateComment: (commentId: string, newContent: string) => void;
  onDeleteComment: (commentId: string) => void;
  onReportComment: (commentId: string, reason: string) => void;
}

const CommentItem = ({
  comment,
  isTeacher,
  hasMarkedAnswer,
  discussionId,
  onMarkAnswer,
  onUnmarkAnswer,
  onUpdateComment,
  onDeleteComment,
  onReportComment,
}: CommentItemProps) => {
  const { user } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const { mutate: upvoteComment } = useUpvoteComment(user);
  const { mutate: downvoteComment } = useDownvoteComment(user);

  const isAuthor = comment.postedBy._id === user?.id;
  const isAdmin = user?.role === "admin";

  const handleUpvote = () => {
    upvoteComment({ discussionId, commentId: comment._id });
  };

  const handleDownvote = () => {
    downvoteComment({ discussionId, commentId: comment._id });
  };

  const handleUpdateComment = () => {
    onUpdateComment(comment._id, editedContent);
    setEditMode(false);
  };

  const confirmDelete = () => {
    onDeleteComment(comment._id);
    setDeleteModalVisible(false);
  };

  const handleReport = () => {
    onReportComment(comment._id, reportReason);
    setReportModalVisible(false);
    setReportReason("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.author}>{comment.postedBy.name}</Text>
        <View style={styles.headerRight}>
          {comment.isAnswer && (
            <Ionicons name="checkmark-circle" color="#4CAF50" size={20} />
          )}
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity onPress={() => setMenuVisible(true)}>
                <MaterialCommunityIcons
                  name="dots-vertical"
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            }
          >
            {(isAuthor || isAdmin) && (
              <Menu.Item
                title="Update"
                onPress={() => {
                  setMenuVisible(false);
                  setEditMode(true);
                }}
              />
            )}
            {(isAuthor || isAdmin) && (
              <Menu.Item
                title="Delete"
                onPress={() => {
                  setMenuVisible(false);
                  setDeleteModalVisible(true);
                }}
              />
            )}
            <Menu.Item
              title="Report"
              onPress={() => {
                setMenuVisible(false);
                setReportModalVisible(true);
              }}
            />
          </Menu>
        </View>
      </View>

      {editMode ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.editInput}
            value={editedContent}
            onChangeText={setEditedContent}
            multiline
            autoFocus
          />
          <View style={styles.editButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEditMode(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleUpdateComment}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <Text style={styles.content}>{comment.content}</Text>
          <View style={styles.actions}>
            <View style={styles.votesContainer}>
              <TouchableOpacity style={styles.voteItem} onPress={handleUpvote}>
                <Ionicons name="arrow-up-outline" size={18} color="#4CAF50" />
                <Text style={styles.voteCount}>
                  {formatNumber(comment.upvotesCount)}
                </Text>
              </TouchableOpacity>
              <View style={styles.separator} />
              <TouchableOpacity
                style={styles.voteItem}
                onPress={handleDownvote}
              >
                <Ionicons name="arrow-down-outline" size={18} color="#F44336" />
                <Text style={styles.voteCount}>
                  {formatNumber(comment.downvotesCount)}
                </Text>
              </TouchableOpacity>
            </View>
            {(isTeacher || isAdmin) && (
              <>
                {comment.isAnswer ? (
                  <TouchableOpacity
                    style={styles.answerAction}
                    onPress={onUnmarkAnswer}
                  >
                    <Text style={styles.actionText}>Unmark Answer</Text>
                  </TouchableOpacity>
                ) : (
                  !hasMarkedAnswer && (
                    <TouchableOpacity
                      style={styles.answerAction}
                      onPress={onMarkAnswer}
                    >
                      <Text style={styles.actionText}>Mark Answer</Text>
                    </TouchableOpacity>
                  )
                )}
              </>
            )}
          </View>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={deleteModalVisible}
          onDismiss={() => setDeleteModalVisible(false)}
        >
          <Dialog.Title>Delete Comment?</Dialog.Title>
          <Dialog.Actions>
            <Button onPress={() => setDeleteModalVisible(false)}>Cancel</Button>
            <Button onPress={confirmDelete}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Report Modal */}
      <ReportModal
        reportReason={reportReason}
        onDismiss={() => setReportModalVisible(false)}
        onSubmit={handleReport}
        setReportReason={() => setReportReason(reportReason)}
        visible={reportModalVisible}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 10,
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editContainer: {
    marginTop: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    minHeight: 40,
    marginBottom: 8,
  },
  editButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  cancelButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
  },
  saveButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#007BFF",
  },
  buttonText: {
    color: "#fff",
  },
  reportInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    marginVertical: 8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  votesContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderColor: "#353535",
    borderWidth: 1,
    elevation: 6,
    backgroundColor: "#E3E3E3",
    overflow: "hidden",
  },
  voteItem: {
    alignItems: "center",
    marginVertical: 6,
    flexDirection: "row",
    paddingVertical: 2,
    marginHorizontal: 20,
    gap: 6,
  },
  voteCount: {
    fontSize: 14,
    color: "#444",
  },
  separator: {
    height: "100%",
    width: 1,
    backgroundColor: "#353535",
  },
  answerAction: {
    borderRadius: 10,
    borderColor: "#353535",
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: 6,
    backgroundColor: "#94E2FF",
  },
  actionText: {
    color: "black",
    fontSize: 14,
  },
});

export default CommentItem;
