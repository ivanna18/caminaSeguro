import { Stack } from 'expo-router';
import { DatosProvider } from '@/context/DatosContext';

export default function Layout() {
  return (
    <DatosProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="trayecto" options={{ gestureEnabled: false }} />
        <Stack.Screen name="alarma" options={{ gestureEnabled: false }} />
      </Stack>
    </DatosProvider>
  );
}