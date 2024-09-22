import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, SafeAreaView, Image, ScrollView, Modal } from 'react-native';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';

const MailScreenStudent = () => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [fileUri, setFileUri] = useState(null);
  const [fileType, setFileType] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false); // State to control modal visibility

  const handleSendReport = () => {
    const apiUrl = 'https://your-api-url.com/api/send-report';

    const formData = new FormData();
    formData.append('to', to);
    formData.append('subject', subject);
    formData.append('message', message);

    if (fileUri) {
      formData.append('file', {
        uri: fileUri,
        type: fileType,
        name: fileUri.split('/').pop(),
      });
    }

    axios
      .post(apiUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(() => {
        Alert.alert('Success', 'Incident report sent successfully!');
      })
      .catch((error) => {
        Alert.alert('Error', 'Failed to send the incident report. Please try again.');
        console.error(error);
      });
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
        <TextInput
          style={[styles.input, styles.readOnlyInput]}
          placeholder="From"
          value="josecundo@my.cspc.edu.ph"
          editable={false}
        />

        <Text style={styles.label}>To</Text>
        <TextInput
          style={styles.input}
          placeholder="To"
          value={to}
          onChangeText={(text) => setTo(text)}
        />

        <Text style={styles.label}>Subject</Text>
        <TextInput
          style={styles.input}
          placeholder="Subject"
          value={subject}
          onChangeText={(text) => setSubject(text)}
        />

        <Text style={styles.label}>Compose Email</Text>
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

        {/* Modal for enlarged image view */}
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
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
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
  },
  readOnlyInput: {
    backgroundColor: '#e0e0e0',
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  fileButton: {
    backgroundColor: '#1E88E5',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
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
    backgroundColor: '#1E88E5',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
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
    color: '#1E88E5',
    fontWeight: '600',
  },
});

export default MailScreenStudent;
