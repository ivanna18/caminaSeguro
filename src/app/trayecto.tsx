import { View, Text } from 'react-native';
import { colors } from '@/constants/caminaTheme';

export default function Trayecto() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.fondo, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: colors.texto, fontSize: 20 }}>Trayecto activo</Text>
    </View>
  );
}