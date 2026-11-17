# caminaSeguro

App móvil hecha con **React Native + Expo** que acompaña a una persona durante un trayecto a pie y avisa a sus contactos de emergencia si detecta una caída, si no responde a un check-in o si activa el botón de pánico. Funciona **sin internet ni servidores externos**: solo usa APIs nativas de Expo y guarda todo en el propio dispositivo.

> Proyecto final (PIA) de Aplicaciones Móviles.

## Funcionalidades

**Navegación (Tabs):** Inicio, Historial y Ajustes. Trayecto y Alarma se abren a pantalla completa, fuera de las pestañas.

- **Inicio:** botón para iniciar trayecto, botón SOS (mantener 3 s) y chips de estado (batería, precisión del GPS, contactos configurados). Antes de iniciar valida que haya al menos un contacto y un PIN.
- **Trayecto activo:** cronómetro, velocidad, distancia recorrida, coordenadas, precisión del GPS y fuerza G en tiempo real. La pantalla no se bloquea. Incluye botón SOS y botón "Llegué a salvo".
- **Detección de caídas:** acelerómetro; impacto fuerte seguido de 2 s de inmovilidad dispara la alarma.
- **Check-in con temporizador:** cada 5, 10 o 15 minutos pregunta "¿Estás bien?"; si no se ingresa el PIN en 30 s, se dispara la alarma.
- **Alarma:** cuenta regresiva de 15 s con vibración y teclado de PIN para cancelar (falsa alarma). Si no se cancela: sirena en bucle y SMS con enlace de Google Maps con la ubicación.
- **Historial de trayectos:** lista de trayectos con fecha, duración, distancia y resultado; **eliminar** uno o borrar todo (con confirmación) y **filtrar** por Todos, Completados, Caídas, Pánico y Check-in.
- **Ajustes:** hasta 3 contactos de emergencia (agregar y eliminar), PIN de 4 dígitos con confirmación y verificación del PIN actual para cambiarlo, y **modo de prueba** para demostraciones.

## Cómo cumple con la rúbrica

| Criterio | Dónde se ve |
|---|---|
| Lista, agregar, eliminar y filtro | Historial (lista, eliminar, borrar todo y filtros por resultado); contactos en Ajustes (agregar y eliminar) |
| Navegación con Tabs y rutas claras | `src/app/(tabs)` con Inicio, Historial y Ajustes; Trayecto y Alarma como pantallas aparte |
| Manejo de estado | `useState` en pantallas y componentes; `DatosContext` centraliza contactos e historial; actualizaciones inmutables (`[...prev, nuevo]`, `filter`); datos que bajan por props a `ContactoItem`, `HistorialItem`, `FiltroChips` |
| Formularios y validaciones | Inputs controlados (`CampoTexto`) con error por campo: longitud de nombre, teléfono de 10 dígitos, contactos duplicados, PIN de 4 dígitos, confirmación y PIN actual |
| UX | Tema único (`caminaTheme`), animaciones, vibración, estados vacíos y confirmaciones |
| APIs del dispositivo | Acelerómetro, ubicación, hápticos, audio, SMS, batería, almacenamiento seguro |

## APIs nativas de Expo usadas

| Paquete | Para qué se usa |
|---|---|
| `expo-sensors` (Accelerometer) | Detección de caídas |
| `expo-location` | Coordenadas, velocidad, distancia y precisión del GPS |
| `expo-haptics` | Vibración en cuenta regresiva y check-in |
| `expo-audio` | Sirena de la alarma |
| `expo-sms` | Mensaje de emergencia con la ubicación |
| `expo-keep-awake` | Pantalla encendida durante el trayecto |
| `expo-secure-store` + `expo-crypto` | PIN guardado como hash en el almacenamiento seguro |
| `expo-battery` | Nivel de batería en Inicio |
| `@react-native-async-storage/async-storage` | Contactos, historial y modo de prueba |

## Cómo correrlo

```bash
npm install
npx expo start --tunnel
```

Escanea el QR con Expo Go. La detección de caídas, los hápticos, el SMS y el GPS solo se prueban en un celular físico (no en la web).

**Modo de prueba:** actívalo en Ajustes para ver el botón "Simular caída", el check-in de 30 s y la salida rápida de la alarma. Está apagado por defecto.

**APK (Android):**

```bash
eas build -p android --profile preview
```

## Estructura

```
src/
  app/
    _layout.tsx        navegación principal (Stack) y DatosProvider
    (tabs)/            Inicio, Historial y Ajustes
    trayecto.tsx       trayecto activo
    alarma.tsx         alarma con cuenta regresiva
  components/          BotonSOS, CampoTexto, Chip, CheckinPrompt, ContactoItem,
                       FiltroChips, HistorialItem
  context/             DatosContext (contactos, historial, modo de prueba)
  hooks/               useDeteccionCaidas, useCheckin
  utils/               storage (almacenamiento), formato (tiempo, distancia, fecha)
  constants/           caminaTheme (colores y espaciados)
  types.ts             tipos de datos
assets/sounds/         alarma.wav
```

## Limitaciones conocidas

- El SMS no se envía solo: el sistema abre la app de mensajes y el usuario toca enviar.
- El acelerómetro, el check-in y el GPS funcionan con la app abierta y la pantalla encendida.
- La app reproduce la sirena al máximo del reproductor, pero no puede subir el volumen del teléfono.
- Los umbrales de caída se calibraron probando; pueden dar falsas alarmas en ciertos movimientos.

## Mejoras futuras

- Notificaciones locales (`expo-notifications`) para que el check-in funcione con la pantalla bloqueada.
- Modo correr, con umbrales distintos y la velocidad del GPS como segunda señal.
- Ajuste de sensibilidad del acelerómetro (baja, media, alta) desde Ajustes.
- GPS en segundo plano.

## Evidencia

- Repositorio: [(https://github.com/ivanna18/caminaSeguro/tree/main)]
- APK: [https://expo.dev/accounts/ivanna-18/projects/caminaSeguro/builds/46e0349c-8eba-4da2-a2ca-47140ca65601]


## Equipo

| Integrante | 
|---|
| Ivanna Rodriguez  | 
| Victor Manuel Colin  


