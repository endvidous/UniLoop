// import { Stack, useLocalSearchParams } from "expo-router";
// import { View, Text, StyleSheet, FlatList } from "react-native";
// import { Link } from "expo-router";

// const PapersIndexPage = () => {
//   const { name } = useLocalSearchParams();

//   // Fetch papers for the department here (you can use a custom hook or API call)

//   return (
//     <View style={styles.container}>
//       <Stack.Screen options={{ title: `${name} Papers` }} />
//       <Text style={styles.title}>{name} Papers</Text>

//       {/* Display papers here */}
//       <FlatList
//         data={[]} // Replace with your papers data
//         renderItem={({ item }) => (
//           <View style={styles.paperCard}>
//             <Text style={styles.paperText}>{item.title}</Text>
//           </View>
//         )}
//         keyExtractor={(item) => item.id}
//         ListEmptyComponent={
//           <Text style={styles.emptyText}>No papers available</Text>
//         }
//       />

//       <Link href={`/department/${name}/papers/paperupload`} asChild>
//         <TouchableOpacity style={styles.button}>
//           <Text style={styles.buttonText}>Upload Paper</Text>
//         </TouchableOpacity>
//       </Link>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "#f5f5f5",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//   },
//   paperCard: {
//     backgroundColor: "#007BFF",
//     padding: 15,
//     borderRadius: 10,
//     marginVertical: 8,
//   },
//   paperText: {
//     color: "white",
//     fontSize: 18,
//   },
//   emptyText: {
//     textAlign: "center",
//     fontSize: 16,
//     color: "#666",
//     marginTop: 20,
//   },
//   button: {
//     backgroundColor: "#007BFF",
//     padding: 15,
//     borderRadius: 10,
//     marginVertical: 8,
//     alignItems: "center",
//   },
//   buttonText: {
//     color: "white",
//     fontSize: 18,
//     fontWeight: "bold",
//   },
// });

// export default PapersIndexPage;
