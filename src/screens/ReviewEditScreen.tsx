/**
 * Review & Edit Screen
 *
 * Review all configured cabinets and make final adjustments before generating cutting plan.
 */

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type ReviewEditScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ReviewEdit'>;
};

export default function ReviewEditScreen({ navigation }: ReviewEditScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Review & Edit Screen</Text>
      <Text style={styles.subtitle}>Review all cabinets and make final adjustments</Text>
      <Button
        title="Generate Cutting Plan"
        onPress={() => navigation.navigate('CuttingPlan')}
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
