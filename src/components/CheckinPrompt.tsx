import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius } from '@/constants/caminaTheme';
import { verificarPin } from '@/utils/storage';

const TECLAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

type Props = { ventana: number; onCorrecto: () => void };

export default function CheckinPrompt({ ventana, onCorrecto }: Props) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

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
        onCorrecto();
      } else {
        setError('PIN incorrecto');
        setPin('');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      }
    }
  };

  return (
    <View style={styles.capa}>
      <Text style={styles.titulo}>¿Estás bien?</Text>
      <Text style={styles.contador}>{ventana}</Text>
      <Text style={styles.instruccion}>Ingresa tu PIN para confirmar</Text>

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
    </View>
  );
}

const styles = StyleSheet.create({
  capa: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: colors.fondo,
  alignItems: 'center',
  justifyContent: 'center',
  gap: spacing.m,
  padding: spacing.l,
},
  titulo: { color: colors.texto, fontSize: 32, fontWeight: '800' },
  contador: { color: colors.verde, fontSize: 72, fontWeight: '800' },
  instruccion: { color: colors.textoSuave, fontSize: 16 },
  puntos: { flexDirection: 'row', gap: spacing.m, marginTop: spacing.s },
  punto: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.texto },
  puntoLleno: { backgroundColor: colors.texto },
  error: { color: colors.rojo, fontSize: 15, fontWeight: '700', height: 20 },
  teclado: { flexDirection: 'row', flexWrap: 'wrap', width: 270, justifyContent: 'space-between', rowGap: spacing.m },
  tecla: {
    width: 80,
    height: 64,
    borderRadius: radius.m,
    backgroundColor: colors.tarjeta,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teclaVacia: { backgroundColor: 'transparent' },
  teclaTexto: { color: colors.texto, fontSize: 26, fontWeight: '700' },
});