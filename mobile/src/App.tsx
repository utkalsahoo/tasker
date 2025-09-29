import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from '@navigation/RootNavigator';
import { store } from '@store/index';
import { theme } from '@theme/theme';
import { bootstrapDayjs } from '@utils/date';
import { useNotificationBootstrap } from '@hooks/useNotificationBootstrap';
import { useAppBootstrap } from '@hooks/useAppBootstrap';

export default function App(): JSX.Element {
  useEffect(() => {
    bootstrapDayjs();
  }, []);

  useNotificationBootstrap();
  useAppBootstrap();

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </Provider>
  );
}
