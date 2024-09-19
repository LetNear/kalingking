import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, ActivityIndicator, Alert } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { useNavigation } from '@react-navigation/native';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);  // For showing a spinner during the entire process
  const navigation = useNavigation();

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: "545004980786-v088am8d8b97q2jillcf18c0cfjr69h5.apps.googleusercontent.com",
    androidClientId: "545004980786-5ptep15ld3vv3ibns21vuhvutrd38r85.apps.googleusercontent.com",
  });

  // Handle the Google login response
  useEffect(() => {
    if (response?.type === 'success' && response.authentication) {
      setLoading(true);  // Show spinner during Google login process
      const fetchUserData = async () => {
        try {
          const user = await getUserinfo(response.authentication.accessToken);
          
          if (user) {
            console.log("User info fetched:", user); // Debugging log
            setUserInfo(user); // Set the state for userInfo
            
            // After fetching user info, fetch student data
            const students = await fetchStudentsData();

            // Check if the user's email exists in the API response
            const matchedStudent = students.find(student => student.email === user.email);

            if (matchedStudent) {
              // Store student data in AsyncStorage
              await AsyncStorage.setItem('studentData', JSON.stringify(matchedStudent));
              console.log("Student data stored:", matchedStudent); // Debugging log
              
              navigation.replace('DrawerNavigatorStudent', { userInfo: user });
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
          setLoading(false);  // Stop the spinner after processing
        }
      };

      // Adding a timeout of 10 seconds
      const timeout = setTimeout(() => {
        setLoading(false);
        Alert.alert("Error", "The request took too long, please try again.");
      }, 10000); // 10 seconds

      fetchUserData().finally(() => clearTimeout(timeout)); // Clear the timeout if the request completes before 10 seconds
    } else {
      console.log("Google login response:", response); // Debugging log
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

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />  // Show spinner while loading
      ) : (
        <Button
          title="Login with Google"
          onPress={() => {
            console.log("Starting Google login session..."); // Debugging log
            promptAsync();
            setLoading(true);  // Start spinner as soon as login is initiated
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
