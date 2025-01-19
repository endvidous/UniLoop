import { Tabs } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { Text } from "react-native";
const AdminLayout = () => {
  const { user } = useAuth();
  return <Tabs screenOptions={{ headerTitle: user?.role }} />;
};

export default AdminLayout;
