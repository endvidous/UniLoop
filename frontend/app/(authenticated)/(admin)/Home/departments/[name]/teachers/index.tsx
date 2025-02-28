// import { Stack, useLocalSearchParams } from "expo-router";
// import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
// import { Link } from "expo-router";

// interface Teacher {
//   id: number;
//   name: string;
// }

// const TeachersIndexPage = () => {
//   const { name } = useLocalSearchParams();

//   // Fetch teachers for the department here (you can use a custom hook or API call)

//   return (
//     <View style={styles.container}>
//         data={[]} // Replace with your teachers data
//         keyExtractor={(item) => item.id.toString()}
//       <Text style={styles.title}>{name} Teachers</Text>

//       {/* Display teachers here */}
//       <FlatList
//         data={[]} // Replace with your teachers data
//         renderItem={({ item }) => (
//           <View style={styles.teacherCard}>
//             <Text style={styles.teacherText}>{item.name}</Text>
//           </View>
//         )}
//         keyExtractor={(item) => item.id}
//         ListEmptyComponent={
//           <Text style={styles.emptyText}>No teachers available</Text>
//         }
//       />

//       <Link href={`/department/${name}/teachers/teacherupload`} asChild>
//         <TouchableOpacity style={styles.button}>
//           <Text style={styles.buttonText}>Add Teacher</Text>
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
//   teacherCard: {
//     backgroundColor: "#007BFF",
//     padding: 15,
//     borderRadius: 10,
//     marginVertical: 8,
//   },
//   teacherText: {
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

// export default TeachersIndexPage;
