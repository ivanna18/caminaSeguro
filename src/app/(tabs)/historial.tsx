import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/constants/caminaTheme';

export default function Historial() {
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: colors.fondo, padding: spacing.l }}
    >
      <Text style={{ color: colors.texto, fontSize: 28, fontWeight: '700' }}>Historial</Text>
    </SafeAreaView>
  );
}