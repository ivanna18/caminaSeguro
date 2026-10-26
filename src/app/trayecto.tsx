import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { colors, spacing, radius } from '@/constants/caminaTheme';
import { useDeteccionCaidas } from '@/hooks/useDeteccionCaidas';

export default function Trayecto() {
  useKeepAwake(); // la pantalla no se bloquea mientras dure el trayecto

  const router = useRouter();
  const [activo, setActivo] = useState(true);
  const [g, setG] = useState(1);
  const ultimaActualizacion = useRef(0);

  const dispararAlarma = () => {
    setActivo(false);
    router.push({ pathname: '/alarma', params: { motivo: 'caida' } });
  };

  useDeteccionCaidas({
    activo,
    sensibilidad: 'media',
    onCaida: dispararAlarma,
    onLectura: (a) => {
      const ahora = Date.now();
      if (ahora - ultimaActualizacion.current > 200) {
        ultimaActualizacion.current = ahora;
        setG(a);
      }
    },
  });

  return (
    <SafeAreaView style={styles.pantalla}>
      <View style={styles.centro}>
        <Text style={styles.etiqueta}>Fuerza actual</Text>
        <Text style={styles.valor}>{g.toFixed(2)} g</Text>
        <Text style={styles.suave}>En reposo debe marcar cerca de 1.00 g</Text>
      </View>

      <View style={styles.pie}>
        <Pressable style={styles.secundario} onPress={dispararAlarma}>
          <Text style={styles.secundarioTexto}>Simular caída (prueba)</Text>
        </Pressable>
        <Pressable style={styles.principal} onPress={() => router.replace('/')}>
          <Text style={styles.principalTexto}>Llegué a salvo</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.fondo, padding: spacing.l },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.s },
  etiqueta: { color: colors.textoSuave, fontSize: 16 },
  valor: { color: colors.verde, fontSize: 56, fontWeight: '800' },
  suave: { color: colors.textoSuave, fontSize: 14 },
  pie: { gap: spacing.m },
  secundario: {
    borderWidth: 2,
    borderColor: colors.textoSuave,
    borderRadius: radius.m,
    padding: spacing.m,
    alignItems: 'center',
  },
  secundarioTexto: { color: colors.textoSuave, fontSize: 16, fontWeight: '600' },
  principal: { backgroundColor: colors.verde, borderRadius: radius.m, padding: spacing.m, alignItems: 'center' },
  principalTexto: { color: colors.fondo, fontSize: 18, fontWeight: '800' },
});