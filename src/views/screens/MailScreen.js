import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, SafeAreaView, Image, ScrollView, Modal, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker'; // Import the picker

const MailScreen = () => {
  const [subject, setSubject] = useState(''); // Change from text input to picker value
  const [message, setMessage] = useState('');
  const [fileUri, setFileUri] = useState(null);
  const [fileType, setFileType] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fromEmail, setFromEmail] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(true);
  const toEmail = 'admin@admin.admin'; // Fixed "To" email

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userDetails = await AsyncStorage.getItem('userData'); 
        if (userDetails) {
          const parsedDetails = JSON.parse(userDetails);
          setFromEmail(parsedDetails.email);
        } else {
          console.error('User details not found in storage.');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoadingEmail(false);
      }
    };

    fetchUserDetails();
  }, []);

  const handleSendReport = async () => {
    const apiUrl = 'https://lockup.pro/api/reports'; 

    const formData = new FormData();
    formData.append('from_email', fromEmail); 
    formData.append('to_email', toEmail);
    formData.append('subject', subject);
    formData.append('message', message);

    if (fileUri) {
      formData.append('attachment', {
        uri: fileUri,
        type: fileType,
        name: fileUri.split('/').pop(),
      });
    }

    try {
      const response = await axios.post(apiUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert('Success', 'Incident report sent successfully!');
        setSubject('');
        setMessage('');
        setFileUri(null);
      } else {
        Alert.alert('Error', 'Unexpected response from the server.');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send the incident report. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleSelectFile = () => {
    const options = {
      mediaType: 'mixed',
      quality: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('Image Picker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        setFileUri(asset.uri);
        setFileType(asset.type);
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Incident Report</Text>

        <Text style={styles.label}>From</Text>
        {loadingEmail ? (
          <ActivityIndicator size="small" color="#1E88E5" />
        ) : (
          <TextInput
            style={[styles.input, styles.readOnlyInput]}
            placeholder="From"
            value={fromEmail}
            editable={false}
          />
        )}

        <Text style={styles.label}>To</Text>
        <TextInput
          style={[styles.input, styles.readOnlyInput]} 
          placeholder="To"
          value={toEmail}
          editable={false}
        />

        <Text style={styles.label}>Type</Text>
        <View style={[styles.input, styles.pickerContainer]}>
          <Picker
            selectedValue={subject}
            onValueChange={(itemValue) => setSubject(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select a Report Type" value="" />
            <Picker.Item label="Lost and Found" value="Lost and Found" />
            <Picker.Item label="Missing Paraphernalia" value="Missing Paraphernalia" />
            <Picker.Item label="Security Breach" value="Security Breach" />
            <Picker.Item label="Damage Report" value="Damage Report" />
          </Picker>
        </View>

        <Text style={styles.label}>Compose Report</Text>
        <TextInput
          style={[styles.input, styles.messageInput]}
          placeholder="Compose email"
          value={message}
          onChangeText={(text) => setMessage(text)}
          multiline
        />

        <TouchableOpacity style={styles.fileButton} onPress={handleSelectFile}>
          <Text style={styles.fileButtonText}>
            {fileUri ? 'Change File' : 'Upload Image/Video'}
          </Text>
        </TouchableOpacity>

        {fileUri && (
          <TouchableOpacity onPress={() => setIsModalVisible(true)}>
            <Image
              source={{ uri: fileUri }}
              style={styles.preview}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.sendButton} onPress={handleSendReport}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>

        <Modal
          visible={isModalVisible}
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <Image source={{ uri: fileUri }} style={styles.fullImage} resizeMode="contain" />
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  readOnlyInput: {
    backgroundColor: '#e0e0e0',
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    justifyContent: 'center',
  },
  picker: {
    height: '100%',
    width: '100%',
  },
  fileButton: {
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  fileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  preview: {
    width: '100%',
    height: 200,
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
  },
  sendButton: {
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '90%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#1E293B',
    fontWeight: '600',
  },
});

export default MailScreen;
