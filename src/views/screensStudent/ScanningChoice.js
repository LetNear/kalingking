import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

const ScanningChoice = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanning, setScanning] = useState(true);
  const [selectedButton, setSelectedButton] = useState(null);

  useEffect(() => {
    const requestCameraPermission = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    requestCameraPermission();

    // Cleanup function to stop scanning if the component unmounts
    return () => {
      setScanning(false);
    };
  }, []);

  const handleNavigation = (screen, button) => {
    setSelectedButton(button);
    setScanning(false); // Stop scanning
    setTimeout(() => {
      navigation.navigate(screen); // Navigate to the selected screen
    }, 300); // Ensure there's enough time for the scanner to stop
  };

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanning) {
      console.log('QR Code Scanned:', data);
      // Handle scanned data here
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }

  if (!hasPermission) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {scanning && (
        <BarCodeScanner
          onBarCodeScanned={handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      <View style={styles.overlay}>
        <Text style={styles.title}>Choose Scanning Method</Text>
        <TouchableOpacity
          style={[
            styles.button,
            selectedButton === 'QrScanner' && styles.selectedButton,
          ]}
          onPress={() => handleNavigation('QrScanner', 'QrScanner')}
        >
          <Text style={[
            styles.buttonText,
            selectedButton === 'QrScanner' && styles.selectedButtonText,
          ]}>
            Scan QR Code For Attendance
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            selectedButton === 'QrScanWithUser' && styles.selectedButton,
          ]}
          onPress={() => handleNavigation('QrScanWithUser', 'QrScanWithUser')}
        >
          <Text style={[
            styles.buttonText,
            selectedButton === 'QrScanWithUser' && styles.selectedButtonText,
          ]}>
            Scan with Mac QR Code
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
  },
  button: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: Dimensions.get('window').width * 0.8,
  },
  selectedButton: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    color: '#000000',
    textAlign: 'center',
  },
  selectedButtonText: {
    color: '#ffffff',
  },
});

export default ScanningChoice;
