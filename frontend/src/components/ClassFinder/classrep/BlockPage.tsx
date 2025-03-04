import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const blocks = ["Arrupe", "New", "Magis", "Science"];

const BlockPage = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Block</Text>
      {blocks.map((block) => (
        <TouchableOpacity
          key={block}
          style={styles.blockButton}
          //onPress={() => navigation.navigate("SelectionPage", { block })}
        >
          <Text style={styles.blockText}>{block}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  blockButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  blockText: { color: "white", fontSize: 18, fontWeight: "bold" },
});

export default BlockPage;
