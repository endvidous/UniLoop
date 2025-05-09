import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
} from "react-native";
import { UniloopText } from "@/src/assets/svgs/splashSvgs";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { AxiosError } from "axios";
import { useAuth } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { toast, ToastPosition } from "@backpackapp-io/react-native-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = useAuth();
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  interface LoginFormState {
    email: string;
    password: string;
    emailError: string | null;
    passwordError: string | null;
    passwordVisible: boolean;
  }

  const [passwordVisible, setPasswordVisible] =
    useState<LoginFormState["passwordVisible"]>(false);

  const handleLogin = async (): Promise<void> => {
    try {
      const signInPromise = signIn(email.trim(), password);
      toast.promise(
        signInPromise,
        {
          loading: "Logging in...",
          success: () => "Welcome ",
          error: (err: Error) => err.toString(),
        },
        { position: ToastPosition.BOTTOM }
      );
      await signInPromise;
    } catch (error: AxiosError | any) {
      //Do Nothing as of now
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
            placeholder="ex: user@gmail.com"
            placeholderTextColor="#999"
            value={email}
            onChange={(e) => {
              setEmail(e.nativeEvent.text);
            }}
          />
          {/* Error message */}
          {emailError && <Text style={styles.error}>{emailError}</Text>}

          {/* Password Input */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              secureTextEntry={!passwordVisible}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              value={password}
              onChange={(e) => {
                setPassword(e.nativeEvent.text);
              }}
            />
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setPasswordVisible(!passwordVisible)}
            >
              <Ionicons
                name={passwordVisible ? "eye-off" : "eye"}
                size={24}
                color="black"
              />
            </TouchableOpacity>
          </View>

          {/* Error message */}
          {passwordError && <Text style={styles.error}>{passwordError}</Text>}

          {/* Reset Password Link */}
          <Link href={"/(auth)/resetPassword"} asChild>
            <TouchableOpacity style={styles.resetButton}>
              <Text style={styles.resetText}>Reset password</Text>
            </TouchableOpacity>
          </Link>

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
            <Link href={"/(auth)/requestDetails"} asChild>
              <TouchableOpacity>
                <Text style={styles.requestLink}>Request here</Text>
              </TouchableOpacity>
            </Link>
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
    marginTop: 100,
  },
  svg: {
    position: "absolute",
  },
  formCard: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginTop: 85,
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    paddingRight: 10,
    fontSize: 16,
  },
  iconButton: {
    paddingHorizontal: 5,
  },
  resetButton: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  resetText: {
    color: "#666",
    fontSize: 14,
  },
  error: {
    color: "red",
    fontSize: 14,
    marginBottom: 15,
    paddingHorizontal: 5,
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
