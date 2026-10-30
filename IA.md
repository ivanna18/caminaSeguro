# Uso de IA en caminaSeguro

## Herramienta y modo

- **Herramienta:** Claude .


## Plan de trabajo

El plan del proyecto lo armamos entre el equipo y la IA. Nosotras llevamos la idea de la app, las APIs que queríamos usar y el flujo de funcionamiento; con Claude platicamos la idea, la ajustamos y la ordenamos en pasos para construirla poco a poco:

1. Crear el proyecto con Expo y subirlo a GitHub desde el inicio.
2. Instalar las APIs nativas y definir un tema visual único (colores y espaciados).
3. Pantalla principal con botón de trayecto, SOS de 3 s y chips de estado.
4. Ajustes: contactos de emergencia y PIN guardados en el dispositivo.
5. Detección de caídas con el acelerómetro, con botón de simulación para probar.
6. Pantalla de alarma: cuenta regresiva, PIN, vibración.
7. Sirena, ubicación y SMS de emergencia.
8. Primer build (APK) con EAS.
9. Trayecto con velocidad, distancia y coordenadas.
10. Documentación: README, IA.md.


## Qué hizo la IA y qué hizo el equipo

- **Plan del proyecto (en conjunto):** la idea, las APIs y el flujo de la app fueron del equipo; junto con la IA los organizamos en pasos y decidimos qué entraba en este avance y qué quedaba para después (por ejemplo, el check-in y el modo correr).
- **Funciones en las que la IA nos ayudó a generar código:** la detección de caídas con el acelerómetro, la pantalla de alarma con cuenta regresiva y teclado de PIN, el guardado de contactos y PIN, la sirena, el envío del SMS con la ubicación, y la velocidad y distancia del trayecto. 


## Cómo se verificó lo que sugirió la IA

- Todo el código se probó en un celular físico antes de hacer commit.
- Algunas sugerencias se corrigieron al probarlas, por ejemplo la estructura de carpetas, que no coincidía con la plantilla de Expo y causó errores de navegación.
- Algunas partes de los codigos que nos daba la IA no se ajustaban a lo que ya llevabamos nosotros asi qeu lo ajustabamos para que esto se acomodara mejor y que nuestro codigo y el de la IA hagan match

