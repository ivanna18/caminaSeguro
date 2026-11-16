
export function formatoTiempo(seg: number) {
  const m = Math.floor(seg / 60).toString().padStart(2, '0');
  const s = (seg % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function formatoDistancia(metros: number) {
  return metros >= 1000 ? `${(metros / 1000).toFixed(2)} km` : `${Math.round(metros)} m`;
}


export function formatoFecha(iso: string) {
  const d = new Date(iso);
  const dos = (n: number) => n.toString().padStart(2, '0');
  return `${dos(d.getDate())}/${dos(d.getMonth() + 1)}/${d.getFullYear()} ${dos(d.getHours())}:${dos(d.getMinutes())}`;
}