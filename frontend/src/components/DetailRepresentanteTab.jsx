import React, { useState, useEffect } from 'react';
import { UserPlus, Save, Loader2, Ban, Edit3 } from 'lucide-react';
import { AtendidosService } from '../services/atendidosService';
import toast from 'react-hot-toast';

export const DetailRepresentanteTab = ({ expedienteId, initialData, onSaveSuccess }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasRepresentante, setHasRepresentante] = useState(!!initialData);
  
  const [formData, setFormData] = useState({
    nombre_completo: '',
    domicilio: '',
    entidad: '',
    municipio: '',
    telefono: '',
    causa_representacion: '',
    acreditacion: '',
    parentezco: ''
  });

  // Inicializar datos si ya existen
  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre_completo: initialData.nombre_completo || '',
        domicilio: initialData.domicilio || '',
        entidad: initialData.entidad || '',
        municipio: initialData.municipio || '',
        telefono: initialData.telefono || '',
        causa_representacion: initialData.causa_representacion || '',
        acreditacion: initialData.acreditacion || '',
        parentezco: initialData.parentezco || ''
      });
      setHasRepresentante(true);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value.toUpperCase() })); // Convertimos a mayúsculas para mantener estándar
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      let response;
      if (hasRepresentante) {
        response = await AtendidosService.updateRepresentante(expedienteId, formData);
      } else {
        response = await AtendidosService.addRepresentante(expedienteId, formData);
      }

      toast.success(hasRepresentante ? 'Representante actualizado' : 'Representante registrado exitosamente');
      
      setHasRepresentante(true);
      setIsEditing(false);
      
      if (onSaveSuccess) {
        onSaveSuccess(formData); // Actualizamos el estado del modal padre
      }

    } catch (error) {
      console.error(error);
      toast.error('Ocurrió un error al guardar el representante.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado del Tab */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <UserPlus className="text-amber-500" size={20} />
            Datos del Representante Legal
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Información de la persona acreditada para dar seguimiento a la solicitud.
          </p>
        </div>
        
        <div>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
            >
              <Edit3 size={16} /> {hasRepresentante ? 'Editar Datos' : 'Agregar Representante'}
            </button>
          ) : (
            <div className="flex gap-2">
               <button 
                 onClick={() => {
                   setIsEditing(false);
                   // Reset al estado inicial si se cancela
                   if (initialData) setFormData(initialData); 
                 }}
                 className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl font-bold text-sm transition-all"
               >
                 Cancelar
               </button>
               <button 
                 onClick={handleSave}
                 disabled={saving}
                 className="px-4 py-2 bg-amber-500 text-white hover:bg-amber-600 rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2"
               >
                 {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                 Guardar
               </button>
            </div>
          )}
        </div>
      </div>

      {/* Mensaje cuando no hay representante y no se está editando */}
      {!hasRepresentante && !isEditing && (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
          <UserPlus size={40} className="text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-600">Sin Representante Legal</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Este expediente no cuenta con información de un representante. Haz clic en "Agregar Representante" si requieres registrar a un tercero.
          </p>
        </div>
      )}

      {/* Formulario / Vista de Datos */}
      {(hasRepresentante || isEditing) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">Nombre Completo</label>
            {isEditing ? (
              <input type="text" name="nombre_completo" value={formData.nombre_completo} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none" placeholder="EJ. JUAN PEREZ LOPEZ" />
            ) : (
              <p className="text-sm font-medium text-slate-800 p-2.5 bg-slate-50/50 rounded-xl border border-transparent">{formData.nombre_completo || 'N/A'}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">Parentesco / Relación</label>
            {isEditing ? (
              <input type="text" name="parentezco" value={formData.parentezco} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none" placeholder="EJ. HIJO, ESPOSO, ABOGADO" />
            ) : (
              <p className="text-sm font-medium text-slate-800 p-2.5 bg-slate-50/50 rounded-xl border border-transparent">{formData.parentezco || 'N/A'}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">Causa de Representación</label>
            {isEditing ? (
              <input type="text" name="causa_representacion" value={formData.causa_representacion} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none" placeholder="EJ. PACIENTE MENOR DE EDAD, DISCAPACIDAD" />
            ) : (
              <p className="text-sm font-medium text-slate-800 p-2.5 bg-slate-50/50 rounded-xl border border-transparent">{formData.causa_representacion || 'N/A'}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">Documento de Acreditación</label>
            {isEditing ? (
              <input type="text" name="acreditacion" value={formData.acreditacion} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none" placeholder="EJ. CARTA PODER, ACTA NACIMIENTO" />
            ) : (
              <p className="text-sm font-medium text-slate-800 p-2.5 bg-slate-50/50 rounded-xl border border-transparent">{formData.acreditacion || 'N/A'}</p>
            )}
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-slate-500">Domicilio</label>
            {isEditing ? (
              <input type="text" name="domicilio" value={formData.domicilio} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none" />
            ) : (
              <p className="text-sm font-medium text-slate-800 p-2.5 bg-slate-50/50 rounded-xl border border-transparent">{formData.domicilio || 'N/A'}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">Entidad / Estado</label>
            {isEditing ? (
              <input type="text" name="entidad" value={formData.entidad} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none" />
            ) : (
              <p className="text-sm font-medium text-slate-800 p-2.5 bg-slate-50/50 rounded-xl border border-transparent">{formData.entidad || 'N/A'}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">Municipio</label>
            {isEditing ? (
              <input type="text" name="municipio" value={formData.municipio} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none" />
            ) : (
              <p className="text-sm font-medium text-slate-800 p-2.5 bg-slate-50/50 rounded-xl border border-transparent">{formData.municipio || 'N/A'}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">Teléfono</label>
            {isEditing ? (
              <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none" placeholder="10 DÍGITOS" />
            ) : (
              <p className="text-sm font-medium text-slate-800 p-2.5 bg-slate-50/50 rounded-xl border border-transparent">{formData.telefono || 'N/A'}</p>
            )}
          </div>

        </div>
      )}
    </div>
  );
};