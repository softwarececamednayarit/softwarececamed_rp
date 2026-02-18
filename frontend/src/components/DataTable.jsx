import { formatDate, formatName } from '../utils/formatters';
import { Eye, FileText, Scale } from 'lucide-react';

// Tabla principal para listar expedientes/atendidos.
// Props:
// - data: array de registros a mostrar
// - onDetailClick: callback cuando se solicita ver detalle (recibe el item)
export const DataTable = ({ data, onDetailClick }) => {

  const getBadgeStyle = (tipoRaw) => {
    const tipo = (tipoRaw || '').toLowerCase();
    
    if (tipo.includes('dictamen')) return 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-100';
    if (tipo.includes('queja')) return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-100';
    if (tipo.includes('gesti')) return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100';
    if (tipo.includes('asesor')) return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-100';
    if (tipo.includes('orientaci')) return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-100';
    
    return 'bg-slate-50 text-slate-600 border-slate-200 ring-slate-100'; 
  };

  const getInitials = (nombre, paterno) => {
    return `${nombre?.charAt(0) || ''}${paterno?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    // Se quitó el fondo blanco, el borde y la sombra pesada del contenedor
    // para que la tabla fluya de forma natural dentro de la sección superior.
    <div className="overflow-hidden w-full">
      <div className="overflow-x-auto custom-scrollbar pb-4">
        <table className="min-w-full border-collapse w-full">
          <thead>
            {/* Se cambió el color del header y se le dio un borde inferior sutil */}
            <tr className="border-b border-slate-100">
              {['Fecha', 'Ciudadano', 'Asunto', 'Autoridad / Procedencia', 'Acciones'].map((header, i) => (
                <th 
                  key={i} 
                  className={`px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap
                    ${i === 0 ? 'pl-2' : ''} 
                    ${i === 4 ? 'text-right pr-2' : ''}
                  `}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50/80">
            {data.map((item) => {
              const badgeStyle = getBadgeStyle(item.tipo);
              const nombreCompleto = formatName(`${item.nombre} ${item.apellido_paterno} ${item.apellido_materno || ''}`);

              return (
                <tr 
                  key={item.id} 
                  onClick={() => onDetailClick(item)}
                  // Hover más sutil para que no brinque tanto a la vista
                  className="group hover:bg-slate-50/50 transition-colors duration-200 cursor-pointer"
                >
                  <td className="px-6 py-5 whitespace-nowrap pl-2">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[13px] font-bold text-slate-700">
                            {formatDate(item.fecha_recepcion)}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Registro
                        </span>
                    </div>
                  </td>

                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-[0.8rem] bg-indigo-50 border border-indigo-100/50 flex items-center justify-center text-indigo-600 font-black text-xs group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                        {getInitials(item.nombre, item.apellido_paterno)}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[13px] font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                            {nombreCompleto}
                        </span>
                        <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded w-fit border border-slate-100/50">
                            {item.curp || 'S/C'}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest border shadow-sm ring-1 ring-inset uppercase ${badgeStyle}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badgeStyle.replace('bg-', 'bg-current ').split(' ')[0]} opacity-50`}></span>
                      {item.tipo || 'GENERAL'}
                    </span>
                  </td>

                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3 text-slate-500 max-w-[220px]">
                        <span className="p-1.5 bg-slate-50 rounded-lg text-slate-400 border border-slate-100">
                            <FileText size={14} />
                        </span>
                        <p className="text-[11px] font-bold text-slate-600 truncate" title={item.institucion || item.autoridad_responsable}>
                            {item.institucion || item.autoridad_responsable || 'No especificada'}
                        </p>
                    </div>
                  </td>

                  <td className="px-6 py-5 whitespace-nowrap text-right pr-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDetailClick(item);
                      }}
                      className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm group-hover:scale-100 scale-95 opacity-0 group-hover:opacity-100"
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
      
      {data.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center border-t border-slate-100">
          <div className="bg-slate-50 p-5 rounded-3xl mb-4">
             <Scale size={32} className="text-slate-300" strokeWidth={1.5} />
          </div>
          <p className="text-slate-500 font-bold text-sm">No hay registros para mostrar</p>
          <p className="text-slate-400 text-xs mt-1">Ajuste los filtros de búsqueda</p>
        </div>
      )}
    </div>
  );
};