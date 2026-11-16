export type Contacto = { id: string; nombre: string; telefono: string };

export type ResultadoTrayecto = 'completado' | 'caida' | 'panico' | 'checkin';

export type Trayecto = {
  id: string;
  inicio: string;          
  duracionSeg: number;
  distanciaM: number;
  resultado: ResultadoTrayecto;
};