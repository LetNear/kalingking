import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  SafeAreaView, 
  TouchableOpacity 
} from 'react-native';

const GeneralConductScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image 
          source={require('../imglogo/lab.png')} // Replace with your image path
          style={styles.headerImage}
        />
        <Text style={styles.title}>General Conduct</Text>
        <Text style={styles.contentText}>
          Welcome to the Mac Laboratory! To maintain a productive and respectful environment, we ask all users to follow these guidelines:
        </Text>
        
        <View style={styles.guidelineContainer}>
          <Text style={styles.guidelineTitle}>1. Respect Others</Text>
          <Text style={styles.guidelineText}>
            Please be considerate of others who are using the lab. Keep noise to a minimum, and avoid disruptive behavior.
          </Text>
        </View>

        <View style={styles.guidelineContainer}>
          <Text style={styles.guidelineTitle}>2. Maintain Cleanliness</Text>
          <Text style={styles.guidelineText}>
            Keep your workspace clean and tidy. Dispose of any trash in the designated bins and avoid leaving personal belongings unattended.
          </Text>
        </View>

        <View style={styles.guidelineContainer}>
          <Text style={styles.guidelineTitle}>3. Follow Instructions</Text>
          <Text style={styles.guidelineText}>
            Follow the instructions provided by lab staff or displayed in the lab. This includes proper use of equipment and adherence to lab rules.
          </Text>
        </View>

        <View style={styles.guidelineContainer}>
          <Text style={styles.guidelineTitle}>4. Report Issues</Text>
          <Text style={styles.guidelineText}>
            If you encounter any issues with the equipment or facilities, please report them to the lab staff immediately.
          </Text>
        </View>

        {/* Next Button */}
        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={() => navigation.navigate('EquipmentUsageScreen')} // Ensure this screen exists in your navigator
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContainer: {
    padding: 16,
    alignItems: 'center',
  },
  headerImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  contentText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  guidelineContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  guidelineTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  guidelineText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
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
  nextButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
});

export default GeneralConductScreen;
