import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const AddSchedule = () => {
  const [subjects, setSubjects] = useState([]);
  const [linkedSubjects, setLinkedSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility
  const [noSubjectsMessage, setNoSubjectsMessage] = useState(null); // Track if no subjects message is returned

  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        const userData = userDataString ? JSON.parse(userDataString) : null;
        if (userData && userData.id) {
          setUserId(userData.id); // Store user_id for POST
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    const fetchSubjectsAndLinkedSubjects = async () => {
      try {
        const [subjectsResponse, linkedSubjectsResponse] = await Promise.all([
          axios.get('https://lockup.pro/api/subs'),
          axios.get('https://lockup.pro/api/linkedSubjects'),
        ]);

        // Handle subjects data
        if (subjectsResponse.data && Array.isArray(subjectsResponse.data.data)) {
          setSubjects(subjectsResponse.data.data);
          setNoSubjectsMessage(null); // Reset the message when subjects are found
        } else if (subjectsResponse.data.message) {
          setNoSubjectsMessage(subjectsResponse.data.message);
          setSubjects([]); // Prevent malfunction by setting empty array
        } else {
          console.error('Unexpected data format for subjects:', subjectsResponse.data);
          Alert.alert('Error', 'Failed to load subjects.');
          setSubjects([]); // Ensure subjects is an empty array
        }

        // Handle linked subjects data
        if (linkedSubjectsResponse.data && Array.isArray(linkedSubjectsResponse.data.data)) {
          setLinkedSubjects(linkedSubjectsResponse.data.data.map(item => item.subject_id));
        } else if (linkedSubjectsResponse.data.message) {
          console.error('No linked subjects:', linkedSubjectsResponse.data.message);
          setLinkedSubjects([]); // Set an empty array for linked subjects
        } else {
          console.error('Unexpected data format for linked subjects:', linkedSubjectsResponse.data);
          Alert.alert('Error', 'Failed to load linked subjects.');
          setLinkedSubjects([]); // Ensure linkedSubjects is an empty array
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to load subjects and linked subjects.');
        setSubjects([]); // Set empty arrays in case of an error
        setLinkedSubjects([]);
        setLoading(false);
      }
    };

    fetchUserData();
    fetchSubjectsAndLinkedSubjects();

    const intervalId = setInterval(() => {
      fetchSubjectsAndLinkedSubjects();
    }, 1000); // Refresh every 1 second

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []);

  const formatTime = (time) => {
    const [hour, minute] = time.split(':');
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleAddSchedule = async () => {
    if (!selectedSubject) {
      Alert.alert('Validation Error', 'Please select a subject.');
      return;
    }

    try {
      const scheduleData = {
        user_id: userId,
        subject_id: selectedSubject.id,
      };

      console.log('Submitting schedule data:', scheduleData);

      const response = await axios.post('https://lockup.pro/api/linkedSubjects', scheduleData);

      if (response.data) {
        console.log('Schedule added successfully:', response.data);
        Alert.alert('Success', 'Schedule added successfully!');
        setIsModalVisible(false); // Close modal after linking
      } else {
        console.log('Unexpected response data:', response.data);
        Alert.alert('Error', 'Failed to add schedule.');
      }
    } catch (error) {
      console.error('Failed to add schedule:', error);
      Alert.alert('Error', 'Failed to add schedule.');
    }
  };

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setIsModalVisible(true); // Open the modal when a subject is selected
  };

  const renderSubjectRow = (subject) => (
    <TouchableOpacity
      key={subject.id}
      style={[styles.tableRow]}
      onPress={() => handleSubjectSelect(subject)}
    >
      <Text style={[styles.tableCell, styles.subjectName]}>{subject.name}</Text>
      <Text style={[styles.tableCell, styles.subjectCode]}>{subject.code}</Text>
      <Text style={[styles.tableCell, styles.dayCell]}>{subject.day}</Text>
      <Text style={[styles.tableCell, styles.timeCell]}>{formatTime(subject.start_time)}</Text>
      <Text style={[styles.tableCell, styles.timeCell]}>{formatTime(subject.end_time)}</Text>
      <Text style={[styles.tableCell, styles.sectionCell]}>{subject.section}</Text>
    </TouchableOpacity>
  );

  const filteredSubjects = subjects.filter(subject => !linkedSubjects.includes(subject.id));

  if (loading) {
    return <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select a Subject</Text>
      {noSubjectsMessage ? (
        <Text style={styles.noSubjectsMessage}>{noSubjectsMessage}</Text> // Display message when no subjects
      ) : (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          <View style={styles.tableContainer}>
            <ScrollView horizontal>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, styles.subjectName]}>Subject Name</Text>
                  <Text style={[styles.tableHeaderCell, styles.subjectCode]}>Code</Text>
                  <Text style={[styles.tableHeaderCell, styles.dayCell]}>Day</Text>
                  <Text style={[styles.tableHeaderCell, styles.timeCell]}>Start Time</Text>
                  <Text style={[styles.tableHeaderCell, styles.timeCell]}>End Time</Text>
                  <Text style={[styles.tableHeaderCell, styles.sectionCell]}>Section</Text>
                </View>
                {filteredSubjects.map(renderSubjectRow)}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      )}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {selectedSubject && (
            <ScrollView>
              <Text style={styles.detailTitle}>{selectedSubject.name}</Text>
              <Text style={styles.detailText}>Code: {selectedSubject.code}</Text>
              <Text style={styles.detailText}>Every: {selectedSubject.day}</Text>
              <Text style={styles.detailText}>Time: {formatTime(selectedSubject.start_time)} to {formatTime(selectedSubject.end_time)}</Text>
              <Text style={styles.detailText}>Section: {selectedSubject.section}</Text>
              <Text style={styles.detailText}>{selectedSubject.description}</Text>
            </ScrollView>
          )}

          <TouchableOpacity style={styles.button} onPress={handleAddSchedule} disabled={!selectedSubject}>
            <Text style={styles.buttonText}>Link Subject</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  label: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noSubjectsMessage: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  tableContainer: {
    flex: 1,
  },
  table: {
    borderWidth: 1,
    borderColor: '#dcdcdc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    padding: 12,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dcdcdc',
  },
  tableCell: {
    padding: 12,
    textAlign: 'center',
  },
  subjectName: {
    flex: 2,
    minWidth: 180,
  },
  subjectCode: {
    flex: 1,
    minWidth: 100,
  },
  timeCell: {
    flex: 1,
    minWidth: 100,
  },
  sectionCell: {
    flex: 1,
    minWidth: 100,
  },
  dayCell: {
    flex: 1,
    minWidth: 100,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 5,
  },
  button: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default AddSchedule;
