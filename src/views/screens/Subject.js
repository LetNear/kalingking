import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import axios from "axios"; // Assuming you fetch subjects from your Laravel API

const Subject = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      // Fetch subjects from your Laravel API
      const response = await axios.get('http://192.168.101.2:8000/api/subs');
      setSubjects(response.data);
      setLoading(false);
    } catch (error) {
      console.log("Error fetching subjects: ", error);
      setLoading(false);
    }
  };

  const handleEnroll = (subject) => {
    // Here you can make a POST request to your Laravel backend to enroll the student in the subject
    Alert.alert(
      "Enroll Subject",
      `Are you sure you want to enroll in ${subject.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Enroll",
          onPress: () => {
            // You can send the enrollment data here
            Alert.alert("Success", `You have been enrolled in ${subject.name}.`);
          },
        },
      ],
    );
  };

  const renderSubject = ({ item }) => (
    <View style={styles.subjectContainer}>
      <View style={styles.subjectInfo}>
        <Text style={styles.subjectName}>{item.name}</Text>
        <Text style={styles.subjectCode}>Code: {item.code}</Text>
        <Text style={styles.subjectDescription}>{item.description}</Text>
      </View>
      <TouchableOpacity
        style={styles.enrollButton}
        onPress={() => handleEnroll(item)}
      >
        <Text style={styles.enrollButtonText}>Enroll</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Subjects</Text>
      {loading ? (
        <Text style={styles.loadingText}>Loading subjects...</Text>
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSubject}
          ListEmptyComponent={<Text style={styles.noSubjectsText}>No subjects available</Text>}
        />
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  noSubjectsText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  subjectContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  subjectCode: {
    fontSize: 14,
    color: "#666",
  },
  subjectDescription: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
  },
  enrollButton: {
    backgroundColor: "#28a745",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  enrollButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Subject;
