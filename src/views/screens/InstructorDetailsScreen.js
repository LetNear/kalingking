import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';

const InstructorDetailsScreen = ({ route }) => {
  const { instructor } = route.params; // Get the passed instructor data
  const [instructorData, setInstructorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInstructorData();
  }, []);

  const fetchInstructorData = async () => {
    try {
      const response = await axios.get('https://lockup.pro/api/instructors-subs-linked');
      const instructorsList = response.data || [];

      // Find the instructor by ID
      const instructorDetails = instructorsList.find(inst => inst.id === instructor.id);

      if (instructorDetails) {
        setInstructorData(instructorDetails);
      } else {
        setError('Instructor not found.');
      }
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch instructor data.');
      setLoading(false);
    }
  };

  if (loading) {
    return <Text style={styles.loadingText}>Loading...</Text>;
  }

  if (error) {
    return <Text style={styles.errorText}>Error: {error}</Text>;
  }

  if (!instructorData) {
    return <Text style={styles.errorText}>No data available for this instructor.</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.instructorName}>{instructorData.username}</Text>
      <Text style={styles.header}>Subjects:</Text>
      {instructorData.subjects && instructorData.subjects.length > 0 ? (
        instructorData.subjects.map(subject => (
          <View key={subject.id} style={styles.subjectContainer}>
            <Text style={styles.subjectTitle}>{subject.name}</Text>
            <Text style={styles.subjectCode}>Code: {subject.code}</Text>
            <Text style={styles.subjectDay}>Day: {subject.day}</Text>
            <Text style={styles.subjectTime}>
              Time: {formatTime(subject.start_time)} - {formatTime(subject.end_time)}
            </Text>
            <Text style={styles.subjectSection}>Section: {subject.section}</Text>
            <Text style={styles.subjectDescription}>{subject.description}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noDataText}>No subjects found for this instructor.</Text>
      )}
    </ScrollView>
  );
};

const formatTime = (time) => {
  const [hours, minutes, seconds] = time.split(':');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes} ${ampm}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  instructorName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  subjectContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  subjectCode: {
    fontSize: 16,
    color: '#666',
  },
  subjectDay: {
    fontSize: 16,
    color: '#666',
  },
  subjectTime: {
    fontSize: 16,
    color: '#666',
  },
  subjectSection: {
    fontSize: 16,
    color: '#666',
  },
  subjectDescription: {
    fontSize: 16,
    color: '#666',
  },
  noDataText: {
    fontSize: 16,
    color: '#333',
  },
  loadingText: {
    flex: 1,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
  },
  errorText: {
    flex: 1,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: 'red',
  },
});

export default InstructorDetailsScreen;
