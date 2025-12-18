export const DataTable = ({ data, onDetailClick }) => (
  <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {['Fecha', 'Nombre', 'Tipo', 'Estatus', 'Acciones'].map((header) => (
            <th key={header} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {data.map((item) => (
          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.fecha_recepcion}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.nombre} {item.apellido_paterno}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                {item.tipo}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
               <div className="text-sm text-gray-500">{item.autoridad_responsable || 'N/A'}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button 
                onClick={() => onDetailClick(item)}
                className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md"
              >
                Ver Detalles
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);