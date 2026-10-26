import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, radius } from '@/constants/caminaTheme';
import {
  Contacto,
  obtenerContactos,
  guardarContactos,
  guardarPin,
  hayPin,
} from '@/utils/storage';

const MAX_CONTACTOS = 3;

export default function Ajustes() {
  const router = useRouter();
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [pin, setPin] = useState('');
  const [pinGuardado, setPinGuardado] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    obtenerContactos().then(setContactos);
    hayPin().then(setPinGuardado);
  }, []);

  const volver = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const agregarContacto = async () => {
    const tel = telefono.replace(/[^\d+]/g, '');
    if (!nombre.trim() || tel.length < 8) {
      setMensaje('Escribe un nombre y un teléfono válido.');
      return;
    }
    if (contactos.length >= MAX_CONTACTOS) {
      setMensaje(`Máximo ${MAX_CONTACTOS} contactos.`);
      return;
    }
    const nuevos = [...contactos, { id: Date.now().toString(), nombre: nombre.trim(), telefono: tel }];
    await guardarContactos(nuevos);
    setContactos(nuevos);
    setNombre('');
    setTelefono('');
    setMensaje('Contacto guardado.');
  };

  const eliminarContacto = async (id: string) => {
    const nuevos = contactos.filter((c) => c.id !== id);
    await guardarContactos(nuevos);
    setContactos(nuevos);
    setMensaje('');
  };

  const guardarElPin = async () => {
    if (!/^\d{4}$/.test(pin)) {
      setMensaje('El PIN debe tener exactamente 4 dígitos.');
      return;
    }
    await guardarPin(pin);
    setPin('');
    setPinGuardado(true);
    setMensaje('PIN guardado.');
  };

  return (
    <SafeAreaView style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Pressable onPress={volver}>
          <Text style={styles.volver}>← Volver</Text>
        </Pressable>
        <Text style={styles.titulo}>Ajustes</Text>

        <View style={styles.tarjeta}>
          <Text style={styles.seccion}>Contactos de emergencia ({contactos.length}/{MAX_CONTACTOS})</Text>

          {contactos.map((c) => (
            <View key={c.id} style={styles.fila}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nombre}>{c.nombre}</Text>
                <Text style={styles.suave}>{c.telefono}</Text>
              </View>
              <Pressable onPress={() => eliminarContacto(c.id)}>
                <Text style={styles.eliminar}>Eliminar</Text>
              </Pressable>
            </View>
          ))}

          {contactos.length < MAX_CONTACTOS && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Nombre"
                placeholderTextColor={colors.textoSuave}
                value={nombre}
                onChangeText={setNombre}
              />
              <TextInput
                style={styles.input}
                placeholder="Teléfono"
                placeholderTextColor={colors.textoSuave}
                keyboardType="phone-pad"
                value={telefono}
                onChangeText={setTelefono}
              />
              <Pressable style={styles.boton} onPress={agregarContacto}>
                <Text style={styles.botonTexto}>Agregar contacto</Text>
              </Pressable>
            </>
          )}
        </View>

        <View style={styles.tarjeta}>
          <Text style={styles.seccion}>PIN de seguridad</Text>
          <Text style={styles.suave}>
            {pinGuardado ? 'Ya tienes un PIN. Escribe uno nuevo para cambiarlo.' : 'Aún no defines tu PIN.'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="4 dígitos"
            placeholderTextColor={colors.textoSuave}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
            value={pin}
            onChangeText={setPin}
          />
          <Pressable style={styles.boton} onPress={guardarElPin}>
            <Text style={styles.botonTexto}>Guardar PIN</Text>
          </Pressable>
        </View>

        {mensaje !== '' && <Text style={styles.mensaje}>{mensaje}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.fondo },
  contenido: { padding: spacing.l, gap: spacing.m },
  volver: { color: colors.textoSuave, fontSize: 16 },
  titulo: { color: colors.texto, fontSize: 28, fontWeight: '700' },
  tarjeta: { backgroundColor: colors.tarjeta, borderRadius: radius.m, padding: spacing.m, gap: spacing.s },
  seccion: { color: colors.texto, fontSize: 18, fontWeight: '700' },
  fila: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.s },
  nombre: { color: colors.texto, fontSize: 16, fontWeight: '600' },
  suave: { color: colors.textoSuave, fontSize: 14 },
  eliminar: { color: colors.rojo, fontSize: 14, fontWeight: '600' },
  input: {
    backgroundColor: colors.fondo,
    color: colors.texto,
    borderRadius: spacing.s + 4,
    padding: spacing.m,
    fontSize: 16,
  },
  boton: { backgroundColor: colors.verde, borderRadius: spacing.s + 4, padding: spacing.m, alignItems: 'center' },
  botonTexto: { color: colors.fondo, fontSize: 16, fontWeight: '700' },
  mensaje: { color: colors.verde, textAlign: 'center', fontSize: 15 },
});
