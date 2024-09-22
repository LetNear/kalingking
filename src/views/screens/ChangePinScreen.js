import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
} from "react-native-alert-notification";
import Loader from "../components/Loader"; // Ensure this path is correct
import axios from "axios";

const ChangePinScreen = ({ navigation }) => {
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [storedId, setStoredId] = useState(null);
  const [storedPin, setStoredPin] = useState(null);

  useEffect(() => {
    fetchStoredUserData(); // Fetch stored user data on component mount
  }, []);

  const fetchStoredUserData = async () => {
    setLoading(true);
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const user = JSON.parse(userData);
        setStoredId(user.id); // Set stored user ID

        // Fetch the list of instructors and get the stored PIN
        const response = await axios.get("https://lockup.pro/api/instructors");
        const instructors = response.data.data;

        // Find the matching instructor based on the stored ID
        const matchedInstructor = instructors.find(
          (instructor) => instructor.id === user.id
        );

        // Check if the matched instructor has a valid PIN
        if (matchedInstructor && matchedInstructor.pin !== null) {
          setStoredPin(matchedInstructor.pin.toString()); // Set the stored PIN as string
        } else {
          setStoredPin(null); // Set to null if no valid PIN is found
          setError("No PIN found for the user. Please set up your PIN first.");
        }
      }
    } catch (error) {
      console.error("Failed to fetch stored user data", error);
      setError("Failed to fetch user data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const validateNewPin = () => {
    if (!newPin || !confirmPin) {
      setError("Please enter your new PIN and confirm it.");
      return;
    }
    if (newPin.length !== 4 || confirmPin.length !== 4) {
      setError("PIN must be 4 digits.");
      return;
    }
    if (newPin !== confirmPin) {
      setError("New PIN and Confirm PIN do not match.");
      return;
    }
    if (!storedPin) {
      setError("No existing PIN found. Please set up your PIN first.");
      return;
    }
    changePin(); // Proceed to change the PIN
  };

  const changePin = async () => {
    setLoading(true);
    try {
      const payload = {
        user_id: storedId,
        old_pin: Number(storedPin), // Ensure old_pin is sent as a number
        new_pin: Number(newPin), // Ensure new_pin is also a number
      };

      // Sending PUT request to change the PIN
      const response = await axios.put(
        "https://lockup.pro/api/user/change-pin",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: "SUCCESS",
        textBody: "Your PIN has been successfully changed.",
        button: "Close",
      });

      navigation.goBack(); // Navigate back after successful change
    } catch (error) {
      if (error.response) {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: "ERROR",
          textBody:
            error.response.data.message ||
            "Failed to change your PIN. Please check the details and try again.",
          button: "Close",
        });
      } else {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: "ERROR",
          textBody: "Failed to change your PIN. Please try again.",
          button: "Close",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertNotificationRoot style={styles.container}>
      <SafeAreaView style={styles.container}>
        <Loader visible={loading} />
        <ScrollView style={styles.svContainer}>
          <Text style={styles.textTitle}>CHANGE YOUR PIN</Text>
          <Text style={styles.textSubtitle}>
            Enter your new 4-digit PIN below
          </Text>
          <View style={styles.viewContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter New PIN"
              value={newPin}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
              onChangeText={(text) => {
                setNewPin(text);
                setError(null); // Reset error on new input
              }}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm New PIN"
              value={confirmPin}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
              onChangeText={(text) => {
                setConfirmPin(text);
                setError(null); // Reset error on new input
              }}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            <TouchableOpacity style={styles.button} onPress={validateNewPin}>
              <Text style={styles.buttonText}>Change PIN</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AlertNotificationRoot>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 16,
  },
  svContainer: {
    flex: 1,
    marginBottom: 20,
  },
  textTitle: {
    fontSize: 28,
    textAlign: "center",
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    marginTop: 100,
  },
  textSubtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 10,
  },
  viewContainer: {
    paddingVertical: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    fontSize: 18,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#1E293B",
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ChangePinScreen;
