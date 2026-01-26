const Atendido = require('../models/atendidoModel');
const db = require('../../config/firebase');
const sheetsService = require('../services/googleSheetsService');

// 1. Obtener lista con filtros (LIGERO)
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

// 2. Obtener un solo registro BÁSICO (Rápido)
// Solo consulta la colección 'atendidos'. Ideal para vistas previas.
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

// 3. Obtener EXPEDIENTE COMPLETO (Endpoint Dedicado)
// Hace el JOIN: Datos Básicos + Datos de Detalle (Padrón/Historial)
const getExpedienteCompleto = async (req, res) => {
  try {
    const { id } = req.params;

    // A. Datos Base (Colección 'atendidos')
    const basicData = await Atendido.getById(id);
    if (!basicData) {
      return res.status(404).json({ ok: false, message: 'Expediente base no encontrado' });
    }

    // B. Datos Detalle (Colección 'expedientes_detalle')
    const detalleDoc = await db.collection('expedientes_detalle').doc(id).get();
    const detalleData = detalleDoc.exists ? detalleDoc.data() : {};

    // C. Construcción del Objeto Final (Arrastre de datos + Nuevos)
    const fullData = {
      id,
      // --- Datos Arrastrados (Base) ---
      curp: basicData.curp || '',
      nombre: basicData.nombre || '',
      apellido_paterno: basicData.apellido_paterno || '',
      apellido_materno: basicData.apellido_materno || '',
      sexo: basicData.sexo || '',
      edad: basicData.edad || basicData.fecha_nacimiento || '', // Ajusta según tu campo real
      
      // --- Resto de datos base (por si se ocupan) ---
      ...basicData,

      // --- Datos del Padrón (Detalle) ---
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
      
      // --- Otros detalles ---
      historial_clinico: detalleData.historial_clinico || []
    };

    res.status(200).json({ ok: true, data: fullData });

  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// 4. Resumen estadístico (LIGERO)
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

// 5. Script de Migración SEGURO (Skip si ya existe)
const migrarExpedientes = async (req, res) => {
  try {
    console.log("Iniciando migración segura...");
    
    // 1. Traer todos los IDs de 'atendidos' (Origen)
    const snapshotAtendidos = await db.collection('atendidos').select().get(); // .select() solo trae IDs para ahorrar datos
    
    // 2. Traer todos los IDs de 'expedientes_detalle' (Destino)
    const snapshotDetalles = await db.collection('expedientes_detalle').select().get();
    
    // Creamos un Set (lista rápida) de los que YA existen en detalle
    const idsExistentes = new Set(snapshotDetalles.docs.map(doc => doc.id));

    const batch = db.batch();
    let contador = 0;
    let lotesProcesados = 0;

    // 3. Iterar y filtrar
    for (const doc of snapshotAtendidos.docs) {
      const id = doc.id;

      // LA LÍNEA MÁGICA: Si ya existe en el set, saltamos (SKIP)
      if (idsExistentes.has(id)) {
        continue; 
      }

      // Si no existe, preparamos la creación
      const detalleRef = db.collection('expedientes_detalle').doc(id);
      
      batch.set(detalleRef, {
        atendido_link_id: id,
        fecha_migracion: new Date(),
        // Inicializamos vacíos solo para los NUEVOS
        tipo_beneficiario: '',
        estatus_padron: 'PENDIENTE',
        historial_clinico: []
      });
      
      contador++;

      // Seguridad: Firestore solo permite 500 operaciones por batch
      if (contador >= 490) {
        await batch.commit();
        lotesProcesados++;
        contador = 0; // Reiniciamos para el siguiente lote (si hubiera lógica de re-instanciar batch)
        // Nota: Para sets masivos reales (>500) se requiere lógica de loop de batches, 
        // pero para tu caso esto previene el error si son menos de 500 faltantes.
      }
    }

    if (contador > 0) {
      await batch.commit();
    }

    res.json({ 
      ok: true, 
      message: `Migración finalizada. Se crearon ${contador + (lotesProcesados * 490)} expedientes nuevos. Los existentes se respetaron.` 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: error.message });
  }
};

// 6. NUEVO: ACTUALIZAR DATOS DE PADRÓN
// Este endpoint recibe solo los campos extra y los guarda en la colección detalle
const actualizarPadron = async (req, res) => {
  const { id } = req.params;
  const datosPadron = req.body;

  try {
    // Validamos que el ID exista en la base principal (opcional, por seguridad)
    const basicCheck = await db.collection('atendidos').doc(id).get();
    if (!basicCheck.exists) {
      return res.status(404).json({ message: "El expediente base no existe." });
    }

    // Preparamos solo los campos permitidos para el padrón
    const updateData = {
      tipo_beneficiario: datosPadron.tipo_beneficiario,
      criterio_seleccion: datosPadron.criterio_seleccion,
      tipo_apoyo: datosPadron.tipo_apoyo,
      monto_apoyo: datosPadron.monto_apoyo,
      parentesco: datosPadron.parentesco,
      estado_civil: datosPadron.estado_civil,
      cargo_ocupacion: datosPadron.cargo_ocupacion,
      actividad_apoyo: datosPadron.actividad_apoyo,
      municipio: datosPadron.municipio,
      localidad: datosPadron.localidad,
      fecha_actualizacion_padron: new Date()
    };

    // Eliminamos claves undefined para no guardar basura
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    // Guardamos en 'expedientes_detalle' con merge: true
    // (Si no existe el documento, lo crea. Si existe, solo actualiza estos campos)
    await db.collection('expedientes_detalle').doc(id).set(updateData, { merge: true });

    res.json({ success: true, message: 'Información de padrón actualizada' });

  } catch (error) {
    console.error("Error actualizando padrón:", error);
    res.status(500).json({ error: 'Error al guardar datos del padrón' });
  }
};

// 7. OBTENER LISTA COMPLETA FUSIONADA (Para la Tabla Padrón)
const getAllExpedientes = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, tipo, nombre } = req.query;

    // A. Obtener la lista base (Colección 'atendidos')
    // Reutilizamos tu lógica de filtrado existente
    let basicDataList;
    if (nombre) {
      basicDataList = await Atendido.searchByName(nombre);
    } else {
      basicDataList = await Atendido.getFiltered({ fechaInicio, fechaFin, tipo });
    }

    // B. Hacer el "JOIN" manual en paralelo
    // Map devuelve un array de Promesas, y Promise.all espera a que todas se resuelvan.
    const fullDataList = await Promise.all(basicDataList.map(async (baseItem) => {
        
        // Buscamos el documento detalle que tenga el MISMO ID
        const detalleDoc = await db.collection('expedientes_detalle').doc(baseItem.id).get();
        const detalleData = detalleDoc.exists ? detalleDoc.data() : {};

        // Fusionamos los datos (Base + Detalle)
        return {
            // --- ID y Datos Base ---
            id: baseItem.id,
            ...baseItem, // Esparce todo lo que venga en atendidos
            
            // Aseguramos campos base clave por si acaso
            fecha_beneficio: baseItem.fecha_recepcion || '',
            curp: baseItem.curp || '',
            nombre: baseItem.nombre || '',
            apellido_paterno: baseItem.apellido_paterno || '',
            apellido_materno: baseItem.apellido_materno || '',
            sexo: baseItem.sexo || '',
            edad: baseItem.edad_o_nacimiento || baseItem.fecha_nacimiento || '', // Ajusta según tu campo real
            
            // --- Datos del Padrón (Detalle) ---
            // Si no existen en detalle, enviamos string vacío para que la tabla no falle
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

    // C. Responder con la lista fusionada
    res.status(200).json({ ok: true, count: fullDataList.length, data: fullDataList });

  } catch (error) {
    console.error("Error en getAllExpedientes:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
};


const exportarExpedientesAPadron = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, tipo, nombre } = req.query;

    // ---------------------------------------------------------
    // 1. OBTENER Y FUSIONAR DATOS
    // ---------------------------------------------------------
    
    // A. Buscar en colección base 'atendidos'
    let basicDataList;
    if (nombre) {
      basicDataList = await Atendido.searchByName(nombre);
    } else {
      basicDataList = await Atendido.getFiltered({ fechaInicio, fechaFin, tipo });
    }

    // B. Join manual con 'expedientes_detalle'
    const fullDataList = await Promise.all(basicDataList.map(async (baseItem) => {
        const detalleDoc = await db.collection('expedientes_detalle').doc(baseItem.id).get();
        const detalleData = detalleDoc.exists ? detalleDoc.data() : {};
        
        // Formatear fecha
        let fechaLimpia = '';
        if (baseItem.fecha_recepcion) {
            if (typeof baseItem.fecha_recepcion.toDate === 'function') {
                fechaLimpia = baseItem.fecha_recepcion.toDate().toISOString().split('T')[0];
            } else {
                fechaLimpia = baseItem.fecha_recepcion;
            }
        }

        const edadRaw = baseItem.edad_o_nacimiento || baseItem.fecha_nacimiento || '';
        // Limpiamos: Convertimos a texto -> Reemplazamos " años" (ignorando mayúsculas/minúsculas) -> Quitamos espacios extra
        const edadLimpia = edadRaw.toString().replace(/ años/gi, '').trim();

        return {
            id: baseItem.id,
            ...baseItem,
            
            // CORRECCIÓN 1: Leer el estatus desde 'detalleData', no desde 'baseItem'
            estatus_padron: detalleData.estatus_padron || 'PENDIENTE', 
            
            fecha_beneficio: fechaLimpia,
            curp: baseItem.curp || '',
            nombre: baseItem.nombre || '',
            apellido_paterno: baseItem.apellido_paterno || '',
            apellido_materno: baseItem.apellido_materno || '',
            sexo: baseItem.sexo || '',
            edad: edadLimpia,
            
            // Datos Detalle
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

    // ---------------------------------------------------------
    // 2. FILTRAR Y ENVIAR A SHEETS
    // ---------------------------------------------------------
    
    // Filtramos los que tengan estatus PENDIENTE (que ahora viene de expediente_detalles)
    const listaPendiente = fullDataList.filter(item => item.estatus_padron === 'PENDIENTE');

    if (listaPendiente.length === 0) {
        return res.status(200).json({ 
            ok: true, 
            message: 'No hay expedientes nuevos (PENDIENTE) para exportar.',
            count: 0 
        });
    }

    // LLAMADA AL SERVICIO
    const resultadoSheet = await sheetsService.exportarLotePadron(listaPendiente);

    // ---------------------------------------------------------
    // 3. ACTUALIZAR FIREBASE (CAMBIAR ESTATUS)
    // ---------------------------------------------------------
    
    if (resultadoSheet.ids.length > 0) {
        const batch = db.batch();
        
        resultadoSheet.ids.forEach(id => {
            // CORRECCIÓN 2: Apuntar a la colección 'expedientes_detalle'
            const docRef = db.collection('expedientes_detalle').doc(id); 
            
            // Usamos set con merge: true por seguridad, por si el documento de detalle 
            // no existiera (aunque debería), así lo crea si falta o actualiza si existe.
            batch.set(docRef, { estatus_padron: 'ENVIADO' }, { merge: true });
        });

        await batch.commit();
        console.log(`🔄 Base de datos actualizada: ${resultadoSheet.ids.length} registros marcados como ENVIADO en expedientes_detalle.`);
    }

    // ---------------------------------------------------------
    // 4. RESPONDER AL CLIENTE
    // ---------------------------------------------------------
    res.status(200).json({ 
        ok: true, 
        message: 'Exportación exitosa.',
        processed_count: resultadoSheet.procesados,
        details: resultadoSheet.ids
    });

  } catch (error) {
    console.error("Error crítico en exportarExpedientesAPadron:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
};

module.exports = {
  getAtendidos,
  getAtendidoById,      // Endpoint ligero
  getExpedienteCompleto, // Endpoint pesado (Nuevo)
  getResumenMensual,
  migrarExpedientes,
  actualizarPadron,   // Nuevo endpoint para actualizar padrón
  getAllExpedientes,   // Nuevo endpoint para obtener lista fusionada
  exportarExpedientesAPadron // Nuevo endpoint para exportar a Google Sheets
};