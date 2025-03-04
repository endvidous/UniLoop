import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@/src/hooks/colors/useThemeColor";
import Icon from "react-native-vector-icons/Ionicons";

const CoursesUploadPage = () => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.secondaryBackground },
      ]}
    >
      <View>
        <Text style={[styles.text, { color: colors.text }]}>CourseUpload</Text>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  button: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007BFF",
    borderRadius: 100,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontSize: 20,
  },
});

export default CoursesUploadPage;
