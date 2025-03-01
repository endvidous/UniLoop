import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { formatNumber } from "@/src/utils/helperFunctions";

// Wrap TouchableOpacity with createAnimatedComponent
const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

interface VoteButtonsProps {
  upVoteCount: number;
  downVoteCount: number;
  hasUpvoted: boolean;
  hasDownvoted: boolean;
  onUpvote: () => void;
  onDownvote: () => void;
}

export default function VoteButtons({
  upVoteCount,
  downVoteCount,
  hasUpvoted,
  hasDownvoted,
  onUpvote,
  onDownvote,
}: VoteButtonsProps) {
  // Shared values: 0 = unvoted, 1 = voted
  const upvoteValue = useSharedValue(hasUpvoted ? 1 : 0);
  const downvoteValue = useSharedValue(hasDownvoted ? 1 : 0);

  // Animate to 1 if hasUpvoted = true, else 0
  useEffect(() => {
    upvoteValue.value = withTiming(hasUpvoted ? 1 : 0, { duration: 200 });
  }, [hasUpvoted]);

  // Animate to 1 if hasDownvoted = true, else 0
  useEffect(() => {
    downvoteValue.value = withTiming(hasDownvoted ? 1 : 0, { duration: 200 });
  }, [hasDownvoted]);

  // Interpolate background color for upvote
  const animatedUpvoteStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      upvoteValue.value,
      [0, 1],
      ["#FFFFFF", "#3fff3f66"] // from white to light green
    );
    return { backgroundColor };
  });

  // Interpolate background color for downvote
  const animatedDownvoteStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      downvoteValue.value,
      [0, 1],
      ["#FFFFFF", "#ff676766"] // from white to light red
    );
    return { backgroundColor };
  });

  return (
    <View style={styles.votesContainer}>
      {/* UPVOTE BUTTON */}
      <AnimatedTouchableOpacity
        style={[styles.voteItem, animatedUpvoteStyle]}
        onPress={onUpvote}
      >
        <Ionicons
          name="arrow-up-outline"
          size={18}
          color={hasUpvoted ? "#155724" : "#4CAF50"}
        />
        <Text style={styles.voteCount}>{formatNumber(upVoteCount)}</Text>
      </AnimatedTouchableOpacity>

      <View style={styles.separator} />

      {/* DOWNVOTE BUTTON */}
      <AnimatedTouchableOpacity
        style={[styles.voteItem, animatedDownvoteStyle]}
        onPress={onDownvote}
      >
        <Ionicons
          name="arrow-down-outline"
          size={18}
          color={hasDownvoted ? "#b40101" : "#F44336"}
        />
        <Text style={styles.voteCount}>{formatNumber(downVoteCount)}</Text>
      </AnimatedTouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
  voteCount: {
    fontSize: 14,
    color: "#444",
    marginLeft: 6,
  },
});
