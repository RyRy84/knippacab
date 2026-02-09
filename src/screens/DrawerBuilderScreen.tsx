/**
 * Drawer Builder Screen
 *
 * Configure drawer construction: corner joinery and bottom attachment method.
 */

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type DrawerBuilderScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DrawerBuilder'>;
};

export default function DrawerBuilderScreen({ navigation }: DrawerBuilderScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Drawer Builder Screen</Text>
      <Text style={styles.subtitle}>Configure drawer corner joinery and bottom attachment</Text>
      <Button
        title="Continue to Review"
        onPress={() => navigation.navigate('ReviewEdit')}
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
