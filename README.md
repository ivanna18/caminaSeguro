# caminaSeguro

App móvil hecha con **React Native + Expo** que acompaña a una persona durante un trayecto a pie y avisa a sus contactos de emergencia si detecta una caída, si no responde a un check-in o si activa el botón de pánico. Funciona **sin internet ni servidores externos**: solo usa APIs nativas de Expo.

> Proyecto final (PIA) — entrega de avances: 31 de octubre.

## Funcionalidades implementadas

- **Pantalla principal** con botón de inicio de trayecto, botón SOS (mantener 3 s) y chips de estado (batería, precisión del GPS, contactos configurados).
- **Ajustes:** hasta 3 contactos de emergencia y PIN de 4 dígitos, guardados en el dispositivo.
- **Detección de caídas** con el acelerómetro: impacto fuerte seguido de 2 s de inmovilidad. Incluye botón de prueba para simular una caída.
- **Trayecto activo:** cronómetro, velocidad, distancia recorrida, coordenadas y fuerza G en tiempo real; la pantalla no se bloquea.
- **Alarma:** cuenta regresiva de 15 s con vibración, teclado de PIN para cancelar (falsa alarma), sirena en bucle y SMS con enlace de Google Maps con la ubicación.

## APIs nativas de Expo usadas

| Paquete | Para qué se usa |
|---|---|
| `expo-sensors` (Accelerometer) | Detección de caídas |
| `expo-location` | Coordenadas, velocidad, distancia y precisión del GPS |
| `expo-haptics` | Vibración durante la cuenta regresiva |
| `expo-audio` | Sirena de la alarma |
| `expo-sms` | Mensaje de emergencia con la ubicación |
| `expo-keep-awake` | Pantalla encendida durante el trayecto |
| `expo-secure-store` + `expo-crypto` | PIN guardado como hash en el almacenamiento seguro |
| `expo-battery` | Nivel de batería en la pantalla principal |
| `@react-native-async-storage/async-storage` | Contactos de emergencia |

## Cómo correrlo

```bash
npm install
npx expo start --tunnel
```

Escanea el QR con Expo Go. La detección de caídas, los hápticos, el SMS y el GPS solo se prueban en un celular físico (no en la web).

## Estructura

```
src/
  app/          pantallas (index, trayecto, alarma, ajustes)
  hooks/        useDeteccionCaidas
  utils/        storage (contactos y PIN)
  constants/    caminaTheme (colores y espaciados)
assets/sounds/  alarma.wav
```

## Limitaciones conocidas

- El SMS no se envía solo: el sistema abre la app de mensajes y el usuario toca enviar.
- El acelerómetro y los temporizadores funcionan con la app abierta y la pantalla encendida.
- La app reproduce la sirena a volumen máximo del reproductor, pero no puede subir el volumen del teléfono.
- Los umbrales de caída se calibraron probando; pueden dar falsas alarmas en ciertos movimientos.

## Plan de trabajo siguiente

- Check-in con temporizador y confirmación por PIN, con notificaciones locales (`expo-notifications`).
- Modo correr con umbrales distintos y velocidad del GPS como segunda señal.
- Ajuste de sensibilidad del acelerómetro desde Ajustes.
- Historial de trayectos.

## Evidencia

- Repositorio: 
- Primer APK: 


## Participación del equipo 

| Integrante | Actividades realizadas |
|---|---|
| Ivanna Rodriguez | pantalla principal, ajustes y alarma |
| Victor Colin |  deteccion de caidas y trayecto |


