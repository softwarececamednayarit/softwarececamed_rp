import React from 'react';
import { User, Phone, Mail, MapPin, Globe, IdCard, Activity, Building2, FileText, Scale, CheckCircle, AlertCircle, MessageSquare, Target, List, Calendar, Clock, Tag, Stethoscope } from 'lucide-react';
import { formatName, formatDate } from '../utils/formatters';
import { RenderField } from './RenderField';

export const DetailGeneralTab = ({ displayData, isDictamen }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* 1. Datos Ciudadano / Solicitante */}
      <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5"><User size={120} /></div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
              <User size={14} /> Información del Solicitante
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              <div className="md:col-span-1 space-y-2">
                  <div>
                      <span className="text-[10px] uppercase text-slate-400 font-bold">Nombre Completo</span>
                      <p className="text-xl font-black text-slate-900 leading-tight">
                          {formatName(`${displayData.nombre} ${displayData.apellido_paterno} ${displayData.apellido_materno || ''}`)}
                      </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                      {(displayData.edad_o_nacimiento || displayData.edad) && (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-200">
                              {displayData.edad_o_nacimiento ? displayData.edad_o_nacimiento.toString().replace(/\D/g,'') + ' Años' : displayData.edad + ' Años'}
                          </span>
                      )}
                      {displayData.sexo && (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-200">{displayData.sexo}</span>
                      )}
                      {displayData.nacionalidad && (
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold border border-blue-100 flex items-center gap-1"><Globe size={10}/> {displayData.nacionalidad}</span>
                      )}
                  </div>
                  {displayData.grupo_vulnerable && displayData.grupo_vulnerable !== "No me identifico con ningún grupo" && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 rounded-full text-[10px] font-bold border border-rose-100">
                          <AlertCircle size={10} /> {displayData.grupo_vulnerable}
                      </div>
                  )}
                  <div className="pt-2">
                      <span className="text-[10px] uppercase text-indigo-400 font-bold block">CURP</span>
                      <p className="text-sm font-mono font-bold text-indigo-900 tracking-wide bg-indigo-50/50 px-2 py-1 rounded border border-indigo-100 w-fit">
                          {displayData.curp || 'NO REGISTRADA'}
                      </p>
                  </div>
              </div>
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 border-l border-slate-100 pl-0 md:pl-6">
                  <RenderField label="Teléfono" value={displayData.telefono} icon={Phone} />
                  <RenderField label="Correo Electrónico" value={displayData.correo} icon={Mail} />
                  <div className="sm:col-span-2">
                      <RenderField label="Domicilio Ciudadano" value={displayData.domicilio_ciudadano || displayData.domicilio} icon={MapPin} />
                  </div>
              </div>
          </div>
      </section>

      {/* 2. Datos del Caso */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <FileText size={14} /> Datos Administrativos
              </h3>
              <div className="grid grid-cols-2 gap-4">
                  <RenderField label="Fecha Recepción" value={formatDate(displayData.fecha_recepcion)} icon={Calendar} />
                  <RenderField label="Fecha Inicio Proceso" value={formatDate(displayData.fecha_inicio_proceso)} icon={Clock} />
                  <div className="col-span-2"><RenderField label="Forma de Recepción" value={displayData.forma_recepcion} icon={Tag} /></div>
                  <div className="col-span-2">
                       <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1 mb-1"><CheckCircle size={10} /> Seguimiento / Bitácora</span>
                       <div className={`p-2 rounded-lg text-xs font-bold border ${displayData.seguimiento_bitacora ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                           {displayData.seguimiento_bitacora || 'Sin seguimiento registrado'}
                       </div>
                  </div>
                  {displayData.autoridad_responsable && displayData.autoridad_responsable !== "Otra" && (
                      <div className="col-span-2"><RenderField label="Autoridad Responsable" value={displayData.autoridad_responsable} icon={Building2} /></div>
                  )}
              </div>
          </section>
          <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Stethoscope size={14} /> Contexto Médico
              </h3>
              <div className="space-y-4">
                  <div>
                      <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1"><Building2 size={10}/> Unidad Médica / Institución</span>
                      <p className="text-sm font-bold text-slate-800 mt-1">{displayData.unidad_medica || displayData.prestador_nombre || 'No especificada'}</p>
                  </div>
                  {displayData.medico_nombre && (
                      <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                          <span className="text-[10px] uppercase text-indigo-400 font-bold flex items-center gap-1"><User size={10}/> Nombre del Médico</span>
                          <p className="text-sm font-bold text-indigo-900 mt-1">{displayData.medico_nombre}</p>
                      </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                      <RenderField label="Especialidad Médica" value={displayData.especialidad_medica || displayData.especialidad} />
                      <RenderField label="Motivo Principal" value={displayData.motivo_principal || displayData.motivo_inconformidad} />
                  </div>
              </div>
          </section>
      </div>

      {/* 3. Narrativa y Categorías */}
      <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div>
              <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1 mb-2"><MessageSquare size={10} /> Descripción de Hechos / Motivo Detallado</span>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-600 text-xs leading-relaxed whitespace-pre-wrap">
                  {displayData.descripcion_hechos || displayData.motivo_queja_detalle || 'Sin narrativa capturada.'}
              </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1 mb-2"><Target size={10} /> Pretensiones del Usuario</span>
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-amber-900 text-xs font-medium">{displayData.pretensiones || 'No especificadas'}</div>
              </div>
              <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1 mb-2"><List size={10} /> Categorías y Clasificación</span>
                  <div className="space-y-2">
                      {[
                          { label: 'Categorías Asesoría', val: displayData.categorias_asesoria },
                          { label: 'Categorías Queja', val: displayData.categorias_queja },
                          { label: 'Tipo Queja', val: displayData.categorias_tipo_queja },
                          { label: 'Submotivo', val: displayData.submotivo }
                      ].map((cat, idx) => {
                          if (!cat.val || (Array.isArray(cat.val) && cat.val.length === 0)) return null;
                          return (
                              <div key={idx} className="flex gap-2 items-start">
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></div>
                                  <div>
                                      <span className="text-[10px] font-bold text-slate-500 mr-2">{cat.label}:</span>
                                      <span className="text-xs text-slate-700">{Array.isArray(cat.val) ? cat.val.join(', ') : cat.val}</span>
                                  </div>
                              </div>
                          );
                      })}
                      {(!displayData.categorias_asesoria && !displayData.categorias_queja && !displayData.submotivo) && (
                          <p className="text-xs text-slate-400 italic">Sin clasificación adicional.</p>
                      )}
                  </div>
              </div>
          </div>
      </section>

      {/* 4. Dictamen */}
      {isDictamen && (
          <section className="bg-purple-50 p-6 rounded-[2rem] border border-purple-100 shadow-sm">
              <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Scale size={14} /> Datos Dictamen
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <RenderField label="Expediente" value={displayData.expediente_dga || displayData.expediente_investigacion} />
                  <RenderField label="Fecha Oficio" value={displayData.fecha_oficio} />
                  <RenderField label="Autoridad" value={displayData.autoridad_solicitante} />
                  <RenderField label="Litis" value={displayData.motivo_litis} />
              </div>
          </section>
      )}
    </div>
  );
};