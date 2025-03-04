import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTheme } from "@/src/hooks/colors/useThemeColor";
import Icon from "react-native-vector-icons/Ionicons";
import { Link } from "expo-router";

const CoursesPage = () => {
  const { colors } = useTheme();

  return (
    <GestureHandlerRootView
      style={[
        styles.container,
        { backgroundColor: colors.secondaryBackground },
      ]}
    >
      <View>
        <Text style={[styles.text, { color: colors.text }]}>CoursesPage</Text>
      </View>

      <Link href="/Home/courses/courseUpload" asChild>
        <TouchableOpacity
          style={styles.button}
        >
          <Icon name="add" size={30} color="white" />
        </TouchableOpacity>
      </Link>
    </GestureHandlerRootView>
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

export default CoursesPage;
