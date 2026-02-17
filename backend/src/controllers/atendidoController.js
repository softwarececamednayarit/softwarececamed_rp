const Atendido = require('../models/atendidoModel');
const db = require('../../config/firebase'); // Necesario solo para la migración y batch de folios
const sheetsService = require('../services/googleSheetsService');
const LoggerService = require('../services/loggerService');

// =====================================================================
// 1. Obtener lista básica (Solo datos de recepción)
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

    if (!data) return res.status(404).json({ ok: false, message: 'Registro no encontrado' });

    res.status(200).json({ ok: true, data });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// =====================================================================
// 3. Obtener EXPEDIENTE COMPLETO (Base + Detalles)
// =====================================================================
const getExpedienteCompleto = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 👇 REFACTOR: El modelo se encarga de buscar y unir todo
    const fullData = await Atendido.getFullExpediente(id);

    if (!fullData) {
      return res.status(404).json({ ok: false, message: 'Expediente no encontrado' });
    }

    res.status(200).json({ ok: true, data: fullData });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// =====================================================================
// 4. ACTUALIZAR / GUARDAR DETALLES
// =====================================================================
const updateExpedienteDetalle = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    // Validar existencia
    const exists = await Atendido.getById(id);
    if (!exists) return res.status(404).json({ message: "El expediente base no existe." });

    // 👇 REFACTOR: El modelo se encarga de limpiar y guardar
    await Atendido.saveDetalle(id, data);

    // LOG
    LoggerService.log(
        req.user, 'EDITAR', 'EXPEDIENTE', 
        `Actualizó expediente ${id}`, 
        { id_expediente: id, campos: Object.keys(data).length }
    );

    res.json({ success: true, message: 'Expediente actualizado correctamente.' });
  } catch (error) {
    console.error("Error update:", error);
    res.status(500).json({ error: 'Error al actualizar datos' });
  }
};

// =====================================================================
// 5. OBTENER LISTA COMPLETA (Para Tablas)
// =====================================================================
const getAllExpedientes = async (req, res) => {
  try {
    // 👇 REFACTOR: Reutilizamos la lógica unificada del modelo
    const fullDataList = await Atendido.getFullList(req.query);
    
    res.status(200).json({ ok: true, count: fullDataList.length, data: fullDataList });
  } catch (error) {
    console.error("Error getAll:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
};

// =====================================================================
// 6. GENERAR REPORTE PADRÓN
// =====================================================================
const exportarExpedientesAPadron = async (req, res) => {
  try {
    console.log("📄 Generando Padrón...");
    
    // 👇 REFACTOR: Misma lista que getAllExpedientes, sin duplicar código
    const listaLimpia = await Atendido.getFullList(req.query);

    if (listaLimpia.length === 0) {
       return res.status(200).json({ ok: true, message: 'No hay registros para exportar.', count: 0 });
    }

    // El servicio de Sheets recibe la lista ya limpia
    const resultadoSheet = await sheetsService.generarReporteCompleto(listaLimpia);

    LoggerService.log(
        req.user, 'EXPORTAR', 'PADRON', 
        `Generó reporte Padrón (${resultadoSheet.count} regs)`, 
        { url: resultadoSheet.url }
    );

    res.status(200).json({ 
      ok: true, 
      message: 'Reporte generado exitosamente.',
      processed_count: resultadoSheet.count,
      url: resultadoSheet.url 
    });

  } catch (error) {
    console.error("Error Padrón:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
};

// =====================================================================
// 7. GENERAR REGISTRO CLÁSICO
// =====================================================================
const exportarRegistroClasico = async (req, res) => {
  try {
    console.log("📊 Generando Registro Clásico...");

    // 👇 REFACTOR: Reutilizamos la lista unificada
    const fullDataList = await Atendido.getFullList(req.query);

    if (fullDataList.length === 0) {
       return res.status(200).json({ ok: true, message: 'No hay registros.', count: 0 });
    }

    const resultado = await sheetsService.generarReporteClasico(fullDataList);

    LoggerService.log(
        req.user, 'EXPORTAR', 'REGISTRO_CLASICO', 
        `Generó reporte Clásico y folios.`, 
        { count: resultado.count }
    );

    res.status(200).json({ 
      ok: true, 
      message: 'Registro generado y folios actualizados.',
      url: resultado.url,
      count: resultado.count
    });

  } catch (error) {
    console.error("Error Registro Clásico:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
};

// =====================================================================
// 8. ACTUALIZAR ESTATUS SIREMED
// =====================================================================
const updateEstatusSiremed = async (req, res) => {
  const { id } = req.params;
  const { estatus_siremed } = req.body; 

  try {
    if (estatus_siremed === undefined) return res.status(400).json({ message: "Falta estatus." });

    const exists = await Atendido.getById(id);
    if (!exists) return res.status(404).json({ message: "Expediente no existe." });

    // 👇 REFACTOR: Reusamos el saveDetalle, es lo mismo
    await Atendido.saveDetalle(id, { estatus_siremed });

    LoggerService.log(
        req.user, 'ACTUALIZAR', 'SIREMED', 
        `Cambió estatus a: ${estatus_siremed}`, 
        { id_expediente: id }
    );

    res.json({ success: true, message: 'Estatus actualizado.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar estatus' });
  }
};

// =====================================================================
// 9. Resumen estadístico (Sin cambios mayores)
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
// 10. Script de Migración (Admin Tool)
// =====================================================================
const migrarExpedientes = async (req, res) => {
  try {
    console.log("Iniciando migración...");
    const snapshotAtendidos = await db.collection('atendidos').select().get();
    const snapshotDetalles = await db.collection('expedientes_detalle').select().get();
    const idsExistentes = new Set(snapshotDetalles.docs.map(doc => doc.id));

    const batch = db.batch();
    let contador = 0;
    let lotesProcesados = 0;

    for (const doc of snapshotAtendidos.docs) {
      if (idsExistentes.has(doc.id)) continue; 
      
      batch.set(db.collection('expedientes_detalle').doc(doc.id), {
        atendido_link_id: doc.id,
        fecha_migracion: new Date(),
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

    const total = contador + (lotesProcesados * 490);
    
    // Usuario fallback por si lo corre el sistema
    const usuarioLog = req.user || { id: 'sys', nombre: 'Admin/System', role: 'system' };
    LoggerService.log(usuarioLog, 'MIGRAR', 'SISTEMA', `Migración ejecutada`, { nuevos: total });

    res.json({ ok: true, message: `Migración: ${total} nuevos.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: error.message });
  }

  const deleteExpediente = async (req, res) => {
    const { id } = req.params;

    try {
      // 1. Verificar existencia (y obtener nombre para el Log)
      const existing = await Atendido.getById(id);
      
      if (!existing) {
        return res.status(404).json({ message: "El expediente no existe." });
      }

      // 2. Ejecutar borrado en el Modelo
      await Atendido.delete(id);

      // 3. Loguear la acción (Vital para seguridad)
      const nombreCompleto = `${existing.nombre} ${existing.apellido_paterno}`;
      
      LoggerService.log(
        req.user, 
        'ELIMINAR', 
        'EXPEDIENTE', 
        `Eliminó permanentemente el expediente de: ${nombreCompleto}`,
        { id_eliminado: id }
      );

      res.json({ success: true, message: 'Expediente y sus detalles eliminados correctamente.' });

    } catch (error) {
      console.error("Error delete:", error);
      res.status(500).json({ ok: false, message: error.message });
    }
  }

};

// =====================================================================
// 11. ELIMINAR EXPEDIENTE (Borrado físico, con Log detallado)
// =====================================================================
const deleteExpediente = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Verificar existencia (y obtener nombre para el Log)
    const existing = await Atendido.getById(id);
    
    if (!existing) {
      return res.status(404).json({ message: "El expediente no existe." });
    }
    // 2. Ejecutar borrado en el Modelo
    await Atendido.delete(id);

    // 3. Loguear la acción (Vital para seguridad)
    const nombreCompleto = `${existing.nombre} ${existing.apellido_paterno}`;
    
    LoggerService.log(
      req.user, 
      'ELIMINAR', 
      'EXPEDIENTE', 
      `Eliminó permanentemente el expediente de: ${nombreCompleto}`,
      { id_eliminado: id }
    );

    res.json({ success: true, message: 'Expediente y sus detalles eliminados correctamente.' });

  } catch (error) {
    console.error("Error delete:", error);
    return res.status(500).json({ ok: false, message: error.message });
  }
};

module.exports = {
  getAtendidos,
  getAtendidoById,
  getExpedienteCompleto,
  updateExpedienteDetalle,
  getAllExpedientes,
  exportarExpedientesAPadron,
  exportarRegistroClasico, 
  updateEstatusSiremed,
  getResumenMensual,
  migrarExpedientes,
  deleteExpediente
};