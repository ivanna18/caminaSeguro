import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, radius } from '@/constants/caminaTheme';

export default function Chip({ texto }: { texto: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.texto}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.tarjeta,
    paddingVertical: 6,
    paddingHorizontal: spacing.m,
    borderRadius: radius.l,
  },
  texto: { color: colors.textoSuave, fontSize: 13 },
});