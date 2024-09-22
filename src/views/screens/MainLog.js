import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { useNavigation } from '@react-navigation/native';
import ccsLogo from "../../img/lck.png";

WebBrowser.maybeCompleteAuthSession();

const MainLog = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false); 
  const [loginType, setLoginType] = useState(null); // New state to track login type
  const navigation = useNavigation();

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: "545004980786-v088am8d8b97q2jillcf18c0cfjr69h5.apps.googleusercontent.com",
    androidClientId: "545004980786-5ptep15ld3vv3ibns21vuhvutrd38r85.apps.googleusercontent.com",
  });

  // Handle the Google login response
  useEffect(() => {
    if (response?.type === 'success' && response.authentication) {
      const fetchUserData = async () => {
        try {
          const user = await getUserinfo(response.authentication.accessToken);

          if (user) {
            console.log("User info fetched:", user);
            setUserInfo(user);

            // Fetch students and instructors concurrently
            const [students, instructors] = await Promise.all([
              fetchStudentsData(),
              fetchInstructorsData()
            ]);

            // Check if the user's email exists in the API response for either student or instructor
            const matchedStudent = students.find(student => student.email === user.email);
            const matchedInstructor = instructors.find(instructor => instructor.email === user.email);

            if (loginType === 'student' && matchedStudent) {
              await AsyncStorage.setItem('userData', JSON.stringify({
                ...matchedStudent,
                fullname: user.name, // Store full name
                picture: user.picture, // Store profile picture
                loggedIn: true // Set logged-in flag
              }));
              console.log("Student data stored:", matchedStudent);
              navigation.replace('DrawerNavigatorStudent', { userInfo: user });
            } else if (loginType === 'instructor' && matchedInstructor) {
              await AsyncStorage.setItem('userData', JSON.stringify({
                ...matchedInstructor,
                fullname: user.name, // Store full name
                picture: user.picture, // Store profile picture
                loggedIn: true // Set logged-in flag
              }));
              console.log("Instructor data stored:", matchedInstructor);
              navigation.replace('DrawerNavigator', { userInfo: user });
            } else {
              Alert.alert("Validation Error", "Your email is not registered, please contact the administrator.");
            }
          } else {
            Alert.alert("Error", "Failed to fetch user info.");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          Alert.alert("Error", "Failed to fetch user data.");
        } finally {
          setLoading(false); // Stop the loading spinner
        }
      };

      // Increased timeout to 30 seconds
      const timeout = setTimeout(() => {
        setLoading(false); // Stop the loading spinner
        Alert.alert("Error", "The request took too long, please try again.");
      }, 30000); // 30 seconds

      fetchUserData().finally(() => clearTimeout(timeout)); // Clear the timeout if the request completes before 30 seconds
    }
  }, [response]);

  // Fetch user info from Google API using access token
  const getUserinfo = async (token) => {
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch user info from Google');
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  };

  // Fetch students data from the given API
  const fetchStudentsData = async () => {
    try {
      const res = await fetch('https://lockup.pro/api/students');
      if (!res.ok) {
        throw new Error('Failed to fetch students data');
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching students data:', error);
      return [];
    }
  };

  // Fetch instructors data from the given API
  const fetchInstructorsData = async () => {
    try {
      const res = await fetch('https://lockup.pro/api/instructors');
      if (!res.ok) {
        throw new Error('Failed to fetch instructors data');
      }

      const data = await res.json();

      // Check if the response contains an array of instructors
      if (Array.isArray(data)) {
        return data; // Return the instructors array directly
      } else if (data.data && Array.isArray(data.data)) {
        return data.data; // Sometimes API responses wrap the array in a `data` field
      } else {
        throw new Error('Unexpected response structure');
      }
    } catch (error) {
      console.error('Error fetching instructors data:', error);
      return [];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.buttonContainer}>
        <Image style={styles.image} source={ccsLogo} />
        <Text style={styles.textTitle}>LOGIN AS</Text>

        {/* Instructor button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setLoginType('instructor'); // Set loginType to instructor
            setLoading(true); // Start the spinner
            promptAsync();  // Start Google login
          }}
        >
          {loading && loginType === 'instructor' ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Instructor</Text>
          )}
        </TouchableOpacity>

        {/* Student button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setLoginType('student'); // Set loginType to student
            setLoading(true); // Start the spinner
            promptAsync();  // Start Google login
          }}
        >
          {loading && loginType === 'student' ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Student</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.infoText}>
        Unlock the door using the LockUp-Based management System. Check the availability of MAC Laboratory. Manage your schedule, attendance, seating arrangement, and reports.
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 10,
  },
  textTitle: {
    fontSize: 25,
    textAlign: "center",
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#1E293B",
    paddingVertical: 15,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  image: {
    width: 255,
    height: 200,
    alignSelf: "center",
    marginBottom: 40,
  },
  infoText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginTop: 40,
  },
});

export default MainLog;
