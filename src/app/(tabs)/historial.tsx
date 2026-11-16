import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/constants/caminaTheme';
import { useDatos } from '@/context/DatosContext';
import { ResultadoTrayecto } from '@/types';
import FiltroChips from '@/components/FiltroChips';
import HistorialItem from '@/components/HistorialItem';

type Filtro = 'todos' | ResultadoTrayecto;

export default function Historial() {
  const { historial, eliminarTrayecto, limpiarHistorial } = useDatos();
  const [filtro, setFiltro] = useState<Filtro>('todos');

  const contar = (r: ResultadoTrayecto) => historial.filter((t) => t.resultado === r).length;

  const opciones: { valor: Filtro; etiqueta: string }[] = [
    { valor: 'todos', etiqueta: `Todos (${historial.length})` },
    { valor: 'completado', etiqueta: `Completados (${contar('completado')})` },
    { valor: 'caida', etiqueta: `Caídas (${contar('caida')})` },
    { valor: 'panico', etiqueta: `Pánico (${contar('panico')})` },
    { valor: 'checkin', etiqueta: `Check-in (${contar('checkin')})` },
  ];

  const visibles = filtro === 'todos' ? historial : historial.filter((t) => t.resultado === filtro);

  const confirmarLimpiar = () => {
    Alert.alert('Borrar historial', '¿Seguro que quieres borrar todos los trayectos?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar todo', style: 'destructive', onPress: limpiarHistorial },
    ]);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.pantalla}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Historial</Text>
        {historial.length > 0 && (
          <Pressable onPress={confirmarLimpiar} hitSlop={8}>
            <Text style={styles.borrar}>Borrar todo</Text>
          </Pressable>
        )}
      </View>

      <FiltroChips opciones={opciones} seleccionado={filtro} onCambiar={setFiltro} />

      <FlatList
        data={visibles}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => <HistorialItem trayecto={item} onEliminar={eliminarTrayecto} />}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <Text style={styles.vacio}>
            {historial.length === 0
              ? 'Todavía no hay trayectos. Inicia uno desde la pestaña Inicio.'
              : 'No hay trayectos con este filtro.'}
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.fondo, padding: spacing.l, gap: spacing.m },
  encabezado: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titulo: { color: colors.texto, fontSize: 28, fontWeight: '700' },
  borrar: { color: colors.rojo, fontSize: 14, fontWeight: '600' },
  lista: { gap: spacing.s, paddingBottom: spacing.l },
  vacio: { color: colors.textoSuave, textAlign: 'center', marginTop: spacing.l, fontSize: 15 },
});