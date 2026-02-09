/**
 * Cabinet Builder Screen
 *
 * Configure cabinet type, dimensions, toe kick, and joinery method.
 */

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type CabinetBuilderScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CabinetBuilder'>;
};

export default function CabinetBuilderScreen({ navigation }: CabinetBuilderScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cabinet Builder Screen</Text>
      <Text style={styles.subtitle}>Configure cabinet type, dimensions, toe kick, and joinery</Text>
      <Button
        title="Add Drawers"
        onPress={() => navigation.navigate('DrawerBuilder')}
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
