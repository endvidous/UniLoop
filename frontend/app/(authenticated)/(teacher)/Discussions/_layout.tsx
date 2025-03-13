import { Stack } from "expo-router";

export default function AnnouncementsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Discussions",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[discussionId]"
        options={{
          title: "Discussion Details",
        }}
      />
    </Stack>
  );
}
