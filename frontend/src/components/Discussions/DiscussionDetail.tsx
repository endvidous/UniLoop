import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Button,
  Divider,
  Menu,
  Provider,
  Portal,
  Dialog,
} from "react-native-paper";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  useDiscussion,
  useAddComment,
  useReportDiscussion,
  useUpvoteDiscussion,
  useDownvoteDiscussion,
  useDeleteDiscussion,
  useUpdateDiscussion,
} from "@/src/hooks/api/useDiscussions";
import { useAuth } from "@/src/context/AuthContext";
import CommentItem from "./CommentItem";
import { capFL, formatNumber } from "@/src/utils/helperFunctions";
import { IComment } from "@/src/utils/interfaces";
import { useRouter } from "expo-router";
import ReportModal from "./ReportModal";
import UpdateDiscussionModal from "./UpdateDiscussionModal";

const DiscussionDetail = ({ id }: { id: string }) => {
  const { user } = useAuth();
  const router = useRouter();
  const { data: discussion } = useDiscussion(id);
  const [comment, setComment] = useState("");
  const [reportReason, setReportReason] = useState("");

  // Discussion related hooks
  const { mutate: reportDiscussion } = useReportDiscussion();
  const { mutate: upvoteDiscussion } = useUpvoteDiscussion(user);
  const { mutate: downvoteDiscussion } = useDownvoteDiscussion(user);
  const { mutate: updateDiscussion } = useUpdateDiscussion();
  const { mutate: deleteDiscussion } = useDeleteDiscussion();

  // Comment related hooks
  const { mutate: addComment } = useAddComment();

  // Menu state
  const [menuVisible, setMenuVisible] = useState(false);
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  // Modal states
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);

  const isAuthor = discussion?.postedBy._id === user?.id;
  const isAdmin = user?.role === "admin";
  const hasCommented = discussion?.comments.some(
    (c: IComment) => c.postedBy._id === user?.id
  );
  const hasMarkedAnswer = discussion?.isClosed;

  const handleAddComment = () => {
    if (!comment.trim()) return;
    addComment({ discussionId: id, content: comment });
    setComment("");
  };

  // Menu action handlers
  // When the user selects "Update Discussion" in your menu:
  const handleUpdateDiscussion = () => {
    closeMenu();
    setUpdateModalVisible(true);
  };

  // When the user submits the updated data:
  const confirmUpdateDiscussion = (title: string, description: string) => {
    updateDiscussion({ id: discussion?._id, data: { title, description } });
    setUpdateModalVisible(false);
  };

  const handleDeleteDiscussion = () => {
    closeMenu();
    setDeleteModalVisible(true);
  };

  const handleReportDiscussion = () => {
    closeMenu();
    setReportModalVisible(true);
  };

  // Modal confirmation handlers
  const confirmDeleteDiscussion = () => {
    deleteDiscussion(discussion._id);
    router.back();
    setDeleteModalVisible(false);
  };

  const confirmReportDiscussion = () => {
    if (!reportReason.trim()) return;
    reportDiscussion({ id: discussion._id, reason: reportReason });
    setReportModalVisible(false);
    setReportReason("");
  };

  if (!discussion) return null;

  return (
    <KeyboardAwareScrollView
      style={styles.outerContainer}
      contentContainerStyle={styles.scrollContainer}
      enableOnAndroid={true}
      extraScrollHeight={120} // adjust if needed
      keyboardOpeningTime={0}
    >
      <View style={styles.innerContainer}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.metaContainer}>
            <View style={styles.meta}>
              <Text style={styles.author}>
                {discussion.postedBy.name} | {capFL(discussion.postedBy.role)}
              </Text>
              <Text style={styles.date}>
                {new Date(discussion.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Menu
              visible={menuVisible}
              onDismiss={closeMenu}
              anchor={
                <TouchableOpacity onPress={openMenu} style={styles.dotsButton}>
                  <MaterialCommunityIcons
                    name="dots-vertical"
                    size={24}
                    color="#000"
                  />
                </TouchableOpacity>
              }
              style={styles.menu}
            >
              {isAuthor && (
                <Menu.Item
                  onPress={handleUpdateDiscussion}
                  title="Update Discussion"
                />
              )}
              {(isAuthor || isAdmin) && (
                <Menu.Item
                  onPress={handleDeleteDiscussion}
                  title="Delete Discussion"
                />
              )}
              <Menu.Item onPress={handleReportDiscussion} title="Report" />
            </Menu>
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Content Section */}
        <View style={styles.content}>
          <Text style={styles.title}>{discussion.title}</Text>
          <Text style={styles.description}>{discussion.description}</Text>
        </View>

        {/* Actions Section */}
        <View style={styles.actionContainer}>
          <View style={styles.votesContainer}>
            <TouchableOpacity
              style={styles.voteItem}
              onPress={() => upvoteDiscussion(discussion._id)}
            >
              <Ionicons name="arrow-up-outline" size={18} color="#4CAF50" />
              <Text style={styles.voteCount}>
                {formatNumber(discussion.upvotesCount)}
              </Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity
              style={styles.voteItem}
              onPress={() => downvoteDiscussion(discussion._id)}
            >
              <Ionicons name="arrow-down-outline" size={18} color="#F44336" />
              <Text style={styles.voteCount}>
                {formatNumber(discussion.downvotesCount)}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.commentNumber}>
            <View style={styles.commentNumberButton}>
              <MaterialCommunityIcons
                name="comment-multiple-outline"
                size={18}
              />
              <Text style={styles.commentNumberText}>
                {formatNumber(discussion.comments.length)}
              </Text>
            </View>
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.sectionTitle}>-- Comments --</Text>
          {discussion.comments.map((c: any) => (
            <CommentItem
              key={c._id}
              comment={c}
              discussionId={id}
              isTeacher={user?.role === "teacher"}
              hasMarkedAnswer={!!hasMarkedAnswer}
            />
          ))}
        </View>
      </View>

      {/* Fixed Comment Input Bar */}
      {!discussion.isClosed && !hasMarkedAnswer && !hasCommented && (
        <View style={styles.fixedCommentBar}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            placeholderTextColor="#888"
            value={comment}
            onChangeText={setComment}
            onSubmitEditing={handleAddComment}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleAddComment}
          >
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Delete Confirmation Modal */}
      <Portal>
        <Dialog
          visible={deleteModalVisible}
          onDismiss={() => setDeleteModalVisible(false)}
        >
          <Dialog.Title>Are you sure?</Dialog.Title>
          <Dialog.Actions>
            <Button onPress={() => setDeleteModalVisible(false)}>Cancel</Button>
            <Button onPress={confirmDeleteDiscussion}>Delete Post</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Report Modal */}
      <ReportModal
        visible={reportModalVisible}
        onDismiss={() => setReportModalVisible(false)}
        reportReason={reportReason}
        setReportReason={setReportReason}
        onSubmit={confirmReportDiscussion}
      />

      {/* Update discussion Modal */}
      <UpdateDiscussionModal
        visible={updateModalVisible}
        onDismiss={() => setUpdateModalVisible(false)}
        initialTitle={discussion.title}
        initialDescription={discussion.description}
        onSubmit={confirmUpdateDiscussion}
      />
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    position: "relative",
    backgroundColor: "#FCFCFC",
  },
  innerContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 120, // Extra space so content doesn't hide behind the fixed bar
  },
  header: {
    marginBottom: 0,
  },
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  meta: {
    flexDirection: "column",
  },
  author: {
    color: "#666",
    fontSize: 14,
  },
  date: {
    color: "#666",
    fontSize: 12,
  },
  dotsButton: {
    paddingHorizontal: 8,
  },
  menu: {
    width: 180,
  },
  divider: {
    marginVertical: 8,
    backgroundColor: "#353535",
  },
  content: {
    marginVertical: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#555",
  },
  actionContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  votesContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderColor: "#353535",
    borderWidth: 1,
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
  commentNumber: {
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 12,
  },
  commentNumberButton: {
    gap: 6,
    alignItems: "center",
    marginVertical: 6,
    flexDirection: "row",
    paddingVertical: 4,
    marginHorizontal: 20,
  },
  commentNumberText: {
    fontSize: 14,
    color: "#444",
  },
  commentsSection: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 12,
    color: "#333",
  },
  fixedCommentBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  commentInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    color: "#333",
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#007BFF",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  reportInput: {
    borderWidth: 1,
    borderColor: "#353535",
    borderRadius: 8,
    padding: 8,
    marginVertical: 8,
    minHeight: 60,
    backgroundColor: "transparent",
    color: "#ffffff",
  },
});

export default DiscussionDetail;
