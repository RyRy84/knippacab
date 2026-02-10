/**
 * Home Screen
 *
 * Landing screen for KnippaCab app.
 * Users can create new projects or load existing ones.
 */

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>KnippaCab</Text>
      <Text style={styles.subtitle}>Cabinet Design & Cut List Generator</Text>
      <View style={styles.buttonRow}>
        <Button
          title="Create New Project"
          onPress={() => navigation.navigate('ProjectSetup')}
        />
      </View>
      <View style={styles.buttonRow}>
        <Button
          title="Calculator Demo"
          onPress={() => navigation.navigate('CalculatorDemo')}
          color="#4CAF50"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1565C0',
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 32,
    color: '#666',
    textAlign: 'center',
  },
  buttonRow: {
    width: '100%',
    marginBottom: 12,
  },
});
