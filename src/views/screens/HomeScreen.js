import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Animated, 
  SafeAreaView, 
  Modal 
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [selectedButton, setSelectedButton] = useState('Overview');
  const [subjects, setSubjects] = useState([]);
  const [matchedSubjects, setMatchedSubjects] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [subjectInstructorMap, setSubjectInstructorMap] = useState({});
  const [instructorSubjectMap, setInstructorSubjectMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isModalVisible, setIsModalVisible] = useState(false); 
  const [selectedSubject, setSelectedSubject] = useState(null); 
  const [schoolYear, setSchoolYear] = useState(null);
  const [semester, setSemester] = useState(null);

  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    getUserData();  
    fetchData();    
    const intervalId = setInterval(fetchData, 1000);
    const timeIntervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      clearInterval(intervalId);
      clearInterval(timeIntervalId);
    };
  }, []);

  const openModal = (subject) => {
    setSelectedSubject(subject);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedSubject(null);
  };

  const getUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        setUserDetails(parsedData);
      }
    } catch (error) {
      console.error('Failed to load user data', error);
    }
  };

  const fetchData = async () => {
    try {
      const subjectsResponse = await axios.get('https://lockup.pro/api/subs');
      const fetchedSubjects = subjectsResponse.data.data || [];
      setSubjects(fetchedSubjects);

      if (fetchedSubjects.length > 0) {
        setSchoolYear(fetchedSubjects[0].school_year);
        setSemester(fetchedSubjects[0].semester);
      }

      const subjectIdResponse = await axios.get('https://lockup.pro/api/linkedSubjects');
      const subjectIds = subjectIdResponse.data.data?.map(item => item.subject_id) || [];

      const instructorsResponse = await axios.get('https://lockup.pro/api/instructors');
      const fetchedInstructors = instructorsResponse.data.data || [];
      setInstructors(fetchedInstructors);

      const instructorSubjectResponse = await axios.get('https://lockup.pro/api/linkedSubjects');
      const instructorSubjects = instructorSubjectResponse.data.data || [];

      const subjectInstructorMap = {};
      const instructorSubjectMap = {};

      instructorSubjects.forEach(instructorSubject => {
        const subject = fetchedSubjects.find(sub => sub.id === instructorSubject.subject_id);
        const instructor = fetchedInstructors.find(inst => inst.id === instructorSubject.user_id);
        if (subject && instructor) {
          subjectInstructorMap[subject.id] = subjectInstructorMap[subject.id] || {
            ...subject,
            instructorName: instructor.username,
          };
          instructorSubjectMap[instructor.id] = instructorSubjectMap[instructor.id] || [];
          instructorSubjectMap[instructor.id].push(subject);
        }
      });

      setSubjectInstructorMap(subjectInstructorMap);

      const filteredSubjects = fetchedSubjects.filter(subject => subjectIds.includes(subject.id));
      setMatchedSubjects(filteredSubjects);
      setInstructorSubjectMap(instructorSubjectMap);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };
  

  const getCurrentTimeFormatted = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const getFormattedDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return currentTime.toLocaleDateString('en-US', options);
  };

  // Updated matchingSubjects to filter by day and time range
  const matchingSubjects = subjects.filter(subject => {
    const isToday = subject.day === currentTime.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTimeMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const [startHour, startMinute] = subject.start_time.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const [endHour, endMinute] = subject.end_time.split(':').map(Number);
    const endMinutes = endHour * 60 + endMinute;

    return isToday && currentTimeMinutes >= startMinutes && currentTimeMinutes < endMinutes;
  });

  if (loading) {
    return <ActivityIndicator size="large" color="#6200ea" style={styles.loader} />;
  }

  if (error) {
    return <Text style={styles.error}>Error: {error.message}</Text>;
  }

  const renderContent = () => {
    switch (selectedButton) {
      case 'Overview':
        return (
          <ScrollView style={styles.scrollableContainer}>
            <Image
              source={require('../imglogo/ccslogo.png')} 
              style={styles.image}
            />
            <View style={styles.textContainer}>
              <Text style={styles.mainText}>Mac Laboratory</Text>
              <Text style={styles.subText}>COLLEGE OF COMPUTER STUDIES</Text>
            </View>
            <View style={styles.box}>
              {matchingSubjects.length > 0 ? (
                matchingSubjects.map(subject => (
                  <React.Fragment key={subject.id}>
                    <Animated.Text style={[styles.occupiedText, { opacity }]}>OCCUPIED</Animated.Text>
                    <Text style={styles.subjectTitle}>{subject.name}</Text>
                    <Text style={styles.subjectCode}>Code: {subject.code}</Text>
                    <Text style={styles.subjectDay}>Every: {subject.day}</Text>
                    <Text style={styles.subjectTime}>Time: {formatTime(subject.start_time)} - {formatTime(subject.end_time)}</Text>
                    <Text style={styles.subjectSection}>Section: {subject.section}</Text>                 
                    <Text style={styles.subjectOccupiedBy}>Occupied By: {subjectInstructorMap[subject.id]?.instructorName || 'Unknown Instructor'}</Text>
                  </React.Fragment>
                ))
              ) : (
                <Text style={styles.noDataText}>No subjects starting at the current time</Text>
              )}
            </View>

            <Text style={styles.scheduleText}>MACLAB SCHEDULE</Text>
            <Text style={styles.schoolYearText}>School Year: {schoolYear || 'N/A'} | Semester: {semester || 'N/A'}</Text>

            {Object.keys(instructorSubjectMap).map(instructorId => (
              <View key={instructorId} style={styles.group}>
                <Text style={styles.instructorHeader}>
                  {instructors.find(inst => inst.id === parseInt(instructorId))?.username || 'Unknown Instructor'}
                </Text>
                {instructorSubjectMap[instructorId].map(subject => (
                  <View key={subject.id} style={styles.subjectContainer}>
                    <Text style={styles.subjectTitle}>{subject.name}</Text>
                    <Text style={styles.subjectCode}>Code: {subject.code}</Text>
                    <Text style={styles.subjectDay}>Every: {subject.day}</Text>
                    <Text style={styles.subjectTime}>Time: {formatTime(subject.start_time)} - {formatTime(subject.end_time)}</Text>
                    <Text style={styles.subjectSection}>Section: {subject.section}</Text>
                    <View style={styles.readMoreContainer}>
                      <TouchableOpacity onPress={() => openModal(subject)}>
                        <Text style={styles.readMore}> Read more →</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        );

      case 'People':
        return (
          <ScrollView style={styles.scrollableContainer}>
            {instructors
              .filter(instructor => instructor.id !== userDetails?.id)
              .map(instructor => (
                <TouchableOpacity
                  key={instructor.id}
                  style={styles.instructorContainer}
                  onPress={() => navigation.navigate('InstructorDetailsScreen', { instructor })} 
                >
                  <Text style={styles.instructorNameText}>{instructor.username}</Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        );

      default:
        return <Text style={styles.contentText}>Welcome to Home Screen</Text>;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.welcomeText}>Welcome, </Text>
        <Text style={styles.nameText}>{userDetails?.username || 'User'}</Text>
      </View>
      <View style={styles.navbar}>
        <TouchableOpacity
          style={[styles.navButton, selectedButton === 'Overview' && styles.selectedButton]}
          onPress={() => setSelectedButton('Overview')}
        >
          <Text style={[styles.navButtonText, selectedButton === 'Overview' && styles.selectedButtonText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, selectedButton === 'People' && styles.selectedButton]}
          onPress={() => {
            setSelectedButton('People');
            fetchData(); 
          }}
        >
          <Text style={[styles.navButtonText, selectedButton === 'People' && styles.selectedButtonText]}>
            Instructors
          </Text>
        </TouchableOpacity>
      </View>
      {renderContent()}
      <View style={styles.timeContainer}>
        <Text style={styles.dateText}>{getFormattedDate()}</Text>
        <Text style={styles.timeText}>{getCurrentTimeFormatted()}</Text>
      </View>

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
            <Text style={styles.modalText}>Time: {formatTime(selectedSubject.start_time)} - {formatTime(selectedSubject.end_time)}</Text>
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


    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,
  },
  headerContainer: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 22,
    color: "#333",
  },
  nameText: {
    fontSize: 35,
    fontWeight: "700",
    color: "#333",
  },
  navbar: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  navButton: {
    backgroundColor: '#e0e0e0',
    height: 35,
    paddingHorizontal: 15,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    minWidth: 100,
  },
  selectedButton: {
    backgroundColor: '#1E293B',
  },
  navButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  selectedButtonText: {
    color: '#fff',
  },
  contentContainer: {
    flex: 1,
  },
  scrollableContainer: {
    flex: 1,
  },
  image: {
    position: 'absolute',
    left: -110,
    top: 0,
    width: 280,
    height: 65,
    resizeMode: 'contain',
  },
  textContainer: {
    paddingTop: 2,
    paddingBottom: 5,
    alignItems: 'center',
  },
  mainText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
    marginLeft: -10,
  },
  subText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'left',
    marginLeft: 30,
    marginBottom: 15,
  },
  boxContainer: {
    marginTop: 100,
    paddingHorizontal: 10,
  },
  box: {
    backgroundColor: '#e0e0e0',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleText: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  schoolYearText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 10,
  },
  group: {
    marginBottom: 20,
  },
  instructorHeader: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#333',
  },
  subjectContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    marginBottom: 10,
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  subjectCode: {
    fontSize: 14,
    color: '#666',
  },
  subjectDay: {
    fontSize: 14,
    color: '#666',
  },
  subjectTime: {
    fontSize: 14,
    color: '#666',
  },
  subjectSection: {
    fontSize: 14,
    color: '#666',
  },
  readMoreContainer: {
    alignItems: 'flex-end',
  },
  readMore: {
    fontSize: 14,
    color: '#1E88E5',
  },
  noDataText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    color: 'red',
    fontSize: 18,
  },
  contentText: {
    fontSize: 16,
    color: '#333',
  },
  occupiedText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#4CAF50', 
    marginBottom: 1,
  },
  timeContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  dateText: {
    fontSize: 18,
    color: '#666',
  },
  timeText: {
    fontSize: 18,
    color: '#666',
  },
  instructorContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  instructorNameText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
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
  closeButton: {
    fontSize: 18,
    color: '#1E88E5',
    marginTop: 20,
  }, 
  closeButtonContainer: {
    position: 'absolute',
    top: 10, // Position from the top
    right: 10, // Position from the right
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    borderRadius: 15, // Circular button
    width: 30, // Adjust size of the button
    height: 30, // Adjust size of the button
    justifyContent: 'center', // Center the X
    alignItems: 'center', // Center the X
    zIndex: 1,
  },
  
  closeButtonText: {
    color: '#fff', // White text for the X
    fontSize: 20, // Size of the X
    fontWeight: 'bold', // Make it bold
  },  
  
});

export default HomeScreen;
