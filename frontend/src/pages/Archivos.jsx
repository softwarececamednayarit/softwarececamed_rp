import React, { useState, useEffect, useCallback } from 'react';
import { 
  FolderOpen, RefreshCw, Plus, FileText, Search, Filter, Loader2 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import UploadModal from '../components/UploadModal'; 
import FileTable from '../components/FileTable'; // El nuevo componente que creaste
import archivosService from '../services/archivosService';

const Archivos = () => {
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [archivos, setArchivos] = useState([]);
  const [activeTab, setActiveTab] = useState('mis-archivos'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Lógica de carga de archivos con lógica de ingeniero: useCallback para evitar re-renders
  const fetchArchivos = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      if (activeTab === 'mis-archivos') {
        response = await archivosService.getMisArchivos();
      } else if (activeTab === 'compartidos') {
        response = await archivosService.getCompartidos();
      } else if (activeTab === 'papelera') {
        response = await archivosService.getArchivosBorrados();
      }

      if (response?.success) {
        setArchivos(response.data);
      } else {
        setArchivos([]);
      }
    } catch (error) {
      console.error("Error al cargar archivos:", error);
      toast.error("No se pudieron cargar los expedientes");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Disparar carga al montar el componente o cambiar de pestaña
  useEffect(() => {
    fetchArchivos();
  }, [fetchArchivos]);

  // Filtrado local por nombre o noOficio para que la búsqueda sea instantánea
  const archivosFiltrados = archivos.filter(file => 
    file.nombreOriginal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.noOficio?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para abrir el modal en modo edición
  const handleOpenEdit = (file) => {
    setSelectedFile(file);
    setIsUploadModalOpen(true);
  };

  // Función para abrir el modal en modo subida limpia (el botón "Subir Archivo")
  const handleOpenUpload = () => {
    setSelectedFile(null);
    setIsUploadModalOpen(true);
  };

  // Modifica el onClose para que limpie el archivo seleccionado
  const handleCloseModal = () => {
    setIsUploadModalOpen(false);
    setSelectedFile(null);
    fetchArchivos();
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER PRINCIPAL */}
      <header className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="p-4 bg-slate-900 rounded-2xl text-white shadow-lg shadow-slate-900/20 hidden sm:block">
            <FolderOpen size={32} /> 
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight text-left">
              Gestión de Expedientes
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1 text-left">
              Repositorio digital del <span className="text-indigo-600 font-bold">SACRE</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <button 
            onClick={fetchArchivos}
            disabled={loading}
            className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all disabled:opacity-50"
            title="Sincronizar"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>

          <button 
            onClick={handleOpenUpload}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-900/20 active:scale-95"
          >
            <Plus size={20} />
            <span>Subir Archivo</span>
          </button>
        </div>
      </header>

      {/* NAVEGACIÓN DE SECCIONES (TABS) */}
      <div className="flex gap-8 border-b border-slate-100 px-4">
        {[
          { id: 'mis-archivos', label: 'Mis Archivos' },
          { id: 'compartidos', label: 'Compartidos' },
          { id: 'papelera', label: 'Papelera' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${
              activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* BARRA DE FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50 p-2 rounded-3xl border border-slate-100">
        <div className="relative w-full md:w-96 text-left">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o No. de oficio..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 font-medium"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-all">
            <Filter size={18} />
            Filtros
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL / LISTADO */}
      <main className="min-h-[500px] bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/60 backdrop-blur-[2px] z-20">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
            <p className="text-slate-500 font-bold animate-pulse">Consultando base de datos...</p>
          </div>
        ) : archivosFiltrados.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
            <div className="bg-slate-50 p-8 rounded-[3rem] mb-6">
              <FileText size={64} className="text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No se encontraron archivos</h3>
            <p className="text-slate-400 mt-2 max-w-xs leading-relaxed">
              {searchTerm 
                ? `No hay resultados para "${searchTerm}" en esta sección.`
                : "Aún no se han registrado documentos en esta pestaña."}
            </p>
          </div>
        ) : (
          <FileTable 
            archivos={archivosFiltrados} 
            onRefresh={fetchArchivos} 
            onEdit={handleOpenEdit}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="flex justify-between items-center px-4 py-2">
        <div className="flex items-center gap-2">
          <span className={`flex h-2 w-2 rounded-full ${loading ? 'bg-amber-400' : 'bg-emerald-500'}`}></span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {loading ? 'Sincronizando...' : 'Conexión con Drive Activa'}
          </span>
        </div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          SACRE v1.0 • CECAMED NAYARIT
        </div>
      </footer>

      {isUploadModalOpen && (
        <UploadModal 
          isOpen={isUploadModalOpen} 
          onClose={handleCloseModal}
          archivoParaEditar={selectedFile}
        />
      )}
    </div>
  );
};

export default Archivos;