import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UnlinkSubjectScreen = () => {
  const [subjects, setSubjects] = useState([]);
  const [linkedSubjects, setLinkedSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        const userData = userDataString ? JSON.parse(userDataString) : null;
        if (userData && userData.id) {
          setUserId(userData.id); // Store user_id for filtering linked subjects
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (userId !== null) {
      fetchSubjectsAndLinkedSubjects();
    }
  }, [userId]);

  const fetchSubjectsAndLinkedSubjects = async () => {
    setLoading(true);
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
        const filteredLinkedSubjects = linkedSubjectsResponse.data.data
          .filter(item => item.user_id === userId)
          .map(item => item.subject_id);
        setLinkedSubjects(filteredLinkedSubjects);
      } else {
        console.error('Unexpected data format for linked subjects:', linkedSubjectsResponse.data);
        Alert.alert('Error', 'Failed to load linked subjects.');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load subjects and linked subjects.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    const [hour, minute] = time.split(':');
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
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

  const filteredSubjects = subjects.filter(subject => linkedSubjects.includes(subject.id));

  const unlinkSubject = async () => {
    if (!selectedSubject) {
      Alert.alert('Error', 'Please select a subject to unlink.');
      return;
    }

    try {
      const response = await axios.delete('https://lockup.pro/api/linkedSubjects', {
        data: {
          user_id: userId,
          subject_id: selectedSubject.id,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        Alert.alert('Success', 'Subject unlinked successfully.');

        // Update the state by removing the unlinked subject
        setLinkedSubjects((prevLinkedSubjects) =>
          prevLinkedSubjects.filter((subjectId) => subjectId !== selectedSubject.id)
        );
        setSelectedSubject(null); // Reset the selected subject
      } else {
        Alert.alert('Error', 'Failed to unlink the subject.');
      }
    } catch (error) {
      console.error('Error unlinking subject:', error);
      Alert.alert('Error', 'Failed to unlink the subject.');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Unlink a Subject</Text>
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
          <Text style={styles.detailText}>Day: {selectedSubject.day}</Text>
          <Text style={styles.detailText}>Time: {formatTime(selectedSubject.start_time)} to {formatTime(selectedSubject.end_time)}</Text>
          <Text style={styles.detailText}>Section: {selectedSubject.section}</Text>
          <Text style={styles.detailText}>{selectedSubject.description}</Text>
          <Text style={styles.readMore}>Read more →</Text>
        </View>
      )}

      <TouchableOpacity style={styles.unlinkButton} onPress={unlinkSubject}>
        <Text style={styles.unlinkButtonText}>Unlink Subject</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
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
    borderColor: '#ccc',
    borderRadius: 10,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  tableHeaderCell: {
    padding: 10,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableCell: {
    padding: 10,
    textAlign: 'center',
  },
  subjectName: {
    flex: 2,
    minWidth: 200,
  },
  subjectCode: {
    flex: 1,
    minWidth: 80,
  },
  dayCell: {
    flex: 1,
    minWidth: 80,
  },
  timeCell: {
    flex: 1,
    minWidth: 80,
  },
  sectionCell: {
    flex: 1,
    minWidth: 80,
  },
  selectedRow: {
    backgroundColor: '#e0e0e0',
  },
  detailContainer: {
    marginTop: 20,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailText: {
    fontSize: 16,
    marginVertical: 5,
  },
  readMore: {
    color: '#007BFF',
    marginTop: 10,
    fontWeight: 'bold',
  },
  unlinkButton: {
    marginTop: 20,
    paddingVertical: 15,
    backgroundColor: '#FF5733',
    borderRadius: 10,
    alignItems: 'center',
  },
  unlinkButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UnlinkSubjectScreen;
