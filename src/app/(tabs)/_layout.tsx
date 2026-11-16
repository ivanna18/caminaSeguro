import { ComponentProps } from 'react';
import { ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/caminaTheme';

type PropsIcono = {
  nombre: ComponentProps<typeof Ionicons>['name'];
  color: ColorValue;
  size: number;
};

function Icono({ nombre, color, size }: PropsIcono) {
  return <Ionicons name={nombre} color={color as string} size={size} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.verde,
        tabBarInactiveTintColor: colors.textoSuave,
        tabBarStyle: { backgroundColor: colors.tarjeta, borderTopWidth: 0 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Icono nombre="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="historial"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color, size }) => <Icono nombre="time" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="ajustes"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color, size }) => <Icono nombre="settings" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}