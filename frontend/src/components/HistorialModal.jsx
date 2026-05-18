import { useState, useEffect } from 'react';
import { getHistorialArchivo, agregarHistorialManual } from '../services/archivosService';

export default function HistorialModal({ isOpen, onClose, archivoId, nombreArchivo }) {
  const [historial, setHistorial] = useState([]);
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (isOpen && archivoId) {
      cargarHistorial();
    }
  }, [isOpen, archivoId]);

  const cargarHistorial = async () => {
    try {
      const res = await getHistorialArchivo(archivoId);
      if (res.success) setHistorial(res.data);
    } catch (error) {
      console.error("Error al cargar historial", error);
    }
  };

  const handleAgregarManual = async (e) => {
    e.preventDefault();
    if (!nuevaDescripcion.trim()) return;

    setCargando(true);
    try {
      const res = await agregarHistorialManual(archivoId, nuevaDescripcion);
      if (res.success) {
        setNuevaDescripcion('');
        await cargarHistorial(); // Recargar la lista para mostrar el nuevo registro
      }
    } catch (error) {
      console.error("Error al agregar registro", error);
    } finally {
      setCargando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Historial: {nombreArchivo}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>

        {/* Lista de Historial (Scrollable) */}
        <div className="p-4 flex-1 overflow-y-auto bg-gray-50">
          {historial.length === 0 ? (
            <p className="text-gray-500 text-center">No hay registros en el historial.</p>
          ) : (
            <ul className="space-y-3">
              {historial.map((item) => (
                <li key={item.id} className="bg-white p-3 rounded shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${item.accion === 'REGISTRO_MANUAL' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                      {item.accion.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(item.fecha).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800">{item.descripcion}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Formulario para agregar manual */}
        <div className="p-4 border-t bg-white">
          <form onSubmit={handleAgregarManual} className="flex gap-2">
            <input
              type="text"
              placeholder="Escribe un nuevo registro manual..."
              className="flex-1 p-2 border rounded focus:outline-none focus:border-blue-500"
              value={nuevaDescripcion}
              onChange={(e) => setNuevaDescripcion(e.target.value)}
              disabled={cargando}
            />
            <button
              type="submit"
              disabled={cargando || !nuevaDescripcion.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {cargando ? 'Guardando...' : 'Agregar'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}