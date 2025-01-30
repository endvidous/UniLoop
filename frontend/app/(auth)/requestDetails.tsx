import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { useState } from "react";
import { Link, useRouter } from "expo-router";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return regex.test(email);
  };

  const handleRequestDetails = () => {
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    Alert.alert(
      "Success",
      "Your account details have been sent to your email.",
      [
        {
          text: "Okay",
          onPress: () => {
            router.push("/");
          },
        },
      ]
    );
    setIsLoading(false);
    setEmail("");
    setEmailError("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.formCard}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Email ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
          />
          {emailError && <Text style={styles.error}>{emailError}</Text>}

          <TouchableOpacity
            style={[styles.resetButton, isLoading && styles.loadingButton]}
            onPress={handleRequestDetails}
            disabled={isLoading}
          >
            <Text style={styles.resetButtonText}>
              {isLoading ? "Sending..." : "Request details"}
            </Text>
          </TouchableOpacity>

          <Link href="/(auth)/" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Back to Login</Text>
            </TouchableOpacity>
          </Link>
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
    width: "100%",
    height: 50,
    backgroundColor: "#000",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  loadingButton: {
    backgroundColor: "#ddd",
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: "red",
    fontSize: 14,
    marginBottom: 15,
  },
  link: {
    color: "#000",
    fontSize: 14,
    textDecorationLine: "underline",
    textAlign: "center",
  },
});
