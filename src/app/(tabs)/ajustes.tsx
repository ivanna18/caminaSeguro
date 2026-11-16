import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '@/constants/caminaTheme';
import { guardarPin, hayPin, verificarPin } from '@/utils/storage';
import { useDatos, MAX_CONTACTOS } from '@/context/DatosContext';
import ContactoItem from '@/components/ContactoItem';
import CampoTexto from '@/components/CampoTexto';

type ErroresContacto = { nombre?: string; telefono?: string };
type ErroresPin = { actual?: string; nuevo?: string; confirmar?: string };

export default function Ajustes() {
  const { contactos, agregarContacto, eliminarContacto, modoPrueba, setModoPrueba } = useDatos();

  // Formulario de contactos
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [errContacto, setErrContacto] = useState<ErroresContacto>({});

  // Formulario del PIN
  const [pinActual, setPinActual] = useState('');
  const [pin, setPin] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [pinGuardado, setPinGuardado] = useState(false);
  const [errPin, setErrPin] = useState<ErroresPin>({});

  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    hayPin().then(setPinGuardado);
  }, []);

  const soloDigitos = (t: string) => t.replace(/\D/g, '');

  const onAgregar = () => {
    const errores: ErroresContacto = {};
    const nom = nombre.trim();
    const tel = telefono.replace(/[^\d+]/g, '');
    const digitos = soloDigitos(tel);

    if (nom.length < 2) errores.nombre = 'Escribe un nombre de al menos 2 letras.';
    else if (nom.length > 30) errores.nombre = 'El nombre es muy largo (máximo 30 caracteres).';

    if (digitos.length < 10 || digitos.length > 13) {
      errores.telefono = 'Escribe un teléfono de 10 dígitos.';
    } else if (contactos.some((c) => soloDigitos(c.telefono).slice(-10) === digitos.slice(-10))) {
      errores.telefono = 'Ya tienes un contacto con ese teléfono.';
    }

    setErrContacto(errores);
    setMensaje('');
    if (Object.keys(errores).length > 0) return;

    agregarContacto(nom, tel);
    setNombre('');
    setTelefono('');
    setMensaje('Contacto guardado.');
  };

  const onEliminar = (id: string) => {
    eliminarContacto(id);
    setMensaje('');
  };

  const onGuardarPin = async () => {
    const errores: ErroresPin = {};

    if (pinGuardado) {
      if (!/^\d{4}$/.test(pinActual)) errores.actual = 'Escribe tu PIN actual (4 dígitos).';
      else if (!(await verificarPin(pinActual))) errores.actual = 'El PIN actual es incorrecto.';
    }

    if (!/^\d{4}$/.test(pin)) errores.nuevo = 'El PIN debe tener exactamente 4 dígitos.';
    else if (/^(\d)\1{3}$/.test(pin)) errores.nuevo = 'Evita un PIN con los 4 dígitos iguales.';

    if (!errores.nuevo && confirmar !== pin) errores.confirmar = 'Los PIN no coinciden.';

    setErrPin(errores);
    setMensaje('');
    if (Object.keys(errores).length > 0) return;

    await guardarPin(pin);
    setPinActual('');
    setPin('');
    setConfirmar('');
    setPinGuardado(true);
    setMensaje('PIN guardado.');
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>Ajustes</Text>

        <View style={styles.tarjeta}>
          <Text style={styles.seccion}>
            Contactos de emergencia ({contactos.length}/{MAX_CONTACTOS})
          </Text>

          {contactos.length === 0 && (
            <Text style={styles.suave}>Aún no tienes contactos. Agrega al menos uno.</Text>
          )}

          {contactos.map((c) => (
            <ContactoItem key={c.id} contacto={c} onEliminar={onEliminar} />
          ))}

          {contactos.length < MAX_CONTACTOS ? (
            <>
              <CampoTexto
                placeholder="Nombre"
                value={nombre}
                onChangeText={(t) => {
                  setNombre(t);
                  setErrContacto((e) => ({ ...e, nombre: undefined }));
                }}
                error={errContacto.nombre}
              />
              <CampoTexto
                placeholder="Teléfono (10 dígitos)"
                keyboardType="phone-pad"
                value={telefono}
                onChangeText={(t) => {
                  setTelefono(t);
                  setErrContacto((e) => ({ ...e, telefono: undefined }));
                }}
                error={errContacto.telefono}
              />
              <Pressable style={styles.boton} onPress={onAgregar}>
                <Text style={styles.botonTexto}>Agregar contacto</Text>
              </Pressable>
            </>
          ) : (
            <Text style={styles.suave}>Llegaste al máximo de contactos. Elimina uno para agregar otro.</Text>
          )}
        </View>

        <View style={styles.tarjeta}>
          <Text style={styles.seccion}>PIN de seguridad</Text>
          <Text style={styles.suave}>
            {pinGuardado ? 'Para cambiarlo, escribe primero tu PIN actual.' : 'Aún no defines tu PIN.'}
          </Text>

          {pinGuardado && (
            <CampoTexto
              placeholder="PIN actual"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              value={pinActual}
              onChangeText={(t) => {
                setPinActual(soloDigitos(t));
                setErrPin((e) => ({ ...e, actual: undefined }));
              }}
              error={errPin.actual}
            />
          )}

          <CampoTexto
            placeholder="PIN nuevo (4 dígitos)"
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
            value={pin}
            onChangeText={(t) => {
              setPin(soloDigitos(t));
              setErrPin((e) => ({ ...e, nuevo: undefined }));
            }}
            error={errPin.nuevo}
          />
          <CampoTexto
            placeholder="Confirma el PIN"
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
            value={confirmar}
            onChangeText={(t) => {
              setConfirmar(soloDigitos(t));
              setErrPin((e) => ({ ...e, confirmar: undefined }));
            }}
            error={errPin.confirmar}
          />
          <Pressable style={styles.boton} onPress={onGuardarPin}>
            <Text style={styles.botonTexto}>{pinGuardado ? 'Cambiar PIN' : 'Guardar PIN'}</Text>
          </Pressable>
        </View>

        <View style={styles.tarjeta}>
          <View style={styles.filaSwitch}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.seccion}>Modo de prueba</Text>
              <Text style={styles.suave}>
                Muestra "Simular caída" en el trayecto y una salida rápida en la alarma. Útil para demostraciones.
              </Text>
            </View>
            <Switch
              value={modoPrueba}
              onValueChange={setModoPrueba}
              trackColor={{ true: colors.verde, false: colors.textoSuave }}
            />
          </View>
        </View>

        {mensaje !== '' && <Text style={styles.mensaje}>{mensaje}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.fondo },
  contenido: { padding: spacing.l, gap: spacing.m },
  titulo: { color: colors.texto, fontSize: 28, fontWeight: '700' },
  tarjeta: { backgroundColor: colors.tarjeta, borderRadius: radius.m, padding: spacing.m, gap: spacing.s },
  seccion: { color: colors.texto, fontSize: 18, fontWeight: '700' },
  suave: { color: colors.textoSuave, fontSize: 14 },
  boton: { backgroundColor: colors.verde, borderRadius: spacing.s + 4, padding: spacing.m, alignItems: 'center' },
  botonTexto: { color: colors.fondo, fontSize: 16, fontWeight: '700' },
  mensaje: { color: colors.verde, textAlign: 'center', fontSize: 15 },
  filaSwitch: { flexDirection: 'row', alignItems: 'center', gap: spacing.m },
});