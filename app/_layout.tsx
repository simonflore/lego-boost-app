import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BoostProvider } from '../src/context/BoostContext';

export default function RootLayout() {
  return (
    <BoostProvider>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
      </Stack>
    </BoostProvider>
  );
}
