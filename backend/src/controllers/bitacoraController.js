const db = require('../../config/firebase');

exports.getLogs = async (req, res) => {
  try {
    // Obtenemos los últimos 100 eventos
    const snapshot = await db.collection('bitacora')
      .orderBy('fecha', 'desc')
      .limit(100)
      .get();

    if (snapshot.empty) {
      return res.json([]);
    }

    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(logs);
  } catch (error) {
    console.error("Error obteniendo bitácora:", error);
    res.status(500).json({ message: "Error al obtener la bitácora" });
  }
};