// backend/routes/config.js
// ========================================
// Endpoints para la configuración de la aplicación.
// Permite obtener y actualizar el "ingreso_total" (presupuesto total).
// ========================================

const express = require('express');
const router = express.Router();
const pool = require('../bd');

// GET: Obtener el ingreso_total de la tabla config
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT ingreso_total FROM config WHERE id = 1');
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }
    res.json(result.rows[0]); // { ingreso_total: ... }
  } catch (err) {
    console.error("Error al obtener la configuración:", err);
    res.status(500).json({ error: 'Error al obtener la configuración' });
  }
});

// POST: Actualizar el ingreso_total
router.post('/', async (req, res) => {
  let { ingresoTotal } = req.body;

  // Permitir ingresoTotal como string numérico y convertirlo
  ingresoTotal = Number(ingresoTotal);

  if (isNaN(ingresoTotal) || ingresoTotal < 0) {
    return res.status(400).json({ error: 'Ingreso total inválido' });
  }

  try {
    const result = await pool.query(
      'UPDATE config SET ingreso_total = $1 WHERE id = 1 RETURNING ingreso_total',
      [ingresoTotal]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }
    res.json(result.rows[0]); // { ingreso_total: ... }
  } catch (err) {
    console.error("Error al actualizar la configuración:", err);
    res.status(500).json({ error: 'Error al actualizar la configuración' });
  }
});

module.exports = router;
