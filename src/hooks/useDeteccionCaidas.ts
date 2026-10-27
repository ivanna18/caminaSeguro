import { useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';

export type Sensibilidad = 'baja' | 'media' | 'alta';

export const UMBRALES: Record<Sensibilidad, number> = {
  baja: 3.5,
  media: 3.0,
  alta: 2.5,
};

const INTERVALO_MS = 50;      // 20 lecturas por segundo
const QUIETO_MS = 2000;       // inmovilidad requerida tras el impacto
const VENTANA_MAX_MS = 6000;  // si no se queda quieto en este tiempo, se descarta
const TOLERANCIA = 0.15;      // |A - 1g| menor a esto = sin movimiento


export function fuerzaTotal(x: number, y: number, z: number) {
  return Math.sqrt(x * x + y * y + z * z);
}

type Opciones = {
  activo: boolean;
  sensibilidad?: Sensibilidad;
  onCaida: () => void;
  onLectura?: (a: number) => void;
};

export function useDeteccionCaidas({ activo, sensibilidad = 'media', onCaida, onLectura }: Opciones) {
  const onCaidaRef = useRef(onCaida);
  const onLecturaRef = useRef(onLectura);
  onCaidaRef.current = onCaida;
  onLecturaRef.current = onLectura;

  useEffect(() => {
    if (!activo) return;

    const umbral = UMBRALES[sensibilidad];
    let fase: 'normal' | 'impacto' = 'normal';
    let inicioVentana = 0;
    let inicioQuieto: number | null = null;

    Accelerometer.setUpdateInterval(INTERVALO_MS);

    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const a = fuerzaTotal(x, y, z);
      const ahora = Date.now();
      onLecturaRef.current?.(a);

      if (fase === 'normal') {
        if (a > umbral) {
          fase = 'impacto';
          inicioVentana = ahora;
          inicioQuieto = null;
        }
        return;
      }

      // fase === 'impacto': buscamos 2 s seguidos de quietud (A ≈ 1g)
      if (Math.abs(a - 1) < TOLERANCIA) {
        if (inicioQuieto === null) inicioQuieto = ahora;
        if (ahora - inicioQuieto >= QUIETO_MS) {
          fase = 'normal';
          onCaidaRef.current();
        }
      } else {
        inicioQuieto = null;
        if (ahora - inicioVentana > VENTANA_MAX_MS) fase = 'normal';
      }
    });

    return () => sub.remove();
  }, [activo, sensibilidad]);
}