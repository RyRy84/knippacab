/**
 * Project Setup Screen
 *
 * Configure project settings: name, units (Imperial/Metric), default joinery method.
 */

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type ProjectSetupScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ProjectSetup'>;
};

export default function ProjectSetupScreen({ navigation }: ProjectSetupScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Project Setup Screen</Text>
      <Text style={styles.subtitle}>Configure project name, units, and default joinery</Text>
      <Button
        title="Continue to Cabinet Builder"
        onPress={() => navigation.navigate('CabinetBuilder')}
      />
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
});
