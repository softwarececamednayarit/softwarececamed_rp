export const ESPECIALIDADES_LISTA = [
  "Urgencias",
  "Anestesiología",
  "Cardiología",
  "Cirugía cardiotorácica",
  "Cirugía de gastroenterología",
  "Cirugía general",
  "Cirugía neurológica",
  "Cirugía pediátrica",
  "Cirugía plástica estética y reconstructiva",
  "Cirugía vascular y angiología",
  "Dermatología",
  "Especialidades odontológicas",
  "Gastroenterología",
  "Ginecología y obstetricia",
  "Hematología",
  "Medicina crítica-terapia intensiva",
  "Medicina familiar",
  "Medicina general",
  "Medicina interna",
  "Nefrología",
  "Neonatología",
  "Neumología",
  "Neurología",
  "Odontología general",
  "Oftalmología",
  "Oncología",
  "Otorrinolaringología",
  "Pediatría",
  "Psiquiatría",
  "Reumatología",
  "Servicios auxiliares de diagnóstico y tratamiento",
  "Traumatología y ortopedia",
  "Urología",
  "Otros"
];

const MAPEO_ESPECIALIDADES = {
  "algología y clínica del dolor": "Otros",
  "biología de la reproducción": "Ginecología y obstetricia",
  "calidad": "Otros",
  "cirugía de cabeza y cuello": "Cirugía general",
  "cirugía laparoscopía": "Cirugía general",
  "cirugía maxilofacial": "Especialidades odontológicas",
  "cirugía oncológica": "Oncología",
  "cirugía plástica y reconstructiva": "Cirugía plástica estética y reconstructiva",
  "clínica de displasias": "Ginecología y obstetricia",
  "clínica de heridas": "Medicina general",
  "coloproctología": "Gastroenterología",
  "comunicación, audiología, otoneurología y foniatría": "Otorrinolaringología",
  "endocrinología": "Medicina interna",
  "endodoncia": "Especialidades odontológicas",
  "endoscopía": "Gastroenterología",
  "enfermería": "Otros",
  "epidemiología": "Otros",
  "exodoncia": "Especialidades odontológicas",
  "genética": "Otros",
  "geriatría": "Medicina interna",
  "homeopatía": "Otros",
  "implantología dental": "Especialidades odontológicas",
  "infectología": "Medicina interna",
  "inhaloterapia": "Neumología",
  "inmunología clínica y alergología": "Medicina interna",
  "medicina aeroespacial": "Otros",
  "medicina del deporte": "Traumatología y ortopedia",
  "medicina del trabajo": "Medicina familiar",
  "medicina estética": "Otros",
  "medicina física y rehabilitación": "Traumatología y ortopedia",
  "medicina forense": "Otros",
  "medicina materno-fetal": "Ginecología y obstetricia",
  "medicina nuclear": "Servicios auxiliares de diagnóstico y tratamiento",
  "medicina preventiva": "Medicina familiar",
  "medicina transfuncional": "Hematología",
  "neurocirugía": "Cirugía neurológica",
  "neurofisiología clínica": "Neurología",
  "nutrición": "Otros",
  "odontología": "Odontología general",
  "odontología pediátrica": "Especialidades odontológicas",
  "oncología médica": "Oncología",
  "ortodoncia": "Especialidades odontológicas",
  "patología": "Servicios auxiliares de diagnóstico y tratamiento",
  "perinatología": "Ginecología y obstetricia",
  "periodoncia": "Especialidades odontológicas",
  "planificación familiar": "Ginecología y obstetricia",
  "prostodoncia": "Especialidades odontológicas",
  "psicología": "Psiquiatría",
  "radiología e imagen": "Servicios auxiliares de diagnóstico y tratamiento",
  "radioterapia": "Oncología",
  "servicios auxiliares de diagnóstico": "Servicios auxiliares de diagnóstico y tratamiento",
  "servicios auxiliares de tratamiento": "Servicios auxiliares de diagnóstico y tratamiento",
  "terapia intensiva adulto": "Medicina crítica-terapia intensiva",
  "terapia intensiva pediatría": "Medicina crítica-terapia intensiva",
  "terapia intermedia adulto": "Medicina crítica-terapia intensiva",
  "terapia intermedia pediatría": "Medicina crítica-terapia intensiva",
  "unidad de quemados": "Cirugía plástica estética y reconstructiva",
  "urgencias médico-quirúrgica pediatría": "Urgencias",
  "urgencias médico-quirúrgicas adultos": "Urgencias"
};

export const obtenerEspecialidadSugerida = (espDB) => {
  if (!espDB) return '';
  const espLower = espDB.trim().toLowerCase();

  const matchExacto = ESPECIALIDADES_LISTA.find(e => e.toLowerCase() === espLower);
  if (matchExacto) return matchExacto;

  if (MAPEO_ESPECIALIDADES[espLower]) {
    return MAPEO_ESPECIALIDADES[espLower];
  }

  return espDB;
};

export const MOTIVOS_CATALOGO = {
  "Tratamiento médico": [
    "Accidentes e incidentes",
    "Complicaciones secundarias",
    "Desinformación sobre el tratamiento",
    "Falta de consentimiento",
    "Retraso del tratamiento",
    "Secuelas: exceso terapéutico",
    "Tratamiento inadecuado o innecesario",
    "Tratamiento insatisfactorio",
    "Otro (especifique)"
  ],
  "Tratamiento quirúrgico": [
    "Accidentes e incidentes",
    "Alta prematura de los ciudadanos postoperatorios",
    "Cirugía innecesaria",
    "Complicaciones quirúrgicas del post operatorio",
    "Complicaciones quirúrgicas del trans operatorio",
    "Error quirúrgico",
    "Falta de carta de consentimiento informado",
    "Falta de seguimiento o seguimiento inadecuado en el postoperatorio",
    "Falta de valoración pre quirúrgica",
    "Retraso del tratamiento quirúrgico",
    "Secuelas",
    "Técnica quirúrgica inadecuada",
    "Tratamiento quirúrgico no satisfactorio",
    "Otro (especifique)"
  ],
  "Deficiencias administrativas": [
    "Cambio de médico tratante o de unidad médica",
    "Demora prolongada y/o diferimento para obtener el servicio",
    "Falta de equipo médico",
    "Falta de insumos o medicamentos",
    "Falta de personal",
    "Negación de la atención",
    "Sistema de referencia y contrareferencia",
    "Trato inadecuado por parte del personal administrativo",
    "Otro (especifique)"
  ],
  "Auxiliares de diagnóstico y tratamiento": [
    "Complicaciones secundarias de los procedimientos diagnósticos",
    "Estudios innecesarios",
    "Falsos positivos o negativos",
    "Falta de información y conocimiento",
    "Retraso del procedimiento diagnóstico",
    "Retraso o falta de notificación de resultados",
    "Secuelas",
    "Otro (especifique)"
  ],
  "Diagnóstico": [
    "Desinformación sobre el diagnóstico",
    "Diagnóstico erróneo",
    "Omisión del diagnóstico",
    "Retraso del diagnóstico",
    "Otro (especifique)"
  ],
  "Relación médico paciente": [
    "Fallas en la comunicación",
    "Tratamiento inadecuado",
    "Falsas expectativas",
    "Otro (especifique)"
  ]
};

export const ESTATUS_SIREMED_OPCIONES = ["PENDIENTE", "SUBIDO"];

export const MUNICIPIOS_NAYARIT = [
  "Acaponeta", "Ahuacatlán", "Amatlán de Cañas", "Compostela", "Huajicori",
  "Ixtlán del Río", "Jala", "La Yesca", "Rosamorada", "Ruiz",
  "San Blas", "San Pedro Lagunillas", "Santa María del Oro", "Santiago Ixcuintla",
  "Tecuala", "Tepic", "Tuxpan", "Bahía de Banderas", "Del Nayar", "Pueblo Nuevo",
  "OTRO (ESPECIFIQUE)"
];

export const ESTADOS_CIVILES = [
  "Soltero(a)", "Casado(a)", "Unión libre", "Viudo(a)", 
  "Divorciado(a)", "Separado(a)", "No Aplica"
];

export const TIPOS_BENEFICIARIO = ["Directo", "Indirecto"];

export const PARENTESCOS = [
  "Beneficiario", "Cónyuge o Compañero(a)", "Padre o Madre", "Hijo(a)",
  "Abuelo(a)", "Hermano(a)", "Nieto(a)", "Suegro(a)", 
  "Sobrino(a)", "Yerno o Nuera", "Hijastro(a) / Entendado(a)", 
  "No Tiene Parentesco", "Otro Parentesco"
];

export const TIPOS_APOYO = [
  "Servicio", "Especie", "Monetario", "Producto Subsidiado", "Mixto", "Estatal"
];

export const ACTIVIDADES_APOYO = [
  "Orientación", "Gestión", "Asesoría", "Queja", "Dictamen"
];