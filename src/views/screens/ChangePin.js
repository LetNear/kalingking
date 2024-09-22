import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
} from "react-native-alert-notification";
import CustomPinInput from "../components/CustomPinInput";
import Loader from "../components/Loader";
import axios from "axios";

const ChangePin = ({ navigation }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [storedPin, setStoredPin] = useState(null);

  useEffect(() => {
    fetchStoredPin(); // Fetch stored PIN on component mount
  }, []);

  useEffect(() => {
    if (pin.length === 4) {
      validate(); // Automatically validate once PIN length reaches 4
    }
  }, [pin]);

  const fetchStoredPin = async () => {
    setLoading(true);
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const user = JSON.parse(userData);
        const response = await axios.get(
          "https://lockup.pro/api/user/get-old-pin",
          {
            params: { user_id: user.id },
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        setStoredPin(response.data.pin?.toString()); // Ensure PIN is stored as string
      }
    } catch (error) {
      console.error("Failed to fetch stored PIN", error);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    if (!pin) {
      setError("Please Enter a 4-Digit PIN");
      return;
    } else if (pin.length !== 4) {
      setError("PIN Must Be 4 Digits");
      return;
    }

    confirmPin();
  };

  const confirmPin = () => {
    if (pin === storedPin) {
      // Navigate to Change PIN screen if the entered PIN matches the stored PIN
      navigation.navigate("ChangePinScreen");
    } else {
      setError("Incorrect PIN");
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: "ERROR",
        textBody: "The entered PIN is incorrect.",
        button: "Close",
      });
    }
  };

  return (
    <AlertNotificationRoot style={styles.container}>
      <SafeAreaView style={styles.container}>
        <Loader visible={loading} />
        <ScrollView style={styles.svContainer}>
          <Text style={styles.textTitle}>VERIFY YOUR PIN</Text>
          <Text style={styles.textSubtitle}>Enter your 4-digit PIN</Text>
          <View style={styles.viewContainer}>
            <CustomPinInput
              value={pin}
              onChangeText={(text) => {
                setPin(text);
                setError(null); // Reset error on new input
              }}
              error={error}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </AlertNotificationRoot>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },
  svContainer: {
    paddingTop: -5,
    paddingHorizontal: 20,
  },
  textTitle: {
    fontSize: 25,
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
    marginBottom: -20,
  },
  viewContainer: {
    paddingVertical: 20,
  },
});

export default ChangePin;
