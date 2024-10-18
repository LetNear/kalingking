import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import axios from "axios";

// Helper function to format time in 12-hour format
const formatTimeTo12Hour = (time24) => {
  const [hours, minutes] = time24.split(':');
  const period = +hours >= 12 ? 'PM' : 'AM';
  const adjustedHours = +hours % 12 || 12; // Convert to 12-hour format
  return `${adjustedHours}:${minutes} ${period}`;
};

const SubjectDetails = ({ route, navigation }) => {
  const { subjectId } = route.params; // Subject ID passed from navigation
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchSubjectDetails = async () => {
      try {
        const response = await axios.get('https://lockup.pro/api/subjectsNgStudent');
        const subjects = response.data;

        // Find the subject with the matching ID
        const selectedSubject = subjects.find(sub => sub.id === subjectId);

        if (selectedSubject) {
          setSubject(selectedSubject);
        } else {
          console.error("Subject not found");
        }
        setLoading(false); // Set loading to false once data is fetched
      } catch (error) {
        console.error("Failed to fetch subject details:", error);
        setLoading(false); // Set loading to false if an error occurs
      }
    };
    fetchSubjectDetails();
  }, [subjectId]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#6200ea" style={styles.loader} />
      ) : subject ? (
        <>
          <View style={styles.subjectHeader}>
            <Text style={styles.subjectName}>{subject.name}</Text>
            <Text style={styles.subjectCode}>{subject.code}</Text>
            <Text style={styles.subjectInfo}>
              {subject.day} ({formatTimeTo12Hour(subject.start_time)} - {formatTimeTo12Hour(subject.end_time)})
            </Text>
            <Text style={styles.subjectSection}>Section: {subject.section}</Text>
          </View>

          <Text style={styles.studentHeader}>Enrolled Students</Text>
          {subject.students.length > 0 ? (
            <FlatList
              data={subject.students}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.studentItem}>
                  <Text style={styles.studentName}>{item.name}</Text>
                  <Text style={styles.studentNumber}>{item.student_number}</Text>
                  <Text style={styles.studentEmail}>{item.email}</Text>
                </View>
              )}
            />
          ) : (
            <Text>No students enrolled yet.</Text>
          )}

          {/* Add a back button to navigate back to HomeScreen */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text>Error loading subject details.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9", // Match the background color with HomeScreen
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subjectHeader: {
    marginBottom: 20,
  },
  subjectName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333", // Matching text color
  },
  subjectCode: {
    fontSize: 18,
    color: "#555",
  },
  subjectInfo: {
    fontSize: 16,
    color: "#666",
  },
  subjectSection: {
    fontSize: 16,
    color: "#666",
  },
  studentHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333", // Matching text color
  },
  studentItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  studentName: {
    fontSize: 16,
    fontWeight: "600",
  },
  studentNumber: {
    fontSize: 14,
    color: "#666",
  },
  studentEmail: {
    fontSize: 14,
    color: "#666",
  },
  backButton: {
    backgroundColor: '#1E88E5',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default SubjectDetails;
