import { formatDate, formatName, getStatusColor } from '../utils/formatters';
import { Eye, User } from 'lucide-react'; 

export const DataTable = ({ data, onDetailClick }) => (
  <div className="overflow-hidden bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40">
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0">
        <thead>
          <tr className="bg-slate-50/80">
            {['Fecha', 'Nombre del Ciudadano', 'Tipo de Atención', 'Autoridad', 'Acciones'].map((header) => (
              <th 
                key={header} 
                className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((item) => (
            <tr 
              key={item.id} 
              className="hover:bg-indigo-50/30 transition-all group cursor-default"
            >
              {/* Fecha: Más minimalista */}
              <td className="px-8 py-6 whitespace-nowrap text-sm text-slate-500 font-medium">
                {formatDate(item.fecha_recepcion)}
              </td>

              {/* Ciudadano: Con avatar visual */}
              <td className="px-8 py-6 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                    <User size={16} />
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    {formatName(`${item.nombre} ${item.apellido_paterno} ${item.apellido_materno || ''}`)}
                  </div>
                </div>
              </td>

              {/* Badge: Usando tu lógica de colores unificada */}
              <td className="px-8 py-6 whitespace-nowrap">
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest border uppercase transition-colors ${getStatusColor(item.tipo)}`}>
                  {item.tipo || 'Sin Tipo'}
                </span>
              </td>

              {/* Autoridad: Texto más suave */}
              <td className="px-8 py-6 whitespace-nowrap">
                <p className="text-sm text-slate-500 font-medium max-w-48 truncate">
                  {item.institucion || item.autoridad_responsable || '---'}
                </p>
              </td>

              {/* Botón: Cambio de color en hover de la fila */}
              <td className="px-8 py-6 whitespace-nowrap text-right">
                <button 
                  onClick={() => onDetailClick(item)}
                  className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 group-hover:shadow-indigo-200/40 active:scale-95"
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
    
    {data.length === 0 && (
      <div className="py-32 flex flex-col items-center justify-center bg-slate-50/20">
        <div className="bg-slate-100 p-4 rounded-full mb-4">
            <User size={32} className="text-slate-300" />
        </div>
        <p className="text-slate-400 font-bold text-lg">No hay registros que coincidan</p>
        <p className="text-slate-400 text-sm">Intenta ajustar los filtros de búsqueda</p>
      </div>
    )}
  </div>
);