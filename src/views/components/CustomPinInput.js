import React from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";

const CustomPinInput = ({ value, onChangeText }) => {
  const handleChange = (text) => {
    if (/^\d*$/.test(text) && text.length <= 4) {
      onChangeText(text);
    }
  };

  const handleErase = () => {
    onChangeText(value.slice(0, -1));
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={handleChange}
        keyboardType="numeric"
        secureTextEntry
        maxLength={4}
        placeholder=""
        placeholderTextColor="transparent"
      />
      <View style={styles.circlesContainer}>
        {[...Array(4)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.circle,
              {
                backgroundColor: value.length > index ? "#1E293B" : "#E0E0E0", // Light gray for unfilled
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.numberPad}>
        {[1, 2, 3].map((number) => (
          <TouchableOpacity
            key={number}
            style={styles.numberButton}
            onPress={() => handleChange(value + number)}
          >
            <Text style={styles.numberText}>{number}</Text>
          </TouchableOpacity>
        ))}
        {[4, 5, 6].map((number) => (
          <TouchableOpacity
            key={number}
            style={styles.numberButton}
            onPress={() => handleChange(value + number)}
          >
            <Text style={styles.numberText}>{number}</Text>
          </TouchableOpacity>
        ))}
        {[7, 8, 9].map((number) => (
          <TouchableOpacity
            key={number}
            style={styles.numberButton}
            onPress={() => handleChange(value + number)}
          >
            <Text style={styles.numberText}>{number}</Text>
          </TouchableOpacity>
        ))}
        <View style={styles.lastRow}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            style={styles.numberButton}
            onPress={() => handleChange(value + "0")}
          >
            <Text style={styles.numberText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.eraseButton} onPress={handleErase}>
            <Text style={styles.eraseText}>×</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
  },
  input: {
    height: 0,
    width: 0,
    opacity: 0,
  },
  circlesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 220,
    marginBottom: 20,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 30,
    backgroundColor: "#E0E0E0", // Light gray for unfilled circles
    alignItems: "center",
    justifyContent: "center",
  },
  numberPad: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 240,
    justifyContent: "space-between",
  },
  numberButton: {
    width: 70,
    height: 70,
    backgroundColor: "#1E293B", // Teal color for buttons
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 5,
  },
  numberText: {
    color: "white",
    fontSize: 28,
  },
  eraseButton: {
    width: 70,
    height: 70,
    backgroundColor: "#B71C1C", // Red for the erase button
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 5,
    marginLeft: 15,
  },
  eraseText: {
    color: "white",
    fontSize: 28,
  },
  lastRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "135%",
  },
});

export default CustomPinInput;
