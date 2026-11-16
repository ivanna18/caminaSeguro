import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, spacing } from '@/constants/caminaTheme';

type Props = TextInputProps & { error?: string };

export default function CampoTexto({ error, style, ...resto }: Props) {
  return (
    <View style={styles.contenedor}>
      <TextInput
        placeholderTextColor={colors.textoSuave}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...resto}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: 4 },
  input: {
    backgroundColor: colors.fondo,
    color: colors.texto,
    borderRadius: spacing.s + 4,
    padding: spacing.m,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: { borderColor: colors.rojo },
  error: { color: colors.rojo, fontSize: 13 },
});