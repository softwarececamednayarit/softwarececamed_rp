/**
 * Modelo `bitacoraModel` - acceso a la colección `bitacora`.
 * Métodos mínimos: `getRecent(limit)` y `create(entry)`.
 */
const db = require('../../config/firebase');
const COL = 'bitacora';

/**
 * Obtiene los registros más recientes ordenados por `fecha`.
 * @param {number} limit
 * @returns {Promise<Array<Object>>}
 */
exports.getRecent = async (limit = 100) => {
  try {
    const snapshot = await db.collection(COL)
      .orderBy('fecha', 'desc')
      .limit(limit)
      .get();

    return snapshot.empty ? [] : snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    throw new Error(`Error bitacora.getRecent: ${error.message}`);
  }
};

/**
 * Crea una entrada en la bitácora. Agrega `fecha` si no viene.
 * @param {Object} entry
 * @returns {Promise<{id: string}>}
 */
exports.create = async (entry) => {
  try {
    const data = { ...entry, fecha: entry.fecha || new Date() };
    const docRef = await db.collection(COL).add(data);
    return { id: docRef.id };
  } catch (error) {
    throw new Error(`Error bitacora.create: ${error.message}`);
  }
};
