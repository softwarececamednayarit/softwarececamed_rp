import { formatDate, formatName, getStatusColor } from '../utils/formatters';
import { Eye } from 'lucide-react'; // Importamos icono para un look más moderno

export const DataTable = ({ data, onDetailClick }) => (
<div className="overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40">
  <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0">
        <thead>
          <tr className="bg-slate-50/80">
            {['Fecha', 'Nombre Completo', 'Tipo de Atención', 'Autoridad', 'Acciones'].map((header) => (
              <th 
                key={header} 
                className="px-8 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item) => (
            <tr 
              key={item.id} 
              className="hover:bg-slate-50/50 transition-all group"
            >
              {/* Fecha formateada */}
              <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-600 font-medium">
                {formatDate(item.fecha_recepcion)}
              </td>

              {/* Nombre con Capital Case */}
              <td className="px-8 py-5 whitespace-nowrap text-sm font-semibold text-slate-900">
                {formatName(`${item.nombre} ${item.apellido_paterno}`)}
              </td>

              {/* Badge Dinámico con colores de Utils */}
              <td className="px-8 py-5 whitespace-nowrap">
                <span className={`px-4 py-1.5 rounded-full text-[11px] font-black tracking-wide border uppercase ${getStatusColor(item.tipo)}`}>
                  {item.tipo || 'Sin Tipo'}
                </span>
              </td>

              {/* Autoridad Responsable */}
              <td className="px-8 py-5 whitespace-nowrap">
                 <div className="text-sm text-slate-500 italic max-w-xs truncate">
                   {item.autoridad_responsable || 'No asignada'}
                 </div>
              </td>

              {/* Botón de Acción estilizado */}
              <td className="px-8 py-5 whitespace-nowrap text-right">
                <button 
                  onClick={() => onDetailClick(item)}
                  className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 group-hover:shadow-indigo-100 active:scale-95"
                >
                  <Eye size={14} />
                  Ver Ficha
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    
    {/* Footer de la tabla (opcional) */}
    {data.length === 0 && (
      <div className="py-20 text-center">
        <p className="text-slate-400 font-medium">No se encontraron registros coincidentes.</p>
      </div>
    )}
  </div>
);