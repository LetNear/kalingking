import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import axios from "axios";

const SubjectDetails = ({ route }) => {
  const { subjectId } = route.params; // Subject ID passed from navigation
  const [subject, setSubject] = useState(null);

  useEffect(() => {
    // Fetch all subjects and filter the one we need
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
      } catch (error) {
        console.error("Failed to fetch subject details:", error);
      }
    };
    fetchSubjectDetails();
  }, [subjectId]);

  return (
    <View style={styles.container}>
      {subject ? (
        <>
          <View style={styles.subjectHeader}>
            <Text style={styles.subjectName}>{subject.name}</Text>
            <Text style={styles.subjectCode}>{subject.code}</Text>
            <Text style={styles.subjectInfo}>
              {subject.day} ({subject.start_time} - {subject.end_time})
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
        </>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  subjectHeader: {
    marginBottom: 20,
  },
  subjectName: {
    fontSize: 22,
    fontWeight: "bold",
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
});

export default SubjectDetails;
