import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { Contacto, Trayecto } from '@/types';

const CLAVE_CONTACTOS = 'contactos';
const CLAVE_HISTORIAL = 'historial';
const CLAVE_PIN = 'pin_hash';

export async function obtenerContactos(): Promise<Contacto[]> {
  const raw = await AsyncStorage.getItem(CLAVE_CONTACTOS);
  return raw ? JSON.parse(raw) : [];
}

export async function guardarContactos(lista: Contacto[]) {
  await AsyncStorage.setItem(CLAVE_CONTACTOS, JSON.stringify(lista));
}

export async function obtenerHistorial(): Promise<Trayecto[]> {
  const raw = await AsyncStorage.getItem(CLAVE_HISTORIAL);
  return raw ? JSON.parse(raw) : [];
}

export async function guardarHistorial(lista: Trayecto[]) {
  await AsyncStorage.setItem(CLAVE_HISTORIAL, JSON.stringify(lista));
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

const CLAVE_MODO_PRUEBA = 'modo_prueba';

export async function obtenerModoPrueba(): Promise<boolean> {
  return (await AsyncStorage.getItem(CLAVE_MODO_PRUEBA)) === 'true';
}

export async function guardarModoPrueba(valor: boolean) {
  await AsyncStorage.setItem(CLAVE_MODO_PRUEBA, String(valor));
}