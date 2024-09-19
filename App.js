import * as React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from '@react-navigation/native';

import HomeScreen from "./src/views/screens/HomeScreen";
import RegistrationScreen from "./src/views/screens/RegistrationScreen";
import LoginScreen from "./src/views/screensStudent/LoginScreen";
import MainLog from "./src/views/screens/MainLog";
import UnlockScreen from "./src/views/screens/UnlockScreen";
import MailScreen from "./src/views/screens/MailScreen";
import AddSchedule from "./src/views/screens/AddSchedule";
import LoginScreenInstructor from "./src/views/screens/LoginScreenInstructor";
import HomeScreenStudent from "./src/views/screensStudent/HomeScreenStudent";
import QrScanner from "./src/views/screensStudent/qrscanner";
import MailScreenStudent from "./src/views/screensStudent/MailScreenStudent";
import UnlinkSubjectScreen from "./src/views/screens/UnlinkSubjectScreen";
import QrScanWithUser from "./src/views/screensStudent/QrScanWithUser";
import ScanningChoice from "./src/views/screensStudent/ScanningChoice";
import VerifyPin from "./src/views/screens/VerifyPin";


// Define Navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Instructor's Tab Navigator
function InstructorTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBarStyle,
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Icon name="home" size={30} color={focused ? '#000' : '#666'} />
              <Text style={focused ? styles.iconTextFocused : styles.iconText}>HOME</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Unlock" 
        component={VerifyPin} 
        options={{
          tabBarIcon: () => (
            <View style={styles.iconContainer}>
              <View style={styles.circleButton}>
                <Icon name="unlock-alt" size={30} color="#ffffff" />
              </View>
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Mail" 
        component={MailScreen} 
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Icon name="envelope" size={30} color={focused ? '#000' : '#666'} />
              <Text style={focused ? styles.iconTextFocused : styles.iconText}>MAIL</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Student's Tab Navigator
function StudentTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBarStyle,
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreenStudent} 
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Icon name="home" size={30} color={focused ? '#000' : '#666'} />
              <Text style={focused ? styles.iconTextFocused : styles.iconText}>HOME</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="ScanningChoice" 
        component={ScanningChoice} 
        options={{
          tabBarIcon: () => (
            <View style={styles.iconContainer}>
              <View style={styles.circleButton}>
                <Icon name="qrcode" size={40} color="#ffffff" />
              </View>
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Mail" 
        component={MailScreenStudent} 
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Icon name="envelope" size={30} color={focused ? '#000' : '#666'} />
              <Text style={focused ? styles.iconTextFocused : styles.iconText}>MAIL</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Custom Drawer Content
function CustomDrawerContent(props) {
  const [userName, setUserName] = React.useState('User');
  const [userEmail, setUserEmail] = React.useState('');

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedData = JSON.parse(userData);
          if (parsedData.loggedIn) {
            setUserName(parsedData.fullname || 'User');
            setUserEmail(parsedData.email || '');
          }
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUserData();
  }, []);

  // Updated handleLogout to clear all AsyncStorage data
  const handleLogout = async () => {
    try {
      // Clear all AsyncStorage data
      await AsyncStorage.clear();

      // Reset navigation stack to MainLog
      props.navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'MainLog' }],
        })
      );
    } catch (error) {
      console.error('Failed to clear user data:', error);
    }
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <Image source={{ uri: 'https://via.placeholder.com/100' }} style={{ width: 100, height: 100, borderRadius: 50 }} />
        <Text style={styles.drawerHeaderText}>{userName}</Text>
        <Text style={styles.drawerEmailText}>{userEmail}</Text>
      </View>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Log out"
        icon={({ color, size }) => (
          <Icon name="sign-out" color={color} size={size} />
        )}
        onPress={handleLogout}
        style={styles.logoutButton}
      />
    </DrawerContentScrollView>
  );
}

// Instructor Drawer Navigator
function DrawerNavigator() {
  return (
    <Drawer.Navigator drawerContent={props => <CustomDrawerContent {...props} />}>
      <Drawer.Screen 
        name="HomeTabs" 
        component={InstructorTabNavigator} 
        options={{ 
          title: 'Home',
          drawerIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="Link Subject" 
        component={AddSchedule} 
        options={{ 
          title: 'Link Subject',
          drawerIcon: ({ color, size }) => (
            <Icon name="calendar-plus-o" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen 
        name="MailScreen" 
        component={MailScreen} 
        options={{ 
          title: 'Mail',
          drawerIcon: ({ color, size }) => (
            <Icon name="envelope" color={color} size={size} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

// Student Drawer Navigator
function DrawerNavigatorStudent() {
  return (
    <Drawer.Navigator drawerContent={props => <CustomDrawerContent {...props} />}>
      <Drawer.Screen 
        name="HomeTabs" 
        component={StudentTabNavigator} 
        options={{ 
          title: 'Home',
          drawerIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="MailScreenStudent" 
        component={MailScreenStudent} 
        options={{ 
          title: 'Mail',
          drawerIcon: ({ color, size }) => (
            <Icon name="envelope" color={color} size={size} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

// Main App Component
function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainLog" screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="DrawerNavigator"
          component={DrawerNavigator}
        />
        <Stack.Screen
          name="DrawerNavigatorStudent"
          component={DrawerNavigatorStudent}
        />
        <Stack.Screen
          name="MainLog"
          component={MainLog}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RegistrationScreen"
          component={RegistrationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddSchedule"
          component={AddSchedule}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LoginScreenInstructor"
          component={LoginScreenInstructor}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UnlinkSubjectScreen"
          component={UnlinkSubjectScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="QrScanWithUser"
          component={QrScanWithUser}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ScanningChoice"
          component={ScanningChoice}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="QrScanner"
          component={QrScanner}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UnlockScreen"
          component={UnlockScreen}
          options={{ headerShown: false }}
        />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBarStyle: {
    backgroundColor: '#ffffff',
    borderTopColor: '#dddddd',
    borderTopWidth: 1,
  },
  iconContainer: {
    alignItems: 'center',
  },
  iconText: {
    fontSize: 12,
    color: '#666',
  },
  iconTextFocused: {
    fontSize: 12,
    color: '#000',
  },
  circleButton: {
    width: 70,
    height: 70,
    borderRadius: 40,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  drawerHeader: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
  drawerHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  drawerEmailText: {
    fontSize: 14,
    color: '#666',
  },
  editButton: {
    backgroundColor: '#007bff',
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
  editButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 350, // This ensures the button is pushed to the bottom
  },
});

export default App;
