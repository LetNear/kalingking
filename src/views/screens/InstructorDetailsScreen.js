import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons'; // Import Ionicons from vector icons
import axios from 'axios';

const InstructorDetailsScreen = ({ route }) => {
  const { instructor } = route.params;
  const [instructorData, setInstructorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false); 
  const [selectedSubject, setSelectedSubject] = useState(null); 
  const navigation = useNavigation(); // Use navigation hook

  useEffect(() => {
    fetchInstructorData();
  }, []);

  const fetchInstructorData = async () => {
    try {
      const response = await axios.get('https://lockup.pro/api/instructors-subs-linked');
      const instructorsList = response.data || [];

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

  const openModal = (subject) => {
    setSelectedSubject(subject);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedSubject(null);
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#6200ea" style={styles.loader} />;
  }

  if (error) {
    return <Text style={styles.errorText}>Error: {error}</Text>;
  }

  if (!instructorData) {
    return <Text style={styles.errorText}>No data available for this instructor.</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Back and Home Buttons Container */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('DrawerNavigator')} style={styles.iconButton}>
          <Icon name="home" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.instructorName}>{instructorData.username}</Text>
        <Text style={styles.instructorEmail}>{instructorData.email}</Text> 
        <Text style={styles.header}>
          Courses <Text style={styles.lightText}>({instructorData.school_year}/{instructorData.semester})</Text>
        </Text>
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
              <TouchableOpacity onPress={() => openModal(subject)}>
                <Text style={styles.readMore}>Read more →</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No subjects found for this instructor.</Text>
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={closeModal} style={styles.closeButtonContainer}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
              {selectedSubject && (
                <>
                  <Text style={styles.modalTitle}>{selectedSubject.name}</Text>
                  <Text style={styles.modalText}>Code: {selectedSubject.code}</Text>
                  <Text style={styles.modalText}>Day: {selectedSubject.day}</Text>
                  <Text style={styles.modalText}>
                    Time: {formatTime(selectedSubject.start_time)} - {formatTime(selectedSubject.end_time)}
                  </Text>
                  <Text style={styles.modalText}>Section: {selectedSubject.section}</Text>
                  <Text style={styles.modalText}>School Year: {selectedSubject.school_year}</Text>
                  <Text style={styles.modalText}>Semester: {selectedSubject.semester}</Text>
                  <Text style={styles.modalText}>{selectedSubject.description}</Text>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  navigationContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
  },
  iconButton: {
    padding: 10,
    marginRight: 280,
  },
  scrollContainer: {
    paddingTop: 60, // Adjusts for back button space
    paddingHorizontal: 16,
  },
  instructorName: {
    fontSize: 35,
    fontWeight: '700',
    marginBottom: 5,
    color: '#333',
  },
  instructorEmail: { 
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    color: '#333',
  },
  lightText: {
    fontWeight: '500',
    fontSize: 16,
    color: '#666',
  },
  subjectContainer: {
    backgroundColor: '#e0e0e0',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  readMore: {
    fontSize: 16,
    color: '#1E88E5',
    marginTop: 5,
  },
  noDataText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: 'red',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollViewContent: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default InstructorDetailsScreen; 
