import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Animated,
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

const VerifyPin = ({ navigation }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const opacity = useRef(new Animated.Value(1)).current; // For blinking effect

  useEffect(() => {
    retrieveCurrentSchedule(); // Retrieve schedule data on component mount

    // Start blinking effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    if (pin.length === 4) {
      validate();
    }
  }, [pin]);

  const retrieveCurrentSchedule = async () => {
    try {
      const scheduleData = await AsyncStorage.getItem("currentSchedule");
      if (scheduleData) {
        const schedule = JSON.parse(scheduleData);

        // Get the current time
        const currentTime = new Date();
        const [startHours, startMinutes] = schedule.start_time
          .split(":")
          .map(Number);
        const [endHours, endMinutes] = schedule.end_time
          .split(":")
          .map(Number);

        // Create start and end Date objects for comparison
        const startTime = new Date(currentTime);
        startTime.setHours(startHours, startMinutes, 0);

        const endTime = new Date(currentTime);
        endTime.setHours(endHours, endMinutes, 0);

        // Check if the current time is within the schedule
        if (currentTime >= startTime && currentTime <= endTime) {
          setCurrentSchedule(schedule);
        } else {
          setCurrentSchedule(null); // Clear schedule if not within time range
        }
      }
    } catch (error) {
      console.error("Failed to load schedule data", error);
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

    login();
  };

  const login = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "https://lockup.pro/api/verify-pinDoor",
        { pin: pin },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const user = response.data.user;

      if (response.data.success) {
        // Save user data to AsyncStorage
        await AsyncStorage.setItem("userData", JSON.stringify(user));

        // Navigate to UnlockScreen
        navigation.navigate("UnlockScreen");
      } else {
        setError(response.data.message);
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: "ERROR",
          textBody: response.data.message,
          button: "Close",
        });
      }
    } catch (error) {
      setError(
        error.response?.data?.message || error.message || "An error occurred"
      );
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: "ERROR",
        textBody:
          error.response?.data?.message || error.message || "An error occurred",
        button: "Close",
      });
    } finally {
      setLoading(false);
      setPin("");
    }
  };

  return (
    <AlertNotificationRoot style={styles.container}>
      <SafeAreaView style={styles.container}>
        <Loader visible={loading} />
        <ScrollView style={styles.svContainer}>
          <View style={styles.spacer} />

          {/* Display Current Schedule in a Box */}
          {currentSchedule && (
            <View style={styles.box}>
              {/* Blinking "Access By" text */}
              <Animated.Text
                style={[styles.occupiedText, { opacity }]}
              >
                Access By:
              </Animated.Text>
              <Text style={styles.scheduleInstructor}>
                {currentSchedule.instructorName || "Unknown Instructor"}
              </Text>
              <Text style={styles.scheduleTitle}>
                Course: {currentSchedule.name}
              </Text>
              <Text style={styles.scheduleCode}>
                Code: {currentSchedule.code}
              </Text>
              <Text style={styles.scheduleTime}>
                Time: {formatTime(currentSchedule.start_time)} -{" "}
                {formatTime(currentSchedule.end_time)}
              </Text>
            </View>
          )}

          <Text style={styles.textTitle}>VERIFY IF YOU HAVE ACCESS</Text>
          <Text style={styles.textSubtitle}>Enter your 4-digit PIN</Text>
          <View style={styles.viewContainer}>
            <CustomPinInput
              value={pin}
              onChangeText={(text) => {
                setPin(text);
                setError(null);
              }}
              error={error}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </AlertNotificationRoot>
  );
};

const formatTime = (time) => {
  const [hours, minutes] = time.split(":");
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes} ${ampm}`;
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
  spacer: {
    height: 20,
  },
  box: {
    backgroundColor: "#e0e0e0",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 5,
  },
  scheduleCode: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 5,
  },
  scheduleTime: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 5,
  },
  scheduleInstructor: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 5,
  },
  occupiedText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#4CAF50", // Green color for occupied
    marginBottom: 10,
  },
  textTitle: {
    fontSize: 25,
    textAlign: "center",
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
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

export default VerifyPin;
