import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient'; // Ensure you install this package

const UnlockScreen = () => {
  const [userId, setUserId] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('');
  const [buttonScale] = useState(new Animated.Value(1)); // Animation scale state

  useEffect(() => {
    const getUserId = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedData = JSON.parse(userData);
          setUserId(parsedData.id);
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
    return `${formattedHours}:${formattedMinutes}`;
  };

  const getCurrentDay = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
  };

  const handleButtonPress = (status) => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 3,
    }).start(() => handleStatusChange(status));
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
        time: currentTime,
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
    <LinearGradient
      colors={['#6dd5ed', '#2193b0']}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Unlock/Lock Screen</Text>
        <View style={styles.buttonContainer}>
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[styles.button, styles.unlockButton]}
              onPress={() => handleButtonPress('unlocked')}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Unlock</Text>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[styles.button, styles.lockButton]}
              onPress={() => handleButtonPress('locked')}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Lock</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Current Status:</Text>
          <View
            style={[
              styles.statusIndicator,
              currentStatus === 'unlocked'
                ? styles.statusUnlocked
                : styles.statusLocked,
            ]}
          >
            <Text style={styles.statusText}>
              {currentStatus ? currentStatus.toUpperCase() : 'UNKNOWN'}
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  unlockButton: {
    backgroundColor: '#4caf50',
    marginRight: 15,
  },
  lockButton: {
    backgroundColor: '#f44336',
    marginLeft: 15,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  statusContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
  },
  statusIndicator: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 3,
  },
  statusUnlocked: {
    backgroundColor: '#4caf50',
  },
  statusLocked: {
    backgroundColor: '#f44336',
  },
  statusText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default UnlockScreen;
