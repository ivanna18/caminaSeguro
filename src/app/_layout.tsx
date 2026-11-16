import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="trayecto" options={{ gestureEnabled: false }} />
      <Stack.Screen name="alarma" options={{ gestureEnabled: false }} />
    </Stack>
  );
}