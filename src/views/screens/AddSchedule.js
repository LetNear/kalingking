import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const AddSchedule = () => {
  const [subjects, setSubjects] = useState([]);
  const [linkedSubjects, setLinkedSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
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

        if (subjectsResponse.data && Array.isArray(subjectsResponse.data.data)) {
          setSubjects(subjectsResponse.data.data);
        } else {
          console.error('Unexpected data format for subjects:', subjectsResponse.data);
          Alert.alert('Error', 'Failed to load subjects.');
        }

        if (linkedSubjectsResponse.data && Array.isArray(linkedSubjectsResponse.data.data)) {
          setLinkedSubjects(linkedSubjectsResponse.data.data.map(item => item.subject_id));
        } else {
          console.error('Unexpected data format for linked subjects:', linkedSubjectsResponse.data);
          Alert.alert('Error', 'Failed to load linked subjects.');
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to load subjects and linked subjects.');
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

        // No need to fetch data again as the interval will handle it
      } else {
        console.log('Unexpected response data:', response.data);
        Alert.alert('Error', 'Failed to add schedule.');
      }
    } catch (error) {
      console.error('Failed to add schedule:', error);
      Alert.alert('Error', 'Failed to add schedule.');
    }
  };

  const handleUnlinkSubject = () => {
    navigation.navigate('UnlinkSubjectScreen');
  };

  const renderSubjectRow = (subject) => (
    <TouchableOpacity
      key={subject.id}
      style={[
        styles.tableRow,
        selectedSubject && selectedSubject.id === subject.id ? styles.selectedRow : null,
      ]}
      onPress={() => setSelectedSubject(subject)}
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

      {selectedSubject && (
        <View style={styles.detailContainer}>
          <Text style={styles.detailTitle}>{selectedSubject.name}</Text>
          <Text style={styles.detailText}>Code: {selectedSubject.code}</Text>
          <Text style={styles.detailText}>Every: {selectedSubject.day}</Text>
          <Text style={styles.detailText}>Time: {formatTime(selectedSubject.start_time)} to {formatTime(selectedSubject.end_time)}</Text>
          <Text style={styles.detailText}>Section: {selectedSubject.section}</Text>
          <Text style={styles.detailText}>{selectedSubject.description}</Text>
          <Text style={styles.readMore}>Read more →</Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={handleAddSchedule} disabled={!selectedSubject}>
        <Text style={styles.buttonText}>Link Subject</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.unlinkButton} onPress={handleUnlinkSubject}>
        <Text style={styles.unlinkButtonText}>Unlink Subject</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  label: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: -10,
    marginBottom: 10
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
  selectedRow: {
    backgroundColor: '#f0f0f0',
  },
  detailContainer: {
    marginTop: 20,
    padding: 20,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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
  readMore: {
    color: '#007BFF',
    fontWeight: 'bold',
    marginTop: 10,
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
  unlinkButton: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FF5733',
    borderRadius: 8,
    alignItems: 'center',
  },
  unlinkButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default AddSchedule;
