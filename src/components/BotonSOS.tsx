import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius } from '@/constants/caminaTheme';

type Props = { onActivar: () => void };

export default function BotonSOS({ onActivar }: Props) {
  const progreso = useRef(new Animated.Value(0)).current;

  const iniciar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Animated.timing(progreso, { toValue: 1, duration: 3000, useNativeDriver: false }).start(
      ({ finished }) => {
        if (finished) {
          progreso.setValue(0);
          onActivar();
        }
      }
    );
  };

  const soltar = () => {
    progreso.stopAnimation();
    progreso.setValue(0);
  };

  const ancho = progreso.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Pressable onPressIn={iniciar} onPressOut={soltar} style={styles.sos}>
      <Animated.View style={[styles.relleno, { width: ancho }]} />
      <Text style={styles.texto}>SOS · mantén 3 s</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  relleno: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: colors.rojo },
  texto: { color: colors.texto, fontSize: 18, fontWeight: '700' },
});