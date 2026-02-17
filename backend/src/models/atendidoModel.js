const db = require('../../config/firebase');

/**
 * Modelo `AtendidoModel` - capa sobre Firestore para `atendidos` y
 * `expedientes_detalle`. Métodos para listar, filtrar, buscar, unir
 * y eliminar expedientes. Comentarios breves en español.
 */
class AtendidoModel {
  // Obtener todos: devuelve array de {id, ...}
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

  // Filtrar por fecha/tipo y ordenar por fecha_recepcion
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
      query = query.orderBy('fecha_recepcion', 'desc');

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error('Error en AtendidoModel.getFiltered: ' + error.message);
    }
  }

  // Buscar por ID. Devuelve objeto o null.
  static async getById(id) {
    try {
      const doc = await db.collection('atendidos').doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error('Error en AtendidoModel.getById: ' + error.message);
    }
  }

  // Búsqueda por nombre (rango de texto, límite 20)
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

  // Obtener detalle por ID. Devuelve objeto o {}.
  static async getDetalleById(id) {
    try {
      const doc = await db.collection('expedientes_detalle').doc(id).get();
      return doc.exists ? doc.data() : {};
    } catch (error) {
      console.error("Error obteniendo detalle:", error);
      return {};
    }
  }

  // Guardar/merge de detalle por ID (merge: true)
  static async saveDetalle(id, data) {
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
    data.fecha_ultima_actualizacion = new Date();

    return db.collection('expedientes_detalle').doc(id).set(data, { merge: true });
  }

  // Unifica base + detalle y normaliza campos para el frontend/reportes
  static mergeData(baseItem, detalleData) {
    let fechaLimpia = '';
    if (baseItem.fecha_recepcion) {
      fechaLimpia = (typeof baseItem.fecha_recepcion.toDate === 'function')
        ? baseItem.fecha_recepcion.toDate().toISOString().split('T')[0]
        : baseItem.fecha_recepcion;
    }

    const edadRaw = baseItem.edad_o_nacimiento || baseItem.fecha_nacimiento || '';
    const edadLimpia = edadRaw.toString().replace(/ años/gi, '').trim();

    const prestadorFinal = detalleData.prestador_nombre !== undefined
      ? detalleData.prestador_nombre
      : (baseItem.unidad_medica || baseItem.institucion || '');

    const domicilioFinal = detalleData.domicilio !== undefined
      ? detalleData.domicilio
      : (baseItem.domicilio || baseItem.domicilio_ciudadano || '');

    return {
      id: baseItem.id,
      ...baseItem,
      ...detalleData,
      fecha_recepcion: fechaLimpia,
      fecha_beneficio: fechaLimpia,
      edad: edadLimpia,
      prestador_nombre: prestadorFinal,
      domicilio: domicilioFinal,
      tipo_beneficiario: detalleData.tipo_beneficiario || 'Directo',
      tipo_apoyo: detalleData.tipo_apoyo || 'Servicio',
      parentesco: detalleData.parentesco || 'Beneficiario',
      nombre_completo: `${baseItem.nombre || ''} ${baseItem.apellido_paterno || ''} ${baseItem.apellido_materno || ''}`.trim(),
    };
  }

  // Obtener expediente completo (base + detalle)
  static async getFullExpediente(id) {
    const base = await this.getById(id);
    if (!base) return null;
    const detalle = await this.getDetalleById(id);
    return this.mergeData(base, detalle);
  }

  // Obtener lista unificada (usa búsqueda por nombre o filtros)
  static async getFullList(filters) {
    let basicList;
    if (filters.nombre) {
      basicList = await this.searchByName(filters.nombre);
    } else {
      basicList = await this.getFiltered(filters);
    }

    return Promise.all(basicList.map(async (base) => {
      const detalle = await this.getDetalleById(base.id);
      return this.mergeData(base, detalle);
    }));
  }

  // Eliminar expediente y detalle (operación atómica con batch)
  static async delete(id) {
    try {
      const batch = db.batch();
      const atendidoRef = db.collection('atendidos').doc(id);
      const detalleRef = db.collection('expedientes_detalle').doc(id);
      batch.delete(atendidoRef);
      batch.delete(detalleRef);
      await batch.commit();
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar expediente ${id}: ${error.message}`);
    }
  }

}

module.exports = AtendidoModel;