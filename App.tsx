/**
 * VL Tester App
 * Aplikasi untuk testing KTP OCR dan Receipt Approver
 */

import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { loadConfig } from './src/config/appConfig';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  // load config saat aplikasi dimulai
  useEffect(() => {
    loadConfig();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
