import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { colors, spacing, radius } from '@/constants/caminaTheme';
import { useDeteccionCaidas } from '@/hooks/useDeteccionCaidas';
import * as Location from 'expo-location'; 

function distanciaMetros(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function formatoTiempo(seg: number) {
  const m = Math.floor(seg / 60).toString().padStart(2, '0');
  const s = (seg % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}


export default function Trayecto() {
  useKeepAwake(); 

  const router = useRouter();
  const [activo, setActivo] = useState(true);
  const [g, setG] = useState(1);
  const ultimaActualizacion = useRef(0);

  const [permisoGps, setPermisoGps] = useState<'pidiendo' | 'ok' | 'denegado'>('pidiendo');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [precision, setPrecision] = useState<number | null>(null);
  const [velocidad, setVelocidad] = useState(0); 
  const [distancia, setDistancia] = useState(0); 
  const [segundos, setSegundos] = useState(0);
  const anterior = useRef<{ lat: number; lng: number } | null>(null);

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

  //cronometrp
  useEffect(() => {
    const t = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);




   // seguimiento GPS
  useEffect(() => {
    let suscripcion: Location.LocationSubscription | null = null;
    let cancelado = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermisoGps('denegado');
        return;
      }
      setPermisoGps('ok');

      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced, // equilibrio entre precisión y batería
          timeInterval: 2000,                   // como máximo una lectura cada 2 s
          distanceInterval: 3,                  // o cuando te mueves 3 m
        },
        (pos) => {
          const { latitude, longitude, speed, accuracy } = pos.coords;
          setCoords({ lat: latitude, lng: longitude });
          setPrecision(accuracy ?? null);

          // speed viene en m/s y puede ser null o negativo si no se pudo calcular
          const kmh = speed && speed > 0 ? speed * 3.6 : 0;
          setVelocidad(kmh < 0.5 ? 0 : kmh);

          // solo sumamos distancia si la lectura es razonablemente precisa
          if (accuracy != null && accuracy <= 50) {
            if (anterior.current) {
              const d = distanciaMetros(anterior.current.lat, anterior.current.lng, latitude, longitude);
              if (d >= 3) setDistancia((x) => x + d);
            }
            anterior.current = { lat: latitude, lng: longitude };
          }
        }
      );

      if (cancelado) sub.remove();
      else suscripcion = sub;
    })().catch(() => setPermisoGps('denegado'));

    return () => {
      cancelado = true;
      suscripcion?.remove();
    };
  }, []);

  const textoGps =
    permisoGps === 'denegado'
      ? 'Sin permiso de ubicación'
      : coords
      ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
      : 'Buscando señal GPS...';

  const calidadGps =
    precision === null ? '--' : precision <= 15 ? 'Buena' : precision <= 40 ? 'Media' : 'Baja';

  return (
    <SafeAreaView style={styles.pantalla}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Trayecto activo</Text>
        <Text style={styles.tiempo}>{formatoTiempo(segundos)}</Text>
      </View>

      <View style={styles.tarjetas}>
        <View style={styles.tarjeta}>
          <Text style={styles.etiqueta}>Velocidad</Text>
          <Text style={styles.valor}>{velocidad.toFixed(1)}</Text>
          <Text style={styles.unidad}>km/h</Text>
        </View>
        <View style={styles.tarjeta}>
          <Text style={styles.etiqueta}>Distancia</Text>
          <Text style={styles.valor}>
            {distancia >= 1000 ? (distancia / 1000).toFixed(2) : Math.round(distancia)}
          </Text>
          <Text style={styles.unidad}>{distancia >= 1000 ? 'km' : 'm'}</Text>
        </View>
        <View style={styles.tarjeta}>
          <Text style={styles.etiqueta}>Fuerza</Text>
          <Text style={styles.valor}>{g.toFixed(2)}</Text>
          <Text style={styles.unidad}>g</Text>
        </View>
      </View>

      <View style={styles.gps}>
        <Text style={styles.etiqueta}>Ubicación · precisión GPS: {calidadGps}</Text>
        <Text style={styles.coordenadas}>{textoGps}</Text>
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
  pantalla: { flex: 1, backgroundColor: colors.fondo, padding: spacing.l, gap: spacing.l },
  encabezado: { alignItems: 'center', gap: spacing.s },
  titulo: { color: colors.textoSuave, fontSize: 16 },
  tiempo: { color: colors.verde, fontSize: 56, fontWeight: '800' },
  tarjetas: { flexDirection: 'row', gap: spacing.s },
  tarjeta: {
    flex: 1,
    backgroundColor: colors.tarjeta,
    borderRadius: radius.m,
    padding: spacing.m,
    alignItems: 'center',
  },
  etiqueta: { color: colors.textoSuave, fontSize: 13 },
  valor: { color: colors.texto, fontSize: 28, fontWeight: '800', marginTop: 4 },
  unidad: { color: colors.textoSuave, fontSize: 13 },
  gps: { backgroundColor: colors.tarjeta, borderRadius: radius.m, padding: spacing.m, gap: 4 },
  coordenadas: { color: colors.texto, fontSize: 16, fontWeight: '600' },
  pie: { marginTop: 'auto', gap: spacing.m },
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