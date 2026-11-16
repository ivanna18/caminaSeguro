import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, radius } from '@/constants/caminaTheme';
import { ResultadoTrayecto, Trayecto } from '@/types';
import { formatoDistancia, formatoFecha, formatoTiempo } from '@/utils/formato';

const ETIQUETAS: Record<ResultadoTrayecto, string> = {
  completado: 'Llegué a salvo',
  caida: 'Caída detectada',
  panico: 'Botón de pánico',
  checkin: 'Check-in sin respuesta',
};

type Props = { trayecto: Trayecto; onEliminar: (id: string) => void };

export default function HistorialItem({ trayecto, onEliminar }: Props) {
  const esAlerta = trayecto.resultado !== 'completado';

  return (
    <View style={styles.tarjeta}>
      <View style={[styles.franja, { backgroundColor: esAlerta ? colors.rojo : colors.verde }]} />
      <View style={styles.info}>
        <Text style={styles.resultado}>{ETIQUETAS[trayecto.resultado]}</Text>
        <Text style={styles.suave}>{formatoFecha(trayecto.inicio)}</Text>
        <Text style={styles.suave}>
          {formatoTiempo(trayecto.duracionSeg)} · {formatoDistancia(trayecto.distanciaM)}
        </Text>
      </View>
      <Pressable onPress={() => onEliminar(trayecto.id)} hitSlop={8}>
        <Text style={styles.eliminar}>Eliminar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tarjeta,
    borderRadius: radius.m,
    padding: spacing.m,
    gap: spacing.m,
  },
  franja: { width: 4, alignSelf: 'stretch', borderRadius: 2 },
  info: { flex: 1, gap: 2 },
  resultado: { color: colors.texto, fontSize: 16, fontWeight: '700' },
  suave: { color: colors.textoSuave, fontSize: 13 },
  eliminar: { color: colors.rojo, fontSize: 14, fontWeight: '600' },
});