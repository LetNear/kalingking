import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QrScanner = () => {
  const [hasPermission, setHasPermission] = useState(null); 
  const [scanned, setScanned] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');

      // Retrieve the user's name from AsyncStorage
      const user = await AsyncStorage.getItem('userData');
      if (user) {
        const userData = JSON.parse(user);
        setUserName(userData.name || 'Unknown User'); // Default to 'Unknown User' if no name
      }
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    Alert.alert('QR Code Scanned', `Scanned data: ${data}`);
  
    try {
      // Retrieve userName from AsyncStorage
      const user = await AsyncStorage.getItem('userData');
      let userName = '';
  
      if (user) {
        const userData = JSON.parse(user);
        userName = userData.name || 'Unknown User'; // Use 'Unknown User' if no name is found
      }
  
      // Log userName to ensure it has been retrieved properly
      console.log("Scanned by:", userName);
  
      // API call
      const response = await axios.post('https://lockup.pro/api/record-scan', {
        qr: data,
        scanned_by: userName
      });
  
      if (response.status === 201 || response.status === 200) {
        Alert.alert('Success', 'Scan recorded successfully!');
      } else {
        Alert.alert('Error', 'Failed to record the scan');
      }
    } catch (error) {
      if (error.response) {
        console.error('Error response:', error.response.data);
        Alert.alert('Error', `Failed to record the scan: ${error.response.data.message}`);
      } else {
        console.error('Error:', error.message);
        Alert.alert('Error', 'Failed to record the scan');
      }
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
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
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

export default QrScanner;
