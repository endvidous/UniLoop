// app/announcements/[announcementId].tsx
import React from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import AnnouncementDetailComponent from "@/src/components/Announcements/AnnouncementDetailComponent";

export default function AnnouncementDetailPage() {
  const { announcementId } = useLocalSearchParams<{ announcementId: string }>();

  return (
    <View style={{ flex: 1 }}>
      <AnnouncementDetailComponent id={announcementId} />
    </View>
  );
}
