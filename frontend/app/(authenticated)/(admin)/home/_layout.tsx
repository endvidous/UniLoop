import { Stack } from "expo-router";

const HomeLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerBackButtonDisplayMode: "generic",
      }}
    />
  );
};

export default HomeLayout;
