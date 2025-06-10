// components/CustomToast.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const CustomToast = ({ text1, text2, type = 'success' }) => {
  // Define gradient colors based on type
  const gradientColors =
    type === 'error'
      ? ['#ef4444', '#f87171', '#fca5a5'] // Red gradient for error
      : ['#10b981', '#34d399', '#6ee7b7']; // Green gradient for success (default)

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors}
        style={styles.toast}
        start={[0, 0]}
        end={[1, 1]}
      >
        <Text style={styles.text1}>{text1}</Text>
        {text2 ? <Text style={styles.text2}>{text2}</Text> : null}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '40%',
    left: '5%',
    right: '5%',
    alignItems: 'center',
    zIndex: 999,
  },
  toast: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  text1: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  text2: {
    fontSize: 14,
    color: '#e0f2f1',
    textAlign: 'center',
  },
});
