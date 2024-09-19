import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UnlockScreen = () => {
  const [userId, setUserId] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('');

  useEffect(() => {
    // Function to retrieve user ID from AsyncStorage
    const getUserId = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedData = JSON.parse(userData);
          setUserId(parsedData.id); // Assume userData has an id field
        }
      } catch (error) {
        console.error('Failed to load user data', error);
      }
    };

    getUserId();
  }, []);

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes}`; // H:i format
  };

  const getCurrentDay = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
  };

  const handleStatusChange = async (status) => {
    if (!userId) {
      Alert.alert('Error', 'User ID not found');
      return;
    }

    const currentTime = getCurrentTime();
    const currentDay = getCurrentDay();

    try {
      await axios.post('https://lockup.pro/api/logs', {
        user_id: userId,
        status,
        time: currentTime,  // Ensure this format is 'H:i'
        day: currentDay,
      });
      setCurrentStatus(status);
      Alert.alert('Success', `Status updated to ${status}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
      console.error('Failed to update status', error.response?.data || error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Unlock/Lock Screen</Text>
      <Button
        title="Unlock"
        onPress={() => handleStatusChange('unlock')}
      />
      <Button
        title="Lock"
        onPress={() => handleStatusChange('lock')}
      />
      <Text style={styles.statusText}>Current Status: {currentStatus}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statusText: {
    marginTop: 20,
    fontSize: 18,
  },
});

export default UnlockScreen;
