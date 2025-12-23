/**
 * Utilidades para estandarizar el formato de datos en el Dashboard
 */

// Formatea fechas de Firebase o strings a: "23 Dic 2025"
export const formatDate = (dateString) => {
  if (!dateString) return '---';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

// Convierte texto a "Capital Case" (ej: JUAN -> Juan)
export const formatName = (name) => {
  if (!name) return '';
  return name.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
};

// Asigna un color de badge según el tipo de atención
export const getStatusColor = (tipo) => {
  const t = tipo?.toUpperCase() || '';
  if (t.includes('QUEJA')) return 'bg-rose-100 text-rose-700 border-rose-200';
  if (t.includes('ASESORÍA')) return 'bg-blue-100 text-blue-700 border-blue-200';
  if (t.includes('ORIENTACIÓN')) return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
};