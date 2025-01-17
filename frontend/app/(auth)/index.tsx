import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { UniloopText } from "@/assets/svgs/splashSvgs";
import { useRouter } from "expo-router";
import { useState } from "react";
import { authService } from "@/services/api/auth";
import { useStore } from "@/context/store";
import axios, { AxiosError } from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser, setToken } = useStore();

  const handleLogin = async () => {
    try {
      const response = await authService.login(email, password);
      const { token, ...user } = response; // Extract user and token

      setUser(user); // Save user in Zustand
      setToken(token); // Save token in Zustand
      Alert.alert("Login Successful!", `Welcome, ${user.name}`);

      const role = user.role as "admin" | "teacher" | "student"; // Validate roles
      router.replace(`/(authenticated)/(${role})`); // Type-safe routing
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        // Handle Axios-specific errors
        const message =
          error.response?.data?.message ||
          "An error occurred while logging in.";
        Alert.alert("Login Failed", message);
        console.error(error.message);
      } else if (error instanceof Error) {
        // Handle general errors
        Alert.alert(
          "Login Failed",
          error.message || "An unexpected error occurred."
        );
        console.error(error.message);
      } else {
        console.error("An unknown error occurred:", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topLogo}>
        <UniloopText />
      </View>

      {/* Login Form Card */}
      <View style={styles.formCard}>
        <View style={styles.formContainer}>
          {/* Email/College ID Input */}
          <Text style={styles.label}>Email ID</Text>
          <TextInput
            style={styles.input}
            placeholder="ex: student@gmail.com"
            placeholderTextColor="#999"
            value={email}
            onChange={(e) => {
              setEmail(e.nativeEvent.text);
            }}
          />

          {/* Password Input */}
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholderTextColor="#999"
            placeholder={"*".repeat(password.length)}
            value={password}
            onChange={(e) => {
              setPassword(e.nativeEvent.text);
            }}
          />

          {/* Reset Password Link */}
          <TouchableOpacity style={styles.resetButton}>
            <Text style={styles.resetText}>Reset password</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => handleLogin()}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          {/* Request Account Section */}
          <View style={styles.requestAccount}>
            <Text style={styles.requestText}>
              Don't have your account details?
            </Text>
            <TouchableOpacity>
              <Text style={styles.requestLink}>Request here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
  },
  topLogo: {
    marginTop: 40,
  },
  svg: {
    position: "absolute",
  },
  formCard: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginTop: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formContainer: {
    width: "100%",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  resetButton: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  resetText: {
    color: "#666",
    fontSize: 14,
  },
  loginButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#000",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  requestAccount: {
    alignItems: "center",
    gap: 5,
  },
  requestText: {
    color: "#333",
    fontSize: 14,
  },
  requestLink: {
    color: "#000",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  bottomLogo: {
    position: "absolute",
    bottom: 40,
  },
});
