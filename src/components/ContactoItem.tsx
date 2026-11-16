import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/constants/caminaTheme';
import { Contacto } from '@/types';

type Props = { contacto: Contacto; onEliminar: (id: string) => void };

export default function ContactoItem({ contacto, onEliminar }: Props) {
  return (
    <View style={styles.fila}>
      <View style={{ flex: 1 }}>
        <Text style={styles.nombre}>{contacto.nombre}</Text>
        <Text style={styles.telefono}>{contacto.telefono}</Text>
      </View>
      <Pressable onPress={() => onEliminar(contacto.id)}>
        <Text style={styles.eliminar}>Eliminar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.s },
  nombre: { color: colors.texto, fontSize: 16, fontWeight: '600' },
  telefono: { color: colors.textoSuave, fontSize: 14 },
  eliminar: { color: colors.rojo, fontSize: 14, fontWeight: '600' },
});