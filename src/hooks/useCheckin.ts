import { useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';

type Opciones = {
  activo: boolean;
  intervaloSeg: number; // cada cuánto se pregunta
  ventanaSeg: number;   // cuánto tiempo hay para responder
  onFallo: () => void;  // qué hacer si no se responde
};

export function useCheckin({ activo, intervaloSeg, ventanaSeg, onFallo }: Opciones) {
  const [restante, setRestante] = useState(intervaloSeg);
  const [preguntando, setPreguntando] = useState(false);
  const [ventana, setVentana] = useState(ventanaSeg);
  const onFalloRef = useRef(onFallo);
  onFalloRef.current = onFallo;

  // Si cambia el intervalo, el reloj empieza de nuevo
  useEffect(() => {
    setRestante(intervaloSeg);
    setPreguntando(false);
    setVentana(ventanaSeg);
  }, [intervaloSeg, ventanaSeg]);

  // Un tic por segundo, encadenado
  useEffect(() => {
    if (!activo) return;

    const t = setTimeout(() => {
      if (!preguntando) {
        if (restante <= 1) {
          setRestante(0);
          setPreguntando(true);
          setVentana(ventanaSeg);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        } else {
          setRestante(restante - 1);
        }
      } else if (ventana <= 1) {
        setVentana(0);
        onFalloRef.current();
      } else {
        setVentana(ventana - 1);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      }
    }, 1000);

    return () => clearTimeout(t);
  }, [activo, preguntando, restante, ventana, ventanaSeg]);

  const confirmar = () => {
    setPreguntando(false);
    setRestante(intervaloSeg);
    setVentana(ventanaSeg);
  };

  return { restante, preguntando, ventana, confirmar };
}