/**
 * Utilidades para estandarizar el formato de datos en el Dashboard
 */

// 1. Normalización para búsquedas (Interno)
export const normalizeText = (text) => 
  text?.toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim() || "";

// 2. Formateador de Fechas
export const formatDate = (dateString) => {
  if (!dateString) return '---';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC' // <--- ESTO EVITA QUE CAMBIE EL DÍA
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

// 3. Formateador de Nombres (Simple y compatible con acentos)
export const formatName = (name) => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// 4. Lógica de Colores (Badges)
export const getStatusColor = (tipo) => {
  const t = normalizeText(tipo);
  if (t.includes('queja')) return 'bg-rose-100 text-rose-700 border-rose-200';
  if (t.includes('asesoria')) return 'bg-blue-100 text-blue-700 border-blue-200';
  if (t.includes('gestion')) return 'bg-indigo-100 text-indigo-700 border-indigo-200';
  if (t.includes('orientacion')) return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
};