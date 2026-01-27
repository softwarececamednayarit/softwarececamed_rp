const Atendido = require('../models/atendidoModel');
const db = require('../../config/firebase');
const sheetsService = require('../services/googleSheetsService');

// =====================================================================
// 1. Obtener lista básica
// =====================================================================
const getAtendidos = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, tipo, nombre } = req.query;
    let data;

    if (nombre) {
      data = await Atendido.searchByName(nombre);
    } else {
      data = await Atendido.getFiltered({ fechaInicio, fechaFin, tipo });
    }

    res.status(200).json({ ok: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// =====================================================================
// 2. Obtener un solo registro BÁSICO
// =====================================================================
const getAtendidoById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Atendido.getById(id);

    if (!data) {
      return res.status(404).json({ ok: false, message: 'Registro no encontrado' });
    }

    res.status(200).json({ ok: true, data });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// =====================================================================
// 3. Obtener EXPEDIENTE COMPLETO
// =====================================================================
const getExpedienteCompleto = async (req, res) => {
  try {
    const { id } = req.params;

    // A. Datos Base (atendidos)
    const basicData = await Atendido.getById(id);
    if (!basicData) {
      return res.status(404).json({ ok: false, message: 'Expediente base no encontrado' });
    }

    // B. Datos Detalle (expedientes_detalle)
    const detalleDoc = await db.collection('expedientes_detalle').doc(id).get();
    const detalleData = detalleDoc.exists ? detalleDoc.data() : {};

    // C. Lógica de "Prestador de Servicio"
    // Validamos si la propiedad EXISTE en detalle (aunque sea string vacío).
    // Si existe, respetamos esa. Si no existe (undefined), sugerimos la original.
    let prestadorFinal;
    if (detalleData.prestador_nombre !== undefined) {
        prestadorFinal = detalleData.prestador_nombre; // Toma el valor editado (incluso si se borró y está vacío)
    } else {
        prestadorFinal = basicData.unidad_medica || basicData.institucion || ''; // Sugerencia inicial
    }

    // D. Construcción del Objeto
    const fullData = {
      id,
      // --- SECCIÓN 1: Datos Base (Lectura solamente) ---
      fecha_recepcion: basicData.fecha_recepcion || '',
      nombre: basicData.nombre || '',
      apellido_paterno: basicData.apellido_paterno || '',
      apellido_materno: basicData.apellido_materno || '',
      nombre_completo: `${basicData.nombre || ''} ${basicData.apellido_paterno || ''} ${basicData.apellido_materno || ''}`.trim(),
      domicilio: basicData.domicilio || '',
      telefono: basicData.telefono || '',
      edad: basicData.edad || basicData.fecha_nacimiento || '',
      sexo: basicData.sexo || '',
      curp: basicData.curp || '',
      descripcion_hechos: basicData.descripcion_hechos || '',
      
      // --- SECCIÓN 2: Datos Editables (Guardados en expedientes_detalle) ---
      
      // Campo Prestador (Ahora controlado por la lógica superior)
      prestador_nombre: prestadorFinal,

      // Padrón
      tipo_beneficiario: detalleData.tipo_beneficiario || '',
      criterio_seleccion: detalleData.criterio_seleccion || '',
      tipo_apoyo: detalleData.tipo_apoyo || '',
      monto_apoyo: detalleData.monto_apoyo || '',
      parentesco: detalleData.parentesco || '',
      estado_civil: detalleData.estado_civil || '',
      cargo_ocupacion: detalleData.cargo_ocupacion || '',
      actividad_apoyo: detalleData.actividad_apoyo || '',
      municipio: detalleData.municipio || '',
      localidad: detalleData.localidad || '',

      // Clasificación / Gestión
      foraneo: detalleData.foraneo === true || detalleData.foraneo === "true",
      representante: detalleData.representante || '',
      via_telefonica: detalleData.via_telefonica === true || detalleData.via_telefonica === "true",
      especialidad: detalleData.especialidad || '',
      motivo_inconformidad: detalleData.motivo_inconformidad || '',
      submotivo: detalleData.submotivo || '',
      tipo_asunto: detalleData.tipo_asunto || '',
      observaciones_servicio: detalleData.observaciones_servicio || '',
      servicio: detalleData.servicio || '',
      no_asignado: detalleData.no_asignado || '',

      historial_clinico: detalleData.historial_clinico || []
    };

    res.status(200).json({ ok: true, data: fullData });

  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// =====================================================================
// 4. Resumen estadístico
// =====================================================================
const getResumenMensual = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, tipo } = req.query;
    const data = await Atendido.getFiltered({ fechaInicio, fechaFin, tipo });

    const resumen = data.reduce((acc, curr) => {
      const mes = curr.fecha_recepcion ? curr.fecha_recepcion.substring(0, 7) : "Sin Fecha";
      if (!acc[mes]) acc[mes] = { total: 0, categorias: {} };
      acc[mes].total++;
      const nombreTipo = curr.tipo || "NO_DEFINIDO";
      acc[mes].categorias[nombreTipo] = (acc[mes].categorias[nombreTipo] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({ ok: true, resumen });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// =====================================================================
// 5. Script de Migración
// =====================================================================
const migrarExpedientes = async (req, res) => {
  try {
    console.log("Iniciando migración segura...");
    
    const snapshotAtendidos = await db.collection('atendidos').select().get();
    const snapshotDetalles = await db.collection('expedientes_detalle').select().get();
    const idsExistentes = new Set(snapshotDetalles.docs.map(doc => doc.id));

    const batch = db.batch();
    let contador = 0;
    let lotesProcesados = 0;

    for (const doc of snapshotAtendidos.docs) {
      const id = doc.id;
      if (idsExistentes.has(id)) continue; 

      const detalleRef = db.collection('expedientes_detalle').doc(id);
      batch.set(detalleRef, {
        atendido_link_id: id,
        fecha_migracion: new Date(),
        estatus_padron: 'PENDIENTE',
        historial_clinico: []
      });
      
      contador++;
      if (contador >= 490) {
        await batch.commit();
        lotesProcesados++;
        contador = 0;
      }
    }

    if (contador > 0) await batch.commit();

    res.json({ 
      ok: true, 
      message: `Migración finalizada. Se crearon ${contador + (lotesProcesados * 490)} registros nuevos.` 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: error.message });
  }
};

// =====================================================================
// 6. ACTUALIZAR / GUARDAR DETALLES (Aquí se guarda el prestador_nombre)
// =====================================================================
const updateExpedienteDetalle = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const basicCheck = await db.collection('atendidos').doc(id).get();
    if (!basicCheck.exists) {
      return res.status(404).json({ message: "El expediente base no existe." });
    }

    // Al guardar aquí, "prestador_nombre" se escribe físicamente en expedientes_detalle.
    // A partir de este momento, este campo tendrá prioridad sobre el original.
    const updateData = {
      // Padrón
      tipo_beneficiario: data.tipo_beneficiario,
      criterio_seleccion: data.criterio_seleccion,
      tipo_apoyo: data.tipo_apoyo,
      monto_apoyo: data.monto_apoyo,
      parentesco: data.parentesco,
      estado_civil: data.estado_civil,
      cargo_ocupacion: data.cargo_ocupacion,
      actividad_apoyo: data.actividad_apoyo,
      municipio: data.municipio,
      localidad: data.localidad,
      domicilio: data.domicilio,

      // Clasificación
      foraneo: data.foraneo,
      ocupacion: data.ocupacion,
      representante: data.representante,
      via_telefonica: data.via_telefonica,
      especialidad: data.especialidad,
      motivo_inconformidad: data.motivo_inconformidad, 
      submotivo: data.submotivo,
      tipo_asunto: data.tipo_asunto,
      observaciones_servicio: data.observaciones_servicio,
      servicio: data.servicio,
      no_asignado: data.no_asignado,
      
      // CAMPO IMPORTANTE: Se guarda explícitamente en esta colección
      prestador_nombre: data.prestador_nombre, 

      fecha_ultima_actualizacion: new Date()
    };

    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    await db.collection('expedientes_detalle').doc(id).set(updateData, { merge: true });

    res.json({ success: true, message: 'Expediente actualizado correctamente.' });

  } catch (error) {
    console.error("Error actualizando expediente:", error);
    res.status(500).json({ error: 'Error al actualizar datos' });
  }
};

// =====================================================================
// 7. OBTENER LISTA COMPLETA (Para Tablas)
// =====================================================================
const getAllExpedientes = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, tipo, nombre } = req.query;

    let basicDataList;
    if (nombre) {
      basicDataList = await Atendido.searchByName(nombre);
    } else {
      basicDataList = await Atendido.getFiltered({ fechaInicio, fechaFin, tipo });
    }

    const fullDataList = await Promise.all(basicDataList.map(async (baseItem) => {
        const detalleDoc = await db.collection('expedientes_detalle').doc(baseItem.id).get();
        const detalleData = detalleDoc.exists ? detalleDoc.data() : {};

        // Lógica de Prioridad (Igual que en getExpedienteCompleto)
        let prestadorFinal;
        if (detalleData.prestador_nombre !== undefined) {
            prestadorFinal = detalleData.prestador_nombre; // Usamos el dato de esta colección
        } else {
            prestadorFinal = baseItem.unidad_medica || baseItem.institucion || ''; // Fallback
        }

        let fechaLimpia = '';
        if (baseItem.fecha_recepcion) { 
             fechaLimpia = (typeof baseItem.fecha_recepcion.toDate === 'function') 
                ? baseItem.fecha_recepcion.toDate().toISOString().split('T')[0] 
                : baseItem.fecha_recepcion;
        }
        
        return {
            id: baseItem.id,
            ...baseItem,
            
            // Datos Base
            fecha_beneficio: baseItem.fecha_recepcion || '',
            curp: baseItem.curp || '',
            nombre: baseItem.nombre || '',
            apellido_paterno: baseItem.apellido_paterno || '',
            apellido_materno: baseItem.apellido_materno || '',
            sexo: baseItem.sexo || '',
            edad: baseItem.edad_o_nacimiento || '',
            telefono: baseItem.telefono || '',
            domicilio: baseItem.domicilio || '',
            descripcion_hechos: baseItem.descripcion_hechos || '',

            // Padrón
            municipio: detalleData.municipio || '',
            localidad: detalleData.localidad || '',
            tipo_beneficiario: detalleData.tipo_beneficiario || '',
            tipo_apoyo: detalleData.tipo_apoyo || '',
            monto_apoyo: detalleData.monto_apoyo || '',
            parentesco: detalleData.parentesco || '',
            criterio_seleccion: detalleData.criterio_seleccion || '',
            estado_civil: detalleData.estado_civil || '',
            cargo_ocupacion: detalleData.cargo_ocupacion || '',
            actividad_apoyo: detalleData.actividad_apoyo || '',

            // Clasificación
            foraneo: detalleData.foraneo || '',
            representante: detalleData.representante || '',
            via_telefonica: detalleData.via_telefonica || '',
            submotivo: detalleData.submotivo || '',
            tipo_asunto: detalleData.tipo_asunto || '',
            no_asignado: detalleData.no_asignado || '',
            servicio: detalleData.servicio || '',
            observaciones_servicio: detalleData.observaciones_servicio || '',
            motivo: detalleData.motivo_inconformidad || '',
            especialidad: detalleData.especialidad || '',
            
            // Campo calculado/leído
            prestador_nombre: prestadorFinal
        };
    }));

    res.status(200).json({ ok: true, count: fullDataList.length, data: fullDataList });

  } catch (error) {
    console.error("Error en getAllExpedientes:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
};

// =====================================================================
// 8. Exportar a Google Sheets
// =====================================================================
const exportarExpedientesAPadron = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, tipo, nombre } = req.query;

    // 1. Obtener Base
    let basicDataList;
    if (nombre) {
      basicDataList = await Atendido.searchByName(nombre);
    } else {
      basicDataList = await Atendido.getFiltered({ fechaInicio, fechaFin, tipo });
    }

    // 2. Fusionar
    const fullDataList = await Promise.all(basicDataList.map(async (baseItem) => {
        const detalleDoc = await db.collection('expedientes_detalle').doc(baseItem.id).get();
        const detalleData = detalleDoc.exists ? detalleDoc.data() : {};
        
        let fechaLimpia = '';
        if (baseItem.fecha_recepcion) {
            fechaLimpia = (typeof baseItem.fecha_recepcion.toDate === 'function') 
                ? baseItem.fecha_recepcion.toDate().toISOString().split('T')[0] 
                : baseItem.fecha_recepcion;
        }

        const edadRaw = baseItem.edad_o_nacimiento || baseItem.fecha_nacimiento || '';
        const edadLimpia = edadRaw.toString().replace(/ años/gi, '').trim();

        return {
            id: baseItem.id,
            ...baseItem,
            estatus_padron: detalleData.estatus_padron || 'PENDIENTE', 
            fecha_beneficio: fechaLimpia,
            curp: baseItem.curp || '',
            nombre: baseItem.nombre || '',
            apellido_paterno: baseItem.apellido_paterno || '',
            apellido_materno: baseItem.apellido_materno || '',
            sexo: baseItem.sexo || '',
            edad: edadLimpia,
            municipio: detalleData.municipio || '',
            localidad: detalleData.localidad || '',
            tipo_beneficiario: detalleData.tipo_beneficiario || '',
            tipo_apoyo: detalleData.tipo_apoyo || '',
            monto_apoyo: detalleData.monto_apoyo || '',
            estado_civil: detalleData.estado_civil || '',
            cargo_ocupacion: detalleData.cargo_ocupacion || '',
            parentesco: detalleData.parentesco || '',
            criterio_seleccion: detalleData.criterio_seleccion || '',
            actividad_apoyo: detalleData.actividad_apoyo || ''
        };
    }));

    // 3. Filtrar PENDIENTES
    const listaPendiente = fullDataList.filter(item => item.estatus_padron === 'PENDIENTE');

    if (listaPendiente.length === 0) {
        return res.status(200).json({ ok: true, message: 'No hay expedientes nuevos para exportar.', count: 0 });
    }

    // 4. Enviar a Sheets
    const resultadoSheet = await sheetsService.exportarLotePadron(listaPendiente);

    // 5. Actualizar Estatus en Firebase
    if (resultadoSheet.ids.length > 0) {
        const batch = db.batch();
        resultadoSheet.ids.forEach(id => {
            const docRef = db.collection('expedientes_detalle').doc(id); 
            batch.set(docRef, { estatus_padron: 'ENVIADO' }, { merge: true });
        });
        await batch.commit();
    }

    res.status(200).json({ 
        ok: true, 
        message: 'Exportación exitosa.',
        processed_count: resultadoSheet.procesados,
        details: resultadoSheet.ids
    });

  } catch (error) {
    console.error("Error en exportarExpedientesAPadron:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
};

module.exports = {
  getAtendidos,
  getAtendidoById,
  getExpedienteCompleto,
  getResumenMensual,
  migrarExpedientes,
  updateExpedienteDetalle,
  getAllExpedientes,
  exportarExpedientesAPadron
};