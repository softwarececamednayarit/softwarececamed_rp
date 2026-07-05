// Configuración de secciones para el Acta
export const SECCIONES_CONFIG = {
  RECEPCION: {
    titulo: 'DATOS DE LA RECEPCIÓN',
    filas: [
      [{ label: 'Tipo de asunto:', key: 'tipo' }],
      [{ label: 'Forma de recepción:', key: 'forma_recepcion' }],
      [{ label: 'Folio de atención:', key: 'no_asignado' }],
      [{ label: 'Folio de expediente:', key: 'servicio' }],
      [{ label: 'Fecha de registro:', key: 'fecha_recepcion' }]
    ]
  },
  USUARIO: {
    titulo: 'DATOS DEL USUARIO',
    filas: [
      [{ label: 'Nombre:', key: 'nombre_completo' }],
      [{ label: 'Sexo:', key: 'sexo' }, { label: 'Edad:', key: 'edad_o_nacimiento' }],
      [{ label: 'Domicilio:', key: 'domicilio_ciudadano' }],
      [{ label: 'Entidad:', key: 'entidad' }, { label: 'Municipio:', key: 'municipio_localidad' }],
      [{ label: 'Teléfono:', key: 'telefono' }, { label: 'Nacionalidad:', key: 'nacionalidad' }],
      [{ label: 'Identificación:', key: 'identificacion' }]
    ]
  },
  REPRESENTANTE: {
    titulo: 'DATOS DEL REPRESENTANTE',
    // Esta sección tiene una condición, solo se procesa si devuelve true
    condicion: (datos) => datos.rep_nombre_completo && datos.rep_nombre_completo !== '',
    filas: [
      [{ label: 'Nombre:', key: 'rep_nombre_completo' }],
      [{ label: 'Domicilio:', key: 'rep_domicilio' }],
      [{ label: 'Entidad:', key: 'rep_entidad' }, { label: 'Municipio:', key: 'rep_municipio' }],
      [{ label: 'Teléfono:', key: 'rep_telefono' }, { label: 'Acreditación:', key: 'rep_acreditacion' }],
      [{ label: 'Causa rep.:', key: 'rep_causa' }, { label: 'Parentesco:', key: 'rep_parentesco' }]
    ]
  },
  PRESTADOR: {
    titulo: 'PRESTADOR(ES) DEL(LOS) SERVICIO(S)',
    filas: [
      [{ label: 'Nombre:', key: 'medico_nombre' }],
      [{ label: 'Domicilio:', key: 'unidad_medica_domicilio' }],
      [{ label: 'Entidad:', key: 'pres_entidad' }, { label: 'Municipio:', key: 'pres_municipio' }],
      [{ label: 'Teléfono:', key: 'pres_telefono' }],
      [{ label: 'Sector:', key: 'sector' }],
      [{ label: 'Tipo de Institución:', key: 'tipo_institucion' }],
      [{ label: 'Institución:', key: 'institucion' }],
      [{ label: 'Especialidad:', key: 'especialidad_medica' }]
    ]
  },
  ATENCION: {
    titulo: 'DATOS DE LA ATENCIÓN',
    filas: [
      [{ label: 'Motivo:', key: 'motivo_principal' }],
      [{ label: 'Submotivo:', key: 'submotivo' }],
      [{ label: 'Hechos:', key: 'descripcion_hechos' }],
      [{ label: 'Diagnóstico:', key: 'diagnostico' }],
      [{ label: 'Pretensiones:', key: 'pretensiones' }],
      [{ label: 'Criterio Médico:', key: 'criterio_medico' }],
      [{ label: 'Notas Seguimiento:', key: 'notas_seguimiento' }],
      [{ label: 'Observaciones:', key: 'observaciones_servicio' }]
    ]
  }
};

export const CONFIG_CAMPOS_CARNET = [
  { label: 'NACIONALIDAD',        keys: ['nacionalidad'] },
  { label: 'FOLIO DE ATENCIÓN', keys: ['no_asignado'] },
  { label: 'FOLIO DE EXPEDIENTE', keys: ['servicio'] },
  { label: 'IDENTIFICACIÓN',      keys: ['identificacion', 'tipo_identificacion'] },
  { label: 'NO. IDENTIFICACIÓN',  keys: ['no_identificacion', 'num_identificacion'] },
  { label: 'CURP',                keys: ['curp'] },
  { label: 'APELLIDO PATERNO',    keys: ['apellido_paterno', 'apellido_p'] },
  { label: 'APELLIDO MATERNO',    keys: ['apellido_materno', 'apellido_m'] },
  { label: 'NOMBRE (S)',          keys: ['nombre', 'nombres'] },
  { label: 'SEXO',                keys: ['sexo'] },
  { label: 'FECHA NAC. O EDAD',   keys: ['edad', 'edad_o_nacimiento'] },
  { label: 'GRUPO',               keys: ['grupo'] },
  { label: 'DOMICILIO',           keys: ['domicilio'] },
  { label: 'TELÉFONO',            keys: ['telefono'] },
  { label: 'CORREO ELECTRÓNICO',  keys: ['correo_electronico'] },
  { label: 'PRETENSIONES',        keys: ['pretensiones'] },
  { label: 'NOTAS SEGUIMIENTO',   keys: ['notas_seguimiento'] }
];

export const ETIQUETA_FIRMA_USUARIO = "COMPARECIENTE"; 
