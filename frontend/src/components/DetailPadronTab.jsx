import React from 'react';
import { FileText, Pencil, Stethoscope, AlertCircle, AlertTriangle, Tag, Building2, Briefcase, Map as MapIcon, PhoneCall, UserCheck, MessageSquare, User, MapPin, Activity } from 'lucide-react';
import { RenderField } from './RenderField';
import { ESPECIALIDADES_LISTA, MOTIVOS_CATALOGO } from '../utils/catalogs';

export const DetailPadronTab = ({ 
  isEditingPadron, setIsEditingPadron, padronForm, displayData, 
  handleInputChange, handleSpecialtyChange, handleSubmotivoSelectorChange,
  isOtherSpecialty, isOtherSubmotivo 
}) => {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 h-full">
      {!isEditingPadron ? (
        <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 shrink-0"><FileText size={20} /></div>
                    <div>
                        <h4 className="font-bold text-emerald-900 text-sm">Detalles y Clasificación</h4>
                        <p className="text-xs text-emerald-700">Información técnica, administrativa y socioeconómica.</p>
                    </div>
                </div>
                <button onClick={() => setIsEditingPadron(true)} className="text-xs font-bold text-emerald-700 bg-white border border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 shadow-sm">
                    <Pencil size={12} /> Editar Datos
                </button>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="md:col-span-2 lg:col-span-4 pb-2 border-b border-slate-100 mb-2">
                     <h5 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2"><Stethoscope size={14}/> Clasificación del Asunto</h5>
                </div>
                <div className="md:col-span-2 lg:col-span-4"><RenderField label="Diagnóstico Médico" value={displayData.diagnostico} icon={Activity} /></div>
                <div className="md:col-span-2"><RenderField label="Motivo Inconformidad" value={displayData.motivo_inconformidad} icon={AlertCircle} /></div>
                <div className="md:col-span-2"><RenderField label="Submotivo" value={displayData.submotivo} icon={AlertTriangle}/></div>
                <div className="md:col-span-2"><RenderField label="Especialidad" value={displayData.especialidad} icon={Stethoscope} /></div>
                <RenderField label="Tipo Asunto" value={displayData.tipo_asunto} icon={Tag} />
                <div className="md:col-span-4"><RenderField label="Prestador de Servicio" value={displayData.prestador_nombre} icon={Building2} /></div>

                <div className="md:col-span-2 lg:col-span-4 pb-2 border-b border-slate-100 mb-2 mt-4">
                     <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Briefcase size={14}/> Datos de Gestión</h5>
                </div>
                <RenderField label="Foráneo" value={displayData.foraneo} isBool={true} icon={MapIcon} />
                <RenderField label="Vía Telefónica" value={displayData.via_telefonica} isBool={true} icon={PhoneCall} />
                <div className="md:col-span-2"><RenderField label="Representante" value={displayData.representante} icon={UserCheck} /></div>
                <div className="md:col-span-4"><RenderField label="Observaciones Servicio" value={displayData.observaciones_servicio} icon={MessageSquare} /></div>

                <div className="md:col-span-2 lg:col-span-4 pb-2 border-b border-slate-100 mb-2 mt-4">
                     <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><User size={14}/> Datos Socioeconómicos</h5>
                </div>
                <RenderField label="Estado Civil" value={displayData.estado_civil} />
                <RenderField label="Ocupación" value={displayData.cargo_ocupacion} />
                <RenderField label="Tipo Beneficiario" value={displayData.tipo_beneficiario} />
                <RenderField label="Parentesco" value={displayData.parentesco} />
                <RenderField label="Actividad / Apoyo" value={displayData.actividad_apoyo} />
                <RenderField label="Monto Apoyo" value={displayData.monto_apoyo ? `$${displayData.monto_apoyo}` : null} />
                
                <div className="md:col-span-2 lg:col-span-4 pb-2 border-b border-slate-100 mb-2 mt-4">
                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><MapPin size={14}/> Ubicación</h5>
                </div>
                <div className="md:col-span-2 lg:col-span-4"><RenderField label="Domicilio Completo" value={displayData.domicilio} icon={MapPin} /></div>
                <RenderField label="Municipio" value={displayData.municipio} icon={MapPin} />
                <RenderField label="Localidad" value={displayData.localidad} />
            </div>
        </div>
      ) : (
        <div className="space-y-6">
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-start gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 shrink-0"><FileText size={20} /></div>
                <div>
                    <h4 className="font-bold text-indigo-900 text-sm">Modo Edición</h4>
                    <p className="text-xs text-indigo-700">Complete los campos. Los cambios se guardarán en la base de datos de detalles.</p>
                </div>
            </div>

            <form className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm border-2 border-indigo-50 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2 pb-2 border-b border-indigo-100">
                     <h5 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Clasificación Médica / Técnica</h5>
                </div>

                <div className="md:col-span-2 space-y-1">
                     <label className="text-xs font-bold text-slate-700 ml-1">Prestador de Servicio / Institución</label>
                     <input type="text" name="prestador_nombre" value={padronForm.prestador_nombre} onChange={handleInputChange} className="w-full bg-indigo-50/50 border border-indigo-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900" placeholder="Nombre de la unidad o institución..." />
                </div>
                <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">Diagnóstico</label>
                    <textarea name="diagnostico" value={padronForm.diagnostico} onChange={handleInputChange} rows="2" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none font-medium text-slate-700" placeholder="Ingrese el diagnóstico médico..." />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">Motivo Inconformidad</label>
                    <select name="motivo_inconformidad" value={padronForm.motivo_inconformidad} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all">
                        <option value="">Seleccione Motivo...</option>
                        {Object.keys(MOTIVOS_CATALOGO).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">Submotivo</label>
                    <select name="submotivo" value={isOtherSubmotivo ? 'OTRO (ESPECIFIQUE)' : padronForm.submotivo} onChange={handleSubmotivoSelectorChange} disabled={!padronForm.motivo_inconformidad} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:bg-slate-100">
                        <option value="">Seleccione Submotivo...</option>
                        {padronForm.motivo_inconformidad && MOTIVOS_CATALOGO[padronForm.motivo_inconformidad]?.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                    </select>
                </div>
                {isOtherSubmotivo && (
                    <div className="md:col-span-2 space-y-1 animate-in fade-in slide-in-from-left-2">
                        <label className="text-xs font-bold text-indigo-600 ml-1">Especifique Submotivo</label>
                        <input type="text" name="submotivo" value={padronForm.submotivo} onChange={handleInputChange} className="w-full bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold" placeholder="Escriba el detalle del submotivo..." autoFocus />
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">Especialidad</label>
                    <select value={isOtherSpecialty ? 'OTROS' : padronForm.especialidad} onChange={handleSpecialtyChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all">
                        <option value="">Seleccione...</option>
                        {ESPECIALIDADES_LISTA.map(esp => <option key={esp} value={esp}>{esp}</option>)}
                    </select>
                </div>
                {isOtherSpecialty && (
                     <div className="space-y-1 animate-in fade-in slide-in-from-left-2">
                        <label className="text-xs font-bold text-indigo-600 ml-1">Especifique Especialidad</label>
                        <input type="text" name="especialidad" value={padronForm.especialidad} onChange={handleInputChange} className="w-full bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Escriba la especialidad..." autoFocus />
                     </div>
                )}

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">Tipo de Asunto</label>
                    <select name="tipo_asunto" value={padronForm.tipo_asunto} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all">
                        <option value="">Seleccione...</option>
                        <option value="Servicio">Servicio</option>
                        <option value="Especie">Especie</option>
                        <option value="Indirecto">Indirecto</option>
                        <option value="Mixto">Mixto</option>
                        <option value="Monetario">Monetario</option>
                        <option value="Producto Subsidiado">Producto Subsidiado</option>
                    </select>
                </div>

                <div className="md:col-span-2 pb-2 border-b border-indigo-100 mt-4">
                     <h5 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Datos Administrativos</h5>
                </div>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors w-full">
                        <input type="checkbox" name="foraneo" checked={padronForm.foraneo} onChange={handleInputChange} className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"/>
                        <span className="text-xs font-bold text-slate-700">¿Es Foráneo?</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors w-full">
                        <input type="checkbox" name="via_telefonica" checked={padronForm.via_telefonica} onChange={handleInputChange} className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"/>
                        <span className="text-xs font-bold text-slate-700">¿Vía Telefónica?</span>
                    </label>
                </div>
                <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-700 ml-1">Representante</label>
                     <input type="text" name="representante" value={padronForm.representante} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                </div>
                <div className="md:col-span-2 space-y-1">
                     <label className="text-xs font-bold text-slate-700 ml-1">Observaciones del Servicio</label>
                     <textarea name="observaciones_servicio" value={padronForm.observaciones_servicio} onChange={handleInputChange} rows="2" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"></textarea>
                </div>

                <div className="md:col-span-2 pb-2 border-b border-indigo-100 mt-4">
                     <h5 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Datos Socioeconómicos</h5>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">Ocupación</label>
                    <input type="text" name="cargo_ocupacion" value={padronForm.cargo_ocupacion} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" placeholder="Ocupación del solicitante" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">Estado Civil</label>
                    <select name="estado_civil" value={padronForm.estado_civil} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm">
                        <option value="">Seleccione...</option>
                        <option value="Soltero(a)">Soltero/a</option>
                        <option value="Casado(a)">Casado/a</option>
                        <option value="Unión Libre">Unión Libre</option>
                        <option value="Viudo(a)">Viudo/a</option>
                        <option value="Divorciado(a)">Divorciado/a</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">Tipo Beneficiario</label>
                    <input type="text" name="tipo_beneficiario" value={padronForm.tipo_beneficiario} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">Parentesco</label>
                    <input type="text" name="parentesco" value={padronForm.parentesco} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">Actividad / Apoyo</label>
                    <select name="actividad_apoyo" value={padronForm.actividad_apoyo} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm">
                        <option value="">Seleccione...</option>
                        <option value="Orientación">Orientación</option>
                        <option value="Gestión">Gestión</option>
                        <option value="Asesoría">Asesoría</option>
                        <option value="Queja">Queja</option>
                        <option value="Dictamen">Dictamen</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">Monto ($)</label>
                    <input type="number" name="monto_apoyo" value={padronForm.monto_apoyo} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                </div>

                <div className="md:col-span-2 pb-2 border-b border-indigo-100 mt-4">
                     <h5 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Ubicación</h5>
                </div>
                <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">Calle y Número / Domicilio</label>
                    <input type="text" name="domicilio" value={padronForm.domicilio} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" placeholder="Ingrese calle, número y colonia..." />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">Municipio</label>
                    <input type="text" name="municipio" value={padronForm.municipio} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">Localidad</label>
                    <input type="text" name="localidad" value={padronForm.localidad} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                </div>
            </form>
        </div>
      )}
    </div>
  );
};