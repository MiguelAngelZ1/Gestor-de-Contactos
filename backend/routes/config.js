// backend/routes/config.js
// ========================================
// Endpoints para la configuración de la aplicación.
// Permite obtener y actualizar el "ingreso_total" (presupuesto total).
// ========================================

const express = require('express');
const router = express.Router();
const pool = require('../index'); // Utiliza el pool definido en index.js

// GET: Obtener el ingreso_total de la tabla config
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT ingreso_total FROM config WHERE id = 1');
    res.json(result.rows[0]); // Ejemplo de respuesta: { ingreso_total: 500000 }
  } catch (err) {
    console.error("Error al obtener la configuración:", err);
    res.status(500).json({ error: 'Error al obtener la configuración' });
  }
});

// POST: Actualizar el ingreso_total en la tabla config
router.post('/', async (req, res) => {
  const { ingresoTotal } = req.body; // Se espera un JSON con la propiedad "ingresoTotal"
  try {
    await pool.query('UPDATE config SET ingreso_total = $1 WHERE id = 1', [ingresoTotal]);
    res.json({ ingresoTotal });
  } catch (err) {
    console.error("Error al actualizar la configuración:", err);
    res.status(500).json({ error: 'Error al actualizar la configuración' });
  }
});

module.exports = router;
