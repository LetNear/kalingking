import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';

const EquipmentUsageScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Equipment Usage</Text>
      </View>
      
      <Image 
        source={require('../imglogo/equipment_usage.png')} // Replace with your image path
        style={styles.image}
      />
      
      <View style={styles.contentContainer}>
        <Text style={styles.contentTitle}>Guidelines:</Text>
        <Text style={styles.contentText}>
          1. Handle all equipment with care and respect. Ensure that all devices are used as intended and according to the provided instructions.
        </Text>
        <Text style={styles.contentText}>
          2. Report any malfunctioning or damaged equipment to the lab supervisor immediately. Do not attempt to repair the equipment yourself.
        </Text>
        <Text style={styles.contentText}>
          3. Ensure that all equipment is turned off and returned to its designated place after use. Keep the workspace tidy.
        </Text>
        <Text style={styles.contentText}>
          4. Avoid eating or drinking near the equipment to prevent accidental spills and damage.
        </Text>
        <Text style={styles.contentText}>
          5. Unauthorized use of lab equipment is strictly prohibited. Ensure you have proper authorization before using any device.
        </Text>
        <Text style={styles.contentText}>
          6. If you are unsure about how to use any equipment, please ask for assistance from the lab supervisor or a designated staff member.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        {/* Previous Button */}
        <TouchableOpacity 
          style={styles.previousButton} 
          onPress={() => navigation.goBack()} // Navigate to the previous screen
        >
          <Text style={styles.buttonText}>Previous</Text>
        </TouchableOpacity>

        {/* Next Button */}
        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={() => navigation.navigate('SoftwareUsageScreen')} // Replace 'NextScreen' with your target screen
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  previousButton: {
    marginTop: 5,
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    marginTop: 5,
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end', // Aligns the button to the right
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
});

export default EquipmentUsageScreen;
