import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

const mockEmails = [
  {
    id: '1',
    sender: 'john@example.com',
    subject: 'Meeting Reminder',
    message: 'Don\'t forget about our meeting tomorrow at 10am.',
    date: '2024-06-25',
  },
  {
    id: '2',
    sender: 'jane@example.com',
    subject: 'Project Update',
    message: 'Here is the latest update on the project.',
    date: '2024-06-24',
  },
  {
    id: '3',
    sender: 'alice@example.com',
    subject: 'Invoice',
    message: 'Please find the attached invoice for last month.',
    date: '2024-06-23',
  },
];

const MailScreenStudent = () => {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.emailContainer}>
      <Text style={styles.emailSender}>{item.sender}</Text>
      <Text style={styles.emailSubject}>{item.subject}</Text>
      <Text style={styles.emailDate}>{item.date}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={mockEmails}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 10,
  },
  emailContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  emailSender: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emailSubject: {
    fontSize: 14,
    color: '#333',
    marginVertical: 5,
  },
  emailDate: {
    fontSize: 12,
    color: '#666',
  },
});

export default MailScreenStudent;
