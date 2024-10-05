import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QrScanWithUser = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');

      const user = await AsyncStorage.getItem('userData');
      if (user) {
        const userData = JSON.parse(user);
        setUserId(userData.id);
      }
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned) return; // Prevent multiple scans

    setScanned(true);
    console.log('QR Code Scanned:', data);

    try {
      const payload = {
        student_id: userId,
        qr: data,
      };

      // Log the payload
      console.log('Payload being sent to API:', payload);

      const response = await axios.post('https://lockup.pro/api/macs', payload);

      // Log the response
      console.log('API Response:', response);

      if (response.status === 201) {
        Alert.alert('Success', 'MAC address linked to student successfully!');
      } else {
        Alert.alert('Error', 'Failed to link MAC address.');
      }
    } catch (error) {
      // Log the error
      console.error('Error linking MAC address:', error);
      Alert.alert('Error', 'Failed to link MAC address.');
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default QrScanWithUser;
