import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Battery from 'expo-battery';
import { colors, spacing, radius } from '@/constants/caminaTheme';
import { obtenerContactos } from '@/utils/storage';

function Chip({ texto }: { texto: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipTexto}>{texto}</Text>
    </View>
  );
}

export default function Inicio() {
  const router = useRouter();
  const pulso = useRef(new Animated.Value(0)).current;
  const sos = useRef(new Animated.Value(0)).current;
  const [numContactos, setNumContactos] = useState(0);
  const [bateria, setBateria] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      obtenerContactos().then((contactos) => setNumContactos(contactos.length));
    }, [])
  );

  useEffect(() => {
    Animated.loop(
      Animated.timing(pulso, {
        toValue: 1,
        duration: 1600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    ).start();

    Battery.getBatteryLevelAsync()
      .then((n) => setBateria(n >= 0 ? Math.round(n * 100) : null))
      .catch(() => {});
  }, [pulso]);

  const iniciarSOS = () => {
    Animated.timing(sos, { toValue: 1, duration: 3000, useNativeDriver: false }).start(
      ({ finished }) => {
        if (finished) {
          sos.setValue(0);
          router.push({ pathname: '/alarma', params: { motivo: 'panico' } });  
        }
      }
    );
  };

  const soltarSOS = () => {
    sos.stopAnimation();
    sos.setValue(0);
  };

  const anchoSOS = sos.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const escalaAnillo = pulso.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] });
  const opacidadAnillo = pulso.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  return (
    <SafeAreaView style={styles.pantalla}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>caminaSeguro</Text>
        <Text style={styles.subtitulo}>Tu trayecto, acompañado.</Text>
        <View style={styles.chips}>
          <Chip texto={bateria !== null ? `Batería ${bateria}%` : 'Batería --'} />
          <Chip texto="GPS: --" />
          <Chip texto={`Contactos ${numContactos}/3`} />
        </View>
      </View>

      <View style={styles.centro}>
        <Animated.View
          style={[styles.anillo, { opacity: opacidadAnillo, transform: [{ scale: escalaAnillo }] }]}
        />
        <Pressable style={styles.botonPrincipal} onPress={() => router.push('/trayecto')}>
          <Text style={styles.botonTexto}>Iniciar{'\n'}trayecto</Text>
        </Pressable>
      </View>

      <View style={styles.pie}>
        <Pressable onPressIn={iniciarSOS} onPressOut={soltarSOS} style={styles.sos}>
          <Animated.View style={[styles.sosRelleno, { width: anchoSOS }]} />
          <Text style={styles.sosTexto}>SOS · mantén 3 s</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/ajustes')}>
          <Text style={styles.enlace}>Ajustes y contactos</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.fondo, padding: spacing.l },
  encabezado: { gap: spacing.s },
  titulo: { color: colors.texto, fontSize: 28, fontWeight: '700' },
  subtitulo: { color: colors.textoSuave, fontSize: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s, marginTop: spacing.m },
  chip: {
    backgroundColor: colors.tarjeta,
    paddingVertical: 6,
    paddingHorizontal: spacing.m,
    borderRadius: radius.l,
  },
  chipTexto: { color: colors.textoSuave, fontSize: 13 },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  anillo: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.verde,
  },
  botonPrincipal: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.verde,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonTexto: { color: colors.fondo, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  pie: { gap: spacing.m, alignItems: 'center' },
  sos: {
    width: '100%',
    height: 64,
    borderRadius: radius.m,
    backgroundColor: colors.tarjeta,
    borderWidth: 2,
    borderColor: colors.rojo,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosRelleno: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: colors.rojo },
  sosTexto: { color: colors.texto, fontSize: 18, fontWeight: '700' },
  enlace: { color: colors.textoSuave, fontSize: 15 },
});