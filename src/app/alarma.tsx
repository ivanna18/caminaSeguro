import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius } from '@/constants/caminaTheme';
import { verificarPin } from '@/utils/storage';

const SEGUNDOS = 15;
const TECLAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

const MOTIVOS: Record<string, string> = {
  caida: 'Se detectó una posible caída',
  panico: 'Botón de pánico activado',
  checkin: 'No respondiste el check-in',
};

export default function Alarma() {
  const router = useRouter();
  const { motivo } = useLocalSearchParams<{ motivo?: string }>();
  const [restante, setRestante] = useState(SEGUNDOS);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const parpadeo = useRef(new Animated.Value(0)).current;

  const disparada = restante <= 0;

  // Fondo rojo parpadeante
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(parpadeo, { toValue: 1, duration: 500, useNativeDriver: false }),
        Animated.timing(parpadeo, { toValue: 0, duration: 500, useNativeDriver: false }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [parpadeo]);

  // Cuenta regresiva con vibración cada segundo
  useEffect(() => {
    if (restante <= 0) return;
    const t = setTimeout(() => {
      setRestante((r) => r - 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }, 1000);
    return () => clearTimeout(t);
  }, [restante]);

  const presionar = async (tecla: string) => {
    if (tecla === '') return;
    setError('');
    if (tecla === '⌫') {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (pin.length >= 4) return;

    const nuevo = pin + tecla;
    setPin(nuevo);

    if (nuevo.length === 4) {
      if (await verificarPin(nuevo)) {
        router.replace('/');
      } else {
        setError('PIN incorrecto');
        setPin('');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      }
    }
  };

  const fondo = parpadeo.interpolate({
    inputRange: [0, 1],
    outputRange: ['#4A0D10', '#B3151A'],
  });

  return (
    <Animated.View style={[styles.fondo, { backgroundColor: fondo }]}>
      <SafeAreaView style={styles.pantalla}>
        <View style={styles.arriba}>
          <Text style={styles.motivo}>{MOTIVOS[motivo ?? ''] ?? 'Alerta activada'}</Text>
          {disparada ? (
            <Text style={styles.estado}>Alarma activada</Text>
          ) : (
            <>
              <Text style={styles.contador}>{restante}</Text>
              <Text style={styles.instruccion}>Ingresa tu PIN para cancelar</Text>
            </>
          )}
        </View>

        <View style={styles.puntos}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.punto, i < pin.length && styles.puntoLleno]} />
          ))}
        </View>
        <Text style={styles.error}>{error}</Text>

        <View style={styles.teclado}>
          {TECLAS.map((t, i) => (
            <Pressable
              key={i}
              style={[styles.tecla, t === '' && styles.teclaVacia]}
              onPress={() => presionar(t)}
            >
              <Text style={styles.teclaTexto}>{t}</Text>
            </Pressable>
          ))}
        </View>

        {/* Temporal: quitar cuando todo esté probado */}
        <Pressable onPress={() => router.replace('/')}>
          <Text style={styles.salida}>Salir (solo pruebas)</Text>
        </Pressable>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1 },
  pantalla: { flex: 1, padding: spacing.l, alignItems: 'center', justifyContent: 'space-between' },
  arriba: { alignItems: 'center', gap: spacing.s },
  motivo: { color: colors.texto, fontSize: 18, fontWeight: '600', textAlign: 'center' },
  contador: { color: colors.texto, fontSize: 96, fontWeight: '800' },
  estado: { color: colors.texto, fontSize: 36, fontWeight: '800', marginVertical: spacing.l },
  instruccion: { color: colors.texto, fontSize: 16, opacity: 0.85 },
  puntos: { flexDirection: 'row', gap: spacing.m },
  punto: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.texto },
  puntoLleno: { backgroundColor: colors.texto },
  error: { color: colors.texto, fontSize: 15, fontWeight: '700', height: 20 },
  teclado: { flexDirection: 'row', flexWrap: 'wrap', width: 270, justifyContent: 'space-between', rowGap: spacing.m },
  tecla: {
    width: 80,
    height: 64,
    borderRadius: radius.m,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teclaVacia: { backgroundColor: 'transparent' },
  teclaTexto: { color: colors.texto, fontSize: 26, fontWeight: '700' },
  salida: { color: colors.texto, opacity: 0.6, fontSize: 14 },
});