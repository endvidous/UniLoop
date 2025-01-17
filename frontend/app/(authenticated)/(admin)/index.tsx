import { Text, View } from "react-native";
import { useStore } from "@/context/store";
const AdminIndex = () => {
  const user = useStore((state) => state.user);
  return (
    <View>
      <Text>AdminIndex</Text>
      <Text>{user?.name}</Text>
      <Text>{user?.role}</Text>
    </View>
  );
};

export default AdminIndex;
