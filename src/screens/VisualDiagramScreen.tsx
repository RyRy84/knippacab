/**
 * Visual Diagram Screen
 *
 * Display 2D cutting diagram showing optimized sheet goods layout.
 * Final screen in the workflow - includes export options.
 */

import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type VisualDiagramScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'VisualDiagram'>;
};

export default function VisualDiagramScreen({ navigation }: VisualDiagramScreenProps) {
  const handleExport = () => {
    Alert.alert('Export', 'Export functionality will be implemented here');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Visual Diagram Screen</Text>
      <Text style={styles.subtitle}>2D cutting diagram with optimized sheet goods layout</Text>
      <Button
        title="Export"
        onPress={handleExport}
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
