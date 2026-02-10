import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase } from './src/db/init';
import { useSettingsStore } from './src/store/settingsStore';

/**
 * App.tsx — Entry Point
 *
 * Responsibilities:
 * 1. Initialize SQLite database (creates tables on first launch, runs migrations)
 * 2. Load user settings into the settings store
 * 3. Show a loading screen while initialization runs
 * 4. Render the navigation stack once ready
 *
 * WHY INITIALIZE HERE?
 * The database must be ready before any screen renders — screens immediately
 * read from the DB when they mount. Doing init in App.tsx ensures the DB
 * is always ready before navigation starts.
 *
 * C# COMPARISON:
 * This is equivalent to the Startup.cs ConfigureServices() call in ASP.NET —
 * infrastructure setup happens once at the entry point before anything else runs.
 */
export default function App() {
  const [isReady, setIsReady] = React.useState(false);
  const [initError, setInitError] = React.useState<string | null>(null);

  const loadSettings = useSettingsStore((s) => s.loadSettings);

  useEffect(() => {
    async function initialize() {
      try {
        // 1. Open database and run any pending migrations
        initDatabase();

        // 2. Load user settings from DB into the settings store
        loadSettings();

        // 3. Mark app as ready — show the navigator
        setIsReady(true);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setInitError(`Failed to start: ${message}`);
      }
    }

    initialize();
  }, []);

  // Show error screen if initialization failed
  if (initError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Startup Error</Text>
        <Text style={styles.errorMessage}>{initError}</Text>
      </View>
    );
  }

  // Show loading indicator while initializing
  if (!isReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Starting KnippaCab...</Text>
      </View>
    );
  }

  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
});
