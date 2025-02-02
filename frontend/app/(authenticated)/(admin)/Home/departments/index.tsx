// import { Text, View } from "react-native";
// import { Ionicons } from "@expo/vector-icons";

// const DepartmentPage = () => {
//   return (
//     <View>
//       <Text>DepartmentPage</Text>
//     </View>
//   );
// };
// export default DepartmentPage;
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 

const HomeScreen = () => {
  const handleAddPress = () => {
    alert('Department added!');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleAddPress}>
        <Icon name="add" size={40} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
  icon: {
    marginBottom: 10,
  },
  button: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',  
    paddingVertical: 10,        
    paddingHorizontal: 10,      
    backgroundColor: '#007BFF', 
    borderRadius: 100,          
  },
});

export default HomeScreen;