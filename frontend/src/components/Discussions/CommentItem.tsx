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
  useUpdateComment,
  useDeleteComment,
  useReportComment,
  useMarkAnswer,
  useUnmarkAnswer,
} from "@/src/hooks/api/useDiscussions";
import ReportModal from "./ReportModal";
import { useTheme } from "@/src/hooks/colors/useThemeColor";
import BasicDialog from "../common/BasicDialog";
import VoteButtons from "./VoteButtons";

interface CommentItemProps {
  comment: any;
  isTeacher: boolean;
  hasMarkedAnswer: boolean;
  discussionId: string;
}

const CommentItem = ({
  comment,
  isTeacher,
  hasMarkedAnswer,
  discussionId,
}: CommentItemProps) => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState("");

  // Comment action hooks
  const { mutate: upvoteComment } = useUpvoteComment(user);
  const { mutate: downvoteComment } = useDownvoteComment(user);
  const { mutate: updateComment } = useUpdateComment();
  const { mutate: deleteComment } = useDeleteComment();
  const { mutate: reportComment } = useReportComment();
  const { mutate: markAnswer } = useMarkAnswer();
  const { mutate: unmarkAnswer } = useUnmarkAnswer();

  const isAuthor = comment.postedBy._id === user?.id;
  const isAdmin = user?.role === "admin";
  const hasUpvoted = comment?.upvotes.includes(user?.id);
  const hasDownvoted = comment?.downvotes.includes(user?.id);

  const handleUpvote = () =>
    upvoteComment({ discussionId, commentId: comment._id });
  const handleDownvote = () =>
    downvoteComment({ discussionId, commentId: comment._id });

  const handleUpdate = () => {
    updateComment({
      discussionId,
      commentId: comment._id,
      content: editedContent,
    });
    setEditMode(false);
  };

  const handleDelete = () => {
    deleteComment({ discussionId, commentId: comment._id });
    setDeleteModalVisible(false);
  };

  const handleReport = () => {
    reportComment({
      discussionId,
      commentId: comment._id,
      reason: reportReason,
    });
    setReportModalVisible(false);
    setReportReason("");
  };

  const handleMarkAnswer = () =>
    markAnswer({ discussionId, commentId: comment._id });
  const handleUnmarkAnswer = () =>
    unmarkAnswer({ discussionId, commentId: comment._id });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
        { shadowColor: colors.shadowcolor },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.author, { color: colors.text }]}>
          {comment.postedBy.name}
        </Text>
        <View style={styles.headerRight}>
          {comment.isAnswer && (
            <Ionicons name="checkmark-circle" color="#4CAF50" size={20} />
          )}
          <Menu
            anchorPosition="bottom"
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
            <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <Text style={styles.content}>{comment.content}</Text>
          <View style={styles.actions}>
            <VoteButtons
              upVoteCount={comment.upvotes.length}
              downVoteCount={comment.downvotes.length}
              hasUpvoted={hasUpvoted}
              hasDownvoted={hasDownvoted}
              onUpvote={handleUpvote}
              onDownvote={handleDownvote}
            />
            {(isTeacher || isAdmin) && (
              <>
                {comment.isAnswer ? (
                  <TouchableOpacity
                    style={styles.answerAction}
                    onPress={handleUnmarkAnswer}
                  >
                    <Text style={styles.actionText}>Unmark Answer</Text>
                  </TouchableOpacity>
                ) : (
                  !hasMarkedAnswer && (
                    <TouchableOpacity
                      style={styles.answerAction}
                      onPress={handleMarkAnswer}
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

      {/* Delete Confirmation Dialog*/}
      <BasicDialog
        visible={deleteModalVisible}
        title="Delete Comment?"
        onDismiss={() => setDeleteModalVisible(false)}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={handleDelete}
      />

      {/* Report Modal */}
      <ReportModal
        reportTitle="Report Comment"
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
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  author: {
    fontWeight: "500",
    //
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
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  votesContainer: {
    flexDirection: "row",
    width: "35%",
    alignItems: "center",
    borderRadius: 10,
    borderColor: "#353535",
    borderWidth: 1,
    backgroundColor: "white",
    overflow: "hidden",
    elevation: 6,
  },
  voteItem: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },
  separator: {
    height: "100%",
    width: 1.08,
    backgroundColor: "#353535",
  },
  upvoted: {
    backgroundColor: "#3fff3f66",
  },
  downvoted: {
    backgroundColor: "#ff676766",
  },
  voteCount: {
    fontSize: 14,
    color: "#444",
    marginLeft: 6,
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
  deleteButton: {
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#47a7f5",
    elevation: 6,
    paddingHorizontal: 10,
  },
});

export default CommentItem;
