import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, radius } from '@/constants/caminaTheme';

type Opcion<T extends string> = { valor: T; etiqueta: string };

type Props<T extends string> = {
  opciones: Opcion<T>[];
  seleccionado: T;
  onCambiar: (valor: T) => void;
};

export default function FiltroChips<T extends string>({ opciones, seleccionado, onCambiar }: Props<T>) {
  return (
    <View style={styles.fila}>
      {opciones.map((o) => {
        const activo = o.valor === seleccionado;
        return (
          <Pressable
            key={o.valor}
            onPress={() => onCambiar(o.valor)}
            style={[styles.chip, activo && styles.chipActivo]}
          >
            <Text style={[styles.texto, activo && styles.textoActivo]}>{o.etiqueta}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s },
  chip: {
    borderWidth: 1,
    borderColor: colors.textoSuave,
    borderRadius: radius.l,
    paddingVertical: 6,
    paddingHorizontal: spacing.m,
  },
  chipActivo: { backgroundColor: colors.verde, borderColor: colors.verde },
  texto: { color: colors.textoSuave, fontSize: 13 },
  textoActivo: { color: colors.fondo, fontWeight: '700' },
});