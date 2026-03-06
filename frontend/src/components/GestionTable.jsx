import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Save, X, Edit2, Loader2, AlertCircle, 
  Briefcase, Eye, MessageSquare, Building2, Filter, ChevronDown, ChevronUp
} from 'lucide-react';
import { AtendidosService } from '../services/atendidosService';
import toast from 'react-hot-toast';

// =============================================================================
// CATÁLOGOS ESTÁTICOS
// =============================================================================
import { MOTIVOS_CATALOGO, 
        ESTADOS_CIVILES,
        ACTIVIDADES_APOYO,
        ESPECIALIDADES_LISTA,
        obtenerEspecialidadSugerida
} from '../utils/catalogs';

// =============================================================================
// HELPER PARA CLASIFICAR INSTITUCIÓN (BASADO EN TUS ESTADÍSTICAS)
// =============================================================================
const getInstitucionGroupName = (nombreRaw) => {
  const nombre = (nombreRaw || '').toUpperCase();
  
  if (
      nombre.includes('IMSS') || 
      nombre.includes('HGZ') || 
      nombre.includes('UMF') || 
      nombre.includes('HGR') ||
      nombre.includes('HOSPITAL GENERAL') || 
      nombre.includes('BIENESTAR')
  ) {
      return 'IMSS';
  } else if (
      nombre.includes('ISSSTE') || 
      nombre.includes('FOVISSSTE') ||
      nombre.includes('CH ') || 
      nombre.includes('CLINICA HOSPITAL')
  ) {
      return 'ISSSTE';
  } else if (
      nombre.includes('SSN') || 
      nombre.includes('SSA') || 
      nombre.includes('SERVICIOS DE SALUD') || 
      nombre.includes('HOSPITAL CIVIL') || 
      nombre.includes('CENTRO DE SALUD') ||
      nombre.includes('CESSA') ||
      nombre.includes('UNEME') ||
      nombre.includes('INSABI') ||
      nombre.includes('REINSERCION') ||
      nombre.includes('CERESO')
  ) {
      return 'SSN';
  } else if (
      nombre.includes('PRIV') || 
      nombre.includes('PARTICULAR') || 
      nombre.includes('CONSULTORIO') || 
      nombre.includes('FARMACIA') || 
      nombre.includes('SANATORIO') ||
      nombre.includes('CLINICA SAN') || 
      nombre.includes('PUERTA DE HIERRO') ||
      nombre.includes('CMQ') ||
      nombre.includes('HOSPITAL REAL')
  ) {
      return 'PRIVADO';
  } else {
      return 'OTROS';
  }
};

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export const GestionTable = ({ onViewDetails }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isOtherSpecialty, setIsOtherSpecialty] = useState(false);
  const [isOtherSubmotivo, setIsOtherSubmotivo] = useState(false);

  // --- ESTADO DE FILTROS AVANZADOS ---
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    estado_civil: '',
    especialidad: '',
    foraneo: '', 
    municipio: '',
    motivo_inconformidad: '',
    institucion: '',
    fecha_inicio: '',   // NUEVO
    fecha_fin: '',      // NUEVO
    orden: 'reciente'   // NUEVO (Default: más recientes primero)
  });

  // --- CARGA ---
  const loadData = async () => {
    try {
      setLoading(true);
      const response = await AtendidosService.getPadronReport(); 
      if (response && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Error cargando tabla gestión", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // --- EXTRACCIÓN DINÁMICA DE OPCIONES (MUNICIPIOS) ---
  const uniqueMunicipios = useMemo(() => {
    const list = data.map(item => item.municipio?.trim().toUpperCase()).filter(Boolean);
    return [...new Set(list)].sort();
  }, [data]);

  const INSTITUCIONES_LISTA = ['IMSS', 'ISSSTE', 'SSN', 'PRIVADO', 'OTROS'];

  // --- HELPER: OBTENER AÑO Y FECHA EXACTA ---
  const getYearFromRow = (row) => {
      if (row.fecha_recepcion) return new Date(row.fecha_recepcion).getFullYear();
      if (row.created_at) return new Date(row.created_at).getFullYear();
      return new Date().getFullYear();
  };

  const getExactDateFromRow = (row) => {
      if (row.fecha_recepcion) return new Date(row.fecha_recepcion + 'T00:00:00');
      if (row.created_at) return new Date(row.created_at);
      return new Date(0); 
  };

  // --- EDICIÓN ---
  const startEditing = (row) => {
    setEditingId(row.id);
    
    // 1. ESPECIALIDAD
    const espOriginal = row.especialidad_medica || row.especialidad || '';
    const espSugerida = obtenerEspecialidadSugerida(espOriginal);
    const esEspecialidadEstandar = ESPECIALIDADES_LISTA.includes(espSugerida);
    setIsOtherSpecialty(!!espSugerida && !esEspecialidadEstandar);

    // 2. SUBMOTIVO
    const mot = row.motivo_inconformidad || '';
    const catalogoSub = MOTIVOS_CATALOGO[mot] || [];
    
    let finalSubmotivo = '';
    let isOtherSub = false;

    if (row.submotivo_catalogo) {
        if (catalogoSub.includes(row.submotivo_catalogo)) {
            finalSubmotivo = row.submotivo_catalogo;
            isOtherSub = false;
        } else {
            finalSubmotivo = row.submotivo_catalogo;
            isOtherSub = true;
        }
    } else {
        finalSubmotivo = '';
        isOtherSub = false;
    }

    setIsOtherSubmotivo(isOtherSub);

    // 3. FORÁNEO
    let valorForaneo = row.foraneo === true || row.foraneo === "true";
    const municipio = (row.municipio || '').trim().toUpperCase();
    if (municipio && municipio !== 'TEPIC') {
        valorForaneo = true;
    }

    // 4. VÍA TELEFÓNICA
    let valorTelefonico = row.via_telefonica === true || row.via_telefonica === "true";
    const formaRecepcion = (row.forma_recepcion || '').trim().toLowerCase();
    
    if (formaRecepcion.includes('telefónica') || formaRecepcion.includes('telefonica')) {
        valorTelefonico = true;
    }

    // 5. SETEAR ESTADO DEL FORMULARIO
    setEditForm({
      domicilio: row.domicilio || '', 
      ocupacion: row.cargo_ocupacion || row.ocupacion || '', 
      representante: row.representante || '',
      prestador_nombre: row.prestador_nombre || '',
      observaciones_servicio: row.observaciones_servicio || '',
      foraneo: valorForaneo, 
      diagnostico: row.diagnostico || '', 
      via_telefonica: valorTelefonico, 
      estado_civil: row.estado_civil || ESTADOS_CIVILES[0],
      actividad_apoyo: row.actividad_apoyo || ACTIVIDADES_APOYO[0], 
      
      especialidad: espSugerida, 
      motivo_inconformidad: mot,
      
      submotivo_catalogo: finalSubmotivo, 
      
      servicio: row.servicio || '',
      no_asignado: row.no_asignado || ''
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
    setIsOtherSpecialty(false);
    setIsOtherSubmotivo(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === 'checkbox' ? checked : value;
    
    if (name === 'servicio' && typeof val === 'string') {
        val = val.toUpperCase().trim();
    }

    setEditForm(prev => {
      const newState = { ...prev, [name]: val };
      if (name === 'motivo_inconformidad') {
        newState.submotivo_catalogo = '';
        setIsOtherSubmotivo(false); 
      }
      return newState;
    });
  };

  const handleSpecialtySelect = (e) => {
    const val = e.target.value;
    if (val === 'OTROS') {
      setIsOtherSpecialty(true);
      setEditForm(prev => ({ ...prev, especialidad: '' })); 
    } else {
      setIsOtherSpecialty(false);
      setEditForm(prev => ({ ...prev, especialidad: val }));
    }
  };

  const handleSubmotivoSelect = (e) => {
    const val = e.target.value;
    
    if (val && val.toUpperCase().includes('OTRO')) {
      setIsOtherSubmotivo(true);
      setEditForm(prev => ({ ...prev, submotivo_catalogo: '' }));
    } else {
      setIsOtherSubmotivo(false);
      setEditForm(prev => ({ ...prev, submotivo_catalogo: val }));
    }
  };

  // --- GUARDADO Y VALIDACIÓN ---
  const saveRow = async (id) => {
    const servicioTrimmed = (editForm.servicio || '').trim();
    if (servicioTrimmed) {
        const regexBasico = /^[A-Z]-\d{1,4}$/;
        const regexQueja = /^[A-Z]\d{1,4}\/(?:[ivxlcdmIVXLCDM]+|\d{1,4})\/\d{4}$/;

        if (!regexBasico.test(servicioTrimmed) && !regexQueja.test(servicioTrimmed)) {
            toast.error("❌ El formato del Folio de Servicio es incorrecto.\nEjemplos válidos:\n• G-01\n• O-15\n• Q1/V/2026");
            return;
        }

        const actividadSeleccionada = editForm.actividad_apoyo || '';
        if (actividadSeleccionada) {
            const letraEsperada = actividadSeleccionada.charAt(0).toUpperCase(); 
            const letraIngresada = servicioTrimmed.charAt(0).toUpperCase();

            if (letraEsperada !== letraIngresada) {
                toast.error(`❌ Inconsistencia detectada:\n\nEl Folio ingresado empieza con "${letraIngresada}", pero la actividad seleccionada es "${actividadSeleccionada}".\n\nEl folio debería empezar con la letra "${letraEsperada}".`);
                return;
            }
        }
    }

    const filaActual = data.find(item => item.id === id);
    const anioFilaActual = getYearFromRow(filaActual);

    const duplicadoServicio = data.find(item => 
        item.id !== id && 
        item.servicio && 
        item.servicio === servicioTrimmed &&
        getYearFromRow(item) === anioFilaActual
    );

    if (duplicadoServicio) {
        toast.error(`❌ El Folio de Servicio "${servicioTrimmed}" ya está asignado a otro expediente en el año ${anioFilaActual}.\n\nExpediente conflicto:\n${duplicadoServicio.nombre} ${duplicadoServicio.apellido_paterno} (${duplicadoServicio.id})`);
        return;
    }

    const noAsignadoTrimmed = (editForm.no_asignado || '').trim();
    if (noAsignadoTrimmed) {
        const duplicadoAsignado = data.find(item => 
            item.id !== id && 
            item.no_asignado && 
            item.no_asignado === noAsignadoTrimmed &&
            getYearFromRow(item) === anioFilaActual
        );
        if (duplicadoAsignado) {
            toast.error(`❌ El No. Asignado "${noAsignadoTrimmed}" ya existe en el año ${anioFilaActual}.`);
            return;
        }
    }

    try {
      setSaving(true);
      await AtendidosService.updatePadron(id, editForm);
      setData(prevData => prevData.map(item => item.id === id ? { ...item, ...editForm } : item));
      setEditingId(null);
      setIsOtherSpecialty(false);
      setIsOtherSubmotivo(false);
      toast.success("Registro actualizado correctamente");
    } catch (error) {
      console.error(error);
      toast.error("❌ Error al guardar gestión. Verifique la conexión.");
    } finally {
      setSaving(false);
    }
  };

  const handleViewDetails = (item) => {
    if (onViewDetails) {
        onViewDetails(item); 
    }
  };

  // --- MANEJO DE FILTROS ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      estado_civil: '', especialidad: '', foraneo: '', 
      municipio: '', motivo_inconformidad: '', institucion: '',
      fecha_inicio: '', fecha_fin: '', orden: 'reciente'
    });
    setSearchTerm('');
  };

  // --- LÓGICA DE FILTRADO COMBINADO Y ORDENAMIENTO ---
  const filteredData = data.filter(item => {
    // 1. Filtro de Búsqueda de texto libre
    const nombre = (item.nombre || '').toLowerCase();
    const apellido = (item.apellido_paterno || '').toLowerCase();
    const diagnostico = (item.diagnostico || '').toLowerCase();
    const servicio = (item.servicio || '').toLowerCase(); 
    const termino = searchTerm.toLowerCase();
    
    const matchSearch = nombre.includes(termino) || 
                        apellido.includes(termino) || 
                        diagnostico.includes(termino) || 
                        servicio.includes(termino);

    // 2. Filtros Avanzados
    const matchEstadoCivil = filters.estado_civil ? item.estado_civil === filters.estado_civil : true;
    const matchEspecialidad = filters.especialidad ? item.especialidad === filters.especialidad : true;
    const matchMunicipio = filters.municipio ? item.municipio?.trim().toUpperCase() === filters.municipio : true;
    const matchMotivo = filters.motivo_inconformidad ? item.motivo_inconformidad === filters.motivo_inconformidad : true;
    
    // Validar foráneo
    let matchForaneo = true;
    if (filters.foraneo !== '') {
        const isForaneo = item.foraneo === true || item.foraneo === 'true';
        matchForaneo = filters.foraneo === 'true' ? isForaneo : !isForaneo;
    }

    // Validar Institución
    let matchInstitucion = true;
    if (filters.institucion) {
        const itemInstGroup = getInstitucionGroupName(item.prestador_nombre || item.institucion);
        matchInstitucion = itemInstGroup === filters.institucion;
    }

    // Validar Fechas (Inicio y Fin)
    let matchFecha = true;
    if (filters.fecha_inicio || filters.fecha_fin) {
        const itemDate = getExactDateFromRow(item);
        const start = filters.fecha_inicio ? new Date(filters.fecha_inicio + 'T00:00:00') : null;
        const end = filters.fecha_fin ? new Date(filters.fecha_fin + 'T23:59:59') : null;

        if (start && Math.sign(itemDate.getTime() - start.getTime()) === -1) matchFecha = false;
        if (end && Math.sign(itemDate.getTime() - end.getTime()) === 1) matchFecha = false;
    }

    return matchSearch && matchEstadoCivil && matchEspecialidad && matchMunicipio && matchMotivo && matchInstitucion && matchForaneo && matchFecha;
  }).sort((a, b) => {
    // Lógica de Ordenamiento
    const dateA = getExactDateFromRow(a).getTime();
    const dateB = getExactDateFromRow(b).getTime();
    
    if (filters.orden === 'antiguo') {
        return dateA - dateB;
    } else {
        return dateB - dateA;
    }
  });

  // Contador de filtros activos
  const activeFiltersCount = Object.keys(filters).reduce((acc, key) => {
    if (key === 'orden') return filters[key] !== 'reciente' ? acc + 1 : acc;
    return filters[key] !== '' ? acc + 1 : acc;
  }, 0);

  return (
    <>
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-full max-h-[85vh]">
        
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Briefcase className="text-indigo-600" /> Tabla de Gestión y Quejas
              </h2>
              <p className="text-xs text-slate-500 mt-1">Clasificación técnica y seguimiento de asuntos</p>
            </div>
            
            <div className="flex w-full md:w-auto items-center gap-2">
              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" placeholder="Buscar por nombre" value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${showFilters || activeFiltersCount !== 0 ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <Filter size={16} />
                <span className="hidden sm:inline">Filtros</span>
                {activeFiltersCount !== 0 && (
                  <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{activeFiltersCount}</span>
                )}
                {showFilters ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
              </button>
            </div>
          </div>

          {/* PANEL DE FILTROS */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm animate-in slide-in-from-top-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Estado Civil</label>
                  <select name="estado_civil" value={filters.estado_civil} onChange={handleFilterChange} className="p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Todos</option>
                    {ESTADOS_CIVILES.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Especialidad</label>
                  <select name="especialidad" value={filters.especialidad} onChange={handleFilterChange} className="p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Todas</option>
                    {ESPECIALIDADES_LISTA.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Motivo</label>
                  <select name="motivo_inconformidad" value={filters.motivo_inconformidad} onChange={handleFilterChange} className="p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Todos</option>
                    {Object.keys(MOTIVOS_CATALOGO).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Municipio</label>
                  <select name="municipio" value={filters.municipio} onChange={handleFilterChange} className="p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Todos</option>
                    {uniqueMunicipios.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Institución</label>
                  <select name="institucion" value={filters.institucion} onChange={handleFilterChange} className="p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Todas</option>
                    {INSTITUCIONES_LISTA.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Origen</label>
                  <select name="foraneo" value={filters.foraneo} onChange={handleFilterChange} className="p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Todos</option>
                    <option value="true">Foráneo</option>
                    <option value="false">Local</option>
                  </select>
                </div>

                {/* NUEVOS FILTROS DE FECHAS Y ORDEN */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Fecha Inicio</label>
                  <input type="date" name="fecha_inicio" value={filters.fecha_inicio} onChange={handleFilterChange} className="p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Fecha Fin</label>
                  <input type="date" name="fecha_fin" value={filters.fecha_fin} onChange={handleFilterChange} className="p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Orden</label>
                  <select name="orden" value={filters.orden} onChange={handleFilterChange} className="p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="reciente">Más recientes primero</option>
                    <option value="antiguo">Más antiguos primero</option>
                  </select>
                </div>

              </div>
              
              {/* Limpiar Filtros */}
              {(activeFiltersCount !== 0 || searchTerm !== '') && (
                <div className="mt-3 flex justify-end">
                  <button onClick={clearFilters} className="text-xs text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 transition-colors">
                    <X size={14} /> Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* TABLA SCROLLABLE */}
        <div className="flex-1 overflow-auto custom-scrollbar relative">
          {loading ? (
            <div className="flex items-center justify-center h-full min-h-[300px]">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400">
                <Briefcase size={40} className="mb-2 opacity-50"/>
                <p>No se encontraron registros</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse" style={{ minWidth: '1900px' }}>
              <thead className="text-slate-500 text-[10px] uppercase font-bold tracking-wider sticky top-0 z-20">
                <tr className="bg-slate-100 shadow-sm">
                  <th className="p-4 w-56 bg-slate-100 sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Datos Base y Folios</th>
                  <th className="p-4 w-32 bg-slate-100">Contacto</th>
                  <th className="p-4 w-48 bg-slate-100">Socioeconómico</th>
                  <th className="p-4 w-48 bg-slate-100">Actividad / Prestador</th>
                  <th className="p-4 w-64 bg-slate-100">Clasificación (Motivo)</th>
                  <th className="p-4 w-64 bg-slate-100">Diagnóstico</th>
                  <th className="p-4 w-64 bg-slate-100">Narrativa (No Editable)</th>
                  <th className="p-4 w-48 bg-slate-100">Observaciones</th>
                  <th className="p-4 w-24 text-center bg-slate-100 sticky right-0 z-20">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {filteredData.map((row) => {
                  const isEditing = editingId === row.id;
                  const isMissing = !row.motivo_inconformidad || !row.actividad_apoyo || !row.especialidad || !row.servicio;

                  return (
                    <tr key={row.id} className={`group hover:bg-slate-50 transition-colors ${isEditing ? 'bg-indigo-50/40' : ''}`}>
                      
                      {/* 1. COLUMNA FIJA (CON FOLIOS) */}
                      <td className="p-4 sticky left-0 bg-inherit z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] align-top">
                        <div className="font-bold text-slate-800 text-sm mb-1">
                          {row.nombre} {row.apellido_paterno}
                        </div>
                        <div className="flex flex-col gap-0.5 text-[10px] text-slate-500 mb-2">
                           <div className="flex gap-2">
                              <span className="font-mono bg-slate-100 px-1 rounded">{row.curp || 'S/C'}</span>
                           </div>
                           <div className="text-[9px] text-slate-400 mt-1">
                              {row.municipio || 'Sin Municipio'}
                           </div>
                        </div>

                        {/* SECCIÓN DE FOLIOS */}
                        <div className="border-t border-slate-200/60 pt-2 mt-2">
                            <div className="flex flex-col gap-1">
                                {isEditing ? (
                                    <>
                                        <div className="flex flex-col">
                                            <label className="text-[9px] font-bold text-indigo-500 uppercase">Folio Servicio</label>
                                            <input name="servicio" value={editForm.servicio || ''} onChange={handleChange} className="p-1 border border-indigo-200 rounded text-xs bg-white font-mono" placeholder="Ej: G-01" />
                                        </div>
                                        <div className="flex flex-col mt-1">
                                            <label className="text-[9px] font-bold text-indigo-500 uppercase">No. Asignado</label>
                                            <input name="no_asignado" value={editForm.no_asignado || ''} onChange={handleChange} className="p-1 border border-indigo-200 rounded text-xs bg-white font-mono" placeholder="Ej: 1/2026" />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between bg-slate-50 px-1.5 py-1 rounded border border-slate-100">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">Servicio</span>
                                            <span className="font-mono font-bold text-indigo-700">{row.servicio || 'S/A'}</span>
                                        </div>
                                        <div className="flex items-center justify-between bg-slate-50 px-1.5 py-1 rounded border border-slate-100">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">No. Asig.</span>
                                            <span className="font-mono text-slate-600">{row.no_asignado || 'S/A'}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {isMissing && !isEditing && (
                          <div className="flex items-center gap-1 text-[9px] text-amber-600 mt-2 font-bold bg-amber-50 px-1.5 py-0.5 rounded w-fit">
                            <AlertCircle size={10} /> Faltan campos
                          </div>
                        )}
                      </td>

                      {/* 2. CONTACTO */}
                      {isEditing ? (
                          <td className="p-2 align-top space-y-2 bg-white">
                             <div className="flex gap-2">
                               <label className="flex items-center gap-1 text-[10px] cursor-pointer">
                                 <input type="checkbox" name="foraneo" checked={editForm.foraneo} onChange={handleChange} className="rounded text-indigo-600"/> Foráneo
                               </label>
                               <label className="flex items-center gap-1 text-[10px] cursor-pointer">
                                 <input type="checkbox" name="via_telefonica" checked={editForm.via_telefonica} onChange={handleChange} className="rounded text-indigo-600"/> Tel.
                               </label>
                             </div>
                             <input name="representante" value={editForm.representante || ''} onChange={handleChange} className="w-full p-1.5 border border-indigo-200 rounded text-xs" placeholder="Representante" />
                          </td>
                      ) : (
                          <td className="p-4 align-top">
                             <div className="flex gap-2 mb-1">
                                {row.foraneo && <span className="bg-purple-100 text-purple-700 px-1.5 rounded text-[9px] font-bold">Foráneo</span>}
                                {row.via_telefonica && <span className="bg-blue-100 text-blue-700 px-1.5 rounded text-[9px] font-bold">Tel</span>}
                             </div>
                             {row.representante && <div className="text-[10px] text-slate-500">Rep: {row.representante}</div>}
                          </td>
                      )}

                      {/* 3. SOCIOECONÓMICO */}
                      {isEditing ? (
                          <td className="p-2 align-top space-y-2 bg-white">
                             <textarea name="domicilio" value={editForm.domicilio || ''} onChange={handleChange} rows="2" className="w-full p-1.5 border border-indigo-200 rounded text-xs resize-none" placeholder="Domicilio..." />
                             <div className="grid grid-cols-2 gap-1">
                                <select name="estado_civil" value={editForm.estado_civil || ''} onChange={handleChange} className="p-1 border border-indigo-200 rounded text-[10px]">
                                   {ESTADOS_CIVILES.map(e => <option key={e} value={e}>{e}</option>)}
                                </select>
                                <input name="ocupacion" value={editForm.ocupacion || ''} onChange={handleChange} className="p-1 border border-indigo-200 rounded text-[10px]" placeholder="Ocupación" />
                             </div>
                          </td>
                      ) : (
                          <td className="p-4 align-top">
                             <div className="line-clamp-2 text-slate-600 mb-1" title={row.domicilio}>{row.domicilio || '-'}</div>
                             <div className="text-[10px] text-slate-400">{row.estado_civil} • {row.cargo_ocupacion}</div>
                          </td>
                      )}

                      {/* 4. ACTIVIDAD / PRESTADOR */}
                      {isEditing ? (
                          <td className="p-2 align-top space-y-2 bg-white">
                             <select name="actividad_apoyo" value={editForm.actividad_apoyo || ''} onChange={handleChange} className="w-full p-1.5 border border-indigo-200 rounded text-xs font-bold">
                               {ACTIVIDADES_APOYO.map(t => <option key={t} value={t}>{t}</option>)}
                             </select>
                             <input name="prestador_nombre" value={editForm.prestador_nombre || ''} onChange={handleChange} className="w-full p-1.5 border border-indigo-200 rounded text-xs" placeholder="Prestador / Unidad" />
                             <select value={isOtherSpecialty ? 'OTROS' : (editForm.especialidad || '')} onChange={handleSpecialtySelect} className="w-full p-1.5 border border-indigo-200 rounded text-xs">
                               <option value="">Especialidad...</option>
                               {ESPECIALIDADES_LISTA.map(e => <option key={e} value={e}>{e}</option>)}
                             </select>
                             {isOtherSpecialty && (
                                <input name="especialidad" value={editForm.especialidad || ''} onChange={handleChange} className="w-full p-1.5 border border-indigo-200 rounded text-xs bg-indigo-50 animate-in fade-in" placeholder="Especifique..." autoFocus />
                             )}
                          </td>
                      ) : (
                          <td className="p-4 align-top">
                             <div className="font-bold text-slate-700 mb-1">{row.actividad_apoyo}</div>
                             <div className="text-[10px] text-slate-500 mb-1 line-clamp-1" title={row.prestador_nombre}>
                                <Building2 size={10} className="inline mr-1"/>{row.prestador_nombre || 'N/A'}
                             </div>
                             <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[9px] border border-slate-200">
                                {row.especialidad || 'Sin Esp.'}
                             </span>
                          </td>
                      )}

                      {/* 5. CLASIFICACIÓN (MOTIVO) */}
                      {isEditing ? (
                          <td className="p-2 align-top space-y-2 bg-white">
                             <select name="motivo_inconformidad" value={editForm.motivo_inconformidad || ''} onChange={handleChange} className="w-full p-1.5 border border-indigo-200 rounded text-xs">
                               <option value="">Motivo...</option>
                               {Object.keys(MOTIVOS_CATALOGO).map(m => <option key={m} value={m}>{m}</option>)}
                             </select>
                             
                             <select 
                                name="submotivo_catalogo" 
                                value={isOtherSubmotivo ? 'OTRO (ESPECIFIQUE)' : (editForm.submotivo_catalogo || '')} 
                                onChange={handleSubmotivoSelect} 
                                disabled={!editForm.motivo_inconformidad} 
                                className="w-full p-1.5 border border-indigo-200 rounded text-xs disabled:bg-slate-100"
                             >
                               <option value="">Submotivo...</option>
                               {editForm.motivo_inconformidad && MOTIVOS_CATALOGO[editForm.motivo_inconformidad]?.map(s => <option key={s} value={s}>{s}</option>)}
                             </select>
                             
                             {isOtherSubmotivo && (
                                <input 
                                  name="submotivo_catalogo" 
                                  value={editForm.submotivo_catalogo || ''} 
                                  onChange={handleChange} 
                                  className="w-full p-1.5 border border-indigo-200 rounded text-xs bg-indigo-50 animate-in fade-in" 
                                  placeholder="Especifique el submotivo..." 
                                  autoFocus 
                                />
                             )}
                          </td>
                      ) : (
                          <td className="p-4 align-top">
                             <div className="font-medium text-slate-700 mb-1 leading-tight">{row.motivo_inconformidad || '-'}</div>
                             <div className="text-[10px] leading-tight">
                                ↳ {row.submotivo_catalogo ? (
                                    <span className="text-emerald-600 font-bold">{row.submotivo_catalogo}</span>
                                ) : (
                                    <span className="text-slate-400">Sin clasificar</span>
                                )}
                             </div>
                          </td>
                      )}

                      {/* 6. DIAGNÓSTICO */}
                      {isEditing ? (
                          <td className="p-2 align-top bg-white">
                             <textarea name="diagnostico" value={editForm.diagnostico || ''} onChange={handleChange} rows="3" className="w-full p-1.5 border border-indigo-200 rounded text-xs resize-none" placeholder="Ingrese diagnóstico..." />
                          </td>
                      ) : (
                          <td className="p-4 align-top">
                             <div className="text-[10px] text-slate-600 font-medium leading-relaxed max-h-32 overflow-y-auto" title={row.diagnostico}>
                                {row.diagnostico || <span className="text-slate-300 italic">Sin diagnóstico</span>}
                             </div>
                          </td>
                      )}

                      {/* 7. NARRATIVA */}
                      <td className="p-4 align-top">
                          <div className="text-[10px] text-slate-500 line-clamp-4 leading-relaxed" title={row.descripcion_hechos}>
                             {row.descripcion_hechos || 'Sin descripción'}
                          </div>
                      </td>

                      {/* 8. OBSERVACIONES */}
                      {isEditing ? (
                          <td className="p-2 align-top bg-white">
                             <textarea name="observaciones_servicio" value={editForm.observaciones_servicio || ''} onChange={handleChange} rows="5" className="w-full p-1.5 border border-indigo-200 rounded text-xs resize-none" placeholder="Observaciones..." />
                          </td>
                      ) : (
                          <td className="p-4 align-top">
                             {row.observaciones_servicio ? (
                                <div className="text-[10px] text-indigo-600 bg-indigo-50 p-2 rounded line-clamp-4 border border-indigo-100">
                                   <MessageSquare size={10} className="inline mr-1"/>
                                   {row.observaciones_servicio}
                                </div>
                             ) : <span className="text-slate-300">-</span>}
                          </td>
                      )}

                      {/* 9. ACCIONES */}
                      <td className={`p-4 text-center sticky right-0 z-10 border-l border-slate-100 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)] ${isEditing ? 'bg-indigo-50' : 'bg-white group-hover:bg-slate-50'}`}>
                          {isEditing ? (
                             <div className="flex flex-col gap-2 items-center mt-2">
                               <button onClick={() => saveRow(row.id)} disabled={saving} className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition shadow-md">
                                 {saving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16} />}
                               </button>
                               <button onClick={cancelEditing} className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition">
                                 <X size={16} />
                               </button>
                             </div>
                          ) : (
                             <div className="flex justify-center gap-1">
                               <button onClick={() => handleViewDetails(row)} className="p-1.5 text-indigo-500 bg-indigo-50 hover:bg-indigo-100 rounded transition border border-indigo-100" title="Ver Detalle Completo">
                                 <Eye size={14} />
                               </button>
                               <button onClick={() => startEditing(row)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition" title="Editar">
                                 <Edit2 size={14} />
                               </button>
                             </div>
                          )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-xs text-slate-400">
          <span>Total en base: {data.length}</span>
          <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Mostrando {filteredData.length} registros</span>
        </div>
      </div>
    </>
  );
};

export default GestionTable;