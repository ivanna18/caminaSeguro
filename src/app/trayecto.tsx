import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import * as Location from 'expo-location';
import { colors, spacing, radius } from '@/constants/caminaTheme';
import { useDeteccionCaidas } from '@/hooks/useDeteccionCaidas';
import { useCheckin } from '@/hooks/useCheckin';                   
import CheckinPrompt from '@/components/CheckinPrompt';           
import { useDatos } from '@/context/DatosContext';
import { ResultadoTrayecto } from '@/types';
import { formatoTiempo } from '@/utils/formato';
import BotonSOS from '@/components/BotonSOS';

// opciones del check-in y tiempo para responder
const OPCIONES_CHECKIN = [
  { etiqueta: '30 s (prueba)', seg: 30 },
  { etiqueta: '5 min', seg: 300 },
  { etiqueta: '10 min', seg: 600 },
  { etiqueta: '15 min', seg: 900 },
];
const VENTANA_CHECKIN_SEG = 30;

// Distancia en metros entre dos coordenadas (fórmula de Haversine)
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

export default function Trayecto() {
  useKeepAwake(); // la pantalla no se bloquea mientras dure el trayecto

  const router = useRouter();
  const { agregarTrayecto } = useDatos();

  const [activo, setActivo] = useState(true);
  const [g, setG] = useState(1);
  const ultimaActualizacion = useRef(0);
  const yaGuardado = useRef(false);

  // Estado del GPS
  const [permisoGps, setPermisoGps] = useState<'pidiendo' | 'ok' | 'denegado'>('pidiendo');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [precision, setPrecision] = useState<number | null>(null);
  const [velocidad, setVelocidad] = useState(0); // km/h
  const [distancia, setDistancia] = useState(0); // metros
  const [segundos, setSegundos] = useState(0);
  const anterior = useRef<{ lat: number; lng: number } | null>(null);

  const [intervalo, setIntervalo] = useState(600); // NUEVO: check-in cada 10 min por defecto

  // Guarda el trayecto en el historial (una sola vez)
  const guardarTrayecto = (resultado: ResultadoTrayecto) => {
    if (yaGuardado.current) return;
    yaGuardado.current = true;
    agregarTrayecto({
      inicio: new Date(Date.now() - segundos * 1000).toISOString(),
      duracionSeg: segundos,
      distanciaM: Math.round(distancia),
      resultado,
    });
  };

  // CAMBIO: ahora recibe el motivo ('caida' o 'checkin')
  const dispararAlarma = (motivo: 'caida' | 'checkin' | 'panico') => {    
    guardarTrayecto(motivo);
    setActivo(false);
    router.replace({ pathname: '/alarma', params: { motivo } });
  };

  const llegueASalvo = () => {
    guardarTrayecto('completado');
    router.replace('/');
  };

  useDeteccionCaidas({
    activo,
    sensibilidad: 'media',
    onCaida: () => dispararAlarma('caida'), // CAMBIO
    onLectura: (a) => {
      const ahora = Date.now();
      if (ahora - ultimaActualizacion.current > 200) {
        ultimaActualizacion.current = ahora;
        setG(a);
      }
    },
  });

  // NUEVO: check-in con temporizador
  const checkin = useCheckin({
    activo,
    intervaloSeg: intervalo,
    ventanaSeg: VENTANA_CHECKIN_SEG,
    onFallo: () => dispararAlarma('checkin'),
  });

  // Cronómetro del trayecto
  useEffect(() => {
    const t = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Seguimiento GPS
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

      {/* NUEVO: tarjeta del check-in */}
      <View style={styles.checkin}>
        <Text style={styles.etiqueta}>Próximo check-in en {formatoTiempo(checkin.restante)}</Text>
        <View style={styles.opciones}>
          {OPCIONES_CHECKIN.map((o) => (
            <Pressable
              key={o.seg}
              onPress={() => setIntervalo(o.seg)}
              style={[styles.opcion, intervalo === o.seg && styles.opcionActiva]}
            >
              <Text style={[styles.opcionTexto, intervalo === o.seg && styles.opcionTextoActivo]}>
                {o.etiqueta}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.pie}>
        <BotonSOS onActivar={() => dispararAlarma('panico')} />
        <Pressable style={styles.secundario} onPress={() => dispararAlarma('caida')}>
          <Text style={styles.secundarioTexto}>Simular caída (prueba)</Text>
        </Pressable>
        <Pressable style={styles.principal} onPress={llegueASalvo}>
          <Text style={styles.principalTexto}>Llegué a salvo</Text>
        </Pressable>
      </View>

      {/* NUEVO: pregunta "¿Estás bien?" encima de todo */}
      {checkin.preguntando && (
        <CheckinPrompt ventana={checkin.ventana} onCorrecto={checkin.confirmar} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.fondo, padding: spacing.l, gap: spacing.m },
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
  checkin: { backgroundColor: colors.tarjeta, borderRadius: radius.m, padding: spacing.m, gap: spacing.s },
  opciones: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s },
  opcion: {
    borderWidth: 1,
    borderColor: colors.textoSuave,
    borderRadius: radius.l,
    paddingVertical: 6,
    paddingHorizontal: spacing.m,
  },
  opcionActiva: { backgroundColor: colors.verde, borderColor: colors.verde },
  opcionTexto: { color: colors.textoSuave, fontSize: 13 },
  opcionTextoActivo: { color: colors.fondo, fontWeight: '700' },
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