import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import type { Theme } from '@react-navigation/native';
import { Spinner, ToastProvider, useTheme } from '@industry/mobile';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { subscribeToAuthUser } from './src/services/authService';
import { useAuthStore } from './src/store/useAuthStore';
import { AuthStack } from './src/navigation/AuthStack';
import { AppStack } from './src/navigation/AppStack';

export default function App() {
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, setUser } = useAuthStore();
  const { colors, preference, setTheme } = useTheme();

  useEffect(() => {
    if (preference === 'system') setTheme('dark');
  }, [preference, setTheme]);

  useEffect(() => {
    const unsubscribe = subscribeToAuthUser(
      (user) => {
        setUser(user);
        setLoading(false);
      },
      () => {
        Alert.alert(
          'Erro de conexão',
          'Não foi possível carregar seu perfil. Verifique sua conexão e tente novamente.',
        );
        setUser(null);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [setUser]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.bg,
        }}
      >
        <Spinner />
      </View>
    );
  }

  const navigationTheme: Theme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: colors.accent,
      background: colors.bg,
      card: colors.surface,
      text: colors.text,
      border: colors.divider,
    },
  };

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <NavigationContainer theme={navigationTheme}>
          {isAuthenticated ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
