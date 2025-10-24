import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/home';
import KtpOcrScreen from '../screens/ktp-ocr';
import ReceiptApproverScreen from '../screens/receipt-approver';
import ResultScreen from '../screens/result';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4F46E5',
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
          options={{ title: 'VL Tester' }}
        />
        <Stack.Screen 
          name="KtpOcr" 
          component={KtpOcrScreen} 
          options={{ title: 'KTP OCR' }}
        />
        <Stack.Screen 
          name="ReceiptApprover" 
          component={ReceiptApproverScreen} 
          options={{ title: 'Receipt Approver' }}
        />
        <Stack.Screen 
          name="Result" 
          component={ResultScreen} 
          options={{ title: 'Hasil' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
