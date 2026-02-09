/**
 * Cutting Plan Screen
 *
 * Display generated cut list grouped by material with grain direction and joinery adjustments.
 */

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type CuttingPlanScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CuttingPlan'>;
};

export default function CuttingPlanScreen({ navigation }: CuttingPlanScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cutting Plan Screen</Text>
      <Text style={styles.subtitle}>Cut list grouped by material with grain direction</Text>
      <Button
        title="View Visual Diagram"
        onPress={() => navigation.navigate('VisualDiagram')}
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
