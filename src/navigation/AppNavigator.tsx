/**
 * App Navigator
 *
 * Main navigation structure for KnippaCab.
 * Uses React Navigation Native Stack Navigator for screen transitions.
 *
 * Screen Flow (from CLAUDE.md):
 * Home → Project Setup → Cabinet Builder → Drawer Builder →
 * Review/Edit → Generate Cutting Plan → Visual Diagram → Export
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

// Import placeholder screens
import HomeScreen from '../screens/HomeScreen';
import ProjectSetupScreen from '../screens/ProjectSetupScreen';
import CabinetBuilderScreen from '../screens/CabinetBuilderScreen';
import DrawerBuilderScreen from '../screens/DrawerBuilderScreen';
import ReviewEditScreen from '../screens/ReviewEditScreen';
import CuttingPlanScreen from '../screens/CuttingPlanScreen';
import VisualDiagramScreen from '../screens/VisualDiagramScreen';
import CalculatorDemoScreen from '../screens/CalculatorDemoScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'KnippaCab' }}
        />
        <Stack.Screen
          name="ProjectSetup"
          component={ProjectSetupScreen}
          options={{ title: 'Project Setup' }}
        />
        <Stack.Screen
          name="CabinetBuilder"
          component={CabinetBuilderScreen}
          options={{ title: 'Cabinet Builder' }}
        />
        <Stack.Screen
          name="DrawerBuilder"
          component={DrawerBuilderScreen}
          options={{ title: 'Drawer Builder' }}
        />
        <Stack.Screen
          name="ReviewEdit"
          component={ReviewEditScreen}
          options={{ title: 'Review & Edit' }}
        />
        <Stack.Screen
          name="CuttingPlan"
          component={CuttingPlanScreen}
          options={{ title: 'Cutting Plan' }}
        />
        <Stack.Screen
          name="VisualDiagram"
          component={VisualDiagramScreen}
          options={{ title: 'Visual Diagram' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
        <Stack.Screen
          name="CalculatorDemo"
          component={CalculatorDemoScreen}
          options={{ title: 'Calculator Demo' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
