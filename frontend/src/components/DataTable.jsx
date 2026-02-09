import { formatDate, formatName } from '../utils/formatters';
import { Eye, FileText, Scale } from 'lucide-react'; // Agregué Scale para Dictamen

export const DataTable = ({ data, onDetailClick }) => {

  // 1. LÓGICA DE COLORES MEJORADA (Incluye Dictamen)
  const getBadgeStyle = (tipoRaw) => {
    const tipo = (tipoRaw || '').toLowerCase();
    
    if (tipo.includes('dictamen')) return 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-100';
    if (tipo.includes('queja')) return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-100';
    if (tipo.includes('gesti')) return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100';
    if (tipo.includes('asesor')) return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-100';
    if (tipo.includes('orientaci')) return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-100';
    
    return 'bg-slate-50 text-slate-600 border-slate-200 ring-slate-100'; // Default
  };

  // 2. HELPER PARA INICIALES
  const getInitials = (nombre, paterno) => {
    return `${nombre?.charAt(0) || ''}${paterno?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="overflow-hidden bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50/50">
              {['Fecha', 'Ciudadano', 'Asunto', 'Autoridad / Procedencia', ' '].map((header, i) => (
                <th 
                  key={i} 
                  className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] first:pl-10 last:pr-10"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item) => {
              const badgeStyle = getBadgeStyle(item.tipo);
              const nombreCompleto = formatName(`${item.nombre} ${item.apellido_paterno} ${item.apellido_materno || ''}`);

              return (
                <tr 
                  key={item.id} 
                  onClick={() => onDetailClick(item)}
                  className="group hover:bg-slate-50/80 transition-all duration-300 cursor-pointer"
                >
                  {/* Fecha */}
                  <td className="px-8 py-5 whitespace-nowrap first:pl-10">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">
                            {formatDate(item.fecha_recepcion)}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                            Registro
                        </span>
                    </div>
                  </td>

                  {/* Ciudadano con Iniciales */}
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs shadow-sm group-hover:scale-110 transition-transform duration-300">
                        {getInitials(item.nombre, item.apellido_paterno)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                            {nombreCompleto}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 truncate max-w-[120px]">
                            {item.curp || 'Sin CURP'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Badge Tipo (Dictamen arreglado aquí) */}
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wide border shadow-sm ring-1 ring-inset ${badgeStyle}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badgeStyle.replace('bg-', 'bg-current ').split(' ')[0]} opacity-50`}></span>
                      {(item.tipo || 'GENERAL').toUpperCase()}
                    </span>
                  </td>

                  {/* Autoridad */}
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-slate-500 max-w-[200px]">
                        <span className="p-1.5 bg-slate-100 rounded-lg text-slate-400">
                            <FileText size={12} />
                        </span>
                        <p className="text-xs font-medium truncate" title={item.institucion || item.autoridad_responsable}>
                            {item.institucion || item.autoridad_responsable || 'No especificada'}
                        </p>
                    </div>
                  </td>

                  {/* Acciones */}
                  <td className="px-8 py-5 whitespace-nowrap text-right last:pr-10">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Evitar doble click con el row
                        onDetailClick(item);
                      }}
                      className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm group-hover:translate-x-0 translate-x-2 opacity-0 group-hover:opacity-100"
                      title="Ver Detalles"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Empty State Mejorado */}
      {data.length === 0 && (
        <div className="py-24 flex flex-col items-center justify-center bg-slate-50/30 border-t border-slate-100">
          <div className="bg-white p-4 rounded-[2rem] shadow-xl shadow-slate-100 mb-4 ring-1 ring-slate-100">
             <Scale size={40} className="text-slate-300" strokeWidth={1.5} />
          </div>
          <p className="text-slate-500 font-bold text-sm">No se encontraron expedientes</p>
          <p className="text-slate-400 text-xs mt-1">Intenta cambiar los filtros de búsqueda</p>
        </div>
      )}
    </div>
  );
};