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
  SafeAreaView 
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

  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    getUserData();  // Get user data on mount
    fetchData();    // Fetch subject/instructor data on mount
    const intervalId = setInterval(fetchData, 1000);
    const timeIntervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Add animation loop for any UI effects (optional)
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

  useEffect(() => {
    if (matchedSubjects.length > 0) {
      saveCurrentSchedule(matchedSubjects[0]); // Save the first matching subject
    } else {
      saveCurrentSchedule(null); // Clear if no matching subject
    }
  }, [matchedSubjects]);

  const getUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData'); // Ensure 'userData' is the key used here
      if (userData) {
        const parsedData = JSON.parse(userData);
        console.log('User Details:', parsedData); // Log to confirm correct parsing
        setUserDetails(parsedData);
      } else {
        console.log("No user data found in AsyncStorage.");
      }
    } catch (error) {
      console.error('Failed to load user data', error);
    }
  };

  const saveCurrentSchedule = async (subject) => {
    try {
      if (subject) {
        const subjectWithInstructor = {
          ...subject,
          instructorName: subjectInstructorMap[subject.id]?.instructorName || 'Unknown Instructor',
        };
        await AsyncStorage.setItem('currentSchedule', JSON.stringify(subjectWithInstructor));
      } else {
        await AsyncStorage.removeItem('currentSchedule');
      }
    } catch (error) {
      console.error('Failed to save schedule data', error);
    }
  };

  const fetchData = async () => {
    try {
      const subjectsResponse = await axios.get('https://lockup.pro/api/subs');
      const fetchedSubjects = subjectsResponse.data.data || [];
      setSubjects(fetchedSubjects);

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

  const fetchInstructors = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://lockup.pro/api/instructors');
      setInstructors(response.data.data || []);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
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

  const getCurrentDay = () => {
    return currentTime.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const isTimeWithinRange = (startTime, endTime, day) => {
    const [startHours, startMinutes] = startTime.split(':');
    const [endHours, endMinutes] = endTime.split(':');

    const start = new Date(currentTime);
    const end = new Date(currentTime);
    const now = new Date(currentTime);

    start.setHours(parseInt(startHours), parseInt(startMinutes), 0);
    end.setHours(parseInt(endHours), parseInt(endMinutes), 0);

    // Check if the current time falls within the start and end time and if the day matches
    return now >= start && now <= end && day === getCurrentDay();
  };

  const matchingSubjects = subjects.filter(subject => isTimeWithinRange(subject.start_time, subject.end_time, subject.day));

  if (loading) {
    return <ActivityIndicator size="large" color="#6200ea" style={styles.loader} />;
  }

  if (error) {
    return <Text style={styles.error}>Error: {error.message}</Text>;
  }

  const groupedSubjects = Object.keys(instructorSubjectMap).map(instructorId => ({
    instructorName: instructors.find(inst => inst.id === parseInt(instructorId))?.username || 'Unknown Instructor',
    subjects: instructorSubjectMap[instructorId] || [],
  }));

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
                    <Text style={styles.subjectDescription}>
                      {subject.description}
                      <TouchableOpacity>
                        <Text style={styles.readMore}> Read more →</Text>
                      </TouchableOpacity>
                    </Text>
                    <Text style={styles.subjectOccupiedBy}>Occupied By: {subjectInstructorMap[subject.id]?.instructorName || 'Unknown Instructor'}</Text>
                  </React.Fragment>
                ))
              ) : (
                <Text style={styles.noDataText}>No subjects starting at the current time</Text>
              )}
            </View>
            <Text style={styles.scheduleText}>MACLAB SCHEDULE</Text>
            {groupedSubjects.map(group => (
              <View key={group.instructorName} style={styles.group}>
                <Text style={styles.instructorHeader}>{group.instructorName}</Text>
                {group.subjects.length > 0 ? (
                  group.subjects.map(subject => (
                    <View key={subject.id} style={styles.subjectContainer}>
                      <Text style={styles.subjectTitle}>{subject.name}</Text>
                      <Text style={styles.subjectCode}>Code: {subject.code}</Text>
                      <Text style={styles.subjectDay}>Every: {subject.day}</Text>
                      <Text style={styles.subjectTime}>Time: {formatTime(subject.start_time)} - {formatTime(subject.end_time)}</Text>
                      <Text style={styles.subjectSection}>Section: {subject.section}</Text>
                      <Text style={styles.subjectDescription}>
                        {subject.description}
                        <TouchableOpacity>
                          <Text style={styles.readMore}> Read more →</Text>
                        </TouchableOpacity>
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noDataText}>No subjects available</Text>
                )}
              </View>
            ))}
          </ScrollView>
        );
        case 'People':
  return (
    <ScrollView style={styles.scrollableContainer}>
      {instructors
        .filter(instructor => instructor.id !== userDetails?.id) // Filter out the logged-in instructor
        .map(instructor => (
          <View key={instructor.id} style={styles.instructorContainer}>
            <Text style={styles.instructorNameText}>{instructor.username}</Text>
          </View>
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
        {/* Display username if available, else show 'User' */}
        <Text style={styles.nameText}>{userDetails?.username || 'User'}</Text>
      </View>
      <View style={styles.navbar}>
        <TouchableOpacity
          style={[styles.navButton, selectedButton === 'Overview' && styles.selectedButton]}
          onPress={() => setSelectedButton('Overview')}
        >
          <Text style={[styles.navButtonText, selectedButton === 'Overview' && styles.selectedButtonText]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, selectedButton === 'People' && styles.selectedButton]}
          onPress={() => {
            setSelectedButton('People');
            fetchInstructors(); // Fetch instructors when People is selected
          }}
        >
          <Text style={[styles.navButtonText, selectedButton === 'People' && styles.selectedButtonText]}>People</Text>
        </TouchableOpacity>
      </View>
      {renderContent()}
      <Animated.View style={[styles.timeContainer, { opacity }]}>
        <Text style={styles.dateText}>{getFormattedDate()}</Text>
        <Text style={styles.timeText}>{getCurrentTimeFormatted()}</Text>
      </Animated.View>
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
  subjectDescription: {
    fontSize: 14,
    color: '#666',
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
    color: '#4CAF50', // Green color
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
});

export default HomeScreen;
