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

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        onPress={() => onPress(discussion._id)}
      >
        <View style={styles.content}>
          <Text style={styles.title}>{discussion.title}</Text>
          <Text
            style={styles.description}
            numberOfLines={3}
            ellipsizeMode="tail"
          >
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
            <View
              style={{
                height: "100%",
                width: 1,
                backgroundColor: "#353535",
              }}
            />
            <TouchableOpacity
              style={styles.voteItem}
              onPress={() => {
                downvoteDiscussion(discussion._id);
              }}
            >
              <Ionicons name="arrow-down-outline" size={18} color="#F44336" />
              <Text style={styles.voteCount}>
                {formatNumber(discussion.downvotesCount)}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.reportContainer}>
            <TouchableOpacity
              onPress={openReportDialog}
              style={styles.reportButton}
            >
              <Ionicons name="flag-outline" size={18} color={"red"} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      {/* Report Dialog */}
      <ReportModal
        visible={isReportVisible}
        onDismiss={() => setIsReportVisible(false)}
        reportReason={reason}
        setReportReason={setReason}
        onSubmit={submitReport}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: "column",
    alignItems: "flex-start",
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
