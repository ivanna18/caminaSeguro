import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Battery from 'expo-battery';
import * as Location from 'expo-location';
import { colors, spacing, radius } from '@/constants/caminaTheme';
import { useDatos, MAX_CONTACTOS } from '@/context/DatosContext';
import Chip from '@/components/Chip';
import BotonSOS from '@/components/BotonSOS';

export default function Inicio() {
  const router = useRouter();
  const pulso = useRef(new Animated.Value(0)).current;
  const [gps, setGps] = useState('GPS: --');
  const [bateria, setBateria] = useState<number | null>(null);
  const { contactos, agregarTrayecto } = useDatos();

  // Precisión del GPS cada vez que la pantalla recupera el foco
  useFocusEffect(
    useCallback(() => {
      let cancelado = false;

      (async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            if (!cancelado) setGps('GPS: sin permiso');
            return;
          }
          if (!cancelado) setGps('GPS: buscando...');

          const limite = new Promise<null>((res) => setTimeout(() => res(null), 8000));
          const pos = await Promise.race([
            Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
            limite,
          ]);
          if (cancelado) return;

          if (!pos) {
            setGps('GPS: sin señal');
            return;
          }
          const p = pos.coords.accuracy;
          setGps(
            p == null ? 'GPS: activo' : p <= 15 ? 'GPS: buena' : p <= 40 ? 'GPS: media' : 'GPS: baja'
          );
        } catch {
          if (!cancelado) setGps('GPS: no disponible');
        }
      })();

      return () => {
        cancelado = true;
      };
    }, [])
  );

  // Animación del anillo y nivel de batería
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

  
const alActivarSOS = () => {
  agregarTrayecto({
    inicio: new Date().toISOString(),
    duracionSeg: 0,
    distanciaM: 0,
    resultado: 'panico',
  });
  router.push({ pathname: '/alarma', params: { motivo: 'panico' } });
};
  

  const escalaAnillo = pulso.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] });
  const opacidadAnillo = pulso.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.pantalla}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>CaminaSeguro</Text>
        <Text style={styles.subtitulo}>Tu trayecto, acompañado.</Text>
        <View style={styles.chips}>
          <Chip texto={bateria !== null ? `Batería ${bateria}%` : 'Batería --'} />
          <Chip texto={gps} />
          <Chip texto={`Contactos ${contactos.length}/${MAX_CONTACTOS}`} />
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
        <BotonSOS onActivar={alActivarSOS} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.fondo, padding: spacing.l },
  encabezado: { gap: spacing.s },
  titulo: { color: colors.texto, fontSize: 35, fontWeight: '600' },
  subtitulo: { color: colors.textoSuave, fontSize: 16, fontWeight: '200' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s, marginTop: spacing.m },
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
});