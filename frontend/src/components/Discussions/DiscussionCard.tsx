import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Discussion } from "@/src/utils/interfaces";
import { RelativePathString, useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { Divider, Portal, Dialog, Button, TextInput } from "react-native-paper";
import { formatNumber } from "@/src/utils/helperFunctions";
import {
  useReportDiscussion,
  useUpvoteDiscussion,
  useDownvoteDiscussion,
} from "@/src/hooks/api/useDiscussions";
import ReportModal from "./ReportModal";
import VoteButtons from "./VoteButtons";
import { useTheme } from "@/src/hooks/colors/useThemeColor";

const DiscussionCard = ({ discussion }: { discussion: Discussion }) => {
  const { user } = useAuth();
  const router = useRouter();
  // Destructure the report function from your hook
  const { mutate: reportDiscussion } = useReportDiscussion();
  const { mutate: upvoteDiscussion } = useUpvoteDiscussion(user);
  const { mutate: downvoteDiscussion } = useDownvoteDiscussion(user);

  // State for showing the report dialog and storing the reason
  const [isReportVisible, setIsReportVisible] = useState(false);
  const [reason, setReason] = useState("");

  const onPress = (id: string) => {
    const basepath =
      `/(authenticated)/(${user?.role})/Discussions/[discussionId]` as RelativePathString;
    router.push({
      pathname: basepath,
      params: { discussionId: id },
    });
  };

  const openReportDialog = () => setIsReportVisible(true);
  const closeReportDialog = () => setIsReportVisible(false);

  const submitReport = () => {
    if (!reason.trim()) return;
    // Call your reporting hook with the discussion ID and reason
    reportDiscussion({ id: discussion._id, reason: reason });
    // Optionally reset the reason state
    setReason("");
    closeReportDialog();
  };

  const hasUpvoted = discussion?.upvotes.includes(user?.id || "");
  const hasDownvoted = discussion?.downvotes.includes(user?.id || "");
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.background },
        { shadowColor: colors.shadowcolor },
      ]}
      onPress={() => onPress(discussion._id)}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          {discussion.title}
        </Text>
        <Text style={styles.description} numberOfLines={3} ellipsizeMode="tail">
          {discussion.description}
        </Text>
      </View>
      <Divider
        style={{
          backgroundColor: "#353535",
          marginVertical: 6,
          width: "100%",
        }}
      />
      <View style={styles.actionContainer}>
        <VoteButtons
          upVoteCount={discussion.upvotesCount}
          downVoteCount={discussion.downvotesCount}
          hasUpvoted={hasUpvoted}
          hasDownvoted={hasDownvoted}
          onUpvote={() => upvoteDiscussion(discussion._id)}
          onDownvote={() => downvoteDiscussion(discussion._id)}
        />
        <TouchableOpacity
          onPress={openReportDialog}
          style={styles.reportContainer}
        >
          <View style={styles.reportButton}>
            <Ionicons name="flag-outline" size={18} color={"red"} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Report Dialog */}
      <ReportModal
        reportTitle="Report Discussion"
        visible={isReportVisible}
        onDismiss={() => setIsReportVisible(false)}
        reportReason={reason}
        setReportReason={setReason}
        onSubmit={submitReport}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    // backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: "column",
    alignItems: "flex-start",
    elevation: 2,
    //shadowColor: "#ffffff",
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
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
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
    justifyContent: "space-between",
    borderRadius: 10,
    borderColor: "#353535",
    borderWidth: 1,
  },
  voteItem: {
    alignItems: "center",
    marginVertical: 6,
    flexDirection: "row",
    gap: 6,
    paddingVertical: 2,
    marginHorizontal: 20,
  },
  voteCount: {
    fontSize: 14,
    color: "#444",
  },
  reportContainer: {
    borderWidth: 1,
    borderColor: "red",
    borderRadius: 12,
  },
  reportButton: {
    marginTop: 10,
    alignSelf: "flex-end",
    flexDirection: "row",
    gap: 2,
    marginVertical: 4,
    marginHorizontal: 16,
  },
  reportText: {
    fontSize: 14,
    color: "red",
  },
});

export default DiscussionCard;
