import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Contacto, Trayecto } from '@/types';
import {
  obtenerContactos,
  guardarContactos,
  obtenerHistorial,
  guardarHistorial,
  obtenerModoPrueba,
  guardarModoPrueba,
} from '@/utils/storage';

export const MAX_CONTACTOS = 3;

type DatosContextType = {
  contactos: Contacto[];
  historial: Trayecto[];
  modoPrueba: boolean;
  cargando: boolean;
  agregarContacto: (nombre: string, telefono: string) => void;
  eliminarContacto: (id: string) => void;
  agregarTrayecto: (trayecto: Omit<Trayecto, 'id'>) => void;
  eliminarTrayecto: (id: string) => void;
  limpiarHistorial: () => void;
  setModoPrueba: (valor: boolean) => void;
};

const DatosContext = createContext<DatosContextType | null>(null);

export function DatosProvider({ children }: { children: ReactNode }) {
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [historial, setHistorial] = useState<Trayecto[]>([]);
  const [modoPrueba, setModoPrueba] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Al abrir la app: leer lo guardado
  useEffect(() => {
    Promise.all([obtenerContactos(), obtenerHistorial(), obtenerModoPrueba()])
      .then(([c, h, m]) => {
        setContactos(c);
        setHistorial(h);
        setModoPrueba(m);
      })
      .finally(() => setCargando(false));
  }, []);

  // Cada vez que cambian los datos, guardarlos (solo después de la carga inicial)
  useEffect(() => {
    if (!cargando) guardarContactos(contactos);
  }, [contactos, cargando]);

  useEffect(() => {
    if (!cargando) guardarHistorial(historial);
  }, [historial, cargando]);

  useEffect(() => {
    if (!cargando) guardarModoPrueba(modoPrueba);
  }, [modoPrueba, cargando]);

  const agregarContacto = (nombre: string, telefono: string) => {
    const nuevo: Contacto = { id: Date.now().toString(), nombre, telefono };
    setContactos((prev) => [...prev, nuevo]);
  };

  const eliminarContacto = (id: string) => {
    setContactos((prev) => prev.filter((c) => c.id !== id));
  };

  const agregarTrayecto = (trayecto: Omit<Trayecto, 'id'>) => {
    const nuevo: Trayecto = { id: Date.now().toString(), ...trayecto };
    setHistorial((prev) => [nuevo, ...prev]); // el más reciente primero
  };

  const eliminarTrayecto = (id: string) => {
    setHistorial((prev) => prev.filter((t) => t.id !== id));
  };

  const limpiarHistorial = () => setHistorial([]);

  return (
    <DatosContext.Provider
      value={{
        contactos,
        historial,
        modoPrueba,
        cargando,
        agregarContacto,
        eliminarContacto,
        agregarTrayecto,
        eliminarTrayecto,
        limpiarHistorial,
        setModoPrueba,
      }}
    >
      {children}
    </DatosContext.Provider>
  );
}

export function useDatos() {
  const ctx = useContext(DatosContext);
  if (!ctx) throw new Error('useDatos debe usarse dentro de DatosProvider');
  return ctx;
}
