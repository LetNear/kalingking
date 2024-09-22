import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView 
} from 'react-native';

const SafetyProtocolsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Laboratory Safety Protocols</Text>
      </View>
      
      <Image 
        source={require('../imglogo/safety.png')} // Replace with your image path
        style={styles.image}
      />
      
      <View style={styles.contentContainer}>
        <Text style={styles.contentTitle}>Guidelines:</Text>
        <Text style={styles.contentText}>
          1. Proper Attire: Always wear appropriate clothing in the lab, including closed-toe shoes and safety glasses. Avoid loose clothing or accessories that could get caught in equipment.
        </Text>
        <Text style={styles.contentText}>
          2. Emergency Contacts: Know the location of emergency contact numbers, including lab supervisors and campus security. Familiarize yourself with emergency procedures, such as evacuation routes and assembly points.
        </Text>
        <Text style={styles.contentText}>
          3. Equipment and Electrical Safety: Handle all lab equipment with care. Report any damaged or malfunctioning equipment to the lab supervisor immediately. Avoid overloading power outlets and use only approved power strips.
        </Text>
        <Text style={styles.contentText}>
          4. Fire Safety: Know the location of fire extinguishers and proper usage. Avoid flammable materials near heat sources, and never tamper with smoke detectors or safety devices.
        </Text>
        <Text style={styles.contentText}>
          5. Cleanliness and Hazardous Materials: Keep your workstation clean and dispose of waste properly. Follow proper handling, storage, and disposal protocols for hazardous materials.
        </Text>
        <Text style={styles.contentText}>
          6. Emergency Response: Familiarize yourself with the location of first aid kits and report any injuries to the lab supervisor immediately. Know all emergency exits and participate in regular safety drills.
        </Text>
        <Text style={styles.contentText}>
          7. Incident Reporting: Report any accidents, spills, or unsafe conditions to the lab supervisor promptly and document incidents according to lab protocols.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  headerContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 10,
    marginBottom: 20,
  },
  contentContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  contentText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    lineHeight: 24,
  },
});

export default SafetyProtocolsScreen;
