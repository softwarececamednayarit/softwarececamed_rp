const db = require('../../config/firebase');

class AtendidoModel {
  // 1. Obtener todos (Ya lo tenías bien, agregamos un try/catch robusto)
  static async getAll() {
    try {
      const snapshot = await db.collection('atendidos')
        .orderBy('fecha_recepcion', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error('Error en AtendidoModel.getAll: ' + error.message);
    }
  }

  // 2. Filtrado con Ordenamiento (Vital para gráficas de tiempo)
  static async getFiltered({ fechaInicio, fechaFin, tipo }) {
    try {
      let query = db.collection('atendidos');

      if (fechaInicio && fechaFin) {
        query = query.where('fecha_recepcion', '>=', fechaInicio)
                     .where('fecha_recepcion', '<=', fechaFin);
      }

      if (tipo) {
        query = query.where('tipo', '==', tipo);
      }

      // IMPORTANTE: Siempre ordenar para que el Frontend no tenga que hacerlo
      // Nota: Si usas filtros de rango y orderBy en campos distintos, 
      // Firebase te pedirá crear un "Índice Compuesto" (te dará el link en consola).
      query = query.orderBy('fecha_recepcion', 'desc');

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error('Error en AtendidoModel.getFiltered: ' + error.message);
    }
  }

  // 3. Búsqueda por ID Único (Necesario para la página de "Detalles")
  static async getById(id) {
    try {
      const doc = await db.collection('atendidos').doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error('Error en AtendidoModel.getById: ' + error.message);
    }
  }

  // 4. Búsqueda por Nombre (Simulación de búsqueda parcial)
  // Como Firestore no tiene "LIKE %text%", traemos por rango de texto
  static async searchByName(nombreBusqueda) {
    try {
      const str = nombreBusqueda.toUpperCase();
      const snapshot = await db.collection('atendidos')
        .where('nombre', '>=', str)
        .where('nombre', '<=', str + '\uf8ff')
        .limit(20) // Limitar para no saturar
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error('Error en AtendidoModel.searchByName: ' + error.message);
    }
  }

  static async getDetalleById(id) {
    try {
      const doc = await db.collection('expedientes_detalle').doc(id).get();
      return doc.exists ? doc.data() : {};
    } catch (error) {
      console.error("Error obteniendo detalle:", error);
      return {};
    }
  }

  // ====================================================================
  // NUEVO MÉTODO: GUARDAR DETALLE (Sacamos esto del controlador)
  // ====================================================================
  static async saveDetalle(id, data) {
    // Limpiamos undefined
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
    data.fecha_ultima_actualizacion = new Date();
    
    return db.collection('expedientes_detalle').doc(id).set(data, { merge: true });
  }

  // ====================================================================
  // 🔥 LA MAGIA: FUSIONADOR DE DATOS (HELPER)
  // ====================================================================
  // Este método convierte los datos crudos en el objeto bonito que usa tu frontend y excel
  static mergeData(baseItem, detalleData) {
    // 1. Limpieza de Fecha
    let fechaLimpia = '';
    if (baseItem.fecha_recepcion) {
        fechaLimpia = (typeof baseItem.fecha_recepcion.toDate === 'function') 
          ? baseItem.fecha_recepcion.toDate().toISOString().split('T')[0] 
          : baseItem.fecha_recepcion;
    }

    // 2. Limpieza de Edad
    const edadRaw = baseItem.edad_o_nacimiento || baseItem.fecha_nacimiento || '';
    const edadLimpia = edadRaw.toString().replace(/ años/gi, '').trim();

    // 3. Lógica de Prioridad (Prestador y Domicilio)
    const prestadorFinal = detalleData.prestador_nombre !== undefined 
          ? detalleData.prestador_nombre 
          : (baseItem.unidad_medica || baseItem.institucion || '');

    const domicilioFinal = detalleData.domicilio !== undefined
          ? detalleData.domicilio
          : (baseItem.domicilio || baseItem.domicilio_ciudadano || '');

    // 4. Retornar objeto unificado
    return {
      id: baseItem.id,
      ...baseItem,
      ...detalleData, // Los detalles sobrescriben si hay colisión, o se agregan

      // Sobrescribimos con los datos calculados/limpios
      fecha_recepcion: fechaLimpia,
      fecha_beneficio: fechaLimpia, // Alias para Padrón
      edad: edadLimpia,
      prestador_nombre: prestadorFinal,
      domicilio: domicilioFinal,
      
      // Defaults seguros para evitar errores en Excel
      tipo_beneficiario: detalleData.tipo_beneficiario || 'Directo',
      tipo_apoyo: detalleData.tipo_apoyo || 'Servicio',
      parentesco: detalleData.parentesco || 'Beneficiario',
      nombre_completo: `${baseItem.nombre || ''} ${baseItem.apellido_paterno || ''} ${baseItem.apellido_materno || ''}`.trim(),
    };
  }

  // ====================================================================
  // OBTENER EXPEDIENTE UNIFICADO (Base + Detalle)
  // ====================================================================
  static async getFullExpediente(id) {
     const base = await this.getById(id);
     if (!base) return null;
     const detalle = await this.getDetalleById(id);
     return this.mergeData(base, detalle);
  }

  // ====================================================================
  // OBTENER LISTA UNIFICADA (Para Tablas y Reportes)
  // ====================================================================
  static async getFullList(filters) {
     let basicList;
     if (filters.nombre) {
         basicList = await this.searchByName(filters.nombre);
     } else {
         basicList = await this.getFiltered(filters);
     }

     // Hacemos el map asíncrono para traer los detalles
     return Promise.all(basicList.map(async (base) => {
         const detalle = await this.getDetalleById(base.id);
         return this.mergeData(base, detalle);
     }));
  }

  static async delete(id) {
    try {
      const batch = db.batch(); // 👈 Usamos Batch para atomicidad

      // 1. Referencia a la colección base
      const atendidoRef = db.collection('atendidos').doc(id);
      
      // 2. Referencia a la colección de detalles
      const detalleRef = db.collection('expedientes_detalle').doc(id);

      // 3. Preparamos las eliminaciones
      batch.delete(atendidoRef);
      batch.delete(detalleRef);

      // 4. Ejecutamos todo junto
      await batch.commit();
      
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar expediente ${id}: ${error.message}`);
    }
  }

}

module.exports = AtendidoModel;