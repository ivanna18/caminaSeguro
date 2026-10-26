import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

export type Contacto = { id: string; nombre: string; telefono: string };

const CLAVE_CONTACTOS = 'contactos';
const CLAVE_PIN = 'pin_hash';

export async function obtenerContactos(): Promise<Contacto[]> {
  const raw = await AsyncStorage.getItem(CLAVE_CONTACTOS);
  return raw ? JSON.parse(raw) : [];
}

export async function guardarContactos(lista: Contacto[]) {
  await AsyncStorage.setItem(CLAVE_CONTACTOS, JSON.stringify(lista));
}

async function setSeguro(clave: string, valor: string) {
  if (Platform.OS === 'web') return AsyncStorage.setItem(clave, valor);
  return SecureStore.setItemAsync(clave, valor);
}

async function getSeguro(clave: string) {
  if (Platform.OS === 'web') return AsyncStorage.getItem(clave);
  return SecureStore.getItemAsync(clave);
}

async function hashPin(pin: string) {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `caminaSeguro:${pin}`
  );
}

export async function guardarPin(pin: string) {
  await setSeguro(CLAVE_PIN, await hashPin(pin));
}

export async function hayPin() {
  return (await getSeguro(CLAVE_PIN)) !== null;
}

export async function verificarPin(pin: string) {
  const guardado = await getSeguro(CLAVE_PIN);
  return guardado !== null && guardado === (await hashPin(pin));
}